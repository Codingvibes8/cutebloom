import type { Metadata } from "next";
import Link from "next/link";
import { Plus, CheckCircle, Moon, Brain, Heart, Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodaysCheckin, getDailyCheckins } from "@/lib/actions/checkins";
import { CheckinForm } from "@/components/checkin/checkin-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { formatUKDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Daily Check-in — CuteBloom",
  description: "Quick daily check-in for focus, mood, sleep, and side effects.",
};

export const dynamic = "force-dynamic";

const RATING_LABELS: Record<number, string> = {
  1: "Very poor",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export default async function CheckinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold">Daily Check-in</h1>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Please sign in to complete your daily check-in.
            </p>
            <Link href="/auth" className="mt-4 inline-block">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: todaysCheckin } = await getTodaysCheckin();
  const { data: recentCheckins } = await getDailyCheckins(7);

  // Compute today's date string in London timezone
  const now = new Date();
  const londonFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [day, month, year] = londonFormatter.format(now).split("/");
  const todayStr = `${year}-${month}-${day}`;

  const alreadyCheckedIn = todaysCheckin != null;

  return (
    <div className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Daily Check-in</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Takes less than 15 seconds
            </p>
          </div>
          {alreadyCheckedIn && (
            <Badge variant="accent" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Done for today
            </Badge>
          )}
        </div>

        {/* Check-in form (hidden if already done) */}
        {!alreadyCheckedIn && (
          <CheckinForm
            defaultValues={{
              date: todayStr,
              focusRating: null,
              moodRating: null,
              sleepHours: null,
              sleepQuality: null,
              appetiteRating: null,
              sideEffects: [],
              note: "",
            }}
          />
        )}

        {/* Today's summary */}
        {alreadyCheckedIn && todaysCheckin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
                Today&apos;s check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {todaysCheckin.focus_rating && (
                  <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Brain className="h-3 w-3" />
                      Focus
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {todaysCheckin.focus_rating}/5
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {RATING_LABELS[todaysCheckin.focus_rating]}
                    </p>
                  </div>
                )}
                {todaysCheckin.mood_rating && (
                  <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Heart className="h-3 w-3" />
                      Mood
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {todaysCheckin.mood_rating}/5
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {RATING_LABELS[todaysCheckin.mood_rating]}
                    </p>
                  </div>
                )}
                {todaysCheckin.sleep_hours != null && (
                  <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Moon className="h-3 w-3" />
                      Sleep
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {todaysCheckin.sleep_hours}h
                    </p>
                    {todaysCheckin.sleep_quality && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Quality: {todaysCheckin.sleep_quality}/5
                      </p>
                    )}
                  </div>
                )}
                {todaysCheckin.appetite_rating && (
                  <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Utensils className="h-3 w-3" />
                      Appetite
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {todaysCheckin.appetite_rating}/5
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {RATING_LABELS[todaysCheckin.appetite_rating]}
                    </p>
                  </div>
                )}
              </div>

              {todaysCheckin.side_effects &&
                todaysCheckin.side_effects.length > 0 && (
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Side effects
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {todaysCheckin.side_effects.map((effect: string) => (
                        <Badge key={effect} variant="outline">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {todaysCheckin.note && (
                <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Note
                  </p>
                  <p className="mt-1 text-sm">{todaysCheckin.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent check-ins */}
        {recentCheckins && recentCheckins.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent check-ins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCheckins.slice(0, 7).map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center justify-between rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatUKDate(checkin.date)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      {checkin.focus_rating && (
                        <span>Focus: {checkin.focus_rating}/5</span>
                      )}
                      {checkin.mood_rating && (
                        <span>Mood: {checkin.mood_rating}/5</span>
                      )}
                      {checkin.sleep_hours != null && (
                        <span>Sleep: {checkin.sleep_hours}h</span>
                      )}
                      {checkin.appetite_rating && (
                        <span>Appetite: {checkin.appetite_rating}/5</span>
                      )}
                    </div>
                    {checkin.side_effects && checkin.side_effects.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {checkin.side_effects.map((effect: string) => (
                          <Badge key={effect} variant="outline" className="text-[10px]">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Medical disclaimer */}
        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
