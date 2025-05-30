import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data (optional - remove in production)
    // await ctx.db.delete(await ctx.db.query("pricing").first());

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

    // 2. Create availability for next 3 months
    const today = new Date();
    const availability = [];

    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

      // Skip some random dates as unavailable (holidays, maintenance)
      const isUnavailable = Math.random() < 0.1; // 10% chance unavailable

      availability.push({
        date: dateString,
        timeSlots: [
          {
            slot: "afternoon" as const,
            isAvailable: !isUnavailable && Math.random() > 0.2, // 80% available
          },
          {
            slot: "evening" as const,
            isAvailable: !isUnavailable && Math.random() > 0.3, // 70% available
          },
        ],
      });
    }

    // Insert all availability records
    for (const record of availability) {
      await ctx.db.insert("availability", record);
    }

    // 3. Create some sample bookings
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
        totalPrice: 12525, // (35 × 270) + (35 × 1 × 35) + 1500
        createdAt: Date.now(),
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
        totalPrice: 1500, // Afternoon with karaoke
        createdAt: Date.now(),
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
        totalPrice: 4050, // (15 × 270), meets minimum 1200
        createdAt: Date.now(),
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
        totalPrice: 2200, // 700 + 1500 photographer
        createdAt: Date.now(),
      },
    ];

    // Insert sample bookings
    for (const booking of sampleBookings) {
      await ctx.db.insert("bookings", booking);
    }

    console.log("Database seeded successfully!");
    console.log(`- Created pricing structure`);
    console.log(`- Created ${availability.length} availability records`);
    console.log(`- Created ${sampleBookings.length} sample bookings`);

    return {
      success: true,
      message:
        "Database seeded with pricing, availability, and sample bookings",
    };
  },
});
