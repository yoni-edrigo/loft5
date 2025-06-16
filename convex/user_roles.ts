import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all users (for admin role management)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) throw new Error("Unauthorized");
    return await ctx.db.query("users").collect();
  },
});

// Set user roles (cannot assign or remove ADMIN from client)
export const setUserRoles = mutation({
  args: {
    userId: v.id("users"),
    roles: v.array(
      v.union(v.literal("MANAGER"), v.literal("DESIGNER"), v.literal("GUEST")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.includes("ADMIN")) throw new Error("Unauthorized");
    // Never allow assigning or removing ADMIN from client
    await ctx.db.patch(args.userId, { roles: args.roles });
    return { success: true };
  },
});

// Delete user and all associated data (FCM tokens, etc)
export const deleteUserAndData = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(adminId);
    if (!admin?.roles?.includes("ADMIN")) throw new Error("Unauthorized");
    // Delete FCM tokens
    const tokens = await ctx.db
      .query("fcmTokens")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }
    // Delete user
    await ctx.db.delete(args.userId);
    return { success: true };
  },
});
