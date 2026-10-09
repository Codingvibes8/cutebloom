"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pushSubscribeInputSchema, pushUnsubscribeInputSchema } from "@/lib/validations/push";
import { getVapidKeys } from "@/lib/push/vapid";

/**
 * Get the VAPID public key for client-side push subscription.
 */
export async function getVapidPublicKey() {
  const { publicKey } = getVapidKeys();
  return { publicKey };
}

/**
 * Get all push subscriptions for the current user.
 */
export async function getPushSubscriptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  return { data, error: error?.message ?? null };
}

/**
 * Subscribe to push notifications.
 */
export async function subscribeToPush(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = pushSubscribeInputSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { subscription } = validated.data;

  // Upsert the subscription (unique on user_id + endpoint)
  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        user_agent: subscription.userAgent || null,
        is_active: true,
      },
      { onConflict: "user_id,endpoint" }
    )
    .select()
    .single();

  if (!error) {
    // Record web_push consent
    await supabase.from("consent_records").insert({
      user_id: user.id,
      consent_type: "web_push",
      granted: true,
      policy_version: "1.0",
    });
    revalidatePath("/settings");
  }

  return { data, error: error?.message ?? null };
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribeFromPush(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const validated = pushUnsubscribeInputSchema.safeParse(input);
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message };
  }

  const { endpoint } = validated.data;

  const { error } = await supabase
    .from("push_subscriptions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (!error) {
    // Update consent record
    await supabase
      .from("consent_records")
      .update({ granted: false, granted_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("consent_type", "web_push");
    revalidatePath("/settings");
  }

  return { error: error?.message ?? null };
}

/**
 * Unsubscribe from all push notifications.
 */
export async function unsubscribeFromAllPush() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("push_subscriptions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (!error) {
    await supabase
      .from("consent_records")
      .update({ granted: false, granted_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("consent_type", "web_push");
    revalidatePath("/settings");
  }

  return { error: error?.message ?? null };
}
