import { describe, it, expect } from "vitest";
import {
  dailyCheckinSchema,
  createDailyCheckinSchema,
  updateDailyCheckinSchema,
} from "./checkin";

describe("Daily Check-in Validation", () => {
  describe("dailyCheckinSchema", () => {
    it("should validate a valid check-in", () => {
      const validData = {
        date: "2026-10-09",
        focusRating: 4,
        moodRating: 3,
        sleepHours: 7.5,
        sleepQuality: 4,
        appetiteRating: 3,
        sideEffects: ["Nausea", "Dry mouth"],
        note: "Feeling good today",
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("should validate a minimal check-in", () => {
      const validData = {
        date: "2026-10-09",
        focusRating: null,
        moodRating: null,
        sleepHours: null,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: null,
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const invalidData = {
        date: "09-10-2026",
        focusRating: null,
        moodRating: null,
        sleepHours: null,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: null,
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject rating above 5", () => {
      const invalidData = {
        date: "2026-10-09",
        focusRating: 6,
        moodRating: null,
        sleepHours: null,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: null,
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject rating below 1", () => {
      const invalidData = {
        date: "2026-10-09",
        focusRating: 0,
        moodRating: null,
        sleepHours: null,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: null,
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject sleep hours above 24", () => {
      const invalidData = {
        date: "2026-10-09",
        focusRating: null,
        moodRating: null,
        sleepHours: 25,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: null,
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid client UUID", () => {
      const invalidData = {
        date: "2026-10-09",
        focusRating: null,
        moodRating: null,
        sleepHours: null,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: null,
        clientUuid: "not-a-uuid",
      };

      const parsed = dailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject note over 300 characters", () => {
      const invalidData = {
        date: "2026-10-09",
        focusRating: null,
        moodRating: null,
        sleepHours: null,
        sleepQuality: null,
        appetiteRating: null,
        sideEffects: [],
        note: "a".repeat(301),
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = dailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });
  });

  describe("createDailyCheckinSchema", () => {
    it("should validate a valid create input", () => {
      const validData = {
        date: "2026-10-09",
        focusRating: 4,
        moodRating: 3,
        sleepHours: 7.5,
        sleepQuality: 4,
        appetiteRating: 3,
        sideEffects: [],
        note: null,
        clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      };

      const parsed = createDailyCheckinSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });
  });

  describe("updateDailyCheckinSchema", () => {
    it("should validate a valid update input", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        focusRating: 5,
      };

      const parsed = updateDailyCheckinSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("should reject update without id", () => {
      const invalidData = {
        focusRating: 5,
      };

      const parsed = updateDailyCheckinSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });
  });
});
