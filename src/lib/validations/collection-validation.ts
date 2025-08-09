import * as z from "zod";
import { apiResponseSchema } from "../utils";
import { error } from "console";

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
  createdAt: z.string(),
  fileKey: z.string(),
  highResolutionImageUrl: z.string().nullable(),
  collectionId: z.string(),
  collectionName: z.string(),
  contractAddress: z.string().nullable(),
  price: z.number(),
  floor: z.number().nullable(),
  floorDifference: z.number(),
  ownedBy: z.string().nullable(),
  listedAt: z.date().nullable(),
  listId: z.string().nullable(),
  isOwnListing: z.boolean(),
});

export const collectibleSchema = z.object({
  id: z.string(),
  name: z.string(),
  layer: z.string(),
  uniqueIdx: z.string(),
  createdAt: z.string(),
  fileKey: z.string(),
  isOwned: z.boolean(),
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
  isOwnListing: z.boolean(),
});

// NEW: Creator Collection Schema
export const creatorCollectionSchema = z.object({
  collectionId: z.string(),
  name: z.string(),
  logoKey: z.string().nullable(),
  layer: z.string(),
  network: z.string(),
  paymentInitialized: z.boolean(),
  paymentCompleted: z.boolean(),
  queued: z.boolean(),
  ranOutOfFunds: z.boolean(),
  retopAmount: z.number(),
  collectionCompleted: z.boolean(),
  leftoverClaimed: z.boolean(),
  leftoverAmount: z.number(),
  launchInReview: z.boolean(),
  launchRejected: z.boolean(),
  launchConfirmed: z.boolean(),
  progressState: z.string(),
  inscriptionCount:z.number(),
});

// NEW: Launch Creator Tool Data Schema
export const launchCreaterToolDataSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  isWhitelisted: z.boolean(),
  wlStartsAt: z.string().nullable(),
  wlEndsAt: z.string().nullable(),
  wlMintPrice: z.number().nullable(),
  wlMaxMintPerWallet: z.number().nullable(),
  poStartsAt: z.string(),
  poEndsAt: z.string(),
  poMintPrice: z.number(),
  poMaxMintPerWallet: z.number(),
  createdAt: z.string(),
  status: z.string(),
  userLayerId: z.string(),
  userId: z.string().nullable(),
  reservedCount: z.number(),
  updatedAt: z.string(),
  //add types
    logoKey: z.string().nullable(),
  layer: z.string(),
  supply: z.number()
});

//inscription progress

export const inscriptionProgressSchema = z.object({
  totalTraitValueCount: z.number(),
  doneTraitValueCount: z.number(),
  totalCollectibleCount: z.number(),
  doneCollectibleCount: z.number(),
  done: z.number(),
  total: z.number(),
  etaInMinutes: z.number(),
});

// Schema for the complete API response
export const detailQuerySchema = z.object({
  collectibles: z.array(collectionDetailSchema),
  listedCollectibleCount: z.string(),
  hasMore: z.boolean(),
});

//  add to PaymentStatusResponse
export const checkPaymentSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  data: z
    .object({
      isPaid: z.boolean(),
    })
    .optional(),
});

//invoke order
// invokeMintSchema
export const invokeMintSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      order: z.object({
        id: z.string(),
        userId: z.string(),
        collectionId: z.string(),
        feeRate: z.number(),
        fundingAddress: z.string(),
        privateKey: z.string(),
        createdAt: z.string(),
        paidAt: z.string().nullable(),
        expiredAt: z.string().nullable(),
        orderType: z.string(),
        orderStatus: z.string(),
        purchaseId: z.string().nullable(),
        fundingTxId: z.string().nullable(),
        launchItemId: z.string().nullable(),
        userLayerId: z.string(),
      }),
    })
    .optional(),
  error: z.string().optional(),
});

//Collection type
export type Collection = z.infer<typeof collectionSchema>;
export type CollectionSchema = z.infer<typeof collectionDetailSchema>;

const collectionsArraySchema = z.array(collectionSchema);

export type CollectionApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof collectionsArraySchema>>
>;

// new invoke order mint
export type InvokeMintResponse = z.infer<typeof invokeMintSchema>;

//new inscription progress
export type InscriptionProgress = z.infer<typeof inscriptionProgressSchema>;

// NEW: Creator Collection type
export type CreatorCollection = z.infer<typeof creatorCollectionSchema>;

// NEW: Launch Creator Tool Data type
export type LaunchCreaterToolData = z.infer<typeof launchCreaterToolDataSchema>;

// Detail type
export type CollectionDetail = z.infer<typeof detailQuerySchema>;

export type CollectionDetailApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof detailQuerySchema>>
>;

// Collectible type
export type Collectible = z.infer<typeof collectibleSchema>;

//checkpayment process
export type CheckPaymentProcess = z.infer<typeof checkPaymentSchema>;

const collectibleArraySchema = z.array(collectibleSchema);

export type CollectibleApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof collectibleArraySchema>>
>;

export type CheckPaymentApiResponse = z.infer<
  ReturnType<typeof apiResponseSchema<typeof checkPaymentSchema>>
>;
