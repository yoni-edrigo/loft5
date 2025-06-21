import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
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

    console.log("Cleared existing data from all tables");

    // 1. Insert products structure (replacing the old pricing table)
    const products = [
      // Base pricing (no package - these are fundamental)
      {
        nameHe: "מחיר מינימום",
        descriptionHe: "מחיר מינימום לכל אירוע",
        price: 1200,
        unit: "per_event" as const,
        category: "base",
        key: "minimumPrice",
        visible: false,
        order: 1,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "חלל ערב - לאדם",
        descriptionHe: "השכרת חלל ערב לאדם לאירועי ערב",
        price: 100,
        unit: "per_person" as const,
        category: "base",
        key: "loftPerPerson",
        visible: false,
        order: 2,
        availableSlots: ["evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "שעה נוספת לאדם",
        descriptionHe: "תוספת שעה נוספת לאדם לאירועי ערב",
        price: 25,
        unit: "per_person" as const,
        category: "base",
        key: "extraHourPerPerson",
        visible: false,
        order: 3,
        availableSlots: ["evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "אירוע צהריים - ללא קריוקי",
        descriptionHe: "אירוע צהריים ללא קריוקי (עד 25 איש)",
        price: 700,
        unit: "per_event" as const,
        category: "base",
        key: "afternoonWithoutKaraoke",
        visible: false,
        order: 4,
        availableSlots: ["afternoon"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "אירוע צהריים - עם קריוקי",
        descriptionHe: "אירוע צהריים עם קריוקי (עד 25 איש)",
        price: 1500,
        unit: "per_event" as const,
        category: "base",
        key: "afternoonWithKaraoke",
        visible: false,
        order: 5,
        availableSlots: ["afternoon"] as ("afternoon" | "evening")[],
      },

      // Food Package (mutually exclusive options)
      {
        nameHe: "חבילת אוכל סטנדרטית",
        descriptionHe: "תפריט קייטרינג סטנדרטי עם מגוון מנות",
        price: 70,
        unit: "per_person" as const,
        category: "food_package",
        packageKey: "food_package",
        isDefaultInPackage: true,
        key: "standardFood",
        visible: true,
        order: 10,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "חבילת אוכל פרימיום",
        descriptionHe: "קייטרינג פרימיום עם מנות גורמה ומבחר רחב יותר",
        price: 120,
        unit: "per_person" as const,
        category: "food_package",
        packageKey: "food_package",
        isDefaultInPackage: false,
        key: "premiumFood",
        visible: true,
        order: 11,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "חבילת אוכל דלקס",
        descriptionHe: "קייטרינג דלקס עם תפריט שף ומרכיבים פרימיום",
        price: 180,
        unit: "per_person" as const,
        category: "food_package",
        packageKey: "food_package",
        isDefaultInPackage: false,
        key: "deluxeFood",
        visible: true,
        order: 12,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },

      // Drinks Package (mutually exclusive options)
      {
        nameHe: "חבילת משקאות סטנדרטית",
        descriptionHe: "משקאות קלים, קפה, תה ומשקאות אלכוהוליים בסיסיים",
        price: 70,
        unit: "per_person" as const,
        category: "drinks_package",
        packageKey: "drinks_package",
        isDefaultInPackage: true,
        key: "standardDrinks",
        visible: true,
        order: 20,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "חבילת משקאות פרימיום",
        descriptionHe: "משקאות אלכוהוליים פרימיום, קוקטיילים ומשקאות מיוחדים",
        price: 120,
        unit: "per_person" as const,
        category: "drinks_package",
        packageKey: "drinks_package",
        isDefaultInPackage: false,
        key: "premiumDrinks",
        visible: true,
        order: 21,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "חבילת משקאות דלקס",
        descriptionHe: "ספיריטים פרימיום, שמפניה ותפריט קוקטיילים מותאם",
        price: 180,
        unit: "per_person" as const,
        category: "drinks_package",
        packageKey: "drinks_package",
        isDefaultInPackage: false,
        key: "deluxeDrinks",
        visible: true,
        order: 22,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },

      // Snacks (standalone addon)
      {
        nameHe: "חבילת חטיפים",
        descriptionHe: "חטיפים מגוונים ומזונות אצבעות",
        price: 30,
        unit: "per_person" as const,
        category: "snacks",
        key: "snacksPackage",
        visible: true,
        order: 30,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },

      // Add-ons (standalone options)
      {
        nameHe: "צילום מקצועי",
        descriptionHe: "צלם מקצועי לאירוע שלכם",
        price: 1500,
        unit: "per_event" as const,
        category: "addons",
        key: "photographerPrice",
        visible: true,
        order: 40,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "מערכת קריוקי",
        descriptionHe: "מערכת קריוקי מקצועית עם מבחר שירים",
        price: 800,
        unit: "per_event" as const,
        category: "addons",
        key: "karaokeSystem",
        visible: true,
        order: 41,
        availableSlots: ["afternoon"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "שירות DJ",
        descriptionHe: "DJ מקצועי עם מבחר מוזיקה וציוד",
        price: 1200,
        unit: "per_event" as const,
        category: "addons",
        key: "djService",
        visible: true,
        order: 42,
        availableSlots: ["evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "חבילת עיצוב",
        descriptionHe: "עיצוב בסיסי ועיצוב שולחנות",
        price: 300,
        unit: "per_event" as const,
        category: "addons",
        key: "decorationsPackage",
        visible: true,
        order: 43,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "שירותי קייטרינג מותאם",
        descriptionHe: "קייטרינג מותאם אישית לתפריט שלכם",
        price: 200,
        unit: "per_event" as const,
        category: "addons",
        key: "customCatering",
        visible: true,
        order: 44,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
      {
        nameHe: "ציוד AV מקצועי",
        descriptionHe: "מערכת הגברה, תאורה וציוד אודיו-ויזואלי",
        price: 500,
        unit: "per_event" as const,
        category: "addons",
        key: "avEquipment",
        visible: true,
        order: 45,
        availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
      },
    ];

    // Insert all products
    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    // 2. Create availability for next 3 months - all slots available initially
    const today = new Date();
    const availabilityMap = new Map<string, Id<"availability">>();

    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

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

    // 3. Create sample bookings (unchanged for now)
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
        selectedProducts: [],
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
        selectedProducts: [],
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
        selectedProducts: [],
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
        selectedProducts: [],
        totalPrice: 4180, // 700 (afternoon base) + 1500 (photographer) + (12 × 70 food) + (12 × 70 drinks)
        createdAt: Date.now(),
        // This booking is not yet approved
      },
    ]; // Insert bookings and update availability slots
    for (const booking of sampleBookings) {
      const bookingId = await ctx.db.insert("bookings", booking);
      const availabilityId = availabilityMap.get(booking.eventDate);

      // Only link to availability if the booking is approved
      if (availabilityId && booking.approvedAt) {
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
    console.log(`- Created ${products.length} products`);
    console.log(`- Created ${availabilityMap.size} availability records`);
    console.log(`- Created ${sampleBookings.length} sample bookings`);

    return {
      success: true,
      message:
        "Database seeded with products, availability, and sample bookings",
    };
  },
});

export const seedServices = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing records from services table
    const serviceRecords = await ctx.db.query("services").collect();
    for (const record of serviceRecords) {
      await ctx.db.delete(record._id);
    }
    console.log("Cleared existing data from services table");

    // Seed demo services
    const demoServices = [
      {
        key: "private_events",
        title: "אירועים פרטיים",
        description:
          "מסיבות יום הולדת, אירועי חברה וחגיגות משפחתיות באווירה אינטימית. המרחב מתאים עד 25 איש בצהריים וללא הגבלה בערב.",
        icon: "Users",
        order: 1,
        visible: true,
      },
      {
        key: "content_photos",
        title: "צילומים ותוכן",
        description:
          "סטודיו מעוצב לצילומי אופנה, מוצרים ותוכן דיגיטלי. תאורה מקצועית ורקע מושלם לכל פרויקט יצירתי.",
        icon: "Camera",
        order: 2,
        visible: true,
      },
      {
        key: "weddings_love",
        title: "חתונות ואהבה",
        description:
          "חתונות אינטימיות, מסיבות רווקות וצילומי טרום חתונה באווירה רומנטית עם עיצוב מותאם אישית.",
        icon: "Heart",
        order: 3,
        visible: true,
      },
      {
        key: "business_events",
        title: "אירועי עסקים",
        description:
          "השקות מוצרים, כנסים קטנים, סדנאות ופגישות לקוחות במרחב מקצועי ומעוצב שמשאיר רושם.",
        icon: "Building",
        order: 4,
        visible: true,
      },
      {
        key: "creative_workshops",
        title: "סדנאות יצירה",
        description:
          "סדנאות יצירה, קורסי בישול וסדנאות צילום בקבוצות קטנות במרחב מעורר השראה ומצויד בכל הנדרש.",
        icon: "Lightbulb",
        order: 5,
        visible: true,
      },
      {
        key: "catering_services",
        title: "קייטרינג ושירותים",
        description:
          "קייטרינג מותאם, עיצוב אירועים, ציוד AV מקצועי, צילום ווידאו ותיאום מלא של האירוע שלכם.",
        icon: "Utensils",
        order: 6,
        visible: true,
      },
    ];
    for (const service of demoServices) {
      await ctx.db.insert("services", { ...service, updatedAt: Date.now() });
    }
    console.log(`- Seeded ${demoServices.length} services info cards`);
    return {
      success: true,
      message: `Seeded ${demoServices.length} services info cards`,
    };
  },
});

export const seedOfficeImagesWithExternalUrls = mutation({
  args: {},
  handler: async (ctx) => {
    // Remove all existing officeImages
    const images = await ctx.db.query("officeImages").collect();
    for (const img of images) {
      await ctx.db.delete(img._id);
    }
    // External URLs from hero and gallery
    const urls = [
      {
        url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
        alt: "אירוע חגיגי עם אנשים מרימים כוסות",
      },
      {
        url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
        alt: "חלל מעוצב עם תאורה אווירתית",
      },
      {
        url: "https://plus.unsplash.com/premium_photo-1671580671733-92d038f1ea97?q=80&w=2070&auto=format&fit=crop",
        alt: "אזור ישיבה מעוצב",
      },
      {
        url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop",
        alt: "אווירה מושלמת למסיבות",
      },
    ];
    for (const { url, alt } of urls) {
      await ctx.db.insert("officeImages", {
        externalUrl: url, // This is an external URL, not a Convex storageId
        alt,
        visible: true,
        inHeader: true,
        inGallery: true,
        createdAt: Date.now(),
      });
    }
    return {
      success: true,
      message: `Seeded ${urls.length} office images with external URLs.`,
    };
  },
});
