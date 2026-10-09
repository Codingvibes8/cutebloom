import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { medications, reminderEvents, pushSubscriptions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendPushNotification } from "@/lib/push/vapid";
import { getLondonDate, londonLocalToUtc } from "@/lib/push/notifications";

/**
 * Check for due medication reminders and send push notifications.
 * 
 * This endpoint is designed to be called by a cron job or external scheduler
 * (e.g., Vercel Cron, GitHub Actions) every 5 minutes.
 * 
 * Authorization: requires a secret token in the Authorization header.
 * Set CRON_SECRET in your environment variables.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const now = new Date();
    const todayStr = getLondonDate(now);

    // Find all active medications with scheduled times
    const activeMeds = await db
      .select()
      .from(medications)
      .where(
        and(
          eq(medications.isActive, true)
        )
      );

    if (activeMeds.length === 0) {
      return NextResponse.json({ checked: 0, sent: 0, message: "No active medications" });
    }

    let notificationsSent = 0;
    let remindersChecked = 0;

    for (const med of activeMeds) {
      const scheduleTimes = med.scheduleTimes;

      for (const time of scheduleTimes) {
        remindersChecked++;

        // Check if this reminder is due
        const scheduledUtc = londonLocalToUtc(todayStr, time);
        const diffMs = now.getTime() - scheduledUtc.getTime();
        const windowMs = 5 * 60 * 1000; // 5-minute window

        if (diffMs < 0 || diffMs > windowMs) {
          continue; // Not due yet or too old
        }

        // Check if we already have a reminder event for this
        const existingEvents = await db
          .select()
          .from(reminderEvents)
          .where(
            and(
              eq(reminderEvents.medicationId, med.id),
              eq(reminderEvents.status, "pending"),
              sql`${reminderEvents.scheduledTime} = ${scheduledUtc.toISOString()}`
            )
          )
          .limit(1);

        if (existingEvents.length > 0) {
          continue; // Already tracking this reminder
        }

        // Create a reminder event
        const clientUuid = crypto.randomUUID();
        await db.insert(reminderEvents).values({
          userId: med.userId,
          medicationId: med.id,
          scheduledTime: scheduledUtc,
          status: "pending",
          clientUuid,
          lastReminderAt: now,
        });

        // Get user's push subscriptions
        const subs = await db
          .select()
          .from(pushSubscriptions)
          .where(
            and(
              eq(pushSubscriptions.userId, med.userId),
              eq(pushSubscriptions.isActive, true)
            )
          );

        // Send push notifications
        for (const sub of subs) {
          const result = await sendPushNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
            },
            {
              title: `Time for ${med.name}`,
              body: `Scheduled time: ${time}. Tap an action below when you're ready.`,
              tag: `cutebloom-${med.id}-${time}`,
              requireInteraction: true,
              actions: [
                { action: "taken", title: "Taken" },
                { action: "snooze", title: "Snooze 10m" },
                { action: "skip", title: "Skip" },
              ],
              data: {
                reminderKey: `${med.id}-${todayStr}-${time}`,
                medicationId: med.id,
                scheduledTime: scheduledUtc.toISOString(),
              },
            }
          );

          if (result.success) {
            notificationsSent++;
          }
        }
      }
    }

    return NextResponse.json({
      checked: remindersChecked,
      sent: notificationsSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Reminders Check API]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
