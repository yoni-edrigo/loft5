import { create } from "zustand"
import { format } from "date-fns"

// Updated types to match Convex schema
export type TimeSlot = "afternoon" | "evening"

export type BookingData = {
  customerName: string
  customerEmail: string
  customerPhone: string
  eventDate: string
  timeSlot: TimeSlot
  numberOfParticipants: number
  extraHours?: number
  includesKaraoke: boolean
  includesPhotographer: boolean
  includesFood: boolean
  includesDrinks: boolean
  includesSnacks: boolean
  totalPrice: number
}

export type PricingData = {
  // Base prices
  minimumPriceEvening: number // 1200
  minimumPriceAfternoon: number // 700

  // Evening event per person
  loftPerPerson: number // 100
  foodPerPerson: number // 70
  drinksPerPerson: number // 70
  snacksPerPerson: number // 30
  extraHourPerPerson: number // 35

  // Afternoon event base
  afternoonBaseLoft: number // 700 (just the loft)
  afternoonWithKaraoke: number // 1500
  afternoonLargeGroup: number // 1500 (for >25 participants)

  // Add-ons
  photographerPrice: number // 1500
}

export type AvailabilitySlot = {
  slot: TimeSlot
  isAvailable: boolean
}

export type DateAvailability = {
  date: string
  timeSlots: AvailabilitySlot[]
}

// Mock pricing data (in real app, this would come from Convex)
export const mockPricing: PricingData = {
  minimumPriceEvening: 1200,
  minimumPriceAfternoon: 700,
  loftPerPerson: 100,
  foodPerPerson: 70,
  drinksPerPerson: 70,
  snacksPerPerson: 30,
  extraHourPerPerson: 35,
  afternoonBaseLoft: 700,
  afternoonWithKaraoke: 1500,
  afternoonLargeGroup: 1500,
  photographerPrice: 1500,
}

// Mock availability data with June 2025 for testing
export const mockAvailability: DateAvailability[] = [
  // March 2025 (existing data)
  {
    date: "2025-03-01",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-02",
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-03",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-04",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-03-06",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-07",
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-08",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-09",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-03-11",
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-03-12",
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },

  // June 2025 - Comprehensive test data
  // Week 1 (June 1-7, 2025)
  {
    date: "2025-06-01", // Sunday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-02", // Monday - Only evening available
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-03", // Tuesday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-04", // Wednesday - Only afternoon available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-05", // Thursday - Fully booked
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-06", // Friday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-07", // Saturday - Only evening available
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },

  // Week 2 (June 8-14, 2025)
  {
    date: "2025-06-08", // Sunday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-09", // Monday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-10", // Tuesday - Only afternoon available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-11", // Wednesday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-12", // Thursday - Only evening available
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-13", // Friday - Fully booked
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-14", // Saturday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },

  // Week 3 (June 15-21, 2025)
  {
    date: "2025-06-15", // Sunday - Only afternoon available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-16", // Monday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-17", // Tuesday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-18", // Wednesday - Only evening available
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-19", // Thursday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-20", // Friday - Only afternoon available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-21", // Saturday - Fully booked
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: false },
    ],
  },

  // Week 4 (June 22-28, 2025)
  {
    date: "2025-06-22", // Sunday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-23", // Monday - Only evening available
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-24", // Tuesday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-25", // Wednesday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-26", // Thursday - Only afternoon available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-27", // Friday - Fully booked
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: false },
    ],
  },
  {
    date: "2025-06-28", // Saturday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },

  // Week 5 (June 29-30, 2025)
  {
    date: "2025-06-29", // Sunday - Only evening available
    timeSlots: [
      { slot: "afternoon", isAvailable: false },
      { slot: "evening", isAvailable: true },
    ],
  },
  {
    date: "2025-06-30", // Monday - Fully available
    timeSlots: [
      { slot: "afternoon", isAvailable: true },
      { slot: "evening", isAvailable: true },
    ],
  },
]

