import { Card, CardContent } from "@/components/ui/card";
import { RefillForm } from "@/components/refills/refill-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { createClient } from "@/lib/supabase/server";
import { getAllMedications } from "@/lib/actions/medications";

export const metadata = {
  title: "Add Refill Tracker — CuteBloom",
  description: "Add a new refill tracker for your medication.",
};

export const dynamic = "force-dynamic";

export default async function NewRefillPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to add a refill tracker.</p>
        </div>
      </main>
    );
  }

  const { data: medications } = await getAllMedications();

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Add Refill Tracker
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Track your prescription supply and get early reminders before running out.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <RefillForm medications={(medications ?? []) as never} mode="create" />
          </CardContent>
        </Card>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
