import webpush from "web-push";

/**
 * VAPID keys for Web Push notifications.
 * In production, set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local
 * Generate keys with: npx web-push generate-vapid-keys
 */
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const PRIVATE_KEY = process.env.VAPID_VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:hello@cutebloom.app";

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

export function getVapidKeys(): VapidKeys {
  return {
    publicKey: PUBLIC_KEY,
    privateKey: PRIVATE_KEY,
  };
}

export function isVapidConfigured(): boolean {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY);
}

export function getVapidSubject(): string {
  return VAPID_SUBJECT;
}

/**
 * Configure web-push with VAPID details.
 * Call this before sending any push notifications.
 */
export function configureWebPush(): void {
  if (!isVapidConfigured()) {
    console.warn(
      "[CuteBloom Push] VAPID keys not configured. Push notifications will not work. " +
        "Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_VAPID_PRIVATE_KEY in .env.local"
    );
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
}

/**
 * Send a push notification to a subscription.
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  payload: {
    title: string;
    body: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{ action: string; title: string }>;
    data?: Record<string, unknown>;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isVapidConfigured()) {
    return { success: false, error: "VAPID keys not configured" };
  }

  try {
    configureWebPush();
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        tag: payload.tag || "cutebloom-reminder",
        requireInteraction: payload.requireInteraction ?? true,
        actions: payload.actions || [
          { action: "taken", title: "Taken" },
          { action: "snooze", title: "Snooze 10m" },
          { action: "skip", title: "Skip" },
        ],
        data: payload.data || {},
      })
    );
    return { success: true };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    // 404 or 410 means subscription is no longer valid
    if (err.statusCode === 404 || err.statusCode === 410) {
      return { success: false, error: "Subscription expired" };
    }
    return { success: false, error: err.message || "Failed to send push notification" };
  }
}
