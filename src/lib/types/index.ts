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

// export interface CollectionType {
//   id: string;
//   name: string;
//   ticker: string;
//   description: string;
//   supply: number;
//   price: number;
//   createdAt: string;
//   walletLimit: number;
//   logoKey: string;
//   POStartDate: string;
//   status: COLLECTION_STATUS;
//   totalCount: number;
//   userId: string;
//   mintedCount: number;
// }

export interface CollectionType {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  walletLimit: number;
  logoKey: string;
  totalCount: number;
  mintedCount: number;
  POStartDate: string;
  layer_type: string;
  creator: string;
  feeRate: number;
  ownerAddress: string;
  isLaunched: boolean;
  status: string;
}

export type CollectibleType = {
  // id: string;
  // name: string;
  // createdAt: Date;
  // fileKey: string;
  // status: "ACTIVE" | "INACTIVE";
  // collectionId: string;
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  walletLimit: number;
  logoKey: string;
  totalCount: number;
  mintedCount: number;
  POStartDate: string;
  layer_type: string;
  creator: string;
  feeRate: number;
  ownerAddress: string;
  isLaunched: boolean;
  status: string;
};

export type CollectibleDataType = {
  file: File;
  name: string;
  creator: string;
  description: string;
  mintLayerType: string;
  feeRate: number;
  value:string
};

export type CollectionData = {
  logo: File;
  creator: string;
  description: string;
  name: string;
};

export type FeeRateAmount = {
  fileSizes: number[];
  fileTypeSizes: number[];
  feeRate: number;
};

export type CollectibleMintParamsType = {
  orderId: string;
};

export type LaunchpadItemType = {
  id: number;
  image: string;
  time: { day: number; hour: number; minute: number };
  title: string;
  price: number;
  mint: number;
  total: number;
  type?: string;
};

export type InscribeOrderData = {
  id: string;
  quantity: number;
  orderStatus: string;
  networkFee: number;
  serviceFee: number;
};

export type InscribeOrderDataType = {
  id: string;
  quantity: number;
  status: string;
  networkFee: number;
  serviceFee: number;
};

export type LayerType = {
  id: string;
  name: string;
  layer: string;
  network: string;
};

export type CollectionDataType = {
  id: string;
  creator: string;
  description: string;
  floor: number;
  layerId: string;
  listedCount: string;
  logoKey: string;
  marketCap: number;
  name: string;
  soldCount: string;
  supply: number;
  type: string;
  volume: number;
  uniqueIdx: string;
  price: number;
  createdAt: string;
  collectionName: string;
  fileKey: string;
  floorDifference: number;
  ownedBy: string;
  collectionId: string;
};


export type MintDataType = {
  orderType: string;
  files: File[];
  collectionId: string;
  feeRate: number;
}

export type MintCollectibleDataType = {
  orderType: string;
  files: File[];
  feeRate: number;
  name: string;
  creator: string;
  description: string;
}

export type LaunchCollectionData = {
  POStartsAt: number;
  POEndsAt: number;
  POMintPrice: number;
  POMaxMintPerWallet: number;
  files: File[];
  isWhiteListed: boolean;
}