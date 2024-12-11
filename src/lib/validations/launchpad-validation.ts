import * as z from "zod";

export const launchSchema = z.object({
  id: z.string(),
  name: z.string(),
  creator: z.string().nullable(),
  description: z.string(),
  type: z.string(),
  logoKey: z.string(),
  layerId: z.string(),
  launchId: z.string(),
  wlStartsAt: z.number().nullable(),
  wlEndsAt: z.number().nullable(),
  wlMintPrice: z.number().nullable(),
  wlMaxMintPerWallet: z.number().nullable(),
  poStartsAt: z.number(),
  poEndsAt: z.number(),
  poMintPrice: z.number(),
  poMaxMintPerWallet: z.number(),
  isWhitelisted: z.boolean(),
  createdAt: z.string(),
  mintedAmount: z.number(),
  supply: z.number(),
});

export const launchsDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  creator: z.string().nullable(),
  description: z.string(),
  type: z.string(),
  logoKey: z.string(),
  layerId: z.string(),
  launchId: z.string(),
  wlStartsAt: z.number().nullable(),
  wlEndsAt: z.number().nullable(),
  wlMintPrice: z.number().nullable(),
  wlMaxMintPerWallet: z.number().nullable(),
  poStartsAt: z.number(),
  poEndsAt: z.number(),
  poMintPrice: z.number(),
  poMaxMintPerWallet: z.number(),
  isWhitelisted: z.boolean(),
  createdAt: z.string(),
  mintedAmount: z.number(),
  supply: z.number(),
  contractAddress: z.string(),
});

export type Launchschema = z.infer<typeof launchSchema>;

export type LaunchsDetailSchema = z.infer<typeof launchsDetailSchema>;
