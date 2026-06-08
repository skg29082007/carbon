import { describe, it, expect } from "vitest";
import { calculateCO2 } from "../lib/carbonCalculations";

describe("carbonCalculations", () => {
  it("calculates transport emissions correctly", () => {
    expect(calculateCO2("transport", "car_gasoline", 100)).toBe(21.00);
    expect(calculateCO2("transport", "flight_domestic", 1000)).toBe(255.00);
  });

  it("calculates food emissions correctly", () => {
    expect(calculateCO2("food", "beef", 2)).toBe(54.00);
    expect(calculateCO2("food", "vegetables", 5)).toBe(10.00);
  });

  it("returns 0 for negative amounts", () => {
    expect(calculateCO2("transport", "car_gasoline", -50)).toBe(0);
  });

  it("returns 0 for unknown categories or types", () => {
    expect(calculateCO2("unknown", "car_gasoline", 100)).toBe(0);
    expect(calculateCO2("transport", "unknown_type", 100)).toBe(0);
  });
});
