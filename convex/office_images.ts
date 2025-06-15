import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db.query("officeImages").collect();
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
    return await ctx.db.patch(args.id, {
      ...(args.visible !== undefined && { visible: args.visible }),
      ...(args.inHeader !== undefined && { inHeader: args.inHeader }),
      ...(args.inGallery !== undefined && { inGallery: args.inGallery }),
    });
  },
});
