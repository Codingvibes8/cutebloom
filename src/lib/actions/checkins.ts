"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createDailyCheckinSchema,
  updateDailyCheckinSchema,
  type DailyCheckinInput,
  type UpdateDailyCheckinInput,
} from "@/lib/validations/checkin";

export async function getDailyCheckins(limit = 30) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  return { data, error: error?.message ?? null };
}

export async function getDailyCheckinByDate(date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  return { data, error: error?.message ?? null };
}

export async function getTodaysCheckin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    .maybeSingle();

  return { data, error: error?.message ?? null };
}

export async function createDailyCheckin(input: DailyCheckinInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = createDailyCheckinSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("daily_checkins")
    .upsert(
      {
        user_id: user.id,
        date: validated.data.date,
        focus_rating: validated.data.focusRating,
        mood_rating: validated.data.moodRating,
        sleep_hours: validated.data.sleepHours,
        sleep_quality: validated.data.sleepQuality,
        appetite_rating: validated.data.appetiteRating,
        side_effects: validated.data.sideEffects,
        note: validated.data.note,
        client_uuid: validated.data.clientUuid,
      },
      { onConflict: "client_uuid" }
    )
    .select()
    .single();

  if (!error) revalidatePath("/checkin");
  return { data, error: error?.message ?? null };
}

export async function updateDailyCheckin(input: UpdateDailyCheckinInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = updateDailyCheckinSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { id, ...updates } = validated.data;

  const payload: Record<string, unknown> = {};
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.focusRating !== undefined)
    payload.focus_rating = updates.focusRating;
  if (updates.moodRating !== undefined)
    payload.mood_rating = updates.moodRating;
  if (updates.sleepHours !== undefined)
    payload.sleep_hours = updates.sleepHours;
  if (updates.sleepQuality !== undefined)
    payload.sleep_quality = updates.sleepQuality;
  if (updates.appetiteRating !== undefined)
    payload.appetite_rating = updates.appetiteRating;
  if (updates.sideEffects !== undefined)
    payload.side_effects = updates.sideEffects;
  if (updates.note !== undefined) payload.note = updates.note;

  const { data, error } = await supabase
    .from("daily_checkins")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) revalidatePath("/checkin");
  return { data, error: error?.message ?? null };
}
