import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getMedications } from "@/lib/actions/medications";
import { RefillForm } from "@/components/refills/refill-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const metadata: Metadata = {
  title: "New Refill Tracker — CuteBloom",
  description: "Create a new medication refill tracker.",
};

export const dynamic = "force-dynamic";

export default async function NewRefillPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold">New Refill Tracker</h1>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Please sign in to create a refill tracker.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: medications } = await getMedications();

  return (
    <div className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">New Refill Tracker</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Set up tracking for your medication supplies
          </p>
        </div>

        <RefillForm
          medications={
            medications?.map((m) => ({
              id: m.id,
              name: m.name,
              form: m.form,
              strength: m.strength,
              is_controlled_drug: m.isControlledDrug,
            })) ?? []
          }
          mode="create"
        />

        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
