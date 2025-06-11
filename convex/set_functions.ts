import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
    // Afternoon slot base price
    if (args.numberOfParticipants > 25) {
      expectedPrice = pricing.afternoonWithKaraoke;
    } else {
      expectedPrice = args.includesKaraoke
        ? pricing.afternoonWithKaraoke
        : pricing.afternoonWithoutKaraoke;
    }

    // Add per-person costs for food and drinks
    if (args.includesFood)
      expectedPrice += pricing.foodPerPerson * args.numberOfParticipants;
    if (args.includesDrinks)
      expectedPrice += pricing.drinksPerPerson * args.numberOfParticipants;
    if (args.includesSnacks)
      expectedPrice += pricing.snacksPerPerson * args.numberOfParticipants;
  }
  if (args.includesPhotographer) {
    expectedPrice += pricing.photographerPrice;
  }

  // Only apply minimum price for evening events
  if (args.timeSlot === "evening") {
    expectedPrice = Math.max(expectedPrice, pricing.minimumPrice);
  }

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
    // Debug logs to see what's being received
    console.log("=== createBooking called ===");
    console.log("Received args:", JSON.stringify(args, null, 2));

    // Check availability
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.eventDate))
      .first();

    console.log("Availability query result:", availability);

    if (!availability) {
      console.log("ERROR: Date not available for:", args.eventDate);
      throw new Error("Date not available");
    }
    const timeSlotAvailable = availability.timeSlots.find(
      (slot) => slot.slot === args.timeSlot && !slot.bookingId,
    );

    console.log("Time slot available:", timeSlotAvailable);

    if (!timeSlotAvailable) {
      console.log("ERROR: Time slot not available for:", args.timeSlot);
      console.log("Time slot is already taken by an approved booking");
      throw new Error("Time slot not available");
    }

    // Validate client-calculated price
    const pricing = await ctx.db.query("pricing").first();
    if (!pricing) {
      console.log("ERROR: Pricing not found");
      throw new Error("Pricing not found");
    }

    const priceValidation = validatePrice(pricing, args, args.totalPrice);
    console.log("Price validation result:", priceValidation);

    if (!priceValidation) {
      console.log("ERROR: Price validation failed");
      throw new Error("Price validation failed");
    } // Create booking
    console.log("Creating booking with data:");
    const bookingData = {
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
    };
    console.log(
      "Booking data to insert:",
      JSON.stringify(bookingData, null, 2),
    );
    const bookingId = await ctx.db.insert("bookings", bookingData);

    // DON'T mark time slot as booked immediately - only mark when approved
    // This allows multiple pending bookings for the same slot
    // await ctx.db.patch(availability._id, {
    //   timeSlots: availability.timeSlots.map((slot) =>
    //     slot.slot === args.timeSlot ? { ...slot, bookingId } : slot,
    //   ),
    // });

    // Send push notification about the new booking
    try {
      // Format the date for a readable display
      const date = new Date(args.eventDate);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

      // Create a message body that summarizes the booking details in Hebrew
      const timeSlotText = args.timeSlot === "afternoon" ? "צהריים" : "ערב";
      const bookingDetails = `תאריך: ${formattedDate}, שעה: ${timeSlotText}, שם: ${args.customerName}, מספר משתתפים: ${args.numberOfParticipants}`;

      // Send push notification to all subscribers using an internal action
      await ctx.scheduler.runAfter(0, internal.send_push.sendPushToAll, {
        title: "הזמנה חדשה נכנסה",
        body: bookingDetails,
      });
    } catch (error) {
      // Log error but don't fail the booking creation if notification fails
      console.error("Failed to send push notification:", error);
    }

    console.log("Booking created successfully with ID:", bookingId);
    console.log("=== createBooking completed ===");

    return bookingId;
  },
});

// Cancel a booking and free up the time slot
export const cancelBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // Only free up the time slot if the booking was approved (and thus linked to availability)
    if (booking.approvedAt) {
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

// Delete all bookings
export const deleteAllBookings = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all bookings
    const bookingRecords = await ctx.db.query("bookings").collect();

    // Get all availability records that have bookings
    const availabilityRecords = await ctx.db.query("availability").collect();

    // Clear booking references from availability slots
    for (const availability of availabilityRecords) {
      const updatedTimeSlots = availability.timeSlots.map((slot) => ({
        slot: slot.slot,
        // Remove the bookingId if it exists
        ...(slot.bookingId ? {} : { bookingId: slot.bookingId }),
      }));

      await ctx.db.patch(availability._id, {
        timeSlots: updatedTimeSlots,
      });
    }

    // Delete all bookings
    for (const booking of bookingRecords) {
      await ctx.db.delete(booking._id);
    }

    return {
      success: true,
      message: "All bookings have been deleted",
      deletedCount: bookingRecords.length,
    };
  },
});

// Approve a booking
export const approveBooking = mutation({
  args: {
    id: v.id("bookings"),
    paidAt: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // Mark booking as approved and optionally paid
    await ctx.db.patch(args.id, {
      approvedAt: Date.now(),
      ...(args.paidAt !== undefined ? { paidAt: args.paidAt } : {}),
      ...(args.paymentMethod !== undefined
        ? { paymentMethod: args.paymentMethod }
        : {}),
    });

    // NOW mark the time slot as booked by linking it to the approved booking
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", booking.eventDate))
      .first();

    if (availability) {
      await ctx.db.patch(availability._id, {
        timeSlots: availability.timeSlots.map((slot) =>
          slot.slot === booking.timeSlot
            ? { ...slot, bookingId: args.id }
            : slot,
        ),
      });
    }

    return { success: true };
  },
});

// Decline a booking and free up the time slot
export const declineBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // Mark booking as declined
    await ctx.db.patch(args.id, {
      declinedAt: Date.now(),
    });

    // No need to free up time slot since it was never blocked for pending bookings
    // The time slot is only blocked when booking is approved

    return { success: true };
  },
});

export const addFcmToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated userId from the server context
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if this token already exists for this user
    const existingToken = await ctx.db
      .query("fcmTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existingToken) {
      // Token already exists, just update createdAt timestamp
      await ctx.db.patch(existingToken._id, {
        createdAt: Date.now(),
      });
      return { success: true, updated: true };
    }

    // Insert new token for this user
    await ctx.db.insert("fcmTokens", {
      token: args.token,
      userId,
      createdAt: Date.now(),
    });
    return { success: true, inserted: true };
  },
});
