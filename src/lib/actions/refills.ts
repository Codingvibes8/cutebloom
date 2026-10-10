"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { refillTrackerSchema, type RefillTrackerInput } from "@/lib/validations/refill";

// ── Get all refill trackers for current user ───────────────────────

export async function getRefillTrackers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("refill_trackers")
    .select(`*, medications(name, form, strength, is_controlled_drug)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

// ── Get single refill tracker ─────────────────────────────────────

export async function getRefillTrackerById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("refill_trackers")
    .select(`*, medications(name, form, strength, is_controlled_drug)`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error: error?.message ?? null };
}

// ── Create refill tracker ─────────────────────────────────────────

export async function createRefillTracker(input: RefillTrackerInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = refillTrackerSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("refill_trackers")
    .insert({
      user_id: user.id,
      medication_id: validated.data.medicationId,
      current_quantity: validated.data.currentQuantity,
      unit: validated.data.unit,
      days_supply_remaining: validated.data.daysSupplyRemaining,
      request_by_date: validated.data.requestByDate ?? null,
      last_refill_date: validated.data.lastRefillDate ?? null,
      controlled_drug_expiry: validated.data.controlledDrugExpiry ?? null,
      early_reminder_days: validated.data.earlyReminderDays,
      notes: validated.data.notes ?? null,
    })
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}

// ── Update refill tracker ─────────────────────────────────────────

export async function updateRefillTracker(id: string, input: Partial<RefillTrackerInput>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const updatePayload: Record<string, unknown> = {};
  if (input.currentQuantity !== undefined) updatePayload.current_quantity = input.currentQuantity;
  if (input.unit !== undefined) updatePayload.unit = input.unit;
  if (input.daysSupplyRemaining !== undefined) updatePayload.days_supply_remaining = input.daysSupplyRemaining;
  if (input.requestByDate !== undefined) updatePayload.request_by_date = input.requestByDate;
  if (input.lastRefillDate !== undefined) updatePayload.last_refill_date = input.lastRefillDate;
  if (input.controlledDrugExpiry !== undefined) updatePayload.controlled_drug_expiry = input.controlledDrugExpiry;
  if (input.earlyReminderDays !== undefined) updatePayload.early_reminder_days = input.earlyReminderDays;
  if (input.notes !== undefined) updatePayload.notes = input.notes;
  updatePayload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("refill_trackers")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}

// ── Mark as refilled (update quantity + dates) ────────────────────

export async function markRefilled(
  id: string,
  updates: { currentQuantity: number; lastRefillDate: string; controlledDrugExpiry?: string | null }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("refill_trackers")
    .update({
      current_quantity: updates.currentQuantity,
      last_refill_date: updates.lastRefillDate,
      controlled_drug_expiry: updates.controlledDrugExpiry ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}

// ── Decrement refill quantity (dose taken) ────────────────────────

export async function decrementRefillQuantity(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: tracker } = await supabase
    .from("refill_trackers")
    .select("current_quantity, days_supply_remaining")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tracker) return { data: null, error: "Refill tracker not found" };

  const newQty = Math.max(0, tracker.current_quantity - 1);
  const newDays = Math.max(0, tracker.days_supply_remaining - 1);

  const { data, error } = await supabase
    .from("refill_trackers")
    .update({
      current_quantity: newQty,
      days_supply_remaining: newDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}

// ── Delete refill tracker ─────────────────────────────────────────

export async function deleteRefillTracker(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("refill_trackers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/refills");
  return { error: error?.message ?? null };
}
