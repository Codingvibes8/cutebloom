"use client";

import * as React from "react";
import { Bell, BellRing, BellOff, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnableNotifications } from "./enable-notifications";
import { getLondonTime, getLondonDate } from "@/lib/push/notifications";

/**
 * ReminderSettings — Full reminder settings panel.
 * 
 * Shows notification status, current London time, and configuration options.
 */
export function ReminderSettings() {
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [currentDate, setCurrentDate] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(getLondonTime(now));
      setCurrentDate(getLondonDate(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Current Time Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Time (London)
          </CardTitle>
          <CardDescription>
            All reminders are scheduled in Europe/London timezone, including DST transitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums">{currentTime}</span>
            <span className="text-sm text-muted-foreground">{currentDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <EnableNotifications />

      {/* How Reminders Work */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            How Reminders Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium">Scheduled Times</p>
                <p className="text-sm text-muted-foreground">
                  Reminders fire at the times you set for each medication (e.g., 08:00, 20:00).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium">Notification Actions</p>
                <p className="text-sm text-muted-foreground">
                  When a reminder appears, you can tap <strong>Taken</strong>, <strong>Snooze 10m</strong>, or <strong>Skip</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium">Gentle Escalation</p>
                <p className="text-sm text-muted-foreground">
                  If a reminder is not acknowledged within 15 minutes, a gentle follow-up appears.
                  Maximum 2 follow-ups — no pressure.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">4</Badge>
              <div>
                <p className="font-medium">Snooze</p>
                <p className="text-sm text-muted-foreground">
                  Snooze a reminder for up to 10 minutes, maximum 3 times per dose.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Push notification subscriptions are stored securely and linked only to your account.
            Notification content contains only your medication name and scheduled time — no health data
            is included in push payloads.
          </p>
          <p className="text-sm text-muted-foreground">
            You can revoke notification permission at any time in your browser settings or by
            disabling notifications above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
