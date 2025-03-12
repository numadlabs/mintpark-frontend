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

export type ActivityType = {
  activityType: string;
  price: number;
  collectionId: string;
  fromAddress: string;
  toAddress: string;
  timestamp: number;
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
