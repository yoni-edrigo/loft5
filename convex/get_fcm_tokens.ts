import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all FCM tokens
export const getAllFcmTokens = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fcmTokens").collect();
  },
});

// Get tokens for a specific user
export const getUserFcmTokens = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fcmTokens")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Remove invalid tokens
export const removeInvalidTokens = mutation({
  args: {
    tokens: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    let removedCount = 0;
    const tokenResults: { token: string; removed: boolean; reason: string }[] =
      [];

    // Process tokens in batches to avoid timeouts
    for (const token of args.tokens) {
      try {
        // Double-check the token exists before removing it
        const tokenDoc = await ctx.db
          .query("fcmTokens")
          .withIndex("by_token", (q) => q.eq("token", token))
          .first();

        if (tokenDoc) {
          // Only delete if the token actually exists
          await ctx.db.delete(tokenDoc._id);
          removedCount++;
          tokenResults.push({
            token: token.substring(0, 10) + "...",
            removed: true,
            reason: "Token found and removed",
          });
        } else {
          // Token wasn't found in our database
          tokenResults.push({
            token: token.substring(0, 10) + "...",
            removed: false,
            reason: "Token not found in database",
          });
        }
      } catch (error) {
        // Log any errors but continue processing other tokens
        console.error(
          `Error removing token ${token.substring(0, 10)}...`,
          error,
        );
        tokenResults.push({
          token: token.substring(0, 10) + "...",
          removed: false,
          reason: "Error during removal",
        });
      }
    }

    return {
      success: true,
      removedCount,
      message: `Removed ${removedCount} invalid tokens`,
      details: tokenResults,
    };
  },
});
