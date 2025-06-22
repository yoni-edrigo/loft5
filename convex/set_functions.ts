import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// ============ MUTATIONS ============

// Helper function to validate client-calculated price using products
const validatePrice = async (ctx: any, args: any, calculatedPrice: number) => {
  let expectedPrice = 0;

  // Get all products for price calculation
  const products = await ctx.db.query("products").collect();
  const productsByKey = new Map();
  for (const product of products) {
    if (product.key) {
      productsByKey.set(product.key, product);
    }
  }

  // Determine if karaoke and photographer are included from selectedProducts
  let includesKaraoke = false;

  for (const selection of args.selectedProducts || []) {
    const product = await ctx.db.get(selection.productId);
    if (product) {
      if (product.key === "karaokeSystem") {
        includesKaraoke = true;
      }
    }
  }

  if (args.timeSlot === "evening") {
    // Base loft cost per person
    const loftProduct = productsByKey.get("loftPerPerson");
    if (loftProduct) {
      expectedPrice += loftProduct.price * args.numberOfParticipants;
    }

    // Calculate costs from selected products
    for (const selection of args.selectedProducts || []) {
      const product = await ctx.db.get(selection.productId);
      if (product) {
        const quantity = selection.quantity || args.numberOfParticipants;
        switch (product.unit) {
          case "per_person":
            expectedPrice += product.price * quantity;
            break;
          case "per_event":
            expectedPrice += product.price;
            break;
          case "per_hour":
            expectedPrice += product.price * (args.extraHours || 0);
            break;
          case "flat":
            expectedPrice += product.price;
            break;
        }
      }
    }

    // Apply minimum price
    const minimumPrice = productsByKey.get("minimumPrice");
    if (minimumPrice) {
      expectedPrice = Math.max(expectedPrice, minimumPrice.price);
    }
  } else {
    // Afternoon slot base price
    if (args.numberOfParticipants > 25) {
      const afternoonWithKaraoke = productsByKey.get("afternoonWithKaraoke");
      if (afternoonWithKaraoke) {
        expectedPrice = afternoonWithKaraoke.price;
      }
    } else {
      const afternoonWithoutKaraoke = productsByKey.get(
        "afternoonWithoutKaraoke",
      );
      const afternoonWithKaraoke = productsByKey.get("afternoonWithKaraoke");

      if (includesKaraoke && afternoonWithKaraoke) {
        expectedPrice = afternoonWithKaraoke.price;
      } else if (afternoonWithoutKaraoke) {
        expectedPrice = afternoonWithoutKaraoke.price;
      }
    }

    // Calculate costs from selected products
    for (const selection of args.selectedProducts || []) {
      const product = await ctx.db.get(selection.productId);
      if (product) {
        const quantity = selection.quantity || args.numberOfParticipants;
        switch (product.unit) {
          case "per_person":
            expectedPrice += product.price * quantity;
            break;
          case "per_event":
            expectedPrice += product.price;
            break;
          case "per_hour":
            expectedPrice += product.price * (args.extraHours || 0);
            break;
          case "flat":
            expectedPrice += product.price;
            break;
        }
      }
    }
  }

  // Add photographer cost if included (this is now handled in selectedProducts loop above)
  // The photographer cost is already included in the selectedProducts calculation

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
    startTime: v.string(),
    numberOfParticipants: v.number(),
    extraHours: v.optional(v.number()),
    includesKaraoke: v.boolean(),
    includesPhotographer: v.boolean(),
    selectedProducts: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.optional(v.number()),
      }),
    ),
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
    const priceValidation = await validatePrice(ctx, args, args.totalPrice);
    console.log("Price validation result:", priceValidation);

    if (!priceValidation) {
      console.log("ERROR: Price validation failed");
      throw new Error("Price validation failed");
    }

    // Create booking
    console.log("Creating booking with data:");

    // Determine boolean fields from selectedProducts
    let includesKaraoke = false;

    for (const selection of args.selectedProducts || []) {
      const product = await ctx.db.get(selection.productId);
      if (product) {
        if (product.key === "karaokeSystem") {
          includesKaraoke = true;
        }
      }
    }

    const bookingData = {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      eventDate: args.eventDate,
      timeSlot: args.timeSlot,
      startTime: args.startTime,
      numberOfParticipants: args.numberOfParticipants,
      extraHours: args.extraHours,
      includesKaraoke,
      selectedProducts: args.selectedProducts,
      totalPrice: args.totalPrice,
      createdAt: Date.now(),
    };
    console.log(
      "Booking data to insert:",
      JSON.stringify(bookingData, null, 2),
    );

    // Add the missing includesPhotographer field
    const bookingDataWithPhotographer = {
      ...bookingData,
      startTime: args.startTime,
      includesPhotographer: false, // Default to false, can be updated later
    };

    const bookingId = await ctx.db.insert(
      "bookings",
      bookingDataWithPhotographer,
    );

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }

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

