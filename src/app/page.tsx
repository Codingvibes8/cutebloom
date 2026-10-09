"use client";

import * as React from "react";
import Link from "next/link";
import {
  Pill,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  CloudCheck,
  Zap,
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

        {/* Hero Banner: Calm & Shame-Free Tone */}
        <section className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--background))] to-[hsl(var(--secondary))]/50 p-6 sm:p-10 shadow-xs">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 1 Foundation Live</span>
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

        {/* Architecture Status / Phase 1 Deliverables Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                System Architecture & Foundation
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Phase 1 verification: Supabase Auth, Drizzle ORM, RLS, and Dexie offline storage.
              </p>
            </div>
            <Badge variant="default" className="text-xs">
              Phase 1 Complete
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Supabase & RLS Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                    <Database className="h-5 w-5" />
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                <CardTitle className="pt-2 text-base">Supabase & RLS</CardTitle>
                <CardDescription>
                  Tenant isolation enforced on every table. Special-category UK GDPR health data safety.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-[hsl(var(--muted-foreground))] space-y-2">
                <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
                  <span>Supabase URL</span>
                  <span className="font-mono text-[11px] text-[hsl(var(--foreground))]">zxplsdbnmo...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>RLS Policies</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">auth.uid() isolated</span>
                </div>
              </CardContent>
            </Card>

            {/* Offline-First & Dexie Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--accent))]/50 text-[hsl(var(--accent-foreground))]">
                    <CloudCheck className="h-5 w-5" />
                  </div>
                  <Badge variant="accent">Dexie Ready</Badge>
                </div>
                <CardTitle className="pt-2 text-base">Offline-First Engine</CardTitle>
                <CardDescription>
                  IndexedDB local caching with background synchronisation and zero data loss.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-[hsl(var(--muted-foreground))] space-y-2">
                <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
                  <span>Storage Engine</span>
                  <span className="text-[hsl(var(--foreground))] font-medium">IndexedDB (Dexie)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Offline Sync Status</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Automatic sync</span>
                </div>
              </CardContent>
            </Card>

            {/* UK Compliance & Accessibility Card */}
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--terracotta))]/15 text-[hsl(var(--terracotta))]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <Badge variant="terracotta">WCAG 2.2 AA</Badge>
                </div>
                <CardTitle className="pt-2 text-base">Accessibility & Tone</CardTitle>
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
          </div>
        </section>

        {/* Phase Roadmap Overview */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Implementation Roadmap
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 p-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white font-bold text-xs">
                1
              </div>
              <div>
                <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Phase 1: Foundation (Current)</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Next.js App Router, design system, Supabase Auth SSR, Drizzle schema, RLS, and PWA shell.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3 opacity-80">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-xs">
                2
              </div>
              <div>
                <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Phase 2: Medications & Dose Logging</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Medication manager, shame-free dose logger, and Dexie offline queue synchronization.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3 opacity-80">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-xs">
                3
              </div>
              <div>
                <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Phase 3: Reminder Engine</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  VAPID Web Push notifications, actionable nudges (Taken/Snooze/Skip), and DST-safe scheduling.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3 opacity-80">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-xs">
                4
              </div>
              <div>
                <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Phase 4: Refill Tracker & Check-in</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Controlled drug single-issue 28-day tracking, early alerts, and &lt;15s daily micro check-in.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
