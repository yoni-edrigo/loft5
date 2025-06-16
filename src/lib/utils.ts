import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

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

/**
 * Custom hook to determine if the current screen is mobile (using window.matchMedia).
 * @param maxWidth - The max width in px to consider as mobile (default: 768).
 * @returns {boolean} isMobile
 */
export function useIsMobile(maxWidth: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [maxWidth]);

  return isMobile;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
