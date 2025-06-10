import { query } from "./_generated/server";

// Query to get all FCM tokens
export const getAllFcmTokens = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fcmTokens").collect();
  },
});
