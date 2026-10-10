import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, Shield, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRefillTrackerById, markRefilled, deleteRefillTracker } from "@/lib/actions/refills";
import { getAllMedications } from "@/lib/actions/medications";
import { RefillForm } from "@/components/refills/refill-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUKDate } from "@/lib/utils";

export const metadata = {
  title: "Refill Tracker — CuteBloom",
  description: "View and manage your refill tracker.",
};

export const dynamic = "force-dynamic";

export default async function RefillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to view this refill tracker.</p>
          <Link href="/auth" className="text-[hsl(var(--primary))] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: tracker, error } = await getRefillTrackerById(id);
  const { data: medications } = await getAllMedications();

  if (error || !tracker) {
    notFound();
  }

  const isControlledDrug = tracker.medications.is_controlled_drug;

  const handleMarkRefilled = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const newQty = tracker.current_quantity + 30; // Default 30-day supply
    const expiry = isControlledDrug
      ? new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : null;

    await markRefilled(id, {
      currentQuantity: newQty,
      lastRefillDate: today,
      controlledDrugExpiry: expiry,
    });
  };

  const handleDelete = async () => {
    await deleteRefillTracker(id);
  };

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <Link href="/refills">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              {tracker.medications.name}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {tracker.medications.strength && `${tracker.medications.strength} • `}
              Refill tracker
            </p>
          </div>
          {isControlledDrug && (
            <Badge variant="terracotta" className="gap-1">
              <Shield className="h-3 w-3" />
              Controlled Drug
            </Badge>
          )}
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Status</CardTitle>
            <CardDescription>
              {tracker.current_quantity} {tracker.unit} remaining • {tracker.days_supply_remaining} days supply left
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-3 w-full rounded-full bg-[hsl(var(--secondary))]">
              <div
                className="h-3 rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                style={{
                  width: `${Math.min(100, (tracker.days_supply_remaining / 30) * 100)}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              {tracker.last_refill_date && (
                <span>Last refilled: {formatUKDate(tracker.last_refill_date)}</span>
              )}
              {tracker.request_by_date && (
                <span>Request by: {formatUKDate(tracker.request_by_date)}</span>
              )}
              {tracker.controlled_drug_expiry && (
                <span className="text-[hsl(var(--terracotta))]">
                  CD expires: {formatUKDate(tracker.controlled_drug_expiry)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mark Refilled */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mark as Refilled</CardTitle>
            <CardDescription>
              Update your supply after picking up a new prescription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleMarkRefilled}>
              <Button type="submit" className="w-full gap-2">
                <Save className="h-4 w-4" />
                Mark Refilled (+30 {tracker.unit})
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent className="pt-6">
            <RefillForm
              medications={(medications ?? []) as never}
              defaultValues={{
                id: tracker.id,
                medicationId: tracker.medication_id,
                currentQuantity: tracker.current_quantity,
                unit: tracker.unit,
                daysSupplyRemaining: tracker.days_supply_remaining,
                requestByDate: tracker.request_by_date ?? undefined,
                lastRefillDate: tracker.last_refill_date ?? undefined,
                controlledDrugExpiry: tracker.controlled_drug_expiry ?? undefined,
                earlyReminderDays: tracker.early_reminder_days,
                notes: tracker.notes ?? undefined,
              }}
              mode="edit"
            />
          </CardContent>
        </Card>

        {/* Delete */}
        <div className="flex justify-center">
          <form action={handleDelete}>
            <Button type="submit" variant="ghost" className="text-[hsl(var(--destructive))] gap-2">
              <AlertTriangle className="h-4 w-4" />
              Delete this tracker
            </Button>
          </form>
        </div>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
