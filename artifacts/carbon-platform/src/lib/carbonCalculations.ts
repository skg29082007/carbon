import { z } from "zod";

export const emissionFactors = {
  transport: {
    car_gasoline: 0.21,
    car_diesel: 0.17,
    car_electric: 0.05,
    bus: 0.089,
    train: 0.041,
    flight_domestic: 0.255,
    flight_international: 0.195,
    motorbike: 0.113,
  },
  energy: {
    electricity: 0.233,
    natural_gas: 2.04,
    heating_oil: 2.68,
  },
  food: {
    beef: 27,
    chicken: 6.9,
    pork: 12,
    fish: 6.1,
    dairy: 3.2,
    vegetables: 2,
    fruits: 1.1,
  },
  shopping: {
    clothing: 10,
    electronics: 300,
    furniture: 50,
    general: 5,
  },
} as const;

export type CategoryKey = keyof typeof emissionFactors;

export function calculateCO2(category: string, activityType: string, amount: number): number {
  if (amount < 0) return 0;

  const factors = emissionFactors[category as CategoryKey];
  if (!factors) return 0;

  const factor = factors[activityType as keyof typeof factors];
  if (typeof factor !== "number") return 0;

  return Number((amount * factor).toFixed(2));
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const ACTIVITY_CATEGORIES = ["transport", "energy", "food", "shopping"] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const activitySchema = z.object({
  category: z.enum(["transport", "energy", "food", "shopping"]),
  activityType: z.string().min(1, "Activity type is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  co2Kg: z.number().min(0).optional(),
});
