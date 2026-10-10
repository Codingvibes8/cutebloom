import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/push/vapid";
import { pushSendInputSchema } from "@/lib/validations/push";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

/**
 * Send a push notification to a user's subscriptions.
 *
 * Request body:
 * {
 *   "userId": "uuid" (optional if endpoint is provided),
 *   "endpoint": "string" (optional if userId is provided),
 *   "payload": { "title": "...", "body": "...", ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validated = pushSendInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, endpoint, payload } = validated.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Determine which subscriptions to send to
    let subscriptions: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }> = [];

    if (endpoint) {
      // Send to specific endpoint
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));
      subscriptions = subs.map((s: typeof pushSubscriptions.$inferSelect) => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.keysP256dh, auth: s.keysAuth },
      }));
    } else if (userId) {
      // Send to all subscriptions for a user
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));
      subscriptions = subs.map((s: typeof pushSubscriptions.$inferSelect) => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.keysP256dh, auth: s.keysAuth },
      }));
    } else {
      // Send to the current user's subscriptions
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, user.id));
      subscriptions = subs.map((s: typeof pushSubscriptions.$inferSelect) => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.keysP256dh, auth: s.keysAuth },
      }));
    }

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found" },
        { status: 404 }
      );
    }

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    // Remove expired subscriptions
    const expiredEndpoints = results
      .map((r, i) => (!r.success && r.error === "Subscription expired" ? subscriptions[i].endpoint : null))
      .filter((ep): ep is string => ep !== null);

    if (expiredEndpoints.length > 0) {
      for (const ep of expiredEndpoints) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, ep));
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      removed: expiredEndpoints.length,
    });
  } catch (error) {
    console.error("[Push Send API]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
