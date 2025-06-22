import { create } from "zustand";
import {
  TimeSlot,
  TimeSlotData,
  AvailabilitySlot,
  LegacyPricingData,
  ProductDoc,
  SelectedProduct,
  PackageSelection,
} from "@/lib/types";
import { format } from "date-fns";
import { Id } from "../../convex/_generated/dataModel";

export type BookingStore = {
  // Data loading states
  isPricingLoaded: boolean;
  pricing: LegacyPricingData | null; // Keep for backward compatibility
  products: ProductDoc[] | null;
  currentAvailability: AvailabilitySlot[] | null;

  // Selected booking details
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  numberOfParticipants: number;
  extraHours: number;
  selectedStartTime: string | null;

  // NEW: Product selections (replaces boolean flags)
  selectedProducts: SelectedProduct[];
  packageSelections: Map<string, PackageSelection>; // packageKey -> selection

  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Actions
  setPricing: (pricing: LegacyPricingData | null) => void;
  setProducts: (products: ProductDoc[]) => void;
  setAvailability: (availability: AvailabilitySlot[]) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  setNumberOfParticipants: (count: number) => void;
  setExtraHours: (hours: number) => void;
  setSelectedStartTime: (time: string | null) => void;

  // NEW: Product selection actions
  selectProduct: (
    packageKey: string,
    productId: Id<"products">,
    quantity?: number,
  ) => void;
  removeProduct: (packageKey: string) => void;
  getSelectedProduct: (packageKey: string) => Id<"products"> | null;
  addStandaloneProduct: (productId: Id<"products">, quantity?: number) => void;
  removeStandaloneProduct: (productId: Id<"products">) => void;
  isProductSelected: (productId: Id<"products">) => boolean;

  setCustomerInfo: (info: {
    name: string;
    email: string;
    phone: string;
  }) => void;

  // Calculated values
  calculateTotalPrice: () => number;
  getAvailabilityForDate: (date: Date) => TimeSlotData[];
  isDateAvailable: (date: Date) => boolean;
  getAvailableStartTimes: () => string[];

  // Reset
  resetBooking: () => void;
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  // Initial state
  isPricingLoaded: false,
  pricing: null,
  products: null,
  currentAvailability: null,
  selectedDate: null,
  selectedTimeSlot: null,
  numberOfParticipants: 10,
  extraHours: 0,
  selectedStartTime: null,

  // NEW: Product selections
  selectedProducts: [],
  packageSelections: new Map(),

  customerName: "",
  customerEmail: "",
  customerPhone: "",

  // Actions
  setPricing: (pricing) => set({ pricing, isPricingLoaded: true }),
  setProducts: (products) => set({ products }),
  setAvailability: (availability) => set({ currentAvailability: availability }),
  setSelectedDate: (date) =>
    set({ selectedDate: date, selectedStartTime: null }),
  setSelectedTimeSlot: (slot) =>
    set({ selectedTimeSlot: slot, selectedStartTime: null }),
  setNumberOfParticipants: (count) => set({ numberOfParticipants: count }),
  setExtraHours: (hours) => set({ extraHours: hours }),
  setSelectedStartTime: (time) => set({ selectedStartTime: time }),

  // NEW: Product selection actions
  selectProduct: (packageKey, productId, quantity) => {
    set((state) => {
      const newPackageSelections = new Map(state.packageSelections);
      newPackageSelections.set(packageKey, {
        packageKey,
        productId,
        quantity: quantity || state.numberOfParticipants,
      });

      // Update selectedProducts array
      const newSelectedProducts = state.selectedProducts.filter(
        (p) =>
          !state.products?.find(
            (prod) =>
              prod.packageKey === packageKey && prod._id === p.productId,
          ),
      );

      // Add the new selection
      newSelectedProducts.push({
        productId,
        quantity: quantity || state.numberOfParticipants,
      });

      return {
        packageSelections: newPackageSelections,
        selectedProducts: newSelectedProducts,
      };
    });
  },

  removeProduct: (packageKey) => {
    set((state) => {
      const newPackageSelections = new Map(state.packageSelections);
      newPackageSelections.delete(packageKey);

      // Remove from selectedProducts array
      const newSelectedProducts = state.selectedProducts.filter(
        (p) =>
          !state.products?.find(
            (prod) =>
              prod.packageKey === packageKey && prod._id === p.productId,
          ),
      );

      return {
        packageSelections: newPackageSelections,
        selectedProducts: newSelectedProducts,
      };
    });
  },

  getSelectedProduct: (packageKey) => {
    const state = get();
    return state.packageSelections.get(packageKey)?.productId || null;
  },

  addStandaloneProduct: (productId, quantity) => {
    set((state) => {
      const newSelectedProducts = [...state.selectedProducts];
      newSelectedProducts.push({
        productId,
        quantity: quantity || state.numberOfParticipants,
      });
      return { selectedProducts: newSelectedProducts };
    });
  },

  removeStandaloneProduct: (productId) => {
    set((state) => {
      const newSelectedProducts = state.selectedProducts.filter(
        (p) => p.productId !== productId,
      );
      return { selectedProducts: newSelectedProducts };
    });
  },

  isProductSelected: (productId) => {
    const state = get();
    return state.selectedProducts.some((p) => p.productId === productId);
  },

  setCustomerInfo: (info) =>
    set({
      customerName: info.name,
      customerEmail: info.email,
      customerPhone: info.phone,
    }),

  calculateTotalPrice: () => {
    const {
      pricing,
      products,
      selectedTimeSlot,
      numberOfParticipants,
      extraHours,
      selectedProducts,
    } = get();

    if (!pricing || !selectedTimeSlot) return 0;

    let total = 0;

    if (selectedTimeSlot === "afternoon") {
      // Base price for afternoon
      total =
        numberOfParticipants > 25
          ? pricing.afternoonWithKaraoke // Large groups always include karaoke
          : pricing.afternoonWithoutKaraoke;

      // Calculate costs from selected products
      for (const selection of selectedProducts) {
        const product = products?.find((p) => p._id === selection.productId);
        if (product) {
          const quantity = selection.quantity || numberOfParticipants;
          switch (product.unit) {
            case "per_person":
              total += product.price * quantity;
              break;
            case "per_event":
              total += product.price;
              break;
            case "per_hour":
              total += product.price * extraHours;
              break;
            case "flat":
              total += product.price;
              break;
          }
        }
      }
    } else {
      // Evening event base price
      total = pricing.loftPerPerson * numberOfParticipants;

      // Calculate costs from selected products
      for (const selection of selectedProducts) {
        const product = products?.find((p) => p._id === selection.productId);
        if (product) {
          const quantity = selection.quantity || numberOfParticipants;
          switch (product.unit) {
            case "per_person":
              total += product.price * quantity;
              break;
            case "per_event":
              total += product.price;
              break;
            case "per_hour":
              total += product.price * extraHours;
              break;
            case "flat":
              total += product.price;
              break;
          }
        }
      }

      // Ensure minimum price for evening
      total = Math.max(total, pricing.minimumPrice);
    }

    return total;
  },

  getAvailabilityForDate: (date: Date) => {
    const state = get();
    const dateStr = format(date, "yyyy-MM-dd");
    const availability = (state.currentAvailability || []).find(
      (slot) => slot.date === dateStr,
    );
    return availability?.timeSlots || [];
  },

  isDateAvailable: (date: Date) => {
    const slots = get().getAvailabilityForDate(date);
    return slots.length > 0 && slots.some((slot) => !slot.bookingId);
  },

  getAvailableStartTimes: () => {
    const { selectedTimeSlot } = get();
    if (!selectedTimeSlot) return [];
    // Define allowed start times for each slot
    if (selectedTimeSlot === "afternoon") {
      // 12:00 to 16:00, max 2 extra hours
      return [
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
      ];
    } else {
      // evening: 18:00 to 22:00, max 4 extra hours
      return [
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
        "21:30",
        "22:00",
      ];
    }
  },

  resetBooking: () =>
    set({
      selectedDate: null,
      selectedTimeSlot: null,
      numberOfParticipants: 10,
      extraHours: 0,
      selectedProducts: [],
      packageSelections: new Map(),
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      selectedStartTime: null,
    }),
}));
