"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dailyCheckinSchema, type DailyCheckinInput } from "@/lib/validations/checkin";

// ── Get today's check-in ───────────────────────────────────────────

export async function getTodaysCheckin() {
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
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .single();

  // No check-in yet today — return null data (not an error)
  if (error && error.code === "PGRST116") {
    return { data: null, error: null };
  }

  return { data, error: error?.message ?? null };
}

// ── Get recent check-ins (last 30 days) ────────────────────────────

export async function getRecentCheckins(days = 30) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", cutoffStr)
    .order("date", { ascending: false });

  return { data, error: error?.message ?? null };
}

// ── Create or update today's check-in (upsert by date) ────────────

export async function saveDailyCheckin(input: DailyCheckinInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = dailyCheckinSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("daily_checkins")
    .upsert({
      user_id: user.id,
      date: validated.data.date,
      focus_rating: validated.data.focusRating ?? null,
      mood_rating: validated.data.moodRating ?? null,
      sleep_hours: validated.data.sleepHours ?? null,
      sleep_quality: validated.data.sleepQuality ?? null,
      appetite_rating: validated.data.appetiteRating ?? null,
      side_effects: validated.data.sideEffects,
      note: validated.data.note ?? null,
      client_uuid: validated.data.clientUuid,
    })
    .select()
    .single();

  if (!error) revalidatePath("/checkin");
  return { data, error: error?.message ?? null };
}

// ── Delete a check-in ─────────────────────────────────────────────

export async function deleteDailyCheckin(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("daily_checkins")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/checkin");
  return { error: error?.message ?? null };
}