// Update availability (admin/manager)
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
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

// Delete all data from all tables (admin only)
export const deleteAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: ADMIN role required");
    }
    // Delete all existing records from all tables
    const productRecords = await ctx.db.query("products").collect();
    for (const record of productRecords) {
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
        products: productRecords.length,
        availability: availabilityRecords.length,
        bookings: bookingRecords.length,
      },
    };
  },
});

// Delete all bookings (manager or admin)
export const deleteAllBookings = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
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

// Approve a booking (manager or admin)
export const approveBooking = mutation({
  args: {
    id: v.id("bookings"),
    paidAt: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
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

// Decline a booking (manager or admin)
export const declineBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
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

// Mark a booking as paid (manager or admin)
export const markAsPaid = mutation({
  args: {
    id: v.id("bookings"),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.id, {
      paidAt: Date.now(),
      paymentMethod: args.paymentMethod,
    });

    return { success: true };
  },
});

// Delete a booking (manager or admin)
export const deleteBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: ADMIN role required");
    }
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // Free up time slot if it was an approved booking
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

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update booking details (manager or admin)
export const updateBooking = mutation({
  args: {
    id: v.id("bookings"),
    updates: v.object({
      customerName: v.optional(v.string()),
      customerEmail: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      eventDate: v.optional(v.string()),
      startTime: v.optional(v.string()),
      timeSlot: v.optional(
        v.union(v.literal("afternoon"), v.literal("evening")),
      ),
      numberOfParticipants: v.optional(v.number()),
      extraHours: v.optional(v.number()),
      totalPrice: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("MANAGER") && !user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized: MANAGER or ADMIN role required");
    }

    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // If the date is changed on an approved booking, we need to move the bookingId in availability
    if (
      booking.approvedAt &&
      args.updates.eventDate &&
      args.updates.eventDate !== booking.eventDate
    ) {
      // 1. Remove from old availability
      const oldAvailability = await ctx.db
        .query("availability")
        .withIndex("by_date", (q) => q.eq("date", booking.eventDate))
        .first();

      if (oldAvailability) {
        await ctx.db.patch(oldAvailability._id, {
          timeSlots: oldAvailability.timeSlots.map((s) =>
            s.slot === booking.timeSlot ? { slot: s.slot } : s,
          ),
        });
      }

      // 2. Add to new availability
      const newAvailability = await ctx.db
        .query("availability")
        .withIndex("by_date", (q) => q.eq("date", args.updates.eventDate!))
        .first();

      const targetSlot = args.updates.timeSlot || booking.timeSlot;

      if (newAvailability) {
        await ctx.db.patch(newAvailability._id, {
          timeSlots: newAvailability.timeSlots.map((s) =>
            s.slot === targetSlot ? { ...s, bookingId: args.id } : s,
          ),
        });
      }
    }

    // Update the booking itself
    await ctx.db.patch(args.id, args.updates);

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
