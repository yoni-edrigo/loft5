import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============ QUERIES ============

// Get current pricing structure (fetch once, use for client-side calculations)
// Public: No role check
export const getPricing = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pricing").first();
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

    return availability?.timeSlots || [];
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

    return availabilityRecords
      .filter((record) => record.timeSlots.some((slot) => !slot.bookingId))
      .map((record) => ({
        date: record.date,
        availableSlots: record.timeSlots.filter((slot) => !slot.bookingId),
      }));
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
