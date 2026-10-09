"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { doseLogSchema, type DoseLogInput } from "@/lib/validations/medication";

export async function getDoseLogs(medicationId?: string, limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  let query = supabase
    .from("dose_logs")
    .select(`*, medications(name, form, strength, is_controlled_drug)`)
    .eq("user_id", user.id)
    .order("scheduled_time", { ascending: false })
    .limit(limit);

  if (medicationId) {
    query = query.eq("medication_id", medicationId);
  }

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

export async function getTodaysDoseLogs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  // Today in Europe/London
  const now = new Date();
  const londonFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [day, month, year] = londonFormatter.format(now).split("/");
  const todayStr = `${year}-${month}-${day}`;

  const { data, error } = await supabase
    .from("dose_logs")
    .select(`*, medications(name, form, strength, is_controlled_drug, schedule_times)`)
    .eq("user_id", user.id)
    .gte("scheduled_time", `${todayStr}T00:00:00Z`)
    .lte("scheduled_time", `${todayStr}T23:59:59Z`)
    .order("scheduled_time", { ascending: true });

  return { data, error: error?.message ?? null };
}

export async function logDose(input: DoseLogInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = doseLogSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("dose_logs")
    .upsert(
      {
        user_id: user.id,
        medication_id: validated.data.medicationId,
        scheduled_time: validated.data.scheduledTime,
        taken_time: validated.data.takenTime ?? null,
        status: validated.data.status,
        client_uuid: validated.data.clientUuid,
        notes: validated.data.notes ?? null,
      },
      { onConflict: "client_uuid" }
    )
    .select()
    .single();

  if (!error) revalidatePath("/medications");
  return { data, error: error?.message ?? null };
}

export async function updateDoseLog(
  id: string,
  updates: { status?: string; takenTime?: string | null; notes?: string | null }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.takenTime !== undefined) payload.taken_time = updates.takenTime;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { data, error } = await supabase
    .from("dose_logs")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/medications");
  return { data, error: error?.message ?? null };
}

export async function bulkSyncDoseLogs(
  logs: Array<DoseLogInput & { userId?: string }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", count: 0 };

  const payload = logs.map((log) => ({
    user_id: user.id,
    medication_id: log.medicationId,
    scheduled_time: log.scheduledTime,
    taken_time: log.takenTime ?? null,
    status: log.status,
    client_uuid: log.clientUuid,
    notes: log.notes ?? null,
  }));

  const { error, count } = await supabase
    .from("dose_logs")
    .upsert(payload, { onConflict: "client_uuid" });

  if (!error) revalidatePath("/medications");
  return { error: error?.message ?? null, count: count ?? 0 };
}
