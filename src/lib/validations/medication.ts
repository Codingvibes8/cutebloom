import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required").max(100),
  form: z.enum(["tablet", "capsule", "liquid", "patch", "inhaler", "injection", "other"]).default("tablet"),
  strength: z.string().max(50).optional(),
  scheduleType: z.enum(["fixed_times", "multiple_daily", "as_needed"]).default("fixed_times"),
  scheduleTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:mm time format")).min(1, "At least one scheduled time is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isControlledDrug: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const doseLogSchema = z.object({
  medicationId: z.string().uuid("Invalid medication ID"),
  scheduledTime: z.string().datetime(),
  takenTime: z.string().datetime().optional().nullable(),
  status: z.enum(["taken", "skipped", "late", "snoozed"]),
  clientUuid: z.string().uuid(),
  notes: z.string().max(300).optional().nullable(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
export type DoseLogInput = z.infer<typeof doseLogSchema>;
