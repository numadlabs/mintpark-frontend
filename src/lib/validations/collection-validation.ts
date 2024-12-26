import * as z from "zod";
import { apiResponseSchema } from "../utils";

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  creator: z.string().nullable(),
  description: z.string(),
  logoKey: z.string().nullable(),
  contractAddress: z.string().nullable(),
  layerId: z.string(),
  floor: z.number().nullable(),
  volume: z.number().nullable(),
  listedCount: z.string(),
  soldCount: z.string(),
  marketCap: z.number(),
  priceForLaunchpad: z.number(),
  feeRate: z.number(),
  supply: z.number(),
  discordUrl: z.string().nullable(),
  twitterUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  iconUrl: z.string().nullable(),
  inscriptionIcon: z.string().nullable(),
  slug: z.string().nullable(),
  createdAt: z.date(),
  totalOwnerCount: z.number(),
});

export const collectionDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  uniqueIdx: z.string().nullable(),
  createdAt: z.date(),
  fileKey: z.string().nullable(),
  collectionId: z.string(),
  collectionName: z.string(),
  contractAddress: z.string().nullable(),
  price: z.number(),
  floor: z.number().nullable(),
  floorDifference: z.number(),
  ownedBy: z.string().nullable(),
  listedAt: z.date().nullable(),
  listId: z.string().nullable(),
});

export const collectibleSchema = z.object({
  id: z.string(),
  name: z.string(),
  uniqueIdx: z.string(),
  createdAt: z.string(),
  fileKey: z.string(),
  collectionId: z.string(),
  description: z.string(),
  collectionName: z.string(),
  highResolutionImageUrl: z.string(),
  price: z.number(),
  floor: z.number().nullable(),
  floorDifference: z.number(),
  ownedBy: z.string().nullable(),
  listedAt: z.date().nullable(),
  listId: z.string().nullable(),
  inscriptionId: z.string(),
});

// Schema for the complete API response
export const detailQuerySchema = z.object({
  collectibles: z.array(collectionDetailSchema),
  listedCollectibleCount: z.string(),
  totalOwnerCount: z.number(),
});

//Collection type
export type Collection = z.infer<typeof collectionSchema>;

const collectionsArraySchema = z.array(collectionSchema);

export type CollectionApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof collectionsArraySchema>>
>;

// Detail type
export type CollectionDetail = z.infer<typeof detailQuerySchema>;

export type CollectionDetailApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof detailQuerySchema>>
>;

// Collectible type
export type Collectible = z.infer<typeof collectibleSchema>;

const collectibleArraySchema = z.array(collectibleSchema);

export type CollectibleApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof collectibleArraySchema>>
>;
