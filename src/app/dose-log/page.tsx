import Link from "next/link";
import { CheckCircle2, Clock3, CalendarDays, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodaysDoseLogs } from "@/lib/actions/dose-logs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { DoseLogCard } from "@/components/medications/dose-log-card";
import { formatUKDate } from "@/lib/utils";

export const metadata = {
  title: "Today's Doses — CuteBloom",
  description: "See and log today's scheduled doses.",
};

export const dynamic = "force-dynamic";

export default async function DoseLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to view today&apos;s doses.</p>
          <Link href="/auth"><Button>Sign In</Button></Link>
        </div>
      </main>
    );
  }

  const { data: logs, error } = await getTodaysDoseLogs();
  const todayFormatted = formatUKDate(new Date());

  const takenCount = logs?.filter((l) => l.status === "taken" || l.status === "late").length ?? 0;
  const totalCount = logs?.length ?? 0;
  const pendingCount = totalCount - takenCount;

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{todayFormatted}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              Today&apos;s Doses
            </h1>
          </div>

          {totalCount > 0 && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-[hsl(var(--foreground))]">{takenCount}</span>
                <span className="text-[hsl(var(--muted-foreground))]">taken</span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-[hsl(var(--foreground))]">{pendingCount}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">pending</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>Daily adherence</span>
              <span>{Math.round((takenCount / totalCount) * 100)}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[hsl(var(--secondary))]">
              <div
                className="h-2.5 rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                style={{ width: `${Math.round((takenCount / totalCount) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 px-4 py-3 text-sm text-[hsl(var(--destructive))]">
            {error}
          </div>
        )}

        {/* Dose Cards */}
        {!logs || logs.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] py-16 px-6 text-center space-y-4">
            <div className="text-3xl">💊</div>
            <div>
              <p className="font-semibold text-[hsl(var(--foreground))]">No doses scheduled today</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Add medications to start seeing today&apos;s dose reminders here.
              </p>
            </div>
            <Link href="/medications/new">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add a Medication
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <DoseLogCard key={log.id} log={log as never} />
            ))}
          </div>
        )}

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
