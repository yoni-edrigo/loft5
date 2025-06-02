import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ============ MUTATIONS ============

// Helper function to validate client-calculated price
const validatePrice = (pricing: any, args: any, calculatedPrice: number) => {
  let expectedPrice = 0;

  if (args.timeSlot === "evening") {
    let perPersonCost = pricing.loftPerPerson;
    if (args.includesFood) perPersonCost += pricing.foodPerPerson;
    if (args.includesDrinks) perPersonCost += pricing.drinksPerPerson;
    if (args.includesSnacks) perPersonCost += pricing.snacksPerPerson;
    expectedPrice = args.numberOfParticipants * perPersonCost;

    if (args.extraHours && args.extraHours > 0) {
      expectedPrice +=
        args.numberOfParticipants *
        args.extraHours *
        pricing.extraHourPerPerson;
    }
  } else {
    if (args.numberOfParticipants > 25) {
      expectedPrice = pricing.afternoonWithKaraoke;
    } else {
      expectedPrice = args.includesKaraoke
        ? pricing.afternoonWithKaraoke
        : pricing.afternoonWithoutKaraoke;
    }
  }

  if (args.includesPhotographer) {
    expectedPrice += pricing.photographerPrice;
  }

  expectedPrice = Math.max(expectedPrice, pricing.minimumPrice);

  return Math.abs(expectedPrice - calculatedPrice) < 1; // Allow for rounding
};

// Create a new booking with client-calculated price
export const createBooking = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    eventDate: v.string(),
    timeSlot: v.union(v.literal("afternoon"), v.literal("evening")),
    numberOfParticipants: v.number(),
    extraHours: v.optional(v.number()),
    includesKaraoke: v.boolean(),
    includesPhotographer: v.boolean(),
    includesFood: v.boolean(),
    includesDrinks: v.boolean(),
    includesSnacks: v.boolean(),
    totalPrice: v.number(), // Client-calculated price
  },
  handler: async (ctx, args) => {
    // Check availability
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.eventDate))
      .first();

    if (!availability) {
      throw new Error("Date not available");
    }

    const timeSlotAvailable = availability.timeSlots.find(
      (slot) => slot.slot === args.timeSlot && !slot.bookingId,
    );

    if (!timeSlotAvailable) {
      throw new Error("Time slot not available");
    }

    // Validate client-calculated price
    const pricing = await ctx.db.query("pricing").first();
    if (!pricing) throw new Error("Pricing not found");

    if (!validatePrice(pricing, args, args.totalPrice)) {
      throw new Error("Price validation failed");
    }

    // Create booking
    const bookingId = await ctx.db.insert("bookings", {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      eventDate: args.eventDate,
      timeSlot: args.timeSlot,
      numberOfParticipants: args.numberOfParticipants,
      extraHours: args.extraHours,
      includesKaraoke: args.includesKaraoke,
      includesPhotographer: args.includesPhotographer,
      includesFood: args.includesFood,
      includesDrinks: args.includesDrinks,
      includesSnacks: args.includesSnacks,
      totalPrice: args.totalPrice,
      createdAt: Date.now(),
    });

    // Mark time slot as booked by linking it to the booking
    await ctx.db.patch(availability._id, {
      timeSlots: availability.timeSlots.map((slot) =>
        slot.slot === args.timeSlot ? { ...slot, bookingId } : slot,
      ),
    });

    return bookingId;
  },
});

// Cancel a booking and free up the time slot
export const cancelBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // Free up the time slot by removing the bookingId
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", booking.eventDate))
      .first();

    if (availability) {
      await ctx.db.patch(availability._id, {
        timeSlots: availability.timeSlots.map((slot) =>
          slot.slot === booking.timeSlot ? { slot: slot.slot } : slot,
        ),
      });
    }

    // Delete booking
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update availability (admin)
export const updateAvailability = mutation({
  args: {
    date: v.string(),
    timeSlots: v.array(
      v.object({
        slot: v.union(v.literal("afternoon"), v.literal("evening")),
        bookingId: v.optional(v.id("bookings")), // ID of booking if slot is taken
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { timeSlots: args.timeSlots });
    } else {
      await ctx.db.insert("availability", args);
    }

    return { success: true };
  },
});

// Update pricing (admin)
export const updatePricing = mutation({
  args: {
    minimumPrice: v.number(),
    loftPerPerson: v.number(),
    foodPerPerson: v.number(),
    drinksPerPerson: v.number(),
    snacksPerPerson: v.number(),
    extraHourPerPerson: v.number(),
    afternoonWithoutKaraoke: v.number(),
    afternoonWithKaraoke: v.number(),
    photographerPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("pricing").first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("pricing", args);
    }

    return { success: true };
  },
});

// Delete all data from all tables
export const deleteAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing records from all tables
    const pricingRecords = await ctx.db.query("pricing").collect();
    for (const record of pricingRecords) {
      await ctx.db.delete(record._id);
    }

    const availabilityRecords = await ctx.db.query("availability").collect();
    for (const record of availabilityRecords) {
      await ctx.db.delete(record._id);
    }

    const bookingRecords = await ctx.db.query("bookings").collect();
    for (const record of bookingRecords) {
      await ctx.db.delete(record._id);
    }

    return {
      success: true,
      message: "All data has been deleted from all tables",
      deletedCounts: {
        pricing: pricingRecords.length,
        availability: availabilityRecords.length,
        bookings: bookingRecords.length,
      },
    };
  },
});
