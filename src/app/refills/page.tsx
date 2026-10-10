import Link from "next/link";
import { PlusCircle, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRefillTrackers } from "@/lib/actions/refills";
import { RefillList } from "@/components/refills/refill-list";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Refill Trackers — CuteBloom",
  description: "Track your prescription refills and controlled drug supplies.",
};

export const dynamic = "force-dynamic";

export default async function RefillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[hsl(var(--muted-foreground))]">Please sign in to manage refill trackers.</p>
          <Link href="/auth" className="text-[hsl(var(--primary))] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: trackers, error } = await getRefillTrackers();

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              Refill Trackers
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {trackers?.length ?? 0} active tracker{(trackers?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/refills/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add tracker</span>
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

        {/* Refill List */}
        <RefillList trackers={(trackers ?? []) as never} />

        {/* Medical Disclaimer (compact) */}
        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
