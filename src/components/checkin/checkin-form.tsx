"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Moon,
  Utensils,
  Heart,
  AlertCircle,
  Check,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createDailyCheckin } from "@/lib/actions/checkins";

const SIDE_EFFECT_OPTIONS = [
  "Nausea",
  "Headache",
  "Dry mouth",
  "Insomnia",
  "Dizziness",
  "Fatigue",
  "Anxiety",
  "Loss of appetite",
  "Irritability",
  "Constipation",
];

interface RatingChipProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  icon: React.ReactNode;
  colorClass: string;
}

function RatingChip({
  label,
  value,
  onChange,
  icon,
  colorClass,
}: RatingChipProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className={colorClass}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(value === rating ? null : rating)}
            className={cn(
              "flex h-10 flex-1 items-center justify-center rounded-xl border-2 text-sm font-medium transition-all",
              value === rating
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40"
            )}
            aria-pressed={value === rating}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}

interface CheckinFormProps {
  defaultValues?: {
    date: string;
    focusRating: number | null;
    moodRating: number | null;
    sleepHours: number | null;
    sleepQuality: number | null;
    appetiteRating: number | null;
    sideEffects: string[];
    note: string;
  };
}

export function CheckinForm({ defaultValues }: CheckinFormProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [focusRating, setFocusRating] = React.useState<number | null>(
    defaultValues?.focusRating ?? null
  );
  const [moodRating, setMoodRating] = React.useState<number | null>(
    defaultValues?.moodRating ?? null
  );
  const [sleepHours, setSleepHours] = React.useState<string>(
    defaultValues?.sleepHours?.toString() ?? ""
  );
  const [sleepQuality, setSleepQuality] = React.useState<number | null>(
    defaultValues?.sleepQuality ?? null
  );
  const [appetiteRating, setAppetiteRating] = React.useState<number | null>(
    defaultValues?.appetiteRating ?? null
  );
  const [sideEffects, setSideEffects] = React.useState<string[]>(
    defaultValues?.sideEffects ?? []
  );
  const [note, setNote] = React.useState(defaultValues?.note ?? "");

  const today = React.useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [day, month, year] = formatter.format(now).split("/");
    return `${year}-${month}-${day}`;
  }, []);

  const toggleSideEffect = (effect: string) => {
    setSideEffects((prev) =>
      prev.includes(effect)
        ? prev.filter((e) => e !== effect)
        : [...prev, effect]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createDailyCheckin({
      date: today,
      focusRating,
      moodRating,
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      sleepQuality,
      appetiteRating,
      sideEffects,
      note: note || null,
      clientUuid: crypto.randomUUID(),
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/checkin");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Check-in</CardTitle>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Takes less than 15 seconds. No pressure to fill everything in.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Focus rating */}
          <RatingChip
            label="Focus"
            value={focusRating}
            onChange={setFocusRating}
            icon={<Brain className="h-4 w-4" />}
            colorClass="text-[hsl(var(--primary))]"
          />

          {/* Mood rating */}
          <RatingChip
            label="Mood"
            value={moodRating}
            onChange={setMoodRating}
            icon={<Heart className="h-4 w-4" />}
            colorClass="text-[hsl(var(--accent))]"
          />

          {/* Sleep */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Moon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>Sleep</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="Hours"
                className="h-12 w-24 rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 text-center text-base focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
              />
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setSleepQuality(sleepQuality === rating ? null : rating)
                    }
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-medium transition-all",
                      sleepQuality === rating
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40"
                    )}
                    aria-pressed={sleepQuality === rating}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Hours slept (left) and quality (1-5)
            </p>
          </div>

          {/* Appetite */}
          <RatingChip
            label="Appetite"
            value={appetiteRating}
            onChange={setAppetiteRating}
            icon={<Utensils className="h-4 w-4" />}
            colorClass="text-[hsl(var(--secondary))]"
          />

          {/* Side effects */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>Side effects</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIDE_EFFECT_OPTIONS.map((effect) => {
                const isSelected = sideEffects.includes(effect);
                return (
                  <button
                    key={effect}
                    type="button"
                    onClick={() => toggleSideEffect(effect)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm transition-all",
                      isSelected
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40"
                    )}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {effect}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Note{" "}
              <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                (optional)
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={300}
              className="w-full resize-none rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
              placeholder="Anything you want to remember about today..."
            />
            <p className="text-right text-xs text-[hsl(var(--muted-foreground))]">
              {note.length}/300
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 px-4 py-3">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--destructive))]" />
              <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save check-in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
