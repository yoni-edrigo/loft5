import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all products (optionally filtered by category)
export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    packageKey: v.optional(v.string()),
    onlyVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products;

    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category")
        .filter((q) => q.eq(q.field("category"), args.category))
        .collect();
    } else if (args.packageKey) {
      products = await ctx.db
        .query("products")
        .withIndex("by_package")
        .filter((q) => q.eq(q.field("packageKey"), args.packageKey))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    // Apply visibility filter if requested
    if (args.onlyVisible) {
      products = products.filter((product) => product.visible);
    }

    return products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Get all products for admin management
export const getAllProducts = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.query("products").collect();
  },
});

// Get product by key (for backward compatibility)
export const getProductByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_key")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
  },
});

// Create a new product
export const createProduct = mutation({
  args: {
    name: v.optional(v.string()),
    nameHe: v.string(),
    description: v.optional(v.string()),
    descriptionHe: v.string(),
    price: v.number(),
    unit: v.union(
      v.literal("per_person"),
      v.literal("per_event"),
      v.literal("per_hour"),
    ),
    category: v.string(),
    key: v.string(),
    visible: v.boolean(),
    order: v.number(),
    availableSlots: v.array(
      v.union(v.literal("afternoon"), v.literal("evening")),
    ),
    packageKey: v.optional(v.string()),
    isDefaultInPackage: v.optional(v.boolean()),
    parentId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("products", args);
  },
});

// Update an existing product
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    nameHe: v.string(),
    description: v.optional(v.string()),
    descriptionHe: v.string(),
    price: v.number(),
    unit: v.union(
      v.literal("per_person"),
      v.literal("per_event"),
      v.literal("per_hour"),
    ),
    category: v.string(),
    key: v.string(),
    visible: v.boolean(),
    order: v.number(),
    availableSlots: v.array(
      v.union(v.literal("afternoon"), v.literal("evening")),
    ),
    packageKey: v.optional(v.string()),
    isDefaultInPackage: v.optional(v.boolean()),
    parentId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized");
    }

    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

// Delete a product
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized");
    }

    // Check if product is being used in any bookings
    const bookingsWithProduct = await ctx.db
      .query("bookings")
      .filter((q) => q.neq(q.field("selectedProducts"), undefined))
      .collect();

    const isProductInUse = bookingsWithProduct.some((booking) => {
      const selectedProducts = booking.selectedProducts || [];
      return selectedProducts.some((sp: any) => sp.productId === args.id);
    });

    if (isProductInUse) {
      throw new Error("Cannot delete product that is being used in bookings");
    }

    await ctx.db.delete(args.id);
  },
});

// Create or update a product
export const setProduct = mutation({
  args: {
    name: v.string(),
    nameHe: v.string(),
    description: v.optional(v.string()),
    descriptionHe: v.string(),
    price: v.number(),
    unit: v.union(
      v.literal("per_person"),
      v.literal("per_event"),
      v.literal("per_hour"),
      v.literal("flat"),
    ),
    category: v.string(),
    packageKey: v.optional(v.string()),
    isDefaultInPackage: v.optional(v.boolean()),
    key: v.optional(v.string()),
    visible: v.boolean(),
    order: v.optional(v.number()),
    parentId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("Unauthorized");
    }

    // Try to find existing by key
    const existing = args.key
      ? await ctx.db
          .query("products")
          .withIndex("by_key")
          .filter((q) => q.eq(q.field("key"), args.key))
          .first()
      : null;

    const data = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("products", data);
    }
  },
});
