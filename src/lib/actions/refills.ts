"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createRefillTrackerSchema,
  updateRefillTrackerSchema,
  type RefillTrackerInput,
  type UpdateRefillTrackerInput,
} from "@/lib/validations/refill";

export async function getRefillTrackers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("refill_trackers")
    .select(
      `*, medications(name, form, strength, is_controlled_drug, schedule_times)`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function getRefillTrackerById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("refill_trackers")
    .select(
      `*, medications(name, form, strength, is_controlled_drug, schedule_times)`
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createRefillTracker(input: RefillTrackerInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = createRefillTrackerSchema.safeParse(input);
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
      request_by_date: validated.data.requestByDate,
      last_refill_date: validated.data.lastRefillDate,
      controlled_drug_expiry: validated.data.controlledDrugExpiry,
      early_reminder_days: validated.data.earlyReminderDays,
      notes: validated.data.notes,
    })
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}

export async function updateRefillTracker(input: UpdateRefillTrackerInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = updateRefillTrackerSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { id, ...updates } = validated.data;

  const payload: Record<string, unknown> = {};
  if (updates.medicationId !== undefined)
    payload.medication_id = updates.medicationId;
  if (updates.currentQuantity !== undefined)
    payload.current_quantity = updates.currentQuantity;
  if (updates.unit !== undefined) payload.unit = updates.unit;
  if (updates.daysSupplyRemaining !== undefined)
    payload.days_supply_remaining = updates.daysSupplyRemaining;
  if (updates.requestByDate !== undefined)
    payload.request_by_date = updates.requestByDate;
  if (updates.lastRefillDate !== undefined)
    payload.last_refill_date = updates.lastRefillDate;
  if (updates.controlledDrugExpiry !== undefined)
    payload.controlled_drug_expiry = updates.controlledDrugExpiry;
  if (updates.earlyReminderDays !== undefined)
    payload.early_reminder_days = updates.earlyReminderDays;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { data, error } = await supabase
    .from("refill_trackers")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}

export async function deleteRefillTracker(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("refill_trackers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/refills");
  return { error: error?.message ?? null };
}

export async function decrementRefillQuantity(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  // First get current quantity
  const { data: tracker } = await supabase
    .from("refill_trackers")
    .select("current_quantity")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tracker) return { data: null, error: "Refill tracker not found" };

  const newQuantity = Math.max(0, tracker.current_quantity - 1);

  const { data, error } = await supabase
    .from("refill_trackers")
    .update({
      current_quantity: newQuantity,
      days_supply_remaining: Math.max(
        0,
        tracker.current_quantity - 1
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/refills");
  return { data, error: error?.message ?? null };
}
