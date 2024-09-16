export type User = {
  walletAddress?: string;
  nickname?: string | null;
  createdAt?: string | null;
  profileLink?: string | null;
};
export interface MintCollectiblePayload {
  payload: string;
  ticker: string;
  headline: string;
  supply: number;
  assetType: number;
}

export interface MintCollectibleResponse {
  success: boolean;
  data: {
    hex: string;
  };
}

export interface ImageFile {
  file: File;
  preview: string;
}

export interface CreateCollectibleType {
  file: File; // File object representing the image file
  meta: {
    name: string; // Name of the collectible
    // Add any other metadata fields related to the collectible
  };
  collectionId: string;
}

export type CreateCollectionType = {
  name: string;
  description: string;
  ticker: string;
  supply: number;
  price: number;
  walletLimit: number;
  POStartDate: number; // Unix timestamp
  logo: ImageFile;
};

enum COLLECTION_STATUS {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  SOLD_OUT = "SOLD_OUT",
}

export interface CollectionType {
  id: string;
  name: string;
  ticker: string;
  description: string;
  supply: number;
  price: number;
  createdAt: string;
  walletLimit: number;
  logoKey: string;
  POStartDate: string;
  status: COLLECTION_STATUS;
  totalCount: number;
  userId: string;
  mintedCount: number;
}

export type CollectibleType = {
  id: string;
  name: string;
  createdAt: Date;
  fileKey: string;
  status: "ACTIVE" | "INACTIVE";
  collectionId: string;
};
