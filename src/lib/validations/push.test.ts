import { describe, it, expect } from "vitest";
import {
  pushSubscriptionSchema,
  pushSubscribeInputSchema,
  pushUnsubscribeInputSchema,
  pushSendInputSchema,
} from "./push";

describe("Push Subscription Validation", () => {
  describe("pushSubscriptionSchema", () => {
    it("should validate a valid push subscription", () => {
      const validSub = {
        endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
        keys: {
          p256dh: "dGVzdF8yNTZoX2tleV9mb3JfdmFsaWRhdGlvbl9wdXJwb3Nlcw",
          auth: "dGVzdF9hdXRoX2tleQ",
        },
      };

      const parsed = pushSubscriptionSchema.safeParse(validSub);
      expect(parsed.success).toBe(true);
    });

    it("should reject an invalid endpoint URL", () => {
      const invalidSub = {
        endpoint: "not-a-url",
        keys: {
          p256dh: "dGVzdA",
          auth: "dGVzdA",
        },
      };

      const parsed = pushSubscriptionSchema.safeParse(invalidSub);
      expect(parsed.success).toBe(false);
    });

    it("should reject missing keys", () => {
      const invalidSub = {
        endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
        keys: {
          p256dh: "",
          auth: "",
        },
      };

      const parsed = pushSubscriptionSchema.safeParse(invalidSub);
      expect(parsed.success).toBe(false);
    });

    it("should accept an optional user agent", () => {
      const validSub = {
        endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
        keys: {
          p256dh: "dGVzdA",
          auth: "dGVzdA",
        },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      };

      const parsed = pushSubscriptionSchema.safeParse(validSub);
      expect(parsed.success).toBe(true);
    });
  });

  describe("pushSubscribeInputSchema", () => {
    it("should validate a valid subscribe input", () => {
      const validInput = {
        subscription: {
          endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
          keys: {
            p256dh: "dGVzdA",
            auth: "dGVzdA",
          },
        },
      };

      const parsed = pushSubscribeInputSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    it("should reject missing subscription", () => {
      const parsed = pushSubscribeInputSchema.safeParse({});
      expect(parsed.success).toBe(false);
    });
  });

  describe("pushUnsubscribeInputSchema", () => {
    it("should validate a valid unsubscribe input", () => {
      const validInput = {
        endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
      };

      const parsed = pushUnsubscribeInputSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    it("should reject an invalid endpoint", () => {
      const parsed = pushUnsubscribeInputSchema.safeParse({
        endpoint: "invalid",
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe("pushSendInputSchema", () => {
    it("should validate a valid send input", () => {
      const validInput = {
        payload: {
          title: "Time for Elvanse",
          body: "Scheduled time: 08:00",
          tag: "cutebloom-reminder",
          requireInteraction: true,
          actions: [
            { action: "taken", title: "Taken" },
            { action: "snooze", title: "Snooze 10m" },
            { action: "skip", title: "Skip" },
          ],
          data: { medicationId: "abc-123" },
        },
      };

      const parsed = pushSendInputSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    it("should validate a minimal send input", () => {
      const validInput = {
        payload: {
          title: "Reminder",
          body: "Time for medication",
        },
      };

      const parsed = pushSendInputSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    it("should reject missing title", () => {
      const invalidInput = {
        payload: {
          body: "Time for medication",
        },
      };

      const parsed = pushSendInputSchema.safeParse(invalidInput);
      expect(parsed.success).toBe(false);
    });

    it("should reject an empty title", () => {
      const invalidInput = {
        payload: {
          title: "",
          body: "Time for medication",
        },
      };

      const parsed = pushSendInputSchema.safeParse(invalidInput);
      expect(parsed.success).toBe(false);
    });
  });
});
