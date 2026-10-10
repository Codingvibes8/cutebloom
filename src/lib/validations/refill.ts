import { z } from "zod";

export const refillTrackerSchema = z.object({
  medicationId: z.string().uuid("Invalid medication ID"),
  currentQuantity: z.number().int().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required").max(30).default("pills"),
  daysSupplyRemaining: z.number().int().min(0, "Days supply cannot be negative"),
  requestByDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  lastRefillDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  controlledDrugExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  earlyReminderDays: z.number().int().min(0).max(30).default(7),
  notes: z.string().max(500).optional().nullable(),
});

export type RefillTrackerInput = z.infer<typeof refillTrackerSchema>;
