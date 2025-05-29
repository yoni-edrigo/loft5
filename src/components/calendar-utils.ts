import {
  parseISO,
  isWithinInterval,
  isBefore,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import type { BlockedPeriod } from "@/lib/types";

// Check if a date is blocked based on the blocked periods
export function isDateBlocked(
  date: Date,
  blockedPeriods: BlockedPeriod[],
): boolean {
  if (!blockedPeriods || blockedPeriods.length === 0) return false;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return blockedPeriods.some((period) => {
    const periodStart = parseISO(period.startDateTime);
    const periodEnd = parseISO(period.endDateTime);

    return (
      isWithinInterval(dayStart, { start: periodStart, end: periodEnd }) ||
      isWithinInterval(dayEnd, { start: periodStart, end: periodEnd }) ||
      (dayStart <= periodStart && dayEnd >= periodEnd)
    );
  });
}

// Check if a date is selectable
export const isDateSelectable = (date: Date, blockedPeriods: any[]) => {
  return !isBefore(date, new Date()) && !isDateBlocked(date, blockedPeriods);
};

// Handle date selection with validation
export const handleDateSelection = (
  date: Date,
  blockedPeriods: any[],
  onSelect: (date: Date) => void,
) => {
  if (!isDateSelectable(date, blockedPeriods)) {
    if (isDateBlocked(date, blockedPeriods)) {
      toast.error("תאריך תפוס", {
        description: "נא לבחור תאריך אחר",
      });
    }
    return;
  }

  onSelect(date);
};

// Format date for display
export const formatDate = (date: Date | null) => {
  if (!date) return "";
  return format(date, "dd/MM/yyyy", { locale: he });
};

// Format time for display
export const formatTime = (date: Date | null) => {
  if (!date) return "";
  return format(date, "HH:mm", { locale: he });
};

// Get status color for badges
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "requested":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "approved":
      return "bg-blue-500 hover:bg-blue-600";
    case "payment_pending":
      return "bg-purple-500 hover:bg-purple-600";
    case "confirmed":
      return "bg-green-500 hover:bg-green-600";
    case "cancelled":
      return "bg-red-500 hover:bg-red-600";
    case "expired":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

// Get status display text
export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case "requested":
      return "ממתין לאישור";
    case "approved":
      return "אושר";
    case "payment_pending":
      return "ממתין לתשלום";
    case "confirmed":
      return "מאושר ושולם";
    case "cancelled":
      return "בוטל";
    case "expired":
      return "פג תוקף";
    default:
      return status;
  }
};

// Get status dot color
export const getStatusDotColor = (status: string): string => {
  switch (status) {
    case "requested":
      return "bg-yellow-500";
    case "approved":
      return "bg-blue-500";
    case "payment_pending":
      return "bg-purple-500";
    case "confirmed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    case "expired":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};
