import { create } from "zustand";
import { TimeSlot, AvailabilitySlot, PricingData } from "@/lib/types";
import { format } from "date-fns";

export type BookingStore = {
  // Data loading states
  isPricingLoaded: boolean;
  pricing: PricingData | null;
  currentAvailability: AvailabilitySlot[] | null;

  // Selected booking details
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  numberOfParticipants: number;
  extraHours: number;
  includesKaraoke: boolean;
  includesPhotographer: boolean;
  includesFood: boolean;
  includesDrinks: boolean;
  includesSnacks: boolean;

  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Actions
  setPricing: (pricing: PricingData | null) => void;
  setAvailability: (availability: AvailabilitySlot[]) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  setNumberOfParticipants: (count: number) => void;
  setExtraHours: (hours: number) => void;
  setIncludesKaraoke: (includes: boolean) => void;
  setIncludesPhotographer: (includes: boolean) => void;
  setIncludesFood: (includes: boolean) => void;
  setIncludesDrinks: (includes: boolean) => void;
  setIncludesSnacks: (includes: boolean) => void;
  setCustomerInfo: (info: {
    name: string;
    email: string;
    phone: string;
  }) => void;

  // Calculated values
  calculateTotalPrice: () => number;
  getAvailabilityForDate: (date: Date) => AvailabilitySlot[];
  isDateAvailable: (date: Date) => boolean;

  // Reset
  resetBooking: () => void;
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  // Initial state
  isPricingLoaded: false,
  pricing: null,
  currentAvailability: null,
  selectedDate: null,
  selectedTimeSlot: null,
  numberOfParticipants: 10,
  extraHours: 0,
  includesKaraoke: false,
  includesPhotographer: false,
  includesFood: false,
  includesDrinks: false,
  includesSnacks: false,
  customerName: "",
  customerEmail: "",
  customerPhone: "",

  // Actions
  setPricing: (pricing) => set({ pricing, isPricingLoaded: true }),
  setAvailability: (availability) => set({ currentAvailability: availability }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setNumberOfParticipants: (count) => set({ numberOfParticipants: count }),
  setExtraHours: (hours) => set({ extraHours: hours }),
  setIncludesKaraoke: (includes) => set({ includesKaraoke: includes }),
  setIncludesPhotographer: (includes) =>
    set({ includesPhotographer: includes }),
  setIncludesFood: (includes) => set({ includesFood: includes }),
  setIncludesDrinks: (includes) => set({ includesDrinks: includes }),
  setIncludesSnacks: (includes) => set({ includesSnacks: includes }),
  setCustomerInfo: (info) =>
    set({
      customerName: info.name,
      customerEmail: info.email,
      customerPhone: info.phone,
    }),

  // Calculated values
  calculateTotalPrice: () => {
    const state = get();
    const {
      selectedTimeSlot,
      numberOfParticipants,
      extraHours,
      includesKaraoke,
      includesPhotographer,
      includesFood,
      includesDrinks,
      includesSnacks,
      pricing,
    } = state;

    if (!selectedTimeSlot || !pricing) return 0;

    let total = 0;

    if (selectedTimeSlot === "afternoon") {
      // Afternoon pricing
      if (numberOfParticipants > 25) {
        // Large group (>25 participants) requires karaoke room to be opened
        total = pricing.afternoonWithKaraoke;
      } else {
        // Regular afternoon pricing
        total = includesKaraoke
          ? pricing.afternoonWithKaraoke
          : pricing.afternoonWithoutKaraoke;
      }

      // Add optional food/drinks for afternoon (per person pricing)
      if (includesFood) {
        total += pricing.foodPerPerson * numberOfParticipants;
      }
      if (includesDrinks) {
        total += pricing.drinksPerPerson * numberOfParticipants;
      }
      if (includesSnacks) {
        total += pricing.snacksPerPerson * numberOfParticipants;
      }

      // Ensure minimum price for afternoon
      total = Math.max(total, pricing.minimumPrice);
    } else {
      // Evening pricing - base loft rental per person
      total = pricing.loftPerPerson * numberOfParticipants;

      // Add optional food/drinks/snacks
      if (includesFood) {
        total += pricing.foodPerPerson * numberOfParticipants;
      }
      if (includesDrinks) {
        total += pricing.drinksPerPerson * numberOfParticipants;
      }
      if (includesSnacks) {
        total += pricing.snacksPerPerson * numberOfParticipants;
      }

      // Add extra hours
      if (extraHours > 0) {
        total += extraHours * pricing.extraHourPerPerson * numberOfParticipants;
      }

      // Ensure minimum price for evening
      total = Math.max(total, pricing.minimumPrice);
    }

    // Add photographer if selected
    if (includesPhotographer) {
      total += pricing.photographerPrice;
    }

    return total;
  },

  getAvailabilityForDate: (date: Date) => {
    const state = get();
    const dateStr = format(date, "yyyy-MM-dd");
    return (state.currentAvailability || []).filter(
      (slot) => slot.date === dateStr,
    );
  },

  isDateAvailable: (date: Date) => {
    const slots = get().getAvailabilityForDate(date);
    return slots.length > 0 && slots.some((slot) => slot.isAvailable);
  },

  resetBooking: () =>
    set({
      selectedDate: null,
      selectedTimeSlot: null,
      numberOfParticipants: 10,
      extraHours: 0,
      includesKaraoke: false,
      includesPhotographer: false,
      includesFood: false,
      includesDrinks: false,
      includesSnacks: false,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    }),
}));
