import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRefillTrackerById } from "@/lib/actions/refills";
import { getMedications } from "@/lib/actions/medications";
import { RefillForm } from "@/components/refills/refill-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const metadata: Metadata = {
  title: "Edit Refill Tracker — CuteBloom",
  description: "Edit your medication refill tracker.",
};

export const dynamic = "force-dynamic";

export default async function EditRefillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold">Edit Refill Tracker</h1>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Please sign in to edit a refill tracker.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: refill, error } = await getRefillTrackerById(id);
  const { data: medications } = await getMedications();

  if (error || !refill) {
    notFound();
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Edit Refill Tracker</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Update your medication supply tracking
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
          defaultValues={{
            id: refill.id,
            medicationId: refill.medication_id,
            currentQuantity: refill.current_quantity,
            unit: refill.unit,
            daysSupplyRemaining: refill.days_supply_remaining,
            requestByDate: refill.request_by_date ?? "",
            lastRefillDate: refill.last_refill_date ?? "",
            controlledDrugExpiry: refill.controlled_drug_expiry ?? "",
            earlyReminderDays: refill.early_reminder_days,
            notes: refill.notes ?? "",
          }}
          mode="edit"
        />

        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
