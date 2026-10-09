"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, X, Plus, Minus, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { medicationSchema, type MedicationInput } from "@/lib/validations/medication";
import { createMedication, updateMedication } from "@/lib/actions/medications";

const FORMS = ["tablet", "capsule", "liquid", "patch", "inhaler", "injection", "other"] as const;
const SCHEDULE_TYPES = [
  { value: "fixed_times", label: "Fixed times each day" },
  { value: "multiple_daily", label: "Multiple times per day" },
  { value: "as_needed", label: "As needed (PRN)" },
] as const;

interface MedicationFormProps {
  defaultValues?: Partial<MedicationInput> & { id?: string };
  mode?: "create" | "edit";
}

export function MedicationForm({ defaultValues, mode = "create" }: MedicationFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = React.useState(defaultValues?.name ?? "");
  const [form, setForm] = React.useState<string>(defaultValues?.form ?? "tablet");
  const [strength, setStrength] = React.useState(defaultValues?.strength ?? "");
  const [scheduleType, setScheduleType] = React.useState(defaultValues?.scheduleType ?? "fixed_times");
  const [scheduleTimes, setScheduleTimes] = React.useState<string[]>(defaultValues?.scheduleTimes ?? ["08:00"]);
  const [startDate, setStartDate] = React.useState(defaultValues?.startDate ?? today);
  const [endDate, setEndDate] = React.useState(defaultValues?.endDate ?? "");
  const [notes, setNotes] = React.useState(defaultValues?.notes ?? "");
  const [isControlledDrug, setIsControlledDrug] = React.useState(defaultValues?.isControlledDrug ?? false);
  const [isActive, setIsActive] = React.useState(defaultValues?.isActive ?? true);

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const addTime = () => setScheduleTimes((t) => [...t, "12:00"]);
  const removeTime = (i: number) => setScheduleTimes((t) => t.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) =>
    setScheduleTimes((t) => t.map((v, idx) => (idx === i ? val : v)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    const payload: MedicationInput = {
      name,
      form: form as MedicationInput["form"],
      strength: strength || undefined,
      scheduleType: scheduleType as MedicationInput["scheduleType"],
      scheduleTimes: scheduleType === "as_needed" ? ["00:00"] : scheduleTimes,
      startDate,
      endDate: endDate || undefined,
      notes: notes || undefined,
      isControlledDrug,
      isActive,
    };

    const validated = medicationSchema.safeParse(payload);
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validated.error.issues.forEach((e: any) => {
        const key = String(e.path.join("."));
        fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const result =
      mode === "edit" && defaultValues?.id
        ? await updateMedication(defaultValues.id, payload)
        : await createMedication(payload);

    setLoading(false);

    if (result.error) {
      setServerError(result.error);
    } else {
      router.push("/medications");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Medication Name */}
      <div className="space-y-1.5">
        <label htmlFor="med-name" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Medication name <span className="text-[hsl(var(--destructive))]">*</span>
        </label>
        <Input
          id="med-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Elvanse, Concerta, Strattera"
          required
        />
        {errors.name && <p className="text-xs text-[hsl(var(--destructive))]">{errors.name}</p>}
      </div>

      {/* Form & Strength */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="med-form" className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Form
          </label>
          <div className="relative">
            <select
              id="med-form"
              value={form}
              onChange={(e) => setForm(e.target.value)}
              className="flex min-h-[48px] w-full appearance-none rounded-2xl border-2 border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-2 pr-10 text-base text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20 capitalize"
            >
              {FORMS.map((f) => (
                <option key={f} value={f} className="capitalize">
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="med-strength" className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Strength
          </label>
          <Input
            id="med-strength"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="e.g. 30mg"
          />
        </div>
      </div>

      {/* Schedule Type */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Schedule
        </label>
        <div className="grid gap-2">
          {SCHEDULE_TYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScheduleType(s.value)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm transition-colors",
                scheduleType === s.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/8 text-[hsl(var(--foreground))] font-medium"
                  : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40"
              )}
            >
              <div className={cn(
                "h-4 w-4 rounded-full border-2 shrink-0",
                scheduleType === s.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]"
                  : "border-[hsl(var(--muted-foreground))]"
              )} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Times (not shown for as_needed) */}
      {scheduleType !== "as_needed" && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Reminder times (24h)
          </label>
          <div className="space-y-2">
            {scheduleTimes.map((time, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(i, e.target.value)}
                  className="flex-1 font-mono"
                />
                {scheduleTimes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTime(i)}
                    className="h-12 w-12 shrink-0 rounded-2xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                    title="Remove time"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTime}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add another time
          </Button>
          {errors.scheduleTimes && (
            <p className="text-xs text-[hsl(var(--destructive))]">{errors.scheduleTimes}</p>
          )}
        </div>
      )}

      {/* Start / End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="start-date" className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Start date <span className="text-[hsl(var(--destructive))]">*</span>
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="end-date" className="text-sm font-semibold text-[hsl(var(--foreground))]">
            End date
            <span className="ml-1 text-[hsl(var(--muted-foreground))] font-normal text-xs">(optional)</span>
          </label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Controlled Drug Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setIsControlledDrug(!isControlledDrug)}
          className={cn(
            "flex w-full items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition-all",
            isControlledDrug
              ? "border-[hsl(var(--terracotta))]/50 bg-[hsl(var(--terracotta))]/8"
              : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          )}
        >
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl",
            isControlledDrug ? "bg-[hsl(var(--terracotta))]/20" : "bg-[hsl(var(--secondary))]"
          )}>
            🛡️
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[hsl(var(--foreground))]">
                Controlled Drug (Schedule 2/3)
              </span>
              <div className={cn(
                "h-5 w-9 rounded-full transition-colors relative",
                isControlledDrug ? "bg-[hsl(var(--terracotta))]" : "bg-[hsl(var(--muted))]"
              )}>
                <div className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                  isControlledDrug ? "left-4" : "left-0.5"
                )} />
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              e.g. Elvanse, Ritalin, Medikinet. Enables 28-day prescription tracking.
            </p>
          </div>
        </button>

        {isControlledDrug && (
          <div className="mt-3 rounded-2xl bg-[hsl(var(--terracotta))]/8 border border-[hsl(var(--terracotta))]/25 px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[hsl(var(--terracotta))]" />
            <p className="text-xs text-[hsl(var(--foreground))]">
              <span className="font-semibold">Controlled Drug Mode: </span>
              Your refill tracker will show 28-day single-issue prescription windows. CuteBloom does not verify prescriptions — always check with your pharmacist or GP.
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label htmlFor="med-notes" className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Notes
          <span className="ml-1 text-[hsl(var(--muted-foreground))] font-normal text-xs">(optional)</span>
        </label>
        <textarea
          id="med-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Take with water after breakfast, avoid evening doses..."
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
          {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Add Medication"}
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
