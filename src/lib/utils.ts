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

export const formatTimeRemaining = (totalMinutes: number) => {
  if (!totalMinutes || totalMinutes < 0) return "0m";

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.floor(totalMinutes % 60);

  const parts = [];

  if (days > 0) {
    parts.push(`${days} d`);
  }
  if (hours > 0) {
    parts.push(`${hours} h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} m`);
  }

  return parts.join(" ");
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

// export const capitalizeFirstLetter = (string: string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// };
export const capitalizeFirstLetter = (string: string | undefined | null) => {
  // Add safety checks for undefined/null values
  if (!string || typeof string !== "string") {
    return "";
  }
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
// Add these functions to your existing utils.ts file

// NFT Trait Parsing Functions
/**
 * Parse trait assets from uploaded folder structure
 * @param traitFile - File object with fileList property OR direct FileList
 * @returns Object with expectedTraitTypes and expectedTraitValues
 */
export function parseTraitAssets(traitFile: File | FileList) {
  let fileList: FileList;

  // Handle both direct FileList and virtual File with fileList property
  if (traitFile instanceof FileList) {
    fileList = traitFile;
  } else if ((traitFile as any).fileList) {
    fileList = (traitFile as any).fileList as FileList;
  } else {
    console.warn("Invalid trait file structure");
    return { expectedTraitTypes: 0, expectedTraitValues: 0 };
  }

  const traitTypes = new Set<string>();
  let traitValueCount = 0;

  console.log("Parsing", fileList.length, "files from trait assets");

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const pathParts = file.webkitRelativePath?.split("/") || [];

    console.log(
      "Processing file:",
      file.name,
      "Path:",
      file.webkitRelativePath,
      "Type:",
      file.type
    );

    // Only process image files
    if (pathParts.length >= 2 && file.type.startsWith("image/")) {
      let traitType: string;

      if (pathParts.length === 2) {
        // Direct structure: traitType/image.png
        traitType = pathParts[0];
      } else if (pathParts[0] === "traits") {
        // Nested structure: traits/traitType/image.png
        traitType = pathParts[1];
      } else {
        // Fallback: use parent folder
        traitType = pathParts[pathParts.length - 2];
      }

      traitTypes.add(traitType);
      traitValueCount++; // Each image file is a trait value

      console.log(
        "Added trait type:",
        traitType,
        "Total types so far:",
        traitTypes.size
      );
    }
  }

  const result = {
    expectedTraitTypes: traitTypes.size,
    expectedTraitValues: traitValueCount,
  };

  console.log("Parse result:", result);
  console.log("Trait types found:", Array.from(traitTypes));

  return result;
}

/**
 * Parse metadata JSON file to get collection count
 * @param metadataFile - The uploaded JSON file
 * @returns Promise with expectedRecursive count and collection items
 */
export function parseMetadataJson(metadataFile: File): Promise<{
  expectedRecursive: number;
  collectionItems: any[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);

        // Handle different JSON structures
        let collectionItems = [];

        if (jsonContent.collection && Array.isArray(jsonContent.collection)) {
          // Your current structure: { name: "...", collection: [...] }
          collectionItems = jsonContent.collection;
        } else if (Array.isArray(jsonContent)) {
          // Direct array structure: [...]
          collectionItems = jsonContent;
        } else if (jsonContent.items && Array.isArray(jsonContent.items)) {
          // Alternative structure: { items: [...] }
          collectionItems = jsonContent.items;
        } else if (jsonContent.tokens && Array.isArray(jsonContent.tokens)) {
          // Alternative structure: { tokens: [...] }
          collectionItems = jsonContent.tokens;
        } else {
          // If no recognized structure, assume it's a single item
          collectionItems = [jsonContent];
        }

        resolve({
          expectedRecursive: collectionItems.length,
          collectionItems,
        });
      } catch (error) {
        reject(new Error("Invalid JSON format: " + (error as Error).message));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(metadataFile);
  });
}

/**
 * Count One of One edition files
 * @param oneOfOneFiles - FileList from one-of-one folder upload
 * @returns Number of image files (expectedOOOEditions)
 */
export function parseOneOfOneEditions(oneOfOneFiles: FileList): number {
  let count = 0;

  for (let i = 0; i < oneOfOneFiles.length; i++) {
    const file = oneOfOneFiles[i];
    // Only count image files
    if (file.type.startsWith("image/")) {
      count++;
    }
  }

  return count;
}

