import { describe, it, expect } from "vitest";
import { formatCO2, formatDate } from "../lib/formatters";

describe("formatters", () => {
  describe("formatCO2", () => {
    it("formats small amounts in kg", () => {
      expect(formatCO2(45)).toBe("45.0 kg");
      expect(formatCO2(0.5)).toBe("0.5 kg");
      expect(formatCO2(999.9)).toBe("999.9 kg");
    });

    it("formats large amounts in tonnes", () => {
      expect(formatCO2(1000)).toBe("1.00 t");
      expect(formatCO2(2500)).toBe("2.50 t");
    });
  });

  describe("formatDate", () => {
    it("formats ISO strings correctly", () => {
      expect(formatDate("2023-10-15T00:00:00Z")).toBe("Oct 15, 2023");
    });
    it("returns original string if parsing fails", () => {
      expect(formatDate("invalid-date")).toBe("invalid-date");
    });
  });
});
