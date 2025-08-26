/**
 * TanStack Query Keys Helper
 *
 * This module provides a centralized way to manage all query keys used throughout the application.
 * It follows TanStack Query best practices for key hierarchies and invalidation patterns.
 *
 * Key Structure: [domain, entity, ...identifiers, ...filters]
 * Example: ['users', 'profile', userId] or ['nfts', 'collections', 'list', { page: 1, limit: 10 }]
 */

// Base query key types
type QueryKeyBase = readonly unknown[];

// User related query keys
export const userKeys = {
  // All user-related queries
  all: ["users"] as const,

  // User lists with optional filters
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...userKeys.lists(), filters] as const,

  // Individual user details
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,

  // User profile specific
  profile: (id: string) => [...userKeys.detail(id), "profile"] as const,

  // User loyalty points
  loyaltyPoints: (id: string) =>
    [...userKeys.detail(id), "loyalty-points"] as const,
  pointActivity: (id: string, filters?: { page?: number; limit?: number }) =>
    [...userKeys.loyaltyPoints(id), "activity", filters] as const,
  pointBalance: (id: string) =>
    [...userKeys.loyaltyPoints(id), "balance"] as const,

  // User assets
  assets: (id: string) => [...userKeys.detail(id), "assets"] as const,
  nfts: (id: string, filters?: { layerId?: string; collectionId?: string }) =>
    [...userKeys.assets(id), "nfts", filters] as const,

  // User authentication
  auth: () => [...userKeys.all, "auth"] as const,
  authStatus: () => [...userKeys.auth(), "status"] as const,
  authWallet: (address: string) =>
    [...userKeys.auth(), "wallet", address] as const,
} as const;

// // NFT and Collections related query keys
// export const nftKeys = {
//   // All NFT-related queries
//   all: ['nfts'] as const,

//   // NFT lists
//   lists: () => [...nftKeys.all, 'list'] as const,
//   list: (filters?: Record<string, unknown>) => [...nftKeys.lists(), filters] as const,

//   // Individual NFT details
//   details: () => [...nftKeys.all, 'detail'] as const,
//   detail: (id: string) => [...nftKeys.details(), id] as const,

//   // NFT metadata
//   metadata: (id: string) => [...nftKeys.detail(id), 'metadata'] as const,

//   // Collections
//   collections: {
//     all: ['collections'] as const,
//     lists: () => [...nftKeys.collections.all, 'list'] as const,
//     list: (filters?: { layerId?: string; category?: string; page?: number }) =>
//       [...nftKeys.collections.lists(), filters] as const,
//     details: () => [...nftKeys.collections.all, 'detail'] as const,
//     detail: (id: string) => [...nftKeys.collections.details(), id] as const,
//     stats: (id: string) => [...nftKeys.collections.detail(id), 'stats'] as const,
//     items: (id: string, filters?: { page?: number; limit?: number }) =>
//       [...nftKeys.collections.detail(id), 'items', filters] as const,
//   },
// } as const;

// // Launchpad related query keys
// export const launchpadKeys = {
//   all: ['launchpad'] as const,

//   // Launchpad projects
//   projects: () => [...launchpadKeys.all, 'projects'] as const,
//   projectsList: (filters?: { status?: 'upcoming' | 'live' | 'ended'; page?: number }) =>
//     [...launchpadKeys.projects(), 'list', filters] as const,
//   projectDetail: (id: string) => [...launchpadKeys.projects(), 'detail', id] as const,

//   // Launchpad statistics
//   stats: () => [...launchpadKeys.all, 'stats'] as const,
//   globalStats: () => [...launchpadKeys.stats(), 'global'] as const,
//   projectStats: (id: string) => [...launchpadKeys.stats(), 'project', id] as const,
// } as const;

// // Blockchain/Layer related query keys
// export const blockchainKeys = {
//   all: ['blockchain'] as const,

//   // Available layers/networks
//   layers: () => [...blockchainKeys.all, 'layers'] as const,
//   layersList: () => [...blockchainKeys.layers(), 'list'] as const,
//   layerDetail: (id: string) => [...blockchainKeys.layers(), 'detail', id] as const,

//   // Wallet related
//   wallet: () => [...blockchainKeys.all, 'wallet'] as const,
//   walletBalance: (address: string, layerId: string) =>
//     [...blockchainKeys.wallet(), 'balance', address, layerId] as const,
//   walletTransactions: (address: string, filters?: { page?: number; limit?: number }) =>
//     [...blockchainKeys.wallet(), 'transactions', address, filters] as const,

//   // Gas prices and network info
//   network: (layerId: string) => [...blockchainKeys.all, 'network', layerId] as const,
//   gasPrice: (layerId: string) => [...blockchainKeys.network(layerId), 'gas-price'] as const,
//   blockHeight: (layerId: string) => [...blockchainKeys.network(layerId), 'block-height'] as const,
// } as const;

// // Trading/Marketplace related query keys
// export const marketplaceKeys = {
//   all: ['marketplace'] as const,

//   // Listings
//   listings: () => [...marketplaceKeys.all, 'listings'] as const,
//   listingsList: (filters?: {
//     collectionId?: string;
//     priceRange?: [number, number];
//     sortBy?: string;
//     page?: number;
//   }) => [...marketplaceKeys.listings(), 'list', filters] as const,
//   listingDetail: (id: string) => [...marketplaceKeys.listings(), 'detail', id] as const,