type BookingStore = {
  // Selected booking details
  selectedDate: Date | null
  selectedTimeSlot: TimeSlot | null
  numberOfParticipants: number
  extraHours: number
  includesKaraoke: boolean
  includesPhotographer: boolean
  includesFood: boolean
  includesDrinks: boolean
  includesSnacks: boolean

  // Customer info
  customerName: string
  customerEmail: string
  customerPhone: string

  // Actions
  setSelectedDate: (date: Date | null) => void
  setSelectedTimeSlot: (slot: TimeSlot | null) => void
  setNumberOfParticipants: (count: number) => void
  setExtraHours: (hours: number) => void
  setIncludesKaraoke: (includes: boolean) => void
  setIncludesPhotographer: (includes: boolean) => void
  setIncludesFood: (includes: boolean) => void
  setIncludesDrinks: (includes: boolean) => void
  setIncludesSnacks: (includes: boolean) => void
  setCustomerInfo: (info: { name: string; email: string; phone: string }) => void

  // Calculated values
  calculateTotalPrice: () => number
  getAvailabilityForDate: (date: Date) => AvailabilitySlot[]
  isDateAvailable: (date: Date) => boolean

  // Reset
  resetBooking: () => void
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  // Initial state
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
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setNumberOfParticipants: (count) => set({ numberOfParticipants: count }),
  setExtraHours: (hours) => set({ extraHours: hours }),
  setIncludesKaraoke: (includes) => set({ includesKaraoke: includes }),
  setIncludesPhotographer: (includes) => set({ includesPhotographer: includes }),
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
    const state = get()
    const {
      selectedTimeSlot,
      numberOfParticipants,
      extraHours,
      includesKaraoke,
      includesPhotographer,
      includesFood,
      includesDrinks,
      includesSnacks,
    } = state

    if (!selectedTimeSlot) return 0

    let total = 0

    if (selectedTimeSlot === "afternoon") {
      // Afternoon pricing
      if (numberOfParticipants > 25) {
        // Large group (>25 participants) requires karaoke room to be opened
        total = mockPricing.afternoonLargeGroup
      } else {
        // Regular afternoon pricing
        total = includesKaraoke ? mockPricing.afternoonWithKaraoke : mockPricing.afternoonBaseLoft
      }

      // Add optional food/drinks for afternoon (per person pricing)
      if (includesFood) {
        total += mockPricing.foodPerPerson * numberOfParticipants
      }
      if (includesDrinks) {
        total += mockPricing.drinksPerPerson * numberOfParticipants
      }
      if (includesSnacks) {
        total += mockPricing.snacksPerPerson * numberOfParticipants
      }

      // Ensure minimum price for afternoon
      total = Math.max(total, mockPricing.minimumPriceAfternoon)
    } else {
      // Evening pricing - base loft rental per person
      total = mockPricing.loftPerPerson * numberOfParticipants

      // Add optional food/drinks/snacks
      if (includesFood) {
        total += mockPricing.foodPerPerson * numberOfParticipants
      }
      if (includesDrinks) {
        total += mockPricing.drinksPerPerson * numberOfParticipants
      }
      if (includesSnacks) {
        total += mockPricing.snacksPerPerson * numberOfParticipants
      }

      // Add extra hours
      if (extraHours > 0) {
        total += extraHours * mockPricing.extraHourPerPerson * numberOfParticipants
      }

      // Ensure minimum price for evening
      total = Math.max(total, mockPricing.minimumPriceEvening)
    }

    // Add photographer if selected
    if (includesPhotographer) {
      total += mockPricing.photographerPrice
    }

    return total
  },

  getAvailabilityForDate: (date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const availability = mockAvailability.find((a) => a.date === dateStr)
    return availability?.timeSlots || []
  },

  isDateAvailable: (date) => {
    const slots = get().getAvailabilityForDate(date)
    return slots.some((slot) => slot.isAvailable)
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
}))
