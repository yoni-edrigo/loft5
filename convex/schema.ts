import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  // Add a custom users table with an optional role field
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Role-based access: optional roles array field
    roles: v.optional(
      v.array(
        v.union(
          v.literal("ADMIN"),
          v.literal("DESIGNER"),
          v.literal("GUEST"),
          v.literal("MANAGER"),
        ),
      ),
    ),
  }).index("email", ["email"]),

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
    // REMOVED: includesFood, includesDrinks, includesSnacks
    // ADDED: Dynamic product selections
    selectedProducts: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.optional(v.number()),
      }),
    ),
    totalPrice: v.number(),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()), // Timestamp when booking was approved
    declinedAt: v.optional(v.number()), // Timestamp when booking was declined
    paidAt: v.optional(v.number()), // Timestamp when payment was made
    paymentMethod: v.optional(v.string()), // Payment method used
  }),

  // Products and services with pricing - NEW TABLE
  products: defineTable({
    name: v.optional(v.string()),
    nameHe: v.string(), // Hebrew name (required)
    description: v.optional(v.string()),
    descriptionHe: v.string(), // Hebrew description (required)
    price: v.number(),
    unit: v.union(
      v.literal("per_person"),
      v.literal("per_event"),
      v.literal("per_hour"),
      v.literal("flat"),
    ),
    category: v.string(), // "base", "food", "drinks", "addons", "snacks"
    packageKey: v.optional(v.string()), // Groups mutually exclusive options
    isDefaultInPackage: v.optional(v.boolean()), // Which option is default in a package
    key: v.optional(v.string()), // unique key for programmatic access
    visible: v.boolean(),
    order: v.optional(v.number()),
    parentId: v.optional(v.id("products")), // For sub-menus
    availableSlots: v.optional(
      v.array(v.union(v.literal("afternoon"), v.literal("evening"))),
    ),
  })
    .index("by_key", ["key"])
    .index("by_package", ["packageKey"])
    .index("by_parent_category", ["parentId", "category"])
    .index("by_category", ["category"]),

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

  // Services info cards (for carousel, etc)
  services: defineTable({
    key: v.string(), // unique key for the service (e.g. "private_events")
    title: v.string(),
    description: v.string(),
    icon: v.string(), // icon name or identifier (e.g. "Users", "Camera")
    order: v.optional(v.number()), // for sorting
    visible: v.optional(v.boolean()), // allow hiding
    updatedAt: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_visible", ["visible"])
    .index("by_order", ["order"]),

  // Office images for gallery/header
  officeImages: defineTable(
    v.union(
      v.object({
        storageId: v.id("_storage"),
        alt: v.optional(v.string()),
        visible: v.boolean(),
        inHeader: v.boolean(),
        inGallery: v.boolean(),
        createdAt: v.number(),
      }),
      v.object({
        externalUrl: v.string(),
        alt: v.optional(v.string()),
        visible: v.boolean(),
        inHeader: v.boolean(),
        inGallery: v.boolean(),
        createdAt: v.number(),
      }),
    ),
  )
    .index("by_visible", ["visible"])
    .index("by_inHeader", ["inHeader"])
    .index("by_inGallery", ["inGallery"]),
});
