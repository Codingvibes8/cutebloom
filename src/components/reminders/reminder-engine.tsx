"use client";

import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { offlineDb } from "@/lib/offline/db";
import { ReminderScheduler, type ReminderState } from "@/lib/push/scheduler";
import { areNotificationsGranted, areNotificationsSupported } from "@/lib/push/notifications";
import { logDose } from "@/lib/actions/dose-logs";

/**
 * ReminderEngine — Client-side medication reminder scheduler.
 * 
 * Runs in the background, checking every 30 seconds for due medication
 * reminders. Shows notifications with actions (Taken, Snooze 10m, Skip)
 * and handles escalation nudges for unacknowledged doses.
 * 
 * DST-safe: all time computations use Europe/London timezone.
 */
export function ReminderEngine() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const schedulerRef = React.useRef<ReminderScheduler | null>(null);

  // Fetch medications from Dexie (offline-first)
  const medications = useLiveQuery(async () => {
    if (!offlineDb) return [];
    return await offlineDb.medications
      .where("isActive")
      .equals(1)
      .toArray();
  }, []);

  // Initialize scheduler
  React.useEffect(() => {
    if (!areNotificationsSupported() || !areNotificationsGranted()) {
      setIsEnabled(false);
      return;
    }

    const scheduler = new ReminderScheduler({
      onReminderDue: (state: ReminderState) => {
        // Log the dose as pending when reminder fires
        console.log(`[CuteBloom] Reminder due: ${state.medicationName}`);
      },
      onEscalation: (state: ReminderState) => {
        console.log(`[CuteBloom] Escalation nudge: ${state.medicationName}`);
      },
      onSnooze: (state: ReminderState, snoozeUntil: Date) => {
        console.log(`[CuteBloom] Snoozed: ${state.medicationName} until ${snoozeUntil.toLocaleTimeString()}`);
      },
    });

    schedulerRef.current = scheduler;
    setIsEnabled(true);

    return () => {
      scheduler.stop();
    };
  }, []);

  // Start/stop scheduler when medications change
  React.useEffect(() => {
    if (!isEnabled || !schedulerRef.current || !medications) return;

    const activeMeds = medications
      .filter((m) => m.isActive)
      .map((m) => ({
        id: m.id,
        name: m.name,
        scheduleTimes: m.scheduleTimes,
        isActive: m.isActive,
      }));

    schedulerRef.current.start(activeMeds);
  }, [isEnabled, medications]);

  // Listen for notification actions from service worker
  React.useEffect(() => {
    if (!isEnabled) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "notification-action") {
        const { action, data } = event.data;
        const reminderKey = data?.reminderKey as string | undefined;
        const medicationId = data?.medicationId as string | undefined;
        const scheduledTime = data?.scheduledTime as string | undefined;

        if (reminderKey && schedulerRef.current) {
          schedulerRef.current.handleAction(action, reminderKey);
        }

        // Log the dose based on action
        if (medicationId && scheduledTime) {
          const status = action === "taken" ? "taken" : action === "skip" ? "skipped" : "snoozed";
          void logDose({
            medicationId,
            scheduledTime,
            status,
            clientUuid: crypto.randomUUID(),
          });
        }
      }

      if (event.data?.type === "notification-closed") {
        const data = event.data.data;
        const reminderKey = data?.reminderKey as string | undefined;
        if (reminderKey && schedulerRef.current) {
          // Mark as missed if dismissed without action
          schedulerRef.current.handleAction("skip", reminderKey);
        }
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [isEnabled]);

  // This component doesn't render anything visible
  return null;
}
