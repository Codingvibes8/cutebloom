"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Pill, Clock, Shield, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUKDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Medication {
  id: string;
  name: string;
  form: string;
  strength: string | null;
  schedule_type: string;
  schedule_times: string[];
  start_date: string;
  is_controlled_drug: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface MedicationListProps {
  medications: Medication[];
}

const FORM_EMOJI: Record<string, string> = {
  tablet: "💊",
  capsule: "💊",
  liquid: "🧪",
  patch: "🩹",
  inhaler: "💨",
  injection: "💉",
  other: "🔵",
};

const SCHEDULE_LABEL: Record<string, string> = {
  fixed_times: "Fixed times",
  multiple_daily: "Multiple daily",
  as_needed: "As needed (PRN)",
};

export function MedicationList({ medications }: MedicationListProps) {
  const router = useRouter();

  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(var(--primary))]/10 text-3xl">
          💊
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--foreground))]">
          No medications yet
        </h3>
        <p className="mb-6 max-w-xs text-sm text-[hsl(var(--muted-foreground))]">
          Add your first medication to start tracking doses and getting gentle reminders.
        </p>
        <Button onClick={() => router.push("/medications/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add First Medication
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {medications.map((med) => (
        <button
          key={med.id}
          onClick={() => router.push(`/medications/${med.id}`)}
          className={cn(
            "w-full text-left rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
            !med.is_active && "opacity-60"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl",
                med.is_controlled_drug
                  ? "bg-[hsl(var(--terracotta))]/15"
                  : "bg-[hsl(var(--primary))]/10"
              )}>
                {FORM_EMOJI[med.form] ?? "💊"}
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-base text-[hsl(var(--foreground))]">
                    {med.name}
                  </span>
                  {med.strength && (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {med.strength}
                    </span>
                  )}
                  {med.is_controlled_drug && (
                    <Badge variant="terracotta" className="gap-1 py-0.5">
                      <Shield className="h-3 w-3" />
                      Controlled Drug
                    </Badge>
                  )}
                  {!med.is_active && (
                    <Badge variant="secondary" className="py-0.5">Archived</Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1 capitalize">
                    <Pill className="h-3 w-3" />
                    {med.form}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {SCHEDULE_LABEL[med.schedule_type] ?? med.schedule_type}
                    {med.schedule_type !== "as_needed" && med.schedule_times.length > 0 && (
                      <span className="ml-1 font-mono">
                        ({med.schedule_times.join(", ")})
                      </span>
                    )}
                  </span>
                </div>

                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Started {formatUKDate(med.start_date)}
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 mt-1 shrink-0 text-[hsl(var(--muted-foreground))]" />
          </div>
        </button>
      ))}
    </div>
  );
}
