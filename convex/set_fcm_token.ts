import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertFcmToken = mutation({
  args: {
    token: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only insert if this token does not already exist
    const existing = await ctx.db
      .query("fcmTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!existing) {
      await ctx.db.insert("fcmTokens", {
        token: args.token,
        userId: args.userId,
        createdAt: Date.now(),
      });
      return { success: true, inserted: true };
    }
    return { success: true, inserted: false, message: "Token already exists" };
  },
});
