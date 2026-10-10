import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getReminderSettings } from "@/lib/actions/reminders";
import { ReminderSettings } from "@/components/reminders/reminder-settings";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DyslexiaToggle } from "@/components/ui/dyslexia-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings — CuteBloom",
  description: "Manage your CuteBloom preferences, reminders, and accessibility settings.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: settings } = user ? await getReminderSettings() : { data: null };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Reminders & Notifications */}
      {settings && <ReminderSettings settings={settings} />}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customise how CuteBloom looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Light, dark, or system</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dyslexia-friendly font</p>
              <p className="text-sm text-muted-foreground">Use OpenDyslexic font with increased spacing</p>
            </div>
            <DyslexiaToggle />
          </div>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Disclaimer</CardTitle>
          <CardDescription>
            CuteBloom is a tracking and reminder tool only. It does not provide medical advice,
            recommend doses, or diagnose any condition. Always consult your prescriber or
            pharmacist about your medication.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
