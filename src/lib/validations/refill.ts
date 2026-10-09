import { z } from "zod";

export const refillTrackerSchema = z.object({
  medicationId: z.string().uuid(),
  currentQuantity: z.number().int().min(0),
  unit: z.string().min(1).max(50).default("pills"),
  daysSupplyRemaining: z.number().int().min(0),
  requestByDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .nullable(),
  lastRefillDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .nullable(),
  controlledDrugExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .nullable(),
  earlyReminderDays: z.number().int().min(0).max(30).default(7),
  notes: z.string().max(500).nullable(),
});

export const createRefillTrackerSchema = refillTrackerSchema;

export const updateRefillTrackerSchema = refillTrackerSchema.partial().extend({
  id: z.string().uuid(),
});

export type RefillTrackerInput = z.infer<typeof refillTrackerSchema>;
export type UpdateRefillTrackerInput = z.infer<typeof updateRefillTrackerSchema>;
