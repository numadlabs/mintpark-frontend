import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringtoHex = (value: any) => {
  const buffer = Buffer.from(value, "utf8");
  const hexString = buffer.toString("hex");
  return hexString;
};

export function s3ImageUrlBuilder(fileKey: string) {
  return `https://d1orw8h9a3ark2.cloudfront.net/${fileKey}`;
}

export function imageCDN(uniqueIdx: string) {
  return `https://static-testnet.unisat.io/content/${uniqueIdx}`;
}

export function ordinalsImageCDN(uniqueIdx: string) {
  return `https://ordinals-testnet.fractalbitcoin.io/content/${uniqueIdx}`;
}

import { ethers } from "ethers";

interface WalletConnection {
  // provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}
export async function getSigner(): Promise<WalletConnection> {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      return { signer };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  } else {
    console.log("Please install MetaMask!");
  }
  return { signer: null };
}

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.number(),
    success: z.boolean(),
    data: z.union([dataSchema, z.null()]),
    message: z.string(),
  });

export const formatPrice = (price: number) => {
  const btcAmount = price;
  return btcAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
};
