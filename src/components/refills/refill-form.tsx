"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  createRefillTracker,
  updateRefillTracker,
} from "@/lib/actions/refills";

interface RefillFormProps {
  medications: Array<{
    id: string;
    name: string;
    form: string;
    strength: string | null;
    is_controlled_drug: boolean;
  }>;
  defaultValues?: {
    id: string;
    medicationId: string;
    currentQuantity: number;
    unit: string;
    daysSupplyRemaining: number;
    requestByDate: string;
    lastRefillDate: string;
    controlledDrugExpiry: string;
    earlyReminderDays: number;
    notes: string;
  };
  mode?: "create" | "edit";
}

export function RefillForm({
  medications,
  defaultValues,
  mode = "create",
}: RefillFormProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [medicationId, setMedicationId] = React.useState(
    defaultValues?.medicationId || ""
  );
  const [currentQuantity, setCurrentQuantity] = React.useState(
    defaultValues?.currentQuantity?.toString() || "0"
  );
  const [unit, setUnit] = React.useState(defaultValues?.unit || "pills");
  const [daysSupplyRemaining, setDaysSupplyRemaining] = React.useState(
    defaultValues?.daysSupplyRemaining?.toString() || "0"
  );
  const [requestByDate, setRequestByDate] = React.useState(
    defaultValues?.requestByDate || ""
  );
  const [lastRefillDate, setLastRefillDate] = React.useState(
    defaultValues?.lastRefillDate || ""
  );
  const [controlledDrugExpiry, setControlledDrugExpiry] = React.useState(
    defaultValues?.controlledDrugExpiry || ""
  );
  const [earlyReminderDays, setEarlyReminderDays] = React.useState(
    defaultValues?.earlyReminderDays?.toString() || "7"
  );
  const [notes, setNotes] = React.useState(defaultValues?.notes || "");

  const selectedMed = medications.find((m) => m.id === medicationId);
  const isControlled = selectedMed?.is_controlled_drug || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      medicationId,
      currentQuantity: parseInt(currentQuantity, 10) || 0,
      unit,
      daysSupplyRemaining: parseInt(daysSupplyRemaining, 10) || 0,
      requestByDate: requestByDate || null,
      lastRefillDate: lastRefillDate || null,
      controlledDrugExpiry: isControlled
        ? controlledDrugExpiry || null
        : null,
      earlyReminderDays: parseInt(earlyReminderDays, 10) || 7,
      notes: notes || null,
    };

    const result =
      mode === "edit" && defaultValues?.id
        ? await updateRefillTracker({ ...payload, id: defaultValues.id })
        : await createRefillTracker(payload);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/refills");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "New Refill Tracker" : "Edit Refill Tracker"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Medication <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <div className="relative">
              <select
                value={medicationId}
                onChange={(e) => setMedicationId(e.target.value)}
                required
                className="flex min-h-[48px] w-full appearance-none rounded-2xl border-2 border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-2 pr-10 text-base capitalize focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
              >
                <option value="">Select medication</option>
                {medications.map((m) => (
                  <option key={m.id} value={m.id} className="capitalize">
                    {m.name} - {m.form}
                    {m.strength ? ` (${m.strength})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            </div>
            {fieldErrors.medicationId && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {fieldErrors.medicationId}
              </p>
            )}
          </div>

          {/* Controlled drug info */}
          {isControlled && (
            <div className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--terracotta))]/20 bg-[hsl(var(--terracotta))]/5 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--terracotta))]" />
              <div className="text-sm">
                <p className="font-medium text-[hsl(var(--terracotta))]">
                  Controlled Drug
                </p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  In the UK, controlled drugs are typically issued as single-item
                  prescriptions valid for 28 days. Set the prescription expiry
                  date to receive timely reminders.
                </p>
              </div>
            </div>
          )}

          {/* Quantity and unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Current quantity{" "}
                <span className="text-[hsl(var(--destructive))]">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Unit
              </label>
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex min-h-[48px] w-full appearance-none rounded-2xl border-2 border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-2 pr-10 text-base focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                >
                  <option value="pills">pills</option>
                  <option value="tablets">tablets</option>
                  <option value="capsules">capsules</option>
                  <option value="ml">ml</option>
                  <option value="patches">patches</option>
                  <option value="puffs">puffs</option>
                  <option value="other">other</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              </div>
            </div>
          </div>

          {/* Days supply */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Days of supply remaining{" "}
              <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={daysSupplyRemaining}
              onChange={(e) => setDaysSupplyRemaining(e.target.value)}
              required
            />
          </div>

          {/* Request by date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Request refill by{" "}
              <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                (optional)
              </span>
            </label>
            <Input
              type="date"
              value={requestByDate}
              onChange={(e) => setRequestByDate(e.target.value)}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              We will remind you a few days before this date.
            </p>
          </div>

          {/* Last refill date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Last refill date{" "}
              <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                (optional)
              </span>
            </label>
            <Input
              type="date"
              value={lastRefillDate}
              onChange={(e) => setLastRefillDate(e.target.value)}
            />
          </div>

          {/* Controlled drug expiry */}
          {isControlled && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Prescription expiry (CD){" "}
                <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                  (28 days from issue)
                </span>
              </label>
              <Input
                type="date"
                value={controlledDrugExpiry}
                onChange={(e) => setControlledDrugExpiry(e.target.value)}
              />
              <div className="flex items-start gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <p>
                  Controlled drug prescriptions in the UK expire 28 days after
                  the issue date. You cannot obtain a refill after this date
                  without a new prescription.
                </p>
              </div>
            </div>
          )}

          {/* Early reminder days */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Remind me early (days before)
            </label>
            <Input
              type="number"
              min="0"
              max="30"
              value={earlyReminderDays}
              onChange={(e) => setEarlyReminderDays(e.target.value)}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              We will notify you this many days before your request-by date.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Notes{" "}
              <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                (optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
              placeholder="Any notes about this prescription..."
            />
            <p className="text-right text-xs text-[hsl(var(--muted-foreground))]">
              {notes.length}/500
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--destructive))]" />
              <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/refills")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create tracker"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
