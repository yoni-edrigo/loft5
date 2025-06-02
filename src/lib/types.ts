import { Doc, Id } from "convex/_generated/dataModel";

// Time slot type (matches Convex schema)
export type TimeSlot = "afternoon" | "evening";

// Base types from Convex schema
export interface TimeSlotData {
  slot: TimeSlot;
  bookingId?: Id<"bookings">;
}

export interface AvailabilitySlot {
  date: string;
  timeSlots: TimeSlotData[];
}

export type DateAvailability = Omit<
  Doc<"availability">,
  "_id" | "_creationTime"
>;

// Convex data types
export type PricingDoc = Doc<"pricing">;
export type BookingDoc = Doc<"bookings">;

// Client-side expanded types
export type PricingData = Omit<PricingDoc, "_id" | "_creationTime">;
export type BookingData = Omit<BookingDoc, "_id" | "_creationTime">;