//   // Orders
//   orders: () => [...marketplaceKeys.all, 'orders'] as const,
//   userOrders: (userId: string, filters?: { status?: string; page?: number }) =>
//     [...marketplaceKeys.orders(), 'user', userId, filters] as const,
//   orderDetail: (id: string) => [...marketplaceKeys.orders(), 'detail', id] as const,

//   // Market statistics
//   stats: () => [...marketplaceKeys.all, 'stats'] as const,
//   floorPrice: (collectionId: string) => [...marketplaceKeys.stats(), 'floor-price', collectionId] as const,
//   volume: (collectionId: string, timeframe?: '24h' | '7d' | '30d') =>
//     [...marketplaceKeys.stats(), 'volume', collectionId, timeframe] as const,
// } as const;

// // Analytics and metrics query keys
// export const analyticsKeys = {
//   all: ['analytics'] as const,

//   // Platform metrics
//   platform: () => [...analyticsKeys.all, 'platform'] as const,
//   platformStats: (timeframe?: '24h' | '7d' | '30d') =>
//     [...analyticsKeys.platform(), 'stats', timeframe] as const,

//   // User analytics
//   user: (userId: string) => [...analyticsKeys.all, 'user', userId] as const,
//   userActivity: (userId: string, timeframe?: '24h' | '7d' | '30d') =>
//     [...analyticsKeys.user(userId), 'activity', timeframe] as const,

//   // Collection analytics
//   collection: (collectionId: string) => [...analyticsKeys.all, 'collection', collectionId] as const,
//   collectionMetrics: (collectionId: string, timeframe?: '24h' | '7d' | '30d') =>
//     [...analyticsKeys.collection(collectionId), 'metrics', timeframe] as const,
// } as const;

// // Notification related query keys
// export const notificationKeys = {
//   all: ['notifications'] as const,

//   lists: () => [...notificationKeys.all, 'list'] as const,
//   userNotifications: (userId: string, filters?: {
//     read?: boolean;
//     type?: string;
//     page?: number;
//   }) => [...notificationKeys.lists(), 'user', userId, filters] as const,

//   unreadCount: (userId: string) => [...notificationKeys.all, 'unread-count', userId] as const,
// } as const;

// // System/App configuration query keys
// export const systemKeys = {
//   all: ['system'] as const,

//   config: () => [...systemKeys.all, 'config'] as const,
//   appConfig: () => [...systemKeys.config(), 'app'] as const,
//   featureFlags: () => [...systemKeys.config(), 'feature-flags'] as const,

//   health: () => [...systemKeys.all, 'health'] as const,
//   apiHealth: () => [...systemKeys.health(), 'api'] as const,
// } as const;

// Main query keys object that exports all key factories
export const queryKeys = {
  users: userKeys,
  // nfts: nftKeys,
  // launchpad: launchpadKeys,
  // blockchain: blockchainKeys,
  // marketplace: marketplaceKeys,
  // analytics: analyticsKeys,
  // notifications: notificationKeys,
  // system: systemKeys,
} as const;

// Type exports for better TypeScript support
export type UserQueryKeys = typeof userKeys;
// export type NftQueryKeys = typeof nftKeys;
// export type LaunchpadQueryKeys = typeof launchpadKeys;
// export type BlockchainQueryKeys = typeof blockchainKeys;
// export type MarketplaceQueryKeys = typeof marketplaceKeys;
// export type AnalyticsQueryKeys = typeof analyticsKeys;
// export type NotificationQueryKeys = typeof notificationKeys;
// export type SystemQueryKeys = typeof systemKeys;
// export type AllQueryKeys = typeof queryKeys;

// Utility functions for common invalidation patterns
export const invalidationHelpers = {
  // Invalidate all queries for a specific user
  // invalidateUserQueries: (queryClient: any, userId: string) => {
  //   queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
  // },

  // // Invalidate all queries for a specific collection
  // invalidateCollectionQueries: (queryClient: any, collectionId: string) => {
  //   queryClient.invalidateQueries({ queryKey: nftKeys.collections.detail(collectionId) });
  // },

  // // Invalidate all marketplace related queries
  // invalidateMarketplaceQueries: (queryClient: any) => {
  //   queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
  // },

  // // Invalidate queries when user connects/disconnects wallet
  // invalidateAuthQueries: (queryClient: any) => {
  //   queryClient.invalidateQueries({ queryKey: userKeys.auth() });
  //   queryClient.invalidateQueries({ queryKey: blockchainKeys.wallet() });
  // },

  // Invalidate loyalty points related queries
  invalidateLoyaltyPoints: (queryClient: any, userId: string) => {
    queryClient.invalidateQueries({ queryKey: userKeys.loyaltyPoints(userId) });
  },
} as const;

// Example usage:
/*
// In a component
const { data } = useQuery({
  queryKey: queryKeys.users.loyaltyPoints(userId),
  queryFn: () => fetchLoyaltyPoints(userId),
});

// In a mutation
const mutation = useMutation({
  mutationFn: updateUserProfile,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.users.detail(userId)
    });
  },
});

// Using invalidation helpers
invalidationHelpers.invalidateLoyaltyPoints(queryClient, userId);
*/
