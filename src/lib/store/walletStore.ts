// store/walletStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
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
          state.userLayerCache.set(layerId, userLayer);
        }),

      getUserLayerFromCache: (layerId) => {
        return get().userLayerCache.get(layerId) || null;
      },

      clearUserLayerCache: () =>
        set((state) => {
          state.userLayerCache.clear();
        }),

      disconnect: () =>
        set((state) => {
          state.isConnected = false;
          state.currentLayer = null;
          state.currentUserLayer = null;
          state.user = null;
          state.isLoading = false;
          state.error = null;
          state.userLayerCache.clear();
        }),

      reset: () =>
        set((state) => {
          Object.assign(state, initialState);
          state.userLayerCache = new Map();
        }),
    })),
    { name: "wallet-store" }
  )
);
