// hooks/useWalletQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletStore } from "../store/walletStore";
import { getAllLayers } from "../service/queryHelper";
import { Layer, LinkAccountResponse, LoginResponse } from "../types/wallet";
import {
  generateMessageHandler,
  linkAccount,
  loginHandler,
} from "../service/postRequest";

export const WALLET_QUERY_KEYS = {
  layers: () => ["layers"],
  userLayer: (layerId?: string) => ["userLayer", layerId],
  user: () => ["user"],
  message: (address: string) => ["message", address],
} as const;

export const useLayers = () => {
  const setLayers = useWalletStore((state) => state.setLayers);

  return useQuery({
    queryKey: WALLET_QUERY_KEYS.layers(),
    queryFn: async () => {
      const layers = await getAllLayers();
      setLayers(layers);
      return layers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGenerateMessage = () => {
  return useMutation({
    mutationFn: generateMessageHandler,
    onError: (error) => {
      console.error("Failed to generate message:", error);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setConnected = useWalletStore((state) => state.setConnected);

  return useMutation({
    mutationFn: loginHandler,
    onSuccess: (response: LoginResponse) => {
      const { user, userLayer, auth } = response.data;

      // Update Zustand store
      setConnected({
        layer: {} as Layer, // Will be set by the calling function
        userLayer,
        user,
      });

      // Update TanStack Query cache
      queryClient.setQueryData(WALLET_QUERY_KEYS.user(), user);
      queryClient.setQueryData(
        WALLET_QUERY_KEYS.userLayer(userLayer.layerId),
        userLayer
      );

      // Store auth tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", auth.accessToken);
        localStorage.setItem("refreshToken", auth.refreshToken);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useLinkAccount = () => {
  const queryClient = useQueryClient();
  const addUserLayerToCache = useWalletStore(
    (state) => state.addUserLayerToCache
  );

  return useMutation({
    mutationFn: linkAccount,
    onSuccess: (response: LinkAccountResponse) => {
      const { userLayer } = response.data;

      // Update Zustand cache
      addUserLayerToCache(userLayer.layerId, userLayer);

      // Update TanStack Query cache
      queryClient.setQueryData(
        WALLET_QUERY_KEYS.userLayer(userLayer.layerId),
        userLayer
      );

      // Invalidate related queries that depend on chain
      queryClient.invalidateQueries({
        queryKey: ["myAssets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["chainSpecific"],
      });
    },
    onError: (error) => {
      console.error("Account linking failed:", error);
    },
  });
};
