import { z } from "zod";

export const dailyCheckinSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  focusRating: z.number().int().min(1).max(5).nullable(),
  moodRating: z.number().int().min(1).max(5).nullable(),
  sleepHours: z.number().min(0).max(24).nullable(),
  sleepQuality: z.number().int().min(1).max(5).nullable(),
  appetiteRating: z.number().int().min(1).max(5).nullable(),
  sideEffects: z.array(z.string()).default([]),
  note: z.string().max(300).nullable(),
  clientUuid: z.string().uuid(),
});

export const createDailyCheckinSchema = dailyCheckinSchema;

export const updateDailyCheckinSchema = dailyCheckinSchema.partial().extend({
  id: z.string().uuid(),
});

export type DailyCheckinInput = z.infer<typeof dailyCheckinSchema>;
export type UpdateDailyCheckinInput = z.infer<typeof updateDailyCheckinSchema>;
