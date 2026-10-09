"use client";

import * as React from "react";
import { offlineDb } from "@/lib/offline/db";
import { bulkSyncDoseLogs } from "@/lib/actions/dose-logs";
import type { DoseLogInput } from "@/lib/validations/medication";

/**
 * Offline Sync Engine
 * Listens for 'online' events and automatically syncs all pending
 * Dexie dose logs to Supabase via server actions.
 */
export function OfflineSyncEngine() {
  React.useEffect(() => {
    async function syncPendingLogs() {
      if (!offlineDb) return;

      try {
        const pendingLogs = await offlineDb.doseLogs
          .where("syncStatus")
          .equals("pending")
          .toArray();

        if (pendingLogs.length === 0) return;

        const payload: DoseLogInput[] = pendingLogs.map((log) => ({
          medicationId: log.medicationId,
          scheduledTime: log.scheduledTime,
          takenTime: log.takenTime ?? undefined,
          status: log.status,
          clientUuid: log.id, // client_uuid IS the Dexie id
          notes: undefined,
        }));

        const { error, count } = await bulkSyncDoseLogs(payload);

        if (!error && count >= 0) {
          // Mark as synced in Dexie
          const ids = pendingLogs.map((l) => l.id);
          await offlineDb.doseLogs
            .where("id")
            .anyOf(ids)
            .modify({ syncStatus: "synced" });

          console.log(`[CuteBloom] Synced ${count} offline dose logs to Supabase.`);
        }
      } catch (err) {
        // Silently continue — will retry on next 'online' event
        console.warn("[CuteBloom] Offline sync failed:", err);
      }
    }

    // Sync on initial mount if online
    if (navigator.onLine) {
      syncPendingLogs();
    }

    // Sync whenever network comes back
    window.addEventListener("online", syncPendingLogs);
    return () => window.removeEventListener("online", syncPendingLogs);
  }, []);

  return null;
}
