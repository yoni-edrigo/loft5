import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Mutation to generate an upload URL for images
export const generateImageUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Mutation to save uploaded image metadata
export const saveOfficeImage = mutation({
  args: v.object({
    storageId: v.optional(v.id("_storage")),
    externalUrl: v.optional(v.string()),
    alt: v.optional(v.string()),
    visible: v.boolean(),
    inHeader: v.boolean(),
    inGallery: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.some((r) => r === "DESIGNER" || r === "ADMIN")) {
      throw new Error("Unauthorized");
    }
    // Enforce that exactly one of storageId or externalUrl is provided
    if (!!args.storageId === !!args.externalUrl) {
      throw new Error(
        "Must provide either storageId or externalUrl, but not both.",
      );
    }
    if (args.storageId) {
      return await ctx.db.insert("officeImages", {
        storageId: args.storageId,
        alt: args.alt,
        visible: args.visible,
        inHeader: args.inHeader,
        inGallery: args.inGallery,
        createdAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("officeImages", {
        externalUrl: args.externalUrl!,
        alt: args.alt,
        visible: args.visible,
        inHeader: args.inHeader,
        inGallery: args.inGallery,
        createdAt: Date.now(),
      });
    }
  },
});

// Query to get all office images
export const getOfficeImages = query({
  args: v.object({
    inHeader: v.optional(v.boolean()),
    inGallery: v.optional(v.boolean()),
    visible: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    let q = ctx.db.query("officeImages");
    if (args.inHeader !== undefined) {
      q = q.filter((q) => q.eq(q.field("inHeader"), args.inHeader));
    }
    if (args.inGallery !== undefined) {
      q = q.filter((q) => q.eq(q.field("inGallery"), args.inGallery));
    }
    if (args.visible !== undefined) {
      q = q.filter((q) => q.eq(q.field("visible"), args.visible));
    }
    const images = await q.collect();
    return await Promise.all(
      images.map(async (img) => {
        if ("externalUrl" in img && img.externalUrl) {
          return { ...img, url: img.externalUrl };
        } else if ("storageId" in img && img.storageId) {
          const url = await ctx.storage.getUrl(img.storageId);
          return { ...img, url };
        }
        return { ...img, url: undefined };
      }),
    );
  },
});

// Mutation to update image flags
export const updateOfficeImageFlags = mutation({
  args: {
    id: v.id("officeImages"),
    visible: v.optional(v.boolean()),
    inHeader: v.optional(v.boolean()),
    inGallery: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.roles?.some((r) => r === "DESIGNER" || r === "ADMIN")) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.patch(args.id, {
      ...(args.visible !== undefined && { visible: args.visible }),
      ...(args.inHeader !== undefined && { inHeader: args.inHeader }),
      ...(args.inGallery !== undefined && { inGallery: args.inGallery }),
    });
  },
});
