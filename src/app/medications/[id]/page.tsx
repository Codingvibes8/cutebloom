import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil, Archive, Trash2, Shield } from "lucide-react";
import { getMedicationById } from "@/lib/actions/medications";
import { getDoseLogs } from "@/lib/actions/dose-logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { formatUKDate } from "@/lib/utils";
import { DoseLogCard } from "@/components/medications/dose-log-card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { data } = await getMedicationById(id);
  return {
    title: data ? `${data.name} — CuteBloom` : "Medication — CuteBloom",
  };
}

const SCHEDULE_LABEL: Record<string, string> = {
  fixed_times: "Fixed times",
  multiple_daily: "Multiple times daily",
  as_needed: "As needed (PRN)",
};

export default async function MedicationDetailPage({ params }: Props) {
  const { id } = await params;
  const [{ data: med, error }, { data: logs }] = await Promise.all([
    getMedicationById(id),
    getDoseLogs(id, 20),
  ]);

  if (error || !med) notFound();

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back */}
        <Link
          href="/medications"
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to medications
        </Link>

        {/* Medication Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-2xl ${med.is_controlled_drug ? "bg-[hsl(var(--terracotta))]/15" : "bg-[hsl(var(--primary))]/10"}`}>
                  💊
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-2xl">{med.name}</CardTitle>
                    {med.strength && (
                      <span className="text-[hsl(var(--muted-foreground))] font-normal">{med.strength}</span>
                    )}
                    {med.is_controlled_drug && (
                      <Badge variant="terracotta" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Controlled Drug
                      </Badge>
                    )}
                    {!med.is_active && <Badge variant="secondary">Archived</Badge>}
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] capitalize">
                    {med.form} · {SCHEDULE_LABEL[med.schedule_type] ?? med.schedule_type}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Schedule Info */}
            {med.schedule_type !== "as_needed" && (
              <div className="flex flex-wrap gap-2">
                {(med.schedule_times as string[]).map((t: string) => (
                  <span
                    key={t}
                    className="rounded-xl bg-[hsl(var(--primary))]/10 px-3 py-1 font-mono text-sm text-[hsl(var(--primary))]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wide">Started</p>
                <p className="font-medium text-[hsl(var(--foreground))]">{formatUKDate(med.start_date)}</p>
              </div>
              {med.end_date && (
                <div>
                  <p className="text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wide">Ends</p>
                  <p className="font-medium text-[hsl(var(--foreground))]">{formatUKDate(med.end_date)}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {med.notes && (
              <div className="rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                📝 {med.notes}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
              <Link href={`/medications/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
              <Link href={`/medications/${id}/log`}>
                <Button size="sm" className="gap-1.5">
                  Log dose now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dose History */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
            Dose History
          </h2>
          {!logs || logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No doses logged yet. Start logging doses to track your adherence over time.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <DoseLogCard key={log.id} log={log as never} />
              ))}
            </div>
          )}
        </section>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
