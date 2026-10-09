import { describe, it, expect } from "vitest";
import {
  refillTrackerSchema,
  createRefillTrackerSchema,
  updateRefillTrackerSchema,
} from "./refill";

describe("Refill Tracker Validation", () => {
  describe("refillTrackerSchema", () => {
    it("should validate a valid refill tracker", () => {
      const validData = {
        medicationId: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: 30,
        unit: "pills",
        daysSupplyRemaining: 28,
        requestByDate: "2026-11-01",
        lastRefillDate: "2026-10-09",
        controlledDrugExpiry: null,
        earlyReminderDays: 7,
        notes: null,
      };

      const parsed = refillTrackerSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("should validate a controlled drug refill tracker", () => {
      const validData = {
        medicationId: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: 28,
        unit: "capsules",
        daysSupplyRemaining: 28,
        requestByDate: "2026-11-01",
        lastRefillDate: "2026-10-09",
        controlledDrugExpiry: "2026-11-06",
        earlyReminderDays: 3,
        notes: "Single issue prescription",
      };

      const parsed = refillTrackerSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        medicationId: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: -1,
        unit: "pills",
        daysSupplyRemaining: 28,
        requestByDate: null,
        lastRefillDate: null,
        controlledDrugExpiry: null,
        earlyReminderDays: 7,
        notes: null,
      };

      const parsed = refillTrackerSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const invalidData = {
        medicationId: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: 30,
        unit: "pills",
        daysSupplyRemaining: 28,
        requestByDate: "01-11-2026",
        lastRefillDate: null,
        controlledDrugExpiry: null,
        earlyReminderDays: 7,
        notes: null,
      };

      const parsed = refillTrackerSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid medication UUID", () => {
      const invalidData = {
        medicationId: "not-a-uuid",
        currentQuantity: 30,
        unit: "pills",
        daysSupplyRemaining: 28,
        requestByDate: null,
        lastRefillDate: null,
        controlledDrugExpiry: null,
        earlyReminderDays: 7,
        notes: null,
      };

      const parsed = refillTrackerSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it("should reject early reminder days over 30", () => {
      const invalidData = {
        medicationId: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: 30,
        unit: "pills",
        daysSupplyRemaining: 28,
        requestByDate: null,
        lastRefillDate: null,
        controlledDrugExpiry: null,
        earlyReminderDays: 31,
        notes: null,
      };

      const parsed = refillTrackerSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });
  });

  describe("createRefillTrackerSchema", () => {
    it("should validate a valid create input", () => {
      const validData = {
        medicationId: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: 30,
        unit: "pills",
        daysSupplyRemaining: 28,
        requestByDate: "2026-11-01",
        lastRefillDate: "2026-10-09",
        controlledDrugExpiry: null,
        earlyReminderDays: 7,
        notes: null,
      };

      const parsed = createRefillTrackerSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });
  });

  describe("updateRefillTrackerSchema", () => {
    it("should validate a valid update input", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        currentQuantity: 25,
      };

      const parsed = updateRefillTrackerSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("should reject update without id", () => {
      const invalidData = {
        currentQuantity: 25,
      };

      const parsed = updateRefillTrackerSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });
  });
});
