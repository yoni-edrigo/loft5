import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedDatabase = mutation({
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

    console.log("Cleared existing data from all tables");

    // 1. Insert pricing structure
    await ctx.db.insert("pricing", {
      // Base prices
      minimumPrice: 1200,

      // Evening event per person (4 hours base)
      loftPerPerson: 100,
      foodPerPerson: 70,
      drinksPerPerson: 70,
      snacksPerPerson: 30,
      extraHourPerPerson: 35,

      // Afternoon event (up to 25 people)
      afternoonWithoutKaraoke: 700,
      afternoonWithKaraoke: 1500,

      // Add-ons
      photographerPrice: 1500,
    });

    // 2. Create availability for next 3 months - all slots available initially
    const today = new Date();
    const availabilityMap = new Map<string, Id<"availability">>(); // Store availability records by date

    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

      const availabilityId = await ctx.db.insert("availability", {
        date: dateString,
        timeSlots: [
          {
            slot: "afternoon" as const,
          },
          {
            slot: "evening" as const,
          },
        ],
      });
      availabilityMap.set(dateString, availabilityId);
    }

    // 3. Create sample bookings
    const sampleBookings = [
      {
        customerName: "יוסי כהן",
        customerEmail: "yossi@example.com",
        customerPhone: "050-1234567",
        eventDate: "2025-06-15",
        timeSlot: "evening" as const,
        numberOfParticipants: 35,
        extraHours: 1,
        includesKaraoke: false,
        includesPhotographer: true,
        includesFood: true,
        includesDrinks: true,
        includesSnacks: true,
        totalPrice: 17675, // (35 × 100 base) + (35 × 70 food) + (35 × 70 drinks) + (35 × 30 snacks) + (35 × 1 × 35 extra hour) + 1500 photographer
        createdAt: Date.now(),
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // Approved 2 days ago
      },
      {
        customerName: "שרה לוי",
        customerEmail: "sara@example.com",
        customerPhone: "052-9876543",
        eventDate: "2025-06-20",
        timeSlot: "afternoon" as const,
        numberOfParticipants: 20,
        extraHours: 0,
        includesKaraoke: true,
        includesPhotographer: false,
        includesFood: true,
        includesDrinks: false,
        includesSnacks: true,
        totalPrice: 3500, // 1500 (afternoon with karaoke) + (20 × 70 food) + (20 × 30 snacks)
        createdAt: Date.now(),
        approvedAt: Date.now() - 1000 * 60 * 60 * 24, // Approved 1 day ago
      },
      {
        customerName: "דוד מזרחי",
        customerEmail: "david@example.com",
        customerPhone: "054-5555555",
        eventDate: "2025-06-25",
        timeSlot: "evening" as const,
        numberOfParticipants: 15,
        extraHours: 0,
        includesKaraoke: false,
        includesPhotographer: false,
        includesFood: false,
        includesDrinks: true,
        includesSnacks: false,
        totalPrice: 4050, // (15 × 100 base) + (15 × 70 drinks), meets minimum 1200
        createdAt: Date.now(),
        approvedAt: Date.now() - 1000 * 60 * 60 * 12, // Approved 12 hours ago
      },
      {
        customerName: "רחל אברהם",
        customerEmail: "rachel@example.com",
        customerPhone: "053-7777777",
        eventDate: "2025-07-10",
        timeSlot: "afternoon" as const,
        numberOfParticipants: 12,
        extraHours: 0,
        includesKaraoke: false,
        includesPhotographer: true,
        includesFood: true,
        includesDrinks: true,
        includesSnacks: false,
        totalPrice: 4180, // 700 (afternoon base) + 1500 (photographer) + (12 × 70 food) + (12 × 70 drinks)
        createdAt: Date.now(),
        // This booking is not yet approved
      },
    ];

    // Insert bookings and update availability slots
    for (const booking of sampleBookings) {
      const bookingId = await ctx.db.insert("bookings", booking);
      const availabilityId = availabilityMap.get(booking.eventDate);

      if (availabilityId) {
        const availability = await ctx.db.get(availabilityId);
        if (availability) {
          // Update the corresponding time slot with the booking ID
          const updatedTimeSlots = availability.timeSlots.map(
            (slot: {
              slot: "afternoon" | "evening";
              bookingId?: Id<"bookings">;
            }) =>
              slot.slot === booking.timeSlot ? { ...slot, bookingId } : slot,
          );

          await ctx.db.patch(availabilityId, {
            timeSlots: updatedTimeSlots,
          });
        }
      }
    }

    console.log("Database seeded successfully!");
    console.log(`- Created pricing structure`);
    console.log(`- Created ${availabilityMap.size} availability records`);
    console.log(`- Created ${sampleBookings.length} sample bookings`);

    return {
      success: true,
      message:
        "Database seeded with pricing, availability, and sample bookings",
    };
  },
});
