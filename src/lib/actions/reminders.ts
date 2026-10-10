"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reminderSettingsSchema, pushSubscriptionSchema, type ReminderSettingsInput, type PushSubscriptionInput } from "@/lib/validations/reminder";

// ── Reminder Settings ──────────────────────────────────────────────

export async function getReminderSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("reminder_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // If no settings exist yet, return defaults
  if (error && error.code === "PGRST116") {
    return {
      data: {
        notifications_enabled: true,
        snooze_minutes: 10,
        escalation_enabled: true,
        escalation_minutes: 30,
        quiet_hours_start: null,
        quiet_hours_end: null,
      },
      error: null,
    };
  }

  return { data, error: error?.message ?? null };
}

export async function updateReminderSettings(input: ReminderSettingsInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = reminderSettingsSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("reminder_settings")
    .upsert({
      user_id: user.id,
      notifications_enabled: validated.data.notificationsEnabled,
      snooze_minutes: validated.data.snoozeMinutes,
      escalation_enabled: validated.data.escalationEnabled,
      escalation_minutes: validated.data.escalationMinutes,
      quiet_hours_start: validated.data.quietHoursStart ?? null,
      quiet_hours_end: validated.data.quietHoursEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (!error) revalidatePath("/reminders");
  return { data, error: error?.message ?? null };
}

// ── Push Subscriptions ─────────────────────────────────────────────

export async function savePushSubscription(input: PushSubscriptionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = pushSubscriptionSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  // Upsert by endpoint (one subscription per device)
  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert({
      user_id: user.id,
      endpoint: validated.data.endpoint,
      keys_p256dh: validated.data.p256dh,
      keys_auth: validated.data.auth,
      is_active: true,
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function deletePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  return { error: error?.message ?? null };
}

export async function getPushSubscriptionCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { count: 0, error: "Not authenticated" };

  const { count, error } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return { count: count ?? 0, error: error?.message ?? null };
}
