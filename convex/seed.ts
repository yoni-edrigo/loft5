import { mutation } from "./_generated/server";

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
        includesFood: true,
        includesDrinks: true,
        includesSnacks: true,
        totalPrice: 17675, // (35 × 100 base) + (35 × 70 food) + (35 × 70 drinks) + (35 × 30 snacks) + (35 × 1 × 35 extra hour) + 1500 photographer
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
        includesFood: true,
        includesDrinks: false,
        includesSnacks: true,
        totalPrice: 3500, // 1500 (afternoon with karaoke) + (20 × 70 food) + (20 × 30 snacks)
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
        includesFood: false,
        includesDrinks: true,
        includesSnacks: false,
        totalPrice: 4050, // (15 × 100 base) + (15 × 70 drinks), meets minimum 1200
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
        includesFood: true,
        includesDrinks: true,
        includesSnacks: false,
        totalPrice: 4180, // 700 (afternoon base) + 1500 (photographer) + (12 × 70 food) + (12 × 70 drinks)
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
