import { describe, it, expect } from "vitest";
import {
  getLondonDate,
  getLondonTime,
  londonLocalToUtc,
  getNextOccurrence,
  isReminderDue,
} from "./notifications";

describe("London Timezone Helpers", () => {
  describe("getLondonDate", () => {
    it("should return date in YYYY-MM-DD format for London timezone", () => {
      // BST (summer): UTC+1
      const summerDate = new Date("2026-07-15T14:30:00Z");
      const result = getLondonDate(summerDate);
      expect(result).toBe("2026-07-15");
    });

    it("should return correct date during GMT (winter)", () => {
      // GMT (winter): UTC+0
      const winterDate = new Date("2026-01-15T14:30:00Z");
      const result = getLondonDate(winterDate);
      expect(result).toBe("2026-01-15");
    });

    it("should handle date boundary correctly during BST", () => {
      // 23:30 UTC = 00:30 BST next day
      const lateNight = new Date("2026-07-15T23:30:00Z");
      const result = getLondonDate(lateNight);
      expect(result).toBe("2026-07-16");
    });

    it("should handle date boundary correctly during GMT", () => {
      // 23:30 UTC = 23:30 GMT same day
      const lateNight = new Date("2026-01-15T23:30:00Z");
      const result = getLondonDate(lateNight);
      expect(result).toBe("2026-01-15");
    });
  });

  describe("getLondonTime", () => {
    it("should return time in HH:mm format for London timezone", () => {
      const date = new Date("2026-07-15T14:30:00Z");
      const result = getLondonTime(date);
      expect(result).toBe("15:30"); // BST: UTC+1
    });

    it("should return correct time during GMT", () => {
      const date = new Date("2026-01-15T14:30:00Z");
      const result = getLondonTime(date);
      expect(result).toBe("14:30"); // GMT: UTC+0
    });
  });

  describe("londonLocalToUtc", () => {
    it("should convert London local time to UTC during BST", () => {
      // 08:00 BST = 07:00 UTC
      const result = londonLocalToUtc("2026-07-15", "08:00");
      expect(result.toISOString()).toBe("2026-07-15T07:00:00.000Z");
    });

    it("should convert London local time to UTC during GMT", () => {
      // 08:00 GMT = 08:00 UTC
      const result = londonLocalToUtc("2026-01-15", "08:00");
      expect(result.toISOString()).toBe("2026-01-15T08:00:00.000Z");
    });

    it("should handle midnight correctly", () => {
      const result = londonLocalToUtc("2026-01-15", "00:00");
      expect(result.toISOString()).toBe("2026-01-15T00:00:00.000Z");
    });

    it("should handle end of day correctly", () => {
      const result = londonLocalToUtc("2026-01-15", "23:59");
      expect(result.toISOString()).toBe("2026-01-15T23:59:00.000Z");
    });
  });

  describe("getNextOccurrence", () => {
    it("should return today's occurrence if time is in the future", () => {
      const now = new Date("2026-01-15T06:00:00Z"); // 06:00 GMT
      const result = getNextOccurrence("08:00", now);
      expect(result.toISOString()).toBe("2026-01-15T08:00:00.000Z");
    });

    it("should return tomorrow's occurrence if time has passed", () => {
      const now = new Date("2026-01-15T10:00:00Z"); // 10:00 GMT
      const result = getNextOccurrence("08:00", now);
      expect(result.toISOString()).toBe("2026-01-16T08:00:00.000Z");
    });

    it("should handle BST correctly", () => {
      const now = new Date("2026-07-15T06:00:00Z"); // 07:00 BST
      const result = getNextOccurrence("08:00", now);
      expect(result.toISOString()).toBe("2026-07-15T07:00:00.000Z"); // 08:00 BST = 07:00 UTC
    });
  });

  describe("isReminderDue", () => {
    it("should return true when reminder is due now", () => {
      const now = new Date("2026-01-15T08:00:00Z");
      const result = isReminderDue("08:00", now);
      expect(result).toBe(true);
    });

    it("should return true when reminder is within the 5-minute window", () => {
      const now = new Date("2026-01-15T08:03:00Z");
      const result = isReminderDue("08:00", now);
      expect(result).toBe(true);
    });

    it("should return false when reminder is not yet due", () => {
      const now = new Date("2026-01-15T07:00:00Z");
      const result = isReminderDue("08:00", now);
      expect(result).toBe(false);
    });

    it("should return false when reminder is too old", () => {
      const now = new Date("2026-01-15T08:10:00Z");
      const result = isReminderDue("08:00", now);
      expect(result).toBe(false);
    });

    it("should handle BST correctly", () => {
      // 08:00 BST = 07:00 UTC
      const now = new Date("2026-07-15T07:00:00Z");
      const result = isReminderDue("08:00", now);
      expect(result).toBe(true);
    });
  });
});
