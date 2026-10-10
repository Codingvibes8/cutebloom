import { z } from "zod";

export const dailyCheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  focusRating: z.number().int().min(1).max(5).optional().nullable(),
  moodRating: z.number().int().min(1).max(5).optional().nullable(),
  sleepHours: z.number().min(0).max(24).optional().nullable(),
  sleepQuality: z.number().int().min(1).max(5).optional().nullable(),
  appetiteRating: z.number().int().min(1).max(5).optional().nullable(),
  sideEffects: z.array(z.string()).default([]),
  note: z.string().max(300).optional().nullable(),
  clientUuid: z.string().uuid(),
});

export type DailyCheckinInput = z.infer<typeof dailyCheckinSchema>;
