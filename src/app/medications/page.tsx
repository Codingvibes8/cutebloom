import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMedications } from "@/lib/actions/medications";
import { MedicationList } from "@/components/medications/medication-list";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Medications — CuteBloom",
  description: "Manage your ADHD medications, schedule reminders, and track doses.",
};

export default async function MedicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect handled by middleware; this guards RSC display
  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to manage your medications.</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </main>
    );
  }

  const { data: medications, error } = await getMedications();

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              Medications
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {medications?.length ?? 0} active medication{(medications?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/medications/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add medication</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 px-4 py-3">
            <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
          </div>
        )}

        {/* Medication List */}
        <MedicationList medications={medications ?? []} />

        {/* Medical Disclaimer (compact) */}
        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
