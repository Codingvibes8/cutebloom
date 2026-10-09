import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getMedicationById } from "@/lib/actions/medications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MedicationForm } from "@/components/medications/medication-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMedicationPage({ params }: Props) {
  const { id } = await params;
  const { data: med, error } = await getMedicationById(id);

  if (error || !med) notFound();

  const defaultValues = {
    id: med.id,
    name: med.name,
    form: med.form as "tablet",
    strength: med.strength ?? undefined,
    scheduleType: med.schedule_type as "fixed_times",
    scheduleTimes: med.schedule_times as string[],
    startDate: med.start_date,
    endDate: med.end_date ?? undefined,
    notes: med.notes ?? undefined,
    isControlledDrug: med.is_controlled_drug,
    isActive: med.is_active,
  };

  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href={`/medications/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {med.name}
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Edit Medication
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Editing <strong>{med.name}</strong>. Changes will apply to future reminders.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <MedicationForm mode="edit" defaultValues={defaultValues} />
          </CardContent>
        </Card>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
