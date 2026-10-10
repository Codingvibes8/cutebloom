import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodaysCheckin } from "@/lib/actions/checkins";
import { CheckinForm } from "@/components/checkin/checkin-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const metadata = {
  title: "Daily Check-in — CuteBloom",
  description: "Quick daily check-in for focus, mood, sleep, and side effects.",
};

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to do your daily check-in.</p>
          <Link href="/auth" className="text-[hsl(var(--primary))] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: existingCheckin } = await getTodaysCheckin();

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Daily Check-in
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {existingCheckin
              ? "Update today's check-in — it only takes a moment."
              : "How are you feeling today? Takes less than 15 seconds."}
          </p>
        </div>

        {/* Check-in Form */}
        <CheckinForm existingCheckin={existingCheckin} />

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
