import Link from "next/link";
import { Bell, Clock, Shield, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getReminderSettings } from "@/lib/actions/reminders";
import { getMedications } from "@/lib/actions/medications";
import { NotificationPermission } from "@/components/reminders/notification-permission";
import { ReminderSettings } from "@/components/reminders/reminder-settings";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUKTime } from "@/lib/utils";

export const metadata = {
  title: "Reminders — CuteBloom",
  description: "Manage your medication reminder preferences and notification settings.",
};

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to manage reminders.</p>
          <Link href="/auth" className="text-[hsl(var(--primary))] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: settings } = await getReminderSettings();
  const { data: medications } = await getMedications();

  // Build upcoming reminders preview from medication schedules
  const upcomingReminders = (medications ?? [])
    .filter((m) => m.is_active && m.schedule_type !== "as_needed")
    .flatMap((m) =>
      m.schedule_times.map((time: string) => ({
        medicationName: m.name,
        strength: m.strength,
        time,
        isControlledDrug: m.is_controlled_drug,
      }))
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Reminders
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Configure gentle medication reminders with DST-safe scheduling.
          </p>
        </div>

        {/* Notification Permission */}
        <NotificationPermission />

        {/* Reminder Settings */}
        {settings && <ReminderSettings settings={settings} />}

        {/* Upcoming Reminders Preview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                <Clock className="h-5 w-5" />
              </div>
              <Badge variant="default">{upcomingReminders.length} scheduled</Badge>
            </div>
            <CardTitle className="pt-2 text-base">Today&apos;s Schedule</CardTitle>
            <CardDescription>
              Your medication reminder times (Europe/London timezone, DST-safe).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No active medications with scheduled times. Add a medication to see reminders here.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map((rem, i) => (
                  <div
                    key={`${rem.medicationName}-${rem.time}-${i}`}
                    className="flex items-center justify-between rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-[hsl(var(--foreground))]">
                        {rem.time}
                      </span>
                      <span className="text-sm text-[hsl(var(--foreground))]">
                        {rem.medicationName}
                        {rem.strength ? ` (${rem.strength})` : ""}
                      </span>
                      {rem.isControlledDrug && (
                        <Badge variant="terracotta" className="text-[10px] py-0">
                          <Shield className="h-2.5 w-2.5" />
                          CD
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Zap className="h-3 w-3" />
                      <span>Reminder</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--accent))]/50 text-[hsl(var(--accent-foreground))]">
              <Bell className="h-5 w-5" />
            </div>
            <CardTitle className="pt-2 text-base">How Reminders Work</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[hsl(var(--muted-foreground))] space-y-2">
            <p>
              <span className="font-semibold text-[hsl(var(--foreground))]">Actionable notifications: </span>
              Each reminder includes Taken, Snooze, and Skip actions — no need to open the app.
            </p>
            <p>
              <span className="font-semibold text-[hsl(var(--foreground))]">DST-safe: </span>
              Reminders are stored in Europe/London local time and automatically adjust for daylight saving.
            </p>
            <p>
              <span className="font-semibold text-[hsl(var(--foreground))]">Escalation: </span>
              If a reminder is not acknowledged, a gentle follow-up nudge is sent after your configured wait time.
            </p>
            <p>
              <span className="font-semibold text-[hsl(var(--foreground))]">Quiet hours: </span>
              Set overnight hours to avoid reminders during sleep.
            </p>
          </CardContent>
        </Card>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
