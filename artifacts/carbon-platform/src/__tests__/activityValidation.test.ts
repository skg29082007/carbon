import { describe, it, expect } from "vitest";
import { activitySchema } from "../lib/carbonCalculations";

describe("activityValidation", () => {
  it("validates valid input", () => {
    const validData = {
      category: "transport",
      activityType: "car_gasoline",
      amount: 100,
      unit: "km",
      date: "2023-10-15",
    };
    const result = activitySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid amounts", () => {
    const invalidData = {
      category: "transport",
      activityType: "car_gasoline",
      amount: -10,
      unit: "km",
      date: "2023-10-15",
    };
    const result = activitySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects empty strings for required fields", () => {
    const invalidData = {
      category: "transport",
      activityType: "",
      amount: 10,
      unit: "",
      date: "",
    };
    const result = activitySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
