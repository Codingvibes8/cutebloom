import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MedicationForm } from "@/components/medications/medication-form";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

export const metadata = {
  title: "Add Medication — CuteBloom",
  description: "Add a new medication to track with CuteBloom.",
};

export default function NewMedicationPage() {
  return (
    <main className="flex-1 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Add Medication
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Add medication details for reminders and dose tracking. Free text only — CuteBloom never advises on doses.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <MedicationForm mode="create" />
          </CardContent>
        </Card>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
