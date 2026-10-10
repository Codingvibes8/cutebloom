"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveDailyCheckin } from "@/lib/actions/checkins";
import type { DailyCheckinInput } from "@/lib/validations/checkin";

interface CheckinFormProps {
  existingCheckin?: {
    focus_rating: number | null;
    mood_rating: number | null;
    sleep_hours: number | null;
    sleep_quality: number | null;
    appetite_rating: number | null;
    side_effects: string[];
    note: string | null;
  } | null;
}

const SIDE_EFFECT_OPTIONS = [
  "Dry mouth",
  "Decreased appetite",
  "Difficulty sleeping",
  "Headache",
  "Nausea",
  "Irritability",
  "Fatigue",
  "Dizziness",
  "Stomach ache",
  "Increased heart rate",
];

const RATING_LABELS = ["", "Very low", "Low", "Moderate", "High", "Very high"];

function RatingSelector({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: number | null;
  onChange: (val: number | null) => void;
  icon: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              "flex-1 min-h-[44px] rounded-2xl border-2 text-sm font-medium transition-all",
              value === n
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40"
            )}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      {value !== null && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          {RATING_LABELS[value]}
        </p>
      )}
    </div>
  );
}

export function CheckinForm({ existingCheckin }: CheckinFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [focusRating, setFocusRating] = React.useState<number | null>(existingCheckin?.focus_rating ?? null);
  const [moodRating, setMoodRating] = React.useState<number | null>(existingCheckin?.mood_rating ?? null);
  const [sleepHours, setSleepHours] = React.useState(existingCheckin?.sleep_hours?.toString() ?? "");
  const [sleepQuality, setSleepQuality] = React.useState<number | null>(existingCheckin?.sleep_quality ?? null);
  const [appetiteRating, setAppetiteRating] = React.useState<number | null>(existingCheckin?.appetite_rating ?? null);
  const [sideEffects, setSideEffects] = React.useState<string[]>(existingCheckin?.side_effects ?? []);
  const [note, setNote] = React.useState(existingCheckin?.note ?? "");

  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleSideEffect = (effect: string) => {
    setSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const payload: DailyCheckinInput = {
      date: today,
      focusRating,
      moodRating,
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      sleepQuality,
      appetiteRating,
      sideEffects,
      note: note || null,
      clientUuid: crypto.randomUUID(),
    };

    const result = await saveDailyCheckin(payload);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
            <Check className="h-5 w-5" />
          </div>
          {existingCheckin && (
            <Badge variant="accent">Editing today&apos;s check-in</Badge>
          )}
        </div>
        <CardTitle className="pt-2 text-base">Daily Check-in</CardTitle>
        <CardDescription>
          Takes less than 15 seconds. Just tap what feels right — no wrong answers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Focus Rating */}
          <RatingSelector
            label="Focus today"
            value={focusRating}
            onChange={setFocusRating}
            icon="🎯"
          />

          {/* Mood Rating */}
          <RatingSelector
            label="Mood today"
            value={moodRating}
            onChange={setMoodRating}
            icon="💛"
          />

          {/* Sleep */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
              <span>😴</span>
              Sleep
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Hours</span>
                <Input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="7.5"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Quality</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSleepQuality(sleepQuality === n ? null : n)}
                      className={cn(
                        "flex-1 min-h-[44px] rounded-xl border-2 text-sm font-medium transition-all",
                        sleepQuality === n
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appetite Rating */}
          <RatingSelector
            label="Appetite today"
            value={appetiteRating}
            onChange={setAppetiteRating}
            icon="🍽️"
          />

          {/* Side Effects */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
              <span>⚡</span>
              Side effects
              <span className="text-[hsl(var(--muted-foreground))] font-normal text-xs">(tap all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SIDE_EFFECT_OPTIONS.map((effect) => (
                <button
                  key={effect}
                  type="button"
                  onClick={() => toggleSideEffect(effect)}
                  className={cn(
                    "min-h-[44px] rounded-2xl border-2 px-4 py-2 text-sm font-medium transition-all",
                    sideEffects.includes(effect)
                      ? "border-[hsl(var(--terracotta))] bg-[hsl(var(--terracotta))]/10 text-[hsl(var(--terracotta))]"
                      : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--terracotta))]/40"
                  )}
                  aria-pressed={sideEffects.includes(effect)}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="checkin-note" className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Quick note
              <span className="ml-1 text-[hsl(var(--muted-foreground))] font-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="checkin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Anything worth remembering..."
              maxLength={300}
              className="flex min-h-[60px] w-full rounded-2xl border-2 border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20 resize-none"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-right">{note.length}/300</p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="rounded-2xl bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 px-4 py-3">
              <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            </div>
          )}
          {saved && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Check-in saved. Have a good day.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Check-in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Skip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
