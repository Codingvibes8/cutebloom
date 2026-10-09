import { z } from "zod";

/**
 * Zod schemas for push subscription validation
 */

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
});

export const pushSubscribeInputSchema = z.object({
  subscription: pushSubscriptionSchema,
});

export const pushUnsubscribeInputSchema = z.object({
  endpoint: z.string().url(),
});

export const pushSendInputSchema = z.object({
  userId: z.string().uuid().optional(),
  endpoint: z.string().url().optional(),
  payload: z.object({
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    tag: z.string().optional(),
    requireInteraction: z.boolean().optional(),
    actions: z
      .array(
        z.object({
          action: z.string(),
          title: z.string(),
        })
      )
      .optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type PushSubscribeInput = z.infer<typeof pushSubscribeInputSchema>;
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeInputSchema>;
export type PushSendInput = z.infer<typeof pushSendInputSchema>;
