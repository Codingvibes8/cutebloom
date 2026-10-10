"use client";

import * as React from "react";
import Link from "next/link";
import {
  Pill,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Zap,
  Bell,
  Package,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { formatUKDate, formatUKTime } from "@/lib/utils";

export default function Home() {
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Medical disclaimer (UK Compliance) */}
        <MedicalDisclaimer />

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--background))] to-[hsl(var(--secondary))]/50 p-6 sm:p-10 shadow-xs">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 3 & 4 Live</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              Gentle reminders. Zero guilt. Designed for how your brain works.
            </h1>

            <p className="text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
              Track medications, manage controlled-drug prescriptions, and conquer executive dysfunction with gentle 5-minute focus momentum.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/medications">
                <Button size="lg" className="gap-2">
                  <span>My Medications</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dose-log">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Zap className="h-5 w-5" />
                  <span>Today&apos;s Doses</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] rounded-2xl bg-[hsl(var(--secondary))]">
                <Clock className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span>
                  {currentDate
                    ? `${formatUKDate(currentDate)} • ${formatUKTime(currentDate)} (London)`
                    : "London (Europe/London)"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards — Phase 3 & 4 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Medications */}
            <Link href="/medications">
              <Card className="h-full transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                      <Pill className="h-5 w-5" />
                    </div>
                    <Badge variant="default">Phase 2</Badge>
                  </div>
                  <CardTitle className="pt-2 text-base">Medications</CardTitle>
                  <CardDescription>
                    Manage your medications, schedules, and controlled drug tracking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-[hsl(var(--muted-foreground))]">
                  Add medications with custom schedules, track doses, and view history.
                </CardContent>
              </Card>
            </Link>

            {/* Reminders */}
            <Link href="/reminders">
              <Card className="h-full transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--accent))]/50 text-[hsl(var(--accent-foreground))]">
                      <Bell className="h-5 w-5" />
                    </div>
                    <Badge variant="accent">Phase 3</Badge>
                  </div>
                  <CardTitle className="pt-2 text-base">Reminder Engine</CardTitle>
                  <CardDescription>
                    VAPID Web Push notifications with Taken, Snooze, and Skip actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-[hsl(var(--muted-foreground))]">
                  DST-safe scheduling, escalation nudges, and quiet hours.
                </CardContent>
              </Card>
            </Link>

            {/* Refill Tracker */}
            <Link href="/refills">
              <Card className="h-full transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--terracotta))]/15 text-[hsl(var(--terracotta))]">
                      <Package className="h-5 w-5" />
                    </div>
                    <Badge variant="terracotta">Phase 4</Badge>
                  </div>
                  <CardTitle className="pt-2 text-base">Refill Tracker</CardTitle>
                  <CardDescription>
                    Track prescription supplies with controlled drug 28-day awareness.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-[hsl(var(--muted-foreground))]">
                  Early reminders, days-supply tracking, and CD expiry dates.
                </CardContent>
              </Card>
            </Link>

            {/* Daily Check-in */}
            <Link href="/checkin">
              <Card className="h-full transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <Badge variant="default">Phase 4</Badge>
                  </div>
                  <CardTitle className="pt-2 text-base">Daily Check-in</CardTitle>
                  <CardDescription>
                    Under 15 seconds. Focus, mood, sleep, and side effects.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-[hsl(var(--muted-foreground))]">
                  Quick micro check-in with ratings and side-effect tracking.
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Today's Doses Quick Access */}
        <section className="space-y-4">
          <Link href="/dose-log" className="block">
            <Card className="transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">Today&apos;s Doses</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    View and log today&apos;s scheduled medication doses.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* UK Compliance */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--terracotta))]/15 text-[hsl(var(--terracotta))]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="terracotta">WCAG 2.2 AA</Badge>
              </div>
              <CardTitle className="pt-2 text-base">UK Compliance & Accessibility</CardTitle>
              <CardDescription>
                44px+ tap targets, OpenDyslexic font support, Europe/London timezone, and shame-free copy.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-[hsl(var(--muted-foreground))] space-y-2">
              <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
                <span>Timezone</span>
                <span className="text-[hsl(var(--foreground))] font-medium">Europe/London</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Disclaimer</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">UK Compliant</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
