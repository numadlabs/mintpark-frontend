export interface ImageFile {
  file: File;
  preview: string;
}

export type CollectionData = {
  logo: File;
  // creator: string;
  description: string;
  name: string;
  priceForLaunchpad: number;
  type: string;
  userLayerId: string | null;
  layerId: string | null;
};

export type LayerType = {
  id: string;
  name: string;
  layer: string;
  network: string;
};

export type CollectionDataType = {
  id: string;
  creatorName: string;
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
  highResolutionImageUrl: string;
  fileKey: string;
  floorDifference: number;
  ownedBy: string;
  collectionId: string;
  listId: string;
  ownerCount: number;
  websiteUrl: string;
  twitterUrl: string;
  discordUrl: string;
  listedCollectibleCount?: number;
};

export type MintCollectibleDataType = {
  file: File[];
  feeRate?: number | undefined;
  name?: string;
  creator?: string;
  description?: string;
  txid?: string;
  collectionId: string;
};

export type LaunchDataType = {
  id: string;
  name: string;
  creator: string;
  description: string;
  supply: number;
  type: string;
  logoKey: string;
  layerId: string;
  launchId: string;
  hasFCFS: boolean;
  fcfsStartsAt: number;
  fcfsEndsAt: number;
  fcfsMintPrice: number;
  fcfsMaxMintPerWallet: number;
  wlStartsAt: number;
  wlEndsAt: number;
  wlMintPrice: number;
  wlMaxMintPerWallet: number;
  poStartsAt: number;
  poEndsAt: number;
  poMintPrice: number;
  poMaxMintPerWallet: number;
  isWhitelisted: boolean;
  mintedAmount: number;
  createdAt: string;
  isBadge: boolean;
  badgeSupply: number;
};

// export type ActivityType = {
//   activityType: string;
//   price: number;
//   collectionId: string;
//   fromAddress: string;
//   toAddress: string;
//   timestamp: number;
// };

export type ActivityType = {
    activityType: string;
    tokenId?: string | null;
    collectionId: string;
    fromAddress: string;
    toAddress?: string; // Optional since it only appears for certain activity types
    price: string; // Keep as string to handle large numbers properly
    transactionHash: string;
    timestamp: number;
    blockNumber: number;
    seller?: string;
};

export type InscriptionCollectible = {
  names: string[];
  files: File[];
  collectionId: string;
};

export type LaunchParams = {
  collectionId: string | null;
  isWhitelisted: boolean;
  hasFCFS: boolean;
  poStartsAt?: number | null;
  poEndsAt?: number;
  poMintPrice?: number;
  poMaxMintPerWallet?: number;
  wlStartsAt?: number;
  wlEndsAt?: number;
  wlMintPrice?: number;
  wlMaxMintPerWallet?: number;
  fcfsStartsAt?: number;
  fcfsEndsAt?: number;
  fcfsMintPrice?: number;
  fcfsMaxMintPerWallet?: number;
  userLayerId: string | null;
};

export type CreateLaunchParams = {
  names: string[];
  files: File[];
  collectionId: string;
  isLastBatch: boolean;
};

export type LayerTypes = {
  id: string;
  name: string;
  layer: string;
  network: string;
  currencyId: string;
  comingSoon?: boolean;
  chainId: string | null;
};

export type LaunchType = {
  collectionId: string | null;
  isWhitelisted: boolean;
  hasFCFS: boolean;
  poStartsAt?: number;
  poEndsAt?: number;
  poMintPrice?: number;
  poMaxMintPerWallet?: number;
  wlStartsAt?: number;
  wlEndsAt?: number;
  wlMintPrice?: number;
  wlMaxMintPerWallet?: number;
  fcfsStartsAt?: number;
  fcfsEndsAt?: number;
  fcfsMintPrice?: number;
  fcfsMaxMintPerWallet?: number;
  userLayerId: string | null;
};

