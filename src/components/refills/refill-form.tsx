"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, X, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createRefillTracker, updateRefillTracker } from "@/lib/actions/refills";
import type { RefillTrackerInput } from "@/lib/validations/refill";

interface Medication {
  id: string;
  name: string;
  form: string;
  strength: string | null;
  is_controlled_drug: boolean;
}

interface RefillFormProps {
  medications: Medication[];
  defaultValues?: Partial<RefillTrackerInput> & { id?: string };
  mode?: "create" | "edit";
}

const UNITS = ["pills", "tablets", "capsules", "ml", "patches", "inhalations", "doses"] as const;

export function RefillForm({ medications, defaultValues, mode = "create" }: RefillFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [medicationId, setMedicationId] = React.useState(defaultValues?.medicationId ?? "");
  const [currentQuantity, setCurrentQuantity] = React.useState(
    defaultValues?.currentQuantity?.toString() ?? "0"
  );
  const [unit, setUnit] = React.useState(defaultValues?.unit ?? "pills");
  const [daysSupplyRemaining, setDaysSupplyRemaining] = React.useState(
    defaultValues?.daysSupplyRemaining?.toString() ?? "0"
  );
  const [requestByDate, setRequestByDate] = React.useState(defaultValues?.requestByDate ?? "");
  const [lastRefillDate, setLastRefillDate] = React.useState(defaultValues?.lastRefillDate ?? today);
  const [controlledDrugExpiry, setControlledDrugExpiry] = React.useState(
    defaultValues?.controlledDrugExpiry ?? ""
  );
  const [earlyReminderDays, setEarlyReminderDays] = React.useState(
    defaultValues?.earlyReminderDays?.toString() ?? "7"
  );
  const [notes, setNotes] = React.useState(defaultValues?.notes ?? "");

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const selectedMed = medications.find((m) => m.id === medicationId);
  const isControlledDrug = selectedMed?.is_controlled_drug ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    const payload: RefillTrackerInput = {
      medicationId,
      currentQuantity: parseInt(currentQuantity) || 0,
      unit,
      daysSupplyRemaining: parseInt(daysSupplyRemaining) || 0,
      requestByDate: requestByDate || null,
      lastRefillDate: lastRefillDate || null,
      controlledDrugExpiry: controlledDrugExpiry || null,
      earlyReminderDays: parseInt(earlyReminderDays) || 7,
      notes: notes || null,
    };

    const result =
      mode === "edit" && defaultValues?.id
        ? await updateRefillTracker(defaultValues.id, payload)
        : await createRefillTracker(payload);

    setLoading(false);

    if (result.error) {
      setServerError(result.error);
    } else {
      router.push("/refills");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Medication */}
      <div className="space-y-1.5">
        <label htmlFor="refill-med" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Medication <span className="text-[hsl(var(--destructive))]">*</span>
        </label>
        <div className="relative">
          <select
            id="refill-med"
            value={medicationId}
            onChange={(e) => setMedicationId(e.target.value)}
            required
            className="flex min-h-[48px] w-full appearance-none rounded-2xl border-2 border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-2 pr-10 text-base text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
          >
            <option value="">Select a medication</option>
            {medications.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.strength ? `(${m.strength})` : ""} {m.is_controlled_drug ? "— Controlled Drug" : ""}
              </option>
            ))}
          </select>
        </div>
        {errors.medicationId && <p className="text-xs text-[hsl(var(--destructive))]">{errors.medicationId}</p>}
      </div>

      {/* Controlled Drug Info */}
      {isControlledDrug && (
        <div className="rounded-2xl bg-[hsl(var(--terracotta))]/8 border border-[hsl(var(--terracotta))]/25 px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[hsl(var(--terracotta))]" />
          <p className="text-xs text-[hsl(var(--foreground))]">
            <span className="font-semibold">Controlled Drug Mode: </span>
            28-day single-issue prescription tracking. Set the prescription expiry date below.
          </p>
        </div>
      )}

      {/* Quantity & Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="refill-qty" className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Current quantity <span className="text-[hsl(var(--destructive))]">*</span>
          </label>
          <Input
            id="refill-qty"
            type="number"
            min={0}
            value={currentQuantity}
            onChange={(e) => setCurrentQuantity(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="refill-unit" className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Unit
          </label>
          <div className="relative">
            <select
              id="refill-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="flex min-h-[48px] w-full appearance-none rounded-2xl border-2 border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-2 pr-10 text-base text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Days Supply Remaining */}
      <div className="space-y-1.5">
        <label htmlFor="refill-days" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Days of supply remaining <span className="text-[hsl(var(--destructive))]">*</span>
        </label>
        <Input
          id="refill-days"
          type="number"
          min={0}
          value={daysSupplyRemaining}
          onChange={(e) => setDaysSupplyRemaining(e.target.value)}
          required
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Estimated days until you run out based on your daily usage
        </p>
      </div>

      {/* Request By Date */}
      <div className="space-y-1.5">
        <label htmlFor="refill-request" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Request prescription by
          <span className="ml-1 text-[hsl(var(--muted-foreground))] font-normal text-xs">(optional)</span>
        </label>
        <Input
          id="refill-request"
          type="date"
          value={requestByDate}
          onChange={(e) => setRequestByDate(e.target.value)}
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          You'll be reminded this many days before running out
        </p>
      </div>

      {/* Last Refill Date */}
      <div className="space-y-1.5">
        <label htmlFor="refill-last" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Last refill date
        </label>
        <Input
          id="refill-last"
          type="date"
          value={lastRefillDate}
          onChange={(e) => setLastRefillDate(e.target.value)}
        />
      </div>

      {/* Controlled Drug Expiry */}
      {isControlledDrug && (
        <div className="space-y-1.5">
          <label htmlFor="refill-cd-expiry" className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[hsl(var(--terracotta))]" />
            Prescription expiry date
          </label>
          <Input
            id="refill-cd-expiry"
            type="date"
            value={controlledDrugExpiry}
            onChange={(e) => setControlledDrugExpiry(e.target.value)}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Controlled drug prescriptions are valid for 28 days from issue date
          </p>
        </div>
      )}

      {/* Early Reminder Days */}
      <div className="space-y-1.5">
        <label htmlFor="refill-reminder" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Early reminder (days before running out)
        </label>
        <Input
          id="refill-reminder"
          type="number"
          min={0}
          max={30}
          value={earlyReminderDays}
          onChange={(e) => setEarlyReminderDays(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label htmlFor="refill-notes" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Notes
          <span className="ml-1 text-[hsl(var(--muted-foreground))] font-normal text-xs">(optional)</span>
        </label>
        <textarea
          id="refill-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Pharmacy name, prescription number, collection notes..."
          maxLength={500}
          className="flex min-h-[80px] w-full rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20 resize-none"
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-right">{notes.length}/500</p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="rounded-2xl bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 px-4 py-3">
          <p className="text-sm text-[hsl(var(--destructive))] font-medium">{serverError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Add Refill Tracker"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
