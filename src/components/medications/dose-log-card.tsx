"use client";

import * as React from "react";
import { CheckCircle2, X, Clock3, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatUKTime } from "@/lib/utils";
import { logDose } from "@/lib/actions/dose-logs";
import { offlineDb } from "@/lib/offline/db";

interface DoseLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_time: string | null;
  status: "taken" | "skipped" | "late" | "snoozed";
  medications: {
    name: string;
    form: string;
    strength: string | null;
    is_controlled_drug: boolean;
  };
}

interface DoseLogCardProps {
  log: DoseLog;
  onUpdate?: () => void;
}

const STATUS_CONFIG = {
  taken: {
    label: "Taken",
    badge: "default" as const,
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  skipped: {
    label: "Skipped",
    badge: "secondary" as const,
    icon: X,
    color: "text-[hsl(var(--muted-foreground))]",
  },
  late: {
    label: "Taken late",
    badge: "accent" as const,
    icon: Clock3,
    color: "text-[hsl(var(--accent-foreground))]",
  },
  snoozed: {
    label: "Snoozed",
    badge: "secondary" as const,
    icon: AlarmClock,
    color: "text-amber-600 dark:text-amber-400",
  },
};

export function DoseLogCard({ log, onUpdate }: DoseLogCardProps) {
  const [marking, setMarking] = React.useState<"taken" | "skipped" | null>(null);
  const isLogged = log.status === "taken" || log.status === "late";
  const scheduledDate = new Date(log.scheduled_time);
  const now = new Date();
  const isLate = now > scheduledDate && !isLogged;

  const statusConfig = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.snoozed;

  const handleMark = async (status: "taken" | "skipped") => {
    setMarking(status);
    const takenTime = status === "taken" ? new Date().toISOString() : null;
    const computedStatus = status === "taken" && now > scheduledDate ? "late" : status;

    try {
      // Try online sync first
      if (navigator.onLine) {
        await logDose({
          medicationId: log.medication_id,
          scheduledTime: log.scheduled_time,
          takenTime: takenTime ?? undefined,
          status: computedStatus,
          clientUuid: log.id,
        });
      } else if (offlineDb) {
        // Store offline in Dexie
        await offlineDb.doseLogs.put({
          id: log.id,
          medicationId: log.medication_id,
          scheduledTime: log.scheduled_time,
          takenTime: takenTime ?? undefined,
          status: computedStatus,
          syncStatus: "pending",
          createdAt: Date.now(),
        });
      }
    } finally {
      setMarking(null);
      onUpdate?.();
    }
  };

  return (
    <div
      className={cn(
        "rounded-3xl border bg-[hsl(var(--card))] p-5 transition-all",
        isLogged
          ? "border-[hsl(var(--border))] opacity-80"
          : isLate
          ? "border-amber-300/50 dark:border-amber-600/30 bg-amber-50/30 dark:bg-amber-900/10"
          : "border-[hsl(var(--primary))]/25 shadow-xs"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Medication Icon */}
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl",
            log.medications.is_controlled_drug
              ? "bg-[hsl(var(--terracotta))]/15"
              : "bg-[hsl(var(--primary))]/10"
          )}>
            💊
          </div>

          {/* Info */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm text-[hsl(var(--foreground))]">
                {log.medications.name}
              </span>
              {log.medications.strength && (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {log.medications.strength}
                </span>
              )}
              {isLogged && (
                <Badge variant={statusConfig.badge} className="text-[11px] py-0">
                  {statusConfig.label}
                </Badge>
              )}
              {isLate && !isLogged && (
                <Badge variant="accent" className="text-[11px] py-0 animate-gentle-pulse">
                  Due now
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                Scheduled {formatUKTime(scheduledDate)}
              </span>
              {log.taken_time && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Taken {formatUKTime(new Date(log.taken_time))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isLogged && log.status !== "skipped" && (
          <div className="flex shrink-0 flex-col gap-1.5">
            <Button
              size="sm"
              onClick={() => handleMark("taken")}
              disabled={!!marking}
              className="gap-1.5 text-xs h-9 min-h-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {marking === "taken" ? "Saving..." : "Taken"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMark("skipped")}
              disabled={!!marking}
              className="gap-1.5 text-xs h-9 min-h-0 text-[hsl(var(--muted-foreground))]"
            >
              <X className="h-3.5 w-3.5" />
              Skip
            </Button>
          </div>
        )}
      </div>

      {/* Missed dose neutral guidance (no shame language) */}
      {log.status === "skipped" && (
        <div className="mt-3 rounded-2xl bg-[hsl(var(--secondary))] px-4 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
          💙 If you are unsure what to do about a missed dose, check your patient information leaflet or speak to your pharmacist or GP.
        </div>
      )}
    </div>
  );
}
