"use client";

import * as React from "react";
import { Save, Clock, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateReminderSettings } from "@/lib/actions/reminders";

interface ReminderSettingsData {
  notifications_enabled: boolean;
  snooze_minutes: number;
  escalation_enabled: boolean;
  escalation_minutes: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

export function ReminderSettings({ settings }: { settings: ReminderSettingsData }) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(settings.notifications_enabled);
  const [snoozeMinutes, setSnoozeMinutes] = React.useState(settings.snooze_minutes);
  const [escalationEnabled, setEscalationEnabled] = React.useState(settings.escalation_enabled);
  const [escalationMinutes, setEscalationMinutes] = React.useState(settings.escalation_minutes);
  const [quietHoursStart, setQuietHoursStart] = React.useState(settings.quiet_hours_start ?? "");
  const [quietHoursEnd, setQuietHoursEnd] = React.useState(settings.quiet_hours_end ?? "");

  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const result = await updateReminderSettings({
      notificationsEnabled,
      snoozeMinutes,
      escalationEnabled,
      escalationMinutes,
      quietHoursStart: quietHoursStart || null,
      quietHoursEnd: quietHoursEnd || null,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--accent))]/50 text-[hsl(var(--accent-foreground))]">
          <Clock className="h-5 w-5" />
        </div>
        <CardTitle className="pt-2 text-base">Reminder Preferences</CardTitle>
        <CardDescription>
          Configure how and when you receive medication reminders. All times are in Europe/London (DST-safe).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Enable Notifications Toggle */}
          <div className="flex items-center justify-between rounded-2xl border-2 border-[hsl(var(--border))] px-4 py-3">
            <div>
              <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Enable Reminders</span>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Master switch for all medication reminders</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`h-6 w-11 rounded-full transition-colors relative ${
                notificationsEnabled ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  notificationsEnabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Snooze Duration */}
          <div className="space-y-1.5">
            <label htmlFor="snooze-min" className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              Snooze duration (minutes)
            </label>
            <Input
              id="snooze-min"
              type="number"
              min={1}
              max={60}
              value={snoozeMinutes}
              onChange={(e) => setSnoozeMinutes(parseInt(e.target.value) || 10)}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">How long to wait before reminding again after snoozing</p>
          </div>

          {/* Escalation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border-2 border-[hsl(var(--border))] px-4 py-3">
              <div>
                <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Escalation Nudges</span>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Send a follow-up if a reminder is not acknowledged</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={escalationEnabled}
                onClick={() => setEscalationEnabled(!escalationEnabled)}
                className={`h-6 w-11 rounded-full transition-colors relative ${
                  escalationEnabled ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    escalationEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {escalationEnabled && (
              <div className="space-y-1.5 pl-2">
                <label htmlFor="escalation-min" className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  Escalation wait (minutes)
                </label>
                <Input
                  id="escalation-min"
                  type="number"
                  min={5}
                  max={120}
                  value={escalationMinutes}
                  onChange={(e) => setEscalationMinutes(parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Time before sending a gentle follow-up nudge</p>
              </div>
            )}
          </div>

          {/* Quiet Hours */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
              <Moon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              Quiet hours (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">From</span>
                <Input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  placeholder="22:00"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">To</span>
                <Input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  placeholder="07:00"
                  className="font-mono"
                />
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No reminders during these hours (overnight, etc.)</p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="rounded-2xl bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 px-4 py-3">
              <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            </div>
          )}
          {saved && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Settings saved</p>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
