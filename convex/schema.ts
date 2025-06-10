import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  // Customer bookings
  bookings: defineTable({
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    eventDate: v.string(),
    timeSlot: v.union(v.literal("afternoon"), v.literal("evening")),
    numberOfParticipants: v.number(),
    extraHours: v.optional(v.number()), // For evening events
    includesKaraoke: v.boolean(),
    includesPhotographer: v.boolean(),
    includesFood: v.boolean(),
    includesDrinks: v.boolean(),
    includesSnacks: v.boolean(),
    totalPrice: v.number(),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()), // Timestamp when booking was approved
    declinedAt: v.optional(v.number()), // Timestamp when booking was declined
    paidAt: v.optional(v.number()), // Timestamp when payment was made
    paymentMethod: v.optional(v.string()), // Payment method used
  }),

  // Fixed pricing structure
  pricing: defineTable({
    // Base prices
    minimumPrice: v.number(), // 1200

    // Evening event per person (4 hours base)
    loftPerPerson: v.number(), // 100
    foodPerPerson: v.number(), // 70
    drinksPerPerson: v.number(), // 70
    snacksPerPerson: v.number(), // 30
    extraHourPerPerson: v.number(), // 35

    // Afternoon event (up to 25 people)
    afternoonWithoutKaraoke: v.number(), // 700
    afternoonWithKaraoke: v.number(), // 1500

    // Add-ons
    photographerPrice: v.number(), // 1500
  }),

  // Calendar availability
  availability: defineTable({
    date: v.string(),
    timeSlots: v.array(
      v.object({
        slot: v.union(v.literal("afternoon"), v.literal("evening")),
        bookingId: v.optional(v.id("bookings")), // ID of booking if slot is taken
      }),
    ),
  }).index("by_date", ["date"]),

  // FCM tokens for push notifications
  fcmTokens: defineTable({
    token: v.string(),
    userId: v.optional(v.string()), // Optionally associate with a user
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),
});
