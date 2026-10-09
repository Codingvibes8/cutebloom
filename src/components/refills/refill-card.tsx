"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  CalendarClock,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatUKDate } from "@/lib/utils";

interface RefillCardProps {
  refill: {
    id: string;
    current_quantity: number;
    unit: string;
    days_supply_remaining: number;
    request_by_date: string | null;
    last_refill_date: string | null;
    controlled_drug_expiry: string | null;
    early_reminder_days: number;
    isLow: boolean;
    isControlled: boolean;
    isExpiring: boolean;
    medication: {
      name: string;
      form: string;
      strength: string | null;
      is_controlled_drug: boolean;
    };
  };
}

export function RefillCard({ refill }: RefillCardProps) {
  const {
    id,
    current_quantity,
    unit,
    days_supply_remaining,
    request_by_date,
    controlled_drug_expiry,
    isLow,
    isControlled,
    isExpiring,
    medication,
  } = refill;

  const controlledDrugExpiry = controlled_drug_expiry;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isLow &&
          "border-amber-300/50 dark:border-amber-600/30 bg-amber-50/30 dark:bg-amber-900/10",
        isExpiring &&
          "border-terracotta/30 dark:border-terracotta/20"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                isControlled
                  ? "bg-[hsl(var(--terracotta))]/10"
                  : "bg-[hsl(var(--primary))]/10"
              )}
            >
              <Package
                className={cn(
                  "h-6 w-6",
                  isControlled
                    ? "text-[hsl(var(--terracotta))]"
                    : "text-[hsl(var(--primary))]"
                )}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{medication.name}</CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {medication.form}
                {medication.strength && ` - ${medication.strength}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {medication.is_controlled_drug && (
              <Badge variant="terracotta">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Controlled
              </Badge>
            )}
            {isLow && (
              <Badge variant="secondary">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Low stock
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quantity remaining</span>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isLow && "text-amber-600 dark:text-amber-400"
            )}
          >
            {current_quantity}
            <span className="ml-1 text-sm font-normal text-[hsl(var(--muted-foreground))]">
              {unit}
            </span>
          </span>
        </div>

        {/* Days supply */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              Days supply
            </span>
            <span
              className={cn(
                "font-medium tabular-nums",
                days_supply_remaining <= 3 &&
                  "text-amber-600 dark:text-amber-400"
              )}
            >
              {days_supply_remaining} days
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                days_supply_remaining <= 3
                  ? "bg-amber-500"
                  : "bg-[hsl(var(--primary))]"
              )}
              style={{
                width: `${Math.min(100, (days_supply_remaining / 28) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Request by date */}
        {request_by_date && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              Request by:
            </span>
            <span className="font-medium">
              {formatUKDate(request_by_date)}
            </span>
          </div>
        )}

        {/* Controlled drug expiry */}
        {isControlled && controlledDrugExpiry && (
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-[hsl(var(--terracotta))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              CD expiry:
            </span>
            <span className="font-medium text-[hsl(var(--terracotta))]">
              {formatUKDate(controlledDrugExpiry)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/refills/${id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Update
            </Button>
          </Link>
          <Link href={`/refills/${id}/log`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              Log refill
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
