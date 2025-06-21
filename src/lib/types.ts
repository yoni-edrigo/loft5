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

// Product types
export type ProductDoc = Omit<Doc<"products">, "name" | "description"> & {
  name?: string;
  description?: string;
  nameHe: string;
  descriptionHe: string;
  availableSlots?: Array<"afternoon" | "evening">;
};
export type ProductData = Omit<ProductDoc, "_id" | "_creationTime">;

// Selected product for booking
export interface SelectedProduct {
  productId: Id<"products">;
  quantity?: number;
}

// Package selection (for mutually exclusive options)
export interface PackageSelection {
  packageKey: string;
  productId: Id<"products">;
  quantity?: number;
}

// Convex data types
export type BookingDoc = Doc<"bookings">;

// Client-side expanded types
export type BookingData = Omit<BookingDoc, "_id" | "_creationTime">;

// Legacy pricing type for backward compatibility
export interface LegacyPricingData {
  minimumPrice: number;
  loftPerPerson: number;
  foodPerPerson: number;
  drinksPerPerson: number;
  snacksPerPerson: number;
  extraHourPerPerson: number;
  afternoonWithoutKaraoke: number;
  afternoonWithKaraoke: number;
  photographerPrice: number;
}