/**
 * Enhanced calculation function that handles the new virtual file structure
 */
export async function calculateUploadParameters(
  traitData: {
    traitAssets: File | null;
    oneOfOneEditions: File | null;
    metadataJson: File | null;
  },
  isOneOfOneEnabled: boolean = false
): Promise<{
  expectedTraitTypes: number;
  expectedTraitValues: number;
  expectedRecursive: number;
  expectedOOOEditions: number;
}> {
  let expectedTraitTypes = 0;
  let expectedTraitValues = 0;
  let expectedRecursive = 0;
  let expectedOOOEditions = 0;

  console.log("Calculating upload parameters with trait data:", {
    hasTraitAssets: !!traitData.traitAssets,
    hasMetadataJson: !!traitData.metadataJson,
    hasOneOfOne: !!traitData.oneOfOneEditions,
    isOneOfOneEnabled,
  });

  // Parse trait assets if uploaded
  if (traitData.traitAssets) {
    try {
      const { expectedTraitTypes: types, expectedTraitValues: values } =
        parseTraitAssets(traitData.traitAssets);
      expectedTraitTypes = types;
      expectedTraitValues = values;
      console.log("Parsed trait assets:", { types, values });
    } catch (error) {
      console.error("Error parsing trait assets:", error);
    }
  }

  // Parse metadata JSON if uploaded
  if (traitData.metadataJson) {
    try {
      const { expectedRecursive: recursive } = await parseMetadataJson(
        traitData.metadataJson
      );
      expectedRecursive = recursive;
      console.log("Parsed metadata JSON:", { recursive });
    } catch (error) {
      console.error("Error parsing metadata JSON:", error);
      throw error;
    }
  }

  // Parse One of One editions if enabled and uploaded
  if (isOneOfOneEnabled && traitData.oneOfOneEditions) {
    try {
      const oooFiles = (traitData.oneOfOneEditions as any).fileList as FileList;
      if (oooFiles) {
        expectedOOOEditions = parseOneOfOneEditions(oooFiles);
        console.log("Parsed OOO editions:", { expectedOOOEditions });
      }
    } catch (error) {
      console.error("Error parsing OOO editions:", error);
    }
  }

  const result = {
    expectedTraitTypes,
    expectedTraitValues,
    expectedRecursive,
    expectedOOOEditions,
  };

  console.log("Final calculated parameters:", result);

  return result;
}

// Z-Index Management Utilities

/**
 * Default z-index values for common NFT trait types
 * Lower values appear behind higher values
 */
export const DEFAULT_Z_INDEX_MAP: Record<string, number> = {
  // Base layers (background)
  background: 1,
  backdrop: 1,
  sky: 1,

  // Character base
  body: 2,
  skin: 2,
  base: 2,

  // Clothing and items
  clothing: 3,
  shirt: 3,
  dress: 3,
  outfit: 3,

  // Accessories (worn items)
  accessories: 4,
  jewelry: 4,
  necklace: 4,
  earrings: 4,

  // Facial features
  eyes: 5,
  eyebrows: 5,
  nose: 5,
  mouth: 6,
  lips: 6,

  // Hair and headwear
  hair: 7,
  hairstyle: 7,
  hat: 8,
  helmet: 8,
  crown: 8,
  cap: 8,

  // Held items and effects
  item: 9,
  weapon: 9,
  tool: 9,
  effect: 10,
  aura: 10,

  // Pot NFT specific (based on your JSON)
  plant: 2,
  pot: 3,
  face: 4,

  // Other common types
  frame: 11,
  border: 11,
};

/**
 * Get default z-index for a trait type
 * @param traitType - The trait type name
 * @returns Default z-index value
 */
export function getDefaultZIndex(traitType: string): number {
  const normalizedType = traitType.toLowerCase().trim();
  return DEFAULT_Z_INDEX_MAP[normalizedType] || 5; // Default to middle value
}

// export const storePriceData = (price: number) => {
//   localStorage.setItem(STORAGE_KEYS.CITREA_PRICE_KEY, price.toString());
// };

// export const getPriceData = () => {
//   const citreaPrice = localStorage.getItem(STORAGE_KEYS.CITREA_PRICE_KEY);
//   if (citreaPrice) {
//     return parseInt(citreaPrice);
//   } else return 0;
// };
