import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Update formatPrice to take an optional locale parameter
export function formatPrice(price: number, locale = "he-IL"): string {
  return new Intl.NumberFormat(locale).format(price);
}

export function calculatePrice(guests: number, hours: number): number {
  const baseRate = 50; // ₪ per guest per hour
  const flatFee = 200; // ₪ flat fee

  return guests * hours * baseRate + flatFee;
}
