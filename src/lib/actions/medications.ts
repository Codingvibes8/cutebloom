"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { medicationSchema, type MedicationInput } from "@/lib/validations/medication";

export async function getMedications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function getAllMedications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function getMedicationById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createMedication(input: MedicationInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = medicationSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("medications")
    .insert({
      user_id: user.id,
      name: validated.data.name,
      form: validated.data.form,
      strength: validated.data.strength ?? null,
      schedule_type: validated.data.scheduleType,
      schedule_times: validated.data.scheduleTimes,
      start_date: validated.data.startDate,
      end_date: validated.data.endDate ?? null,
      notes: validated.data.notes ?? null,
      is_controlled_drug: validated.data.isControlledDrug,
      is_active: validated.data.isActive,
    })
    .select()
    .single();

  if (!error) revalidatePath("/medications");
  return { data, error: error?.message ?? null };
}

export async function updateMedication(id: string, input: Partial<MedicationInput>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const updatePayload: Record<string, unknown> = {};
  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.form !== undefined) updatePayload.form = input.form;
  if (input.strength !== undefined) updatePayload.strength = input.strength;
  if (input.scheduleType !== undefined) updatePayload.schedule_type = input.scheduleType;
  if (input.scheduleTimes !== undefined) updatePayload.schedule_times = input.scheduleTimes;
  if (input.startDate !== undefined) updatePayload.start_date = input.startDate;
  if (input.endDate !== undefined) updatePayload.end_date = input.endDate;
  if (input.notes !== undefined) updatePayload.notes = input.notes;
  if (input.isControlledDrug !== undefined) updatePayload.is_controlled_drug = input.isControlledDrug;
  if (input.isActive !== undefined) updatePayload.is_active = input.isActive;
  updatePayload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("medications")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/medications");
  return { data, error: error?.message ?? null };
}

export async function archiveMedication(id: string) {
  return updateMedication(id, { isActive: false });
}

export async function deleteMedication(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/medications");
  return { error: error?.message ?? null };
}
