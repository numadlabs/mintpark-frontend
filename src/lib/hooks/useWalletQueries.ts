// hooks/useWalletQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletStore } from "../store/walletStore";
import { getAllLayers } from "../service/queryHelper";
import {
  Layer,
  LinkAccountResponse,
  LoginResponse,
  UserLayer,
} from "../types/wallet";
import {
  generateMessageHandler,
  linkAccount,
  linkAccountToAnotherUser,
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
        userLayer,
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
    (state) => state.addUserLayerToCache,
  );

  return useMutation({
    mutationFn: linkAccount,
    onSuccess: async (response: LinkAccountResponse, variables) => {
      const { userLayer, hasAlreadyBeenLinkedToAnotherUser } = response.data;

      let userLayerFinal: UserLayer | null = null;

      if (!userLayer && hasAlreadyBeenLinkedToAnotherUser) {
        try {
          // Use the original variables passed to linkAccount
          const anotherUserResponse = await linkAccountToAnotherUser({
            address: variables.address,
            signedMessage: variables.signedMessage,
            layerId: variables.layerId,
            pubkey: variables.pubkey, // Include pubkey if available
          });

          if (anotherUserResponse.success) {
            userLayerFinal = anotherUserResponse.data.userLayer; // Fixed typo: userLAyer -> userLayer
          }
        } catch (error) {
          console.error("Failed to link account to another user:", error);
          throw error; // Re-throw to trigger onError
        }
      } else {
        userLayerFinal = userLayer;
      }

      // Only proceed if we have a valid userLayer
      if (userLayerFinal) {
        // Update Zustand cache
        addUserLayerToCache(userLayerFinal.layerId, userLayerFinal);

        // Update TanStack Query cache - use userLayerFinal consistently
        queryClient.setQueryData(
          WALLET_QUERY_KEYS.userLayer(userLayerFinal.layerId),
          userLayerFinal, // Changed from userLayer to userLayerFinal
        );

        // Invalidate related queries that depend on chain
        queryClient.invalidateQueries({
          queryKey: ["myAssets"],
        });
        queryClient.invalidateQueries({
          queryKey: ["chainSpecific"],
        });
      } else {
        // Handle case where no userLayer was obtained
        console.warn("No userLayer obtained from either linking method");
      }
    },
    onError: (error) => {
      console.error("Account linking failed:", error);
    },
  });
};
