"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, CheckCircle2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logDose } from "@/lib/actions/dose-logs";
import { offlineDb } from "@/lib/offline/db";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Status = "taken" | "skipped";

export default function LogDosePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const now = new Date();

  const [status, setStatus] = React.useState<Status>("taken");
  const [takenTime, setTakenTime] = React.useState(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Build scheduled time as start of today in UTC
    const today = new Date();
    const scheduledTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
    const takenTimestamp = status === "taken"
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate(),
          parseInt(takenTime.split(":")[0]), parseInt(takenTime.split(":")[1]), 0).toISOString()
      : null;

    const clientUuid = crypto.randomUUID();
    const computedStatus = status === "taken" && takenTimestamp && new Date(takenTimestamp) > now ? "taken" : status;

    try {
      if (navigator.onLine) {
        const result = await logDose({
          medicationId: id,
          scheduledTime,
          takenTime: takenTimestamp ?? undefined,
          status: computedStatus,
          clientUuid,
        });
        if (result.error) throw new Error(result.error);
      } else if (offlineDb) {
        await offlineDb.doseLogs.add({
          id: clientUuid,
          medicationId: id,
          scheduledTime,
          takenTime: takenTimestamp ?? undefined,
          status: computedStatus,
          syncStatus: "pending",
          createdAt: Date.now(),
        });
      }
      router.push(`/medications/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log dose. Please try again.");
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-md space-y-6">
        <Link
          href={`/medications/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">Log a Dose</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Record a manual dose entry. Changes are saved offline if you are not connected.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Taken / Skipped toggle */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">What happened?</label>
            <div className="grid grid-cols-2 gap-3">
              {(["taken", "skipped"] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border-2 py-4 font-medium text-sm transition-all",
                    status === s
                      ? s === "taken"
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--muted-foreground))]/50 bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {s === "taken" ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  {s === "taken" ? "Taken" : "Skipped"}
                </button>
              ))}
            </div>
          </div>

          {/* Taken Time (only for "taken") */}
          {status === "taken" && (
            <div className="space-y-1.5">
              <label htmlFor="taken-time" className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Time taken
              </label>
              <input
                id="taken-time"
                type="time"
                value={takenTime}
                onChange={(e) => setTakenTime(e.target.value)}
                className="flex min-h-[48px] w-full rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 py-2 text-base font-mono text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="log-notes" className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Notes <span className="text-[hsl(var(--muted-foreground))] font-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Taken with food..."
              rows={2}
              maxLength={300}
              className="flex w-full rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20 resize-none"
            />
          </div>

          {/* Missed-dose neutral guidance */}
          {status === "skipped" && (
            <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
              💙 If you are unsure what to do about a missed dose, check your patient information leaflet or speak to your pharmacist or GP.
            </div>
          )}

          {error && (
            <p className="text-xs text-[hsl(var(--destructive))] font-medium">{error}</p>
          )}

          <Button type="submit" disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Dose Log"}
          </Button>
        </form>
      </div>
    </main>
  );
}
