// store/walletStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { WalletState, Layer, UserLayer, User } from "../types/wallet";
import { enableMapSet } from "immer";

export interface WalletStore extends WalletState {
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLayers: (layers: Layer[]) => void;
  setConnected: (data: {
    layer: Layer;
    userLayer: UserLayer;
    user: User;
  }) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (layerId: string | null) => void;
  setLayer: (data: { layer: Layer; userLayer?: UserLayer }) => void;
  setUserLayer: (userLayer: UserLayer) => void;
  addUserLayerToCache: (layerId: string, userLayer: UserLayer) => void;
  getUserLayerFromCache: (layerId: string) => UserLayer | null;
  clearUserLayerCache: () => void;
  disconnect: () => void;
  reset: () => void;

  shouldAttemptRestore: () => boolean;
}

const initialState: WalletState = {
  isConnected: false,
  currentLayer: null,
  currentUserLayer: null,
  selectedLayerId: null,
  user: null,
  isLoading: false,
  error: null,
  availableLayers: [],
  userLayerCache: new Map(),
};

enableMapSet();

export const useWalletStore = create<WalletStore>()(
  persist(
    devtools(
      immer((set, get) => ({
        ...initialState,

        setSelectedLayerId(layerId) {
          set((state) => {
            state.selectedLayerId = layerId;
          });
        },

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
            state.isLoading = false;
          }),

        setLayers: (layers) =>
          set((state) => {
            state.availableLayers = layers;
          }),

        setConnected: ({ layer, userLayer, user }) =>
          set((state) => {
            state.isConnected = true;
            state.currentLayer = layer;
            state.currentUserLayer = userLayer;
            state.user = user;
            state.isLoading = false;
            state.error = null;
            // Ensure userLayerCache is a Map
            if (!(state.userLayerCache instanceof Map)) {
              state.userLayerCache = new Map();
            }
            state.userLayerCache.set(layer.id, userLayer);
          }),

        setLayer: ({ layer, userLayer }) =>
          set((state) => {
            state.currentLayer = layer;
            if (userLayer) {
              state.currentUserLayer = userLayer;
            }
            state.isLoading = false;
            state.error = null;
          }),

        setUserLayer: (userLayer) =>
          set((state) => {
            state.currentUserLayer = userLayer;
          }),

        addUserLayerToCache: (layerId, userLayer) =>
          set((state) => {
            // Ensure userLayerCache is a Map
            if (!(state.userLayerCache instanceof Map)) {
              state.userLayerCache = new Map();
            }
            state.userLayerCache.set(layerId, userLayer);
          }),

        getUserLayerFromCache: (layerId) => {
          const cache = get().userLayerCache;
          // Handle both Map and plain object cases
          if (cache instanceof Map) {
            return cache.get(layerId) || null;
          }
          // If it's a plain object (from localStorage), convert and get
          return null;
        },

        clearUserLayerCache: () =>
          set((state) => {
            // Ensure it's a Map before calling clear
            if (state.userLayerCache instanceof Map) {
              state.userLayerCache.clear();
            } else {
              state.userLayerCache = new Map();
            }
          }),

        disconnect: () =>
          set((state) => {
            state.isConnected = false;
            state.currentLayer = null;
            state.currentUserLayer = null;
            state.user = null;
            state.isLoading = false;
            state.error = null;
            // Ensure it's a Map before calling clear
            if (state.userLayerCache instanceof Map) {
              state.userLayerCache.clear();
            } else {
              state.userLayerCache = new Map();
            }
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
            state.userLayerCache = new Map();
          }),

        shouldAttemptRestore: () => {
          const state = get();
          const hasTokens =
            typeof window !== "undefined" &&
            localStorage.getItem("accessToken") &&
            localStorage.getItem("refreshToken");

          return (
            state.isConnected &&
            state.user !== null &&
            state.currentLayer !== null &&
            Boolean(hasTokens)
          );
        },
      })),
      { name: "wallet-store" },
    ),
    {
      name: "wallet-store",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                // Convert array back to Map
                userLayerCache: new Map(state.userLayerCache || []),
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const str = JSON.stringify({
              state: {
                ...value.state,
                // Convert Map to array for storage
                userLayerCache:
                  value.state.userLayerCache instanceof Map
                    ? Array.from(value.state.userLayerCache.entries())
                    : [],
              },
            });
            localStorage.setItem(name, str);
          } catch (error) {
            console.error("Failed to save to localStorage:", error);
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
