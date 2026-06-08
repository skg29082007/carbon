import { format, parseISO } from "date-fns";

export function formatCO2(co2Kg: number): string {
  if (co2Kg >= 1000) {
    return `${(co2Kg / 1000).toFixed(2)} t`;
  }
  return `${co2Kg.toFixed(1)} kg`;
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}
