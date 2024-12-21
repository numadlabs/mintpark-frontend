import * as z from "zod";
import { apiResponseSchema } from "../utils";

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  collectionId: z.string(),
  quantity: z.number(),
  feeRate: z.number(),
  fundingAddress: z.string().nullable(),
  networkFee: z.number(),
  serviceFee: z.number(),
  fundingAmount: z.number(),
  txId: z.string(),
  createdAt: z.string(),
  paidAt: z.string(),
  mintedAt: z.string().nullable(),
  expiredAt: z.string().nullable(),
  orderType: z.string(),
  orderStatus: z.string(),
  purchaseId: z.string().nullable(),
});

export const collectibleSchema = z.object({
  id: z.string(),
  name: z.string(),
  uniqueIdx: z.string(),
  createdAt: z.string(),
  fileKey: z.string(),
  highResolutionImageUrl: z.string(),

  collectionId: z.string(),
  collectionName: z.string(),
  listedAt: z.string().nullable(),
  listId: z.string().nullable(),
  price: z.number().nullable(),
  floor: z.number(),
});

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoKey: z.string(),
  inscriptionIcon: z.string().nullable(),
  iconUrl: z.string().nullable(),
  collectibleCount: z.string(),
});

// Define the exact shape of the API response
export const assetResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    collectibles: z.array(collectibleSchema),
    totalCount: z.number(),
    listCount: z.number(),
    collections: z.array(collectionSchema),
  }),
});

export const activitySchema = z.object({
  activityType: z.string(),
  tokenId: z.string().nullable(),
  collectionId: z.string(),
  fromAddress: z.string(),
  price: z.string(),
  transactionHash: z.string(),
  timestamp: z.number(),
  blockNumber: z.number(),
});

//Order schemas
export type OrderSchema = z.infer<typeof orderSchema>;

//Collectible schema
export type CollectibleSchema = z.infer<typeof collectibleSchema>;

// Asset schema
export type AssetSchema = z.infer<typeof assetResponseSchema>;

//Activity schema
export type ActivitySchema = z.infer<typeof activitySchema>;
