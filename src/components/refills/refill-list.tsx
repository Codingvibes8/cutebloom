"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Pill, Shield, AlertTriangle, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatUKDate } from "@/lib/utils";

interface RefillTracker {
  id: string;
  medication_id: string;
  current_quantity: number;
  unit: string;
  days_supply_remaining: number;
  request_by_date: string | null;
  last_refill_date: string | null;
  controlled_drug_expiry: string | null;
  early_reminder_days: number;
  notes: string | null;
  medications: {
    name: string;
    form: string;
    strength: string | null;
    is_controlled_drug: boolean;
  };
}

interface RefillListProps {
  trackers: RefillTracker[];
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getSupplyStatus(days: number): { label: string; variant: "default" | "accent" | "terracotta" | "destructive" } {
  if (days <= 0) return { label: "Expired", variant: "destructive" };
  if (days <= 3) return { label: "Critical", variant: "destructive" };
  if (days <= 7) return { label: "Low", variant: "terracotta" };
  if (days <= 14) return { label: "Running low", variant: "accent" };
  return { label: "OK", variant: "default" };
}

export function RefillList({ trackers }: RefillListProps) {
  const router = useRouter();

  if (trackers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(var(--primary))]/10 text-3xl">
          <Package className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--foreground))]">No refill trackers yet</h3>
        <p className="mb-6 max-w-xs text-sm text-[hsl(var(--muted-foreground))]">
          Add a refill tracker to monitor your prescription supply and get early reminders.
        </p>
        <Button onClick={() => router.push("/refills/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Refill Tracker
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trackers.map((tracker) => {
        const supplyStatus = getSupplyStatus(tracker.days_supply_remaining);
        const requestDays = tracker.request_by_date ? getDaysUntil(tracker.request_by_date) : null;
        const cdExpiryDays = tracker.controlled_drug_expiry ? getDaysUntil(tracker.controlled_drug_expiry) : null;

        return (
          <button
            key={tracker.id}
            onClick={() => router.push(`/refills/${tracker.id}`)}
            className={cn(
              "w-full text-left rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl",
                    tracker.medications.is_controlled_drug
                      ? "bg-[hsl(var(--terracotta))]/15"
                      : "bg-[hsl(var(--primary))]/10"
                  )}
                >
                  {tracker.medications.is_controlled_drug ? (
                    <Shield className="h-6 w-6 text-[hsl(var(--terracotta))]" />
                  ) : (
                    <Pill className="h-6 w-6 text-[hsl(var(--primary))]" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-base text-[hsl(var(--foreground))]">
                      {tracker.medications.name}
                    </span>
                    {tracker.medications.strength && (
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        {tracker.medications.strength}
                      </span>
                    )}
                    {tracker.medications.is_controlled_drug && (
                      <Badge variant="terracotta" className="gap-1 py-0.5">
                        <Shield className="h-3 w-3" />
                        CD
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {tracker.current_quantity} {tracker.unit}
                    </span>
                    <span>•</span>
                    <span className={cn(
                      "font-medium",
                      tracker.days_supply_remaining <= 3
                        ? "text-[hsl(var(--destructive))]"
                        : tracker.days_supply_remaining <= 7
                        ? "text-[hsl(var(--terracotta))]"
                        : "text-[hsl(var(--foreground))]"
                    )}>
                      {tracker.days_supply_remaining} days left
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={supplyStatus.variant} className="text-[11px] py-0">
                      {supplyStatus.label}
                    </Badge>
                    {requestDays !== null && (
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {requestDays > 0
                          ? `Request by ${formatUKDate(tracker.request_by_date!)} (${requestDays}d)`
                          : requestDays === 0
                          ? "Request due today"
                          : `Request overdue by ${Math.abs(requestDays)}d`}
                      </span>
                    )}
                    {cdExpiryDays !== null && (
                      <span className="text-[11px] text-[hsl(var(--terracotta))]">
                        {cdExpiryDays > 0
                          ? `CD expires in ${cdExpiryDays}d`
                          : "CD expired"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 mt-1 shrink-0 text-[hsl(var(--muted-foreground))]" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
