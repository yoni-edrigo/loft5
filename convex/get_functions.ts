import { query } from "./_generated/server";
import { v } from "convex/values";

// ============ QUERIES ============

// Get current pricing structure (fetch once, use for client-side calculations)
export const getPricing = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pricing").first();
  },
});

// Get available time slots for a specific date
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

// Get all bookings (admin)
export const getAllBookings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

// Get booking by ID
export const getBooking = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get bookings by date
export const getBookingsByDate = query({
  args: {
    date: v.string(),
    approvedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("eventDate"), args.date));

    if (args.approvedOnly) {
      query = query.filter((q) => q.neq(q.field("approvedAt"), null));
    }

    return await query.collect();
  },
});
