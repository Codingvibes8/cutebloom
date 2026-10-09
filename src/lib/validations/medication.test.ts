import { describe, it, expect } from "vitest";
import { medicationSchema, doseLogSchema } from "./medication";
import { formatUKDate, formatUKTime } from "../utils";

describe("Medication Zod Schema Validation", () => {
  it("should validate a valid medication with default UK schedule", () => {
    const validData = {
      name: "Elvanse",
      form: "capsule",
      strength: "30mg",
      scheduleType: "fixed_times",
      scheduleTimes: ["08:30"],
      startDate: "2026-10-09",
      isControlledDrug: true,
      isActive: true,
    };

    const parsed = medicationSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid time format in scheduleTimes", () => {
    const invalidData = {
      name: "Medication X",
      form: "tablet",
      scheduleTimes: ["25:99"], // invalid time
      startDate: "2026-10-09",
    };

    const parsed = medicationSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("should validate a valid dose log", () => {
    const validLog = {
      medicationId: "123e4567-e89b-12d3-a456-426614174000",
      scheduledTime: "2026-10-09T08:00:00Z",
      takenTime: "2026-10-09T08:15:00Z",
      status: "taken",
      clientUuid: "987fcdeb-51a2-43f7-9abc-def012345678",
      notes: "Taken with water after breakfast",
    };

    const parsed = doseLogSchema.safeParse(validLog);
    expect(parsed.success).toBe(true);
  });
});

describe("UK Date & Time Formatters", () => {
  it("should format dates in DD/MM/YYYY UK standard", () => {
    const testDate = new Date("2026-10-09T14:30:00Z");
    const formatted = formatUKDate(testDate);
    expect(formatted).toBe("09/10/2026");
  });

  it("should format times in 24h format (HH:mm) for London timezone", () => {
    const testDate = new Date("2026-10-09T14:30:00Z"); // BST: UTC+1 -> 15:30
    const formatted = formatUKTime(testDate);
    expect(formatted).toBe("15:30");
  });
});
