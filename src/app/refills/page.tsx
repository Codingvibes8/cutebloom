import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRefillTrackers } from "@/lib/actions/refills";
import { RefillCard } from "@/components/refills/refill-card";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const metadata: Metadata = {
  title: "Refill Tracker — CuteBloom",
  description: "Track your medication refills and controlled drug prescriptions.",
};

export const dynamic = "force-dynamic";

export default async function RefillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold">Refill Tracker</h1>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Please sign in to track your medication refills.
            </p>
            <Link href="/auth" className="mt-4 inline-block">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: refills, error } = await getRefillTrackers();

  // Compute derived flags
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const enrichedRefills =
    refills?.map((r) => {
      const isLow =
        r.days_supply_remaining <= r.early_reminder_days ||
        r.current_quantity <= 5;
      const isExpiring =
        r.controlled_drug_expiry != null &&
        r.controlled_drug_expiry <= todayStr;
      const isControlled = r.medications?.is_controlled_drug ?? false;
      return { ...r, isLow, isControlled, isExpiring };
    }) ?? [];

  return (
    <div className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Refill Tracker</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Stay on top of your medication supplies
            </p>
          </div>
          <Link href="/refills/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Add tracker</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 px-4 py-3 text-sm text-[hsl(var(--destructive))]">
            {error}
          </div>
        )}

        {/* Refill list */}
        {enrichedRefills.length > 0 ? (
          <div className="space-y-4">
            {enrichedRefills.map((refill) => (
              <RefillCard
                key={refill.id}
                refill={{
                  id: refill.id,
                  current_quantity: refill.current_quantity,
                  unit: refill.unit,
                  days_supply_remaining: refill.days_supply_remaining,
                  request_by_date: refill.request_by_date,
                  last_refill_date: refill.last_refill_date,
                  controlled_drug_expiry: refill.controlled_drug_expiry,
                  early_reminder_days: refill.early_reminder_days,
                  isLow: refill.isLow,
                  isControlled: refill.isControlled,
                  isExpiring: refill.isExpiring,
                  medication: {
                    name: refill.medications?.name ?? "Unknown",
                    form: refill.medications?.form ?? "tablet",
                    strength: refill.medications?.strength ?? null,
                    is_controlled_drug: refill.medications?.is_controlled_drug ?? false,
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <h2 className="mt-4 text-lg font-semibold">No refill trackers yet</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Add a tracker to monitor your medication supplies and get
              reminders before you run out.
            </p>
            <Link href="/refills/new" className="mt-4 inline-block">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add your first tracker
              </Button>
            </Link>
          </div>
        )}

        {/* Medical disclaimer */}
        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
