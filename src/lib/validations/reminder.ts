import { z } from "zod";

export const reminderSettingsSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  snoozeMinutes: z.number().int().min(1).max(60).default(10),
  escalationEnabled: z.boolean().default(true),
  escalationMinutes: z.number().int().min(5).default(120).default(30),
  quietHoursStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:mm format")
    .optional()
    .nullable(),
  quietHoursEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:mm format")
    .optional()
    .nullable(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url("Invalid endpoint URL"),
  p256dh: z.string().min(1, "p256dh key is required"),
  auth: z.string().min(1, "Auth key is required"),
});

export type ReminderSettingsInput = z.infer<typeof reminderSettingsSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
