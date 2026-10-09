import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRefillTrackerById, decrementRefillQuantity } from "@/lib/actions/refills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const metadata: Metadata = {
  title: "Log Refill — CuteBloom",
  description: "Log a medication refill.",
};

export const dynamic = "force-dynamic";

export default async function LogRefillPage({
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
          <h1 className="text-2xl font-semibold">Log Refill</h1>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Please sign in to log a refill.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: refill, error } = await getRefillTrackerById(id);

  if (error || !refill) {
    notFound();
  }

  const handleDecrement = async () => {
    "use server";
    await decrementRefillQuantity(id);
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Log Refill</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Record that you have taken a dose
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {refill.medications?.name}{" "}
              {refill.medications?.strength && `(${refill.medications.strength})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
              <span className="text-sm font-medium">Current quantity</span>
              <span className="text-2xl font-bold tabular-nums">
                {refill.current_quantity}
                <span className="ml-1 text-sm font-normal text-[hsl(var(--muted-foreground))]">
                  {refill.unit}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3">
              <span className="text-sm font-medium">Days supply remaining</span>
              <span className="text-2xl font-bold tabular-nums">
                {refill.days_supply_remaining}
              </span>
            </div>

            <form action={handleDecrement} className="pt-2">
              <Button type="submit" className="w-full" variant="default">
                Record dose taken (-1)
              </Button>
            </form>

            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              This will decrease your quantity by 1 and update your days supply.
            </p>
          </CardContent>
        </Card>

        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}
