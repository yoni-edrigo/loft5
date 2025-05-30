import { Doc } from "convex/_generated/dataModel";

// Time slot type (matches Convex schema)
export type TimeSlot = "afternoon" | "evening";

// Base types from Convex schema
export type AvailabilitySlot = {
  date: string;
  slot: TimeSlot;
  isAvailable: boolean;
};

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
