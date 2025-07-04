import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const BADGE_BATCH_SIZE = 25;

// export const stringtoHex = (value: any) => {
//   const buffer = Buffer.from(value, "utf8");
//   const hexString = buffer.toString("hex");
//   return hexString;
// };

export function s3ImageUrlBuilder(fileKey: string) {
  return process.env.NODE_ENV === "development"
    ? `https://d237xcwu5voimf.cloudfront.net/${fileKey}`
    : `https://d1orw8h9a3ark2.cloudfront.net/${fileKey}`;
}

// export function imageCDN(uniqueIdx: string) {
//   return `https://static-testnet.unisat.io/content/${uniqueIdx}`;
// }

// export function ordinalsImageCDN(uniqueIdx: string) {
//   return `https://ordinals-testnet.fractalbitcoin.io/content/${uniqueIdx}`;
// }

import { ethers } from "ethers";
import moment from "moment";
import { toast } from "sonner";

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
    toast.message("Please install MetaMask!");
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
  return btcAmount?.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
};

export const formatFloorPrice = (price: number) => {
  const btcAmount = price;
  return btcAmount?.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
};
export const formatPriceBtc = (price: number) => {
  const btcAmount = price;
  return btcAmount?.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
};

export const formatPriceUsd = (price: number) => {
  const btcAmount = price;
  return btcAmount?.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const getDaysAgo = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatDaysAgo = (dateString: string) => {
  const createdDate = new Date(dateString);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day ago";
  } else {
    return `${diffDays} days ago`;
  }
};

export const formatTimeAgo = (dateString: string) => {
  const now = moment();
  const createdDate = moment(dateString);
  const duration = moment.duration(now.diff(createdDate));
  const minutes = duration.asMinutes();

  if (minutes < 60) {
    return `${Math.floor(minutes)}m`;
  } else if (minutes < 1440) {
    return `${Math.floor(minutes / 60)}h`;
  } else {
    return `${Math.floor(minutes / 1440)}d`;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const truncateAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const getFormattedTime = (timestamp?: number) => {
  if (!timestamp) return "-";

  const now = moment();
  const date = moment.unix(timestamp);
  const diffMinutes = now.diff(date, "minutes");
  const diffHours = now.diff(date, "hours");
  const diffDays = now.diff(date, "days");

  if (diffMinutes < 60) {
    return `${diffMinutes} m`;
  } else if (diffHours < 24) {
    return `${diffHours} hours`;
  } else {
    return `${diffDays} days`;
  }
};

// export const storePriceData = (price: number) => {
//   localStorage.setItem(STORAGE_KEYS.CITREA_PRICE_KEY, price.toString());
// };

// export const getPriceData = () => {
//   const citreaPrice = localStorage.getItem(STORAGE_KEYS.CITREA_PRICE_KEY);
//   if (citreaPrice) {
//     return parseInt(citreaPrice);
//   } else return 0;
// };
