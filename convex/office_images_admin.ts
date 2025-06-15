import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateOfficeImage = mutation({
  args: v.object({
    id: v.id("officeImages"),
    alt: v.optional(v.string()),
    visible: v.optional(v.boolean()),
    inHeader: v.optional(v.boolean()),
    inGallery: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      ...(args.alt !== undefined && { alt: args.alt }),
      ...(args.visible !== undefined && { visible: args.visible }),
      ...(args.inHeader !== undefined && { inHeader: args.inHeader }),
      ...(args.inGallery !== undefined && { inGallery: args.inGallery }),
    });
  },
});

export const deleteOfficeImage = mutation({
  args: { id: v.id("officeImages") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
