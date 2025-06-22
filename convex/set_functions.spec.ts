import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { Id } from "./_generated/dataModel";

describe("Server-Side Booking Logic", () => {
  let t: ReturnType<typeof convexTest>;
  let products: {
    loftPerPerson: Id<"products">;
    minimumPrice: Id<"products">;
    karaoke: Id<"products">;
    extraHour: Id<"products">;
  };
  let adminIdentity: { tokenIdentifier: string; [key: string]: any };

  beforeEach(async () => {
    t = convexTest(schema);

    // Seed products
    products = {
      loftPerPerson: await t.run(
        async (ctx: any) =>
          await ctx.db.insert("products", {
            nameHe: "מחיר לופט לאדם",
            price: 150,
            key: "loftPerPerson",
            category: "pricing",
            unit: "per_person",
            descriptionHe: "",
            visible: false,
          }),
      ),
      minimumPrice: await t.run(
        async (ctx: any) =>
          await ctx.db.insert("products", {
            nameHe: "מחיר מינימום",
            price: 2500,
            key: "minimumPrice",
            category: "pricing",
            unit: "flat",
            descriptionHe: "",
            visible: false,
          }),
      ),
      karaoke: await t.run(
        async (ctx: any) =>
          await ctx.db.insert("products", {
            nameHe: "קריוקי",
            price: 500,
            key: "karaokeSystem",
            category: "entertainment",
            unit: "flat",
            descriptionHe: "",
            visible: true,
          }),
      ),
      extraHour: await t.run(
        async (ctx: any) =>
          await ctx.db.insert("products", {
            nameHe: "שעה נוספת",
            price: 300,
            key: "extraHour",
            category: "timing",
            unit: "per_hour",
            descriptionHe: "",
            visible: true,
          }),
      ),
    };

    // Seed availability
    await t.run(
      async (ctx: any) =>
        await ctx.db.insert("availability", {
          date: "2025-12-25",
          timeSlots: [{ slot: "afternoon" }, { slot: "evening" }],
        }),
    );

    // Setup admin user for authenticated tests
    adminIdentity = {
      tokenIdentifier: "test-admin-user",
      name: "Admin User",
      email: "admin@test.com",
    };
  });

  describe("createBooking Mutation", () => {
    const validBookingArgs = {
      customerName: "John Doe",
      customerEmail: "john@doe.com",
      customerPhone: "123456789",
      eventDate: "2025-12-25",
      timeSlot: "evening" as const,
      startTime: "18:00",
      numberOfParticipants: 20,
      extraHours: 0,
      includesKaraoke: true,
      includesPhotographer: false,
      selectedProducts: [] as { productId: Id<"products"> }[],
      totalPrice: 3500, // 20 * 150 (loft) + 500 (karaoke) = 3500. Min price is 2500.
    };

    beforeEach(() => {
      validBookingArgs.selectedProducts = [{ productId: products.karaoke }];
    });

    it("should create a new booking successfully", async () => {
      const bookingId = await t.mutation(
        api.set_functions.createBooking,
        validBookingArgs,
      );
      expect(bookingId).toBeDefined();

      const booking = await t.run(
        async (ctx: any) => await ctx.db.get(bookingId),
      );
      expect(booking).not.toBeNull();
      expect(booking?.customerName).toBe("John Doe");
      expect(booking?.totalPrice).toBe(3500);

      // Verify slot is NOT marked as booked yet
      const availability = await t.run(
        async (ctx: any) =>
          await ctx.db
            .query("availability")
            .filter((q: any) => q.eq(q.field("date"), "2025-12-25"))
            .first(),
      );
      const eveningSlot = availability?.timeSlots.find(
        (s: { slot: string; bookingId?: Id<"bookings"> }) =>
          s.slot === "evening",
      );
      expect(eveningSlot?.bookingId).toBeUndefined();
    });

    it("should fail if price validation fails", async () => {
      await expect(
        t.mutation(api.set_functions.createBooking, {
          ...validBookingArgs,
          totalPrice: 100,
          startTime: "18:00",
        }),
      ).rejects.toThrow("Price validation failed");
    });
  });

  describe("approveBooking Mutation", () => {
    let pendingBookingId: Id<"bookings">;

    beforeEach(async () => {
      pendingBookingId = await t.mutation(api.set_functions.createBooking, {
        customerName: "Pending Approval",
        customerEmail: "pending@test.com",
        customerPhone: "111222333",
        eventDate: "2025-12-25",
        timeSlot: "evening" as const,
        startTime: "18:00",
        numberOfParticipants: 10,
        extraHours: 0,
        includesKaraoke: false,
        includesPhotographer: false,
        selectedProducts: [],
        totalPrice: 2500, // Meets min price
      });
    });

    it("should allow an ADMIN to approve a booking", async () => {
      const asAdmin = t.withIdentity(adminIdentity);
      await expect(
        asAdmin.mutation(api.set_functions.approveBooking, {
          id: pendingBookingId,
        }),
      ).resolves.not.toThrow();

      const booking = await t.run(
        async (ctx: any) => await ctx.db.get(pendingBookingId),
      );
      expect(booking?.approvedAt).toBeDefined();

      // Verify slot IS marked as booked now
      const availability = await t.run(
        async (ctx: any) =>
          await ctx.db
            .query("availability")
            .filter((q: any) => q.eq(q.field("date"), "2025-12-25"))
            .first(),
      );
      const eveningSlot = availability?.timeSlots.find(
        (s: { slot: string; bookingId?: Id<"bookings"> }) =>
          s.slot === "evening",
      );
      expect(eveningSlot?.bookingId).toBe(pendingBookingId);
    });

    it("should PREVENT a non-authenticated user from approving a booking", async () => {
      // Run with no identity
      await expect(
        t.mutation(api.set_functions.approveBooking, { id: pendingBookingId }),
      ).rejects.toThrow("Not authenticated");
    });
  });
});
