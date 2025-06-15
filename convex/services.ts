import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all services (optionally only visible ones, sorted by order)
export const getServices = query({
  args: {
    onlyVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.onlyVisible) {
      q = ctx.db
        .query("services")
        .withIndex("by_visible")
        .filter((q2) => q2.eq(q2.field("visible"), true));
    } else {
      q = ctx.db.query("services").fullTableScan();
    }
    const services = await q.collect();
    // Sort by order if present
    return services.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Set (create or update) a service info card
export const setService = mutation({
  args: {
    key: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    order: v.optional(v.number()),
    visible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Try to find existing by key
    const existing = await ctx.db
      .query("services")
      .withIndex("by_key")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
    const data = {
      ...args,
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("services", data);
    }
  },
});