export type LaunchItemType = {
  files?: File[];
  collectionId: string;
  isLastBatch?: boolean;
};

export type MintFeeType = {
  collectionTxid: string;
  mintFee: string;
};

export type BadgeType = {
  description: string;
  name: string;
  priceForLaunchpad: number;
  type: string;
  userLayerId: string | null;
  layerId: string | null;
  isBadge: boolean;
  creator: string;
};

export interface AddPhaseRequest {
  collectionId: string;
  phaseType: number;
  price: string;
  startTime: number;
  endTime: number;
  maxSupply: number;
  maxPerWallet: number;
  maxMintPerPhase: number;
  merkleRoot?: string;
  layerId: string;
  userLayerId: string | null;
}

export type tokenData = {
  address: string;
  opReturnValues: any[];
  assetType: number;
  headline: string;
  ticker: string;
  supply: number;
};

export type collectionData = {
  address: string;
  opReturnValues: any[];
  assetType: number;
  headline: string;
  ticker: string;
  supply: number;
  traits: Attribute[];
  //traits optional, logo optional
};

// export type utxo = {
//   txid: string;
//   vout: number;
//   value: number;
//   coinbase: boolean;
//   height: number;
//   derviation_index: number;
//   confirmations: number;
// };

// export type rpcResponse = {
//   result: string;
//   error: boolean;
//   id: string;
// };

type Attribute = {
  trait_type: string;
};

type Meta = {
  name: string;
};

export type MergedObject = {
  attributes: Attribute[];
  base64: string;
  fileName: string;
  meta: Meta;
  mimeType: string;
};

export type TokenType = {
  accessToken: string;
  refreshToken: string;
};

export interface JsonDataItem {
  attributes: Attribute[];
  meta: Meta;
  // Add other properties that exist in your JSON data
}

export interface WalletConfig {
  type: "unisat" | "metamask" | "educhain";
  chainId?: string;
  name: string;
  icon: string;
  currencyIcon: string;
  currencyPrice: number;
  networks: {
    [key: string]: NetworkConfig;
  };
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  chainId?: string;
  walletType: "unisat" | "metamask" | null;
}

// export interface Layer {
//   id: string;
//   name: string;
//   layer: string;
//   network: string;
//   currencyId: string;
// }

export interface NetworkConfig {
  chainId?: string;
  chainName?: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  //new implement
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// export interface WalletStorage {
//   address: string;
//   signature: string;
//   walletType: "unisat" | "metamask";
//   layerId: string;
//   expiry: number;
// }

// export interface AuthTokens {
//   accessToken: string | null;
//   refreshToken: string | null;
// }

export interface WalletState {
  primaryWallet: {
    address: string | null;
    type: "EVM" | "BITCOIN" | null;
    layerId: string | null;
  };
  secondaryWallet: {
    address: string | null;
    type: "EVM" | "BITCOIN" | null;
    layerId: string | null;
  };
}

// export interface AuthState {
//   [x: string]: string | null | undefined;
//   authenticated: boolean;
//   loading: boolean;
//   userLayerId: string | null;
//   userId: string | null;
//   layerId: string | null;
//   // primaryWallet: WalletInfo;
//   // secondaryWallet: WalletInfo;
//   // hasAlreadyBeenLinkedToAnotherUser
//   tokens: {
//     accessToken: string | null;
//     refreshToken: string | null;
//   };
// }

export interface AuthState {
  [x: string]:
    | string
    | null
    | undefined
    | boolean
    | {
        accessToken: string | null;
        refreshToken: string | null;
      };

  authenticated: boolean;
  loading: boolean;
  userLayerId: string | null;
  userId: string | null;
  layerId: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export interface WalletInfo {
  address: string | null;
  type: "EVM" | "BITCOIN" | null;
  layerId: string | null;
}

export interface Layer {
  // nativeCurrency?: any;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  id: string;
  name: string;
  layer: string;
  network: string;
  currencyId: string;
  chainId: string;
  layerType: string;
}
