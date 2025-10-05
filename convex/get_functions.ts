import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============ QUERIES ============

// Get all products (replaces getPricing)
// Public: No role check
export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    packageKey: v.optional(v.string()),
    onlyVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products;

    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category")
        .filter((q) => q.eq(q.field("category"), args.category))
        .collect();
    } else if (args.packageKey) {
      products = await ctx.db
        .query("products")
        .withIndex("by_package")
        .filter((q) => q.eq(q.field("packageKey"), args.packageKey))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    // Apply visibility filter if requested
    if (args.onlyVisible) {
      products = products.filter((product) => product.visible);
    }

    return products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Get product by key (for backward compatibility)
// Public: No role check
export const getProductByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_key")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
  },
});

// Legacy function for backward compatibility - returns products in pricing format
// Public: No role check
export const getPricing = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const pricing: any = {};

    // Convert products to pricing format for backward compatibility
    for (const product of products) {
      if (product.key) {
        pricing[product.key] = product.price;
      }
    }

    return pricing;
  },
});

// Get available time slots for a specific date
// Public: No role check
export const getAvailability = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    // If no record exists, return default available slots
    if (!availability) {
      return [
        { slot: "afternoon" as const },
        { slot: "evening" as const }
      ];
    }

    return availability.timeSlots;
  },
});

// Get available dates in a date range
// Public: No role check
export const getAvailableDates = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const availabilityRecords = await ctx.db
      .query("availability")
      .withIndex("by_date")
      .filter(
        (q) =>
          q.gte(q.field("date"), args.startDate) &&
          q.lte(q.field("date"), args.endDate),
      )
      .collect();

    // Create a map of existing records by date
    const existingRecords = new Map();
    for (const record of availabilityRecords) {
      existingRecords.set(record.date, record);
    }

    // Generate all dates in the range
    const result = [];
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    
    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      const dateString = current.toISOString().split('T')[0];
      
      const existingRecord = existingRecords.get(dateString);
      if (existingRecord) {
        // Use existing record if it has available slots
        const availableSlots = existingRecord.timeSlots.filter((slot: any) => !slot.bookingId);
        if (availableSlots.length > 0) {
          result.push({
            date: dateString,
            availableSlots,
          });
        }
      } else {
        // Default availability for dates without records
        result.push({
          date: dateString,
          availableSlots: [
            { slot: "afternoon" as const },
            { slot: "evening" as const }
          ],
        });
      }
    }

    return result;
  },
});

// Get all bookings (office: MANAGER or ADMIN)
export const getAllBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

// Get booking by ID (office: MANAGER or ADMIN)
export const getBooking = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
    return await ctx.db.get(args.id);
  },
});

// Get bookings by date (office: MANAGER or ADMIN)
export const getBookingsByDate = query({
  args: {
    date: v.string(),
    approvedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
    let query = ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("eventDate"), args.date));

    if (args.approvedOnly) {
      query = query.filter((q) => q.neq(q.field("approvedAt"), null));
    }

    return await query.collect();
  },
});

// Get pending bookings (office: MANAGER or ADMIN)
export const getPendingBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
    return await ctx.db
      .query("bookings")
      .filter((q) =>
        q.and(
          q.eq(q.field("approvedAt"), undefined),
          q.eq(q.field("declinedAt"), undefined),
        ),
      )
      .order("desc")
      .collect();
  },
});
