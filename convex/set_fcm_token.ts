import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertFcmToken = mutation({
  args: {
    token: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Optionally, deduplicate tokens per user
    await ctx.db.insert("fcmTokens", {
      token: args.token,
      userId: args.userId,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});
