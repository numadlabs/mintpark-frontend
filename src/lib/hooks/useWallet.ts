import {
  useAccount,
  useChainId,
  useDisconnect,
  useSwitchChain,
  useSignMessage,
  useConnectors,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletStore } from "../store/walletStore";
import {
  useLayers,
  useGenerateMessage,
  useLogin,
  useLinkAccount,
} from "./useWalletQueries";
import {
  getChainIdAsNumber,
  isEVMLayer,
  getNetworkConfigForLayer,
} from "@/lib/utils/wallet";

import { useEffect } from "react";
import { Layer } from "../types/wallet";

export const useWallet = () => {
  const queryClient = useQueryClient();

  // Zustand store
  const {
    isConnected: storeIsConnected,
    currentLayer,
    currentUserLayer,
    user,
    isLoading,
    error,
    availableLayers,
    selectedLayerId,
    setLoading,
    setError,
    setConnected,
    setSelectedLayerId,
    setLayer,
    getUserLayerFromCache,
    addUserLayerToCache,
    disconnect: storeDisconnect,
    clearUserLayerCache,
  } = useWalletStore();

  console.log("current layer", currentLayer);

  // Wagmi hooks
  const { address, isConnected: wagmiConnected, connector } = useAccount();
  const connectors = useConnectors();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  // Query hooks
  const { data: layers } = useLayers();
  const generateMessage = useGenerateMessage();
  const login = useLogin();
  const linkAccount = useLinkAccount();

  const authenticateWithWallet = async (targetLayerId?: string) => {
    if (!address || !wagmiConnected) {
      throw new Error("Wallet not connected");
    }

    if (availableLayers.length === 0) {
      throw new Error("Available layers not found");
    }

    console.log("Authenticating with wallet address:", address);
    setLoading(true);

    try {
      // Find target layer
      let targetLayer: Layer | undefined;

      if (targetLayerId) {
        targetLayer = availableLayers.find(
          (layer) => layer.id === targetLayerId
        );
      } else {
        // Find layer based on current chain ID if EVM
        targetLayer = availableLayers.find((layer) => {
          if (!isEVMLayer(layer)) return false;
          const layerChainId = getChainIdAsNumber(layer.chainId);
          return layerChainId === chainId;
        });

        // Default to first EVM layer if no match
        if (!targetLayer) {
          targetLayer = availableLayers.find((layer) => isEVMLayer(layer));
        }
      }

      console.log("Target layer for authentication:", targetLayer);

      if (!targetLayer) {
        throw new Error("No supported layer found");
      }

      const targetChainId = getChainIdAsNumber(targetLayer.chainId);

      // For EVM layers, ensure wallet is on correct chain
      if (
        isEVMLayer(targetLayer) &&
        targetChainId &&
        targetChainId !== chainId
      ) {
        await switchChain({ chainId: targetChainId });
      }

      // Generate message to sign
      const messageResponse = await generateMessage.mutateAsync({
        address: address.toString(),
      });

      // Sign message
      const signedMessage = await signMessageAsync({
        message: messageResponse.data.message,
      });

      console.log("Message signed successfully");

      // Check if user already exists (has user in store)
      const hasExistingUser = user !== null;

      if (hasExistingUser) {
        console.log("Existing user found, linking account");

        // Link new account
        const result = await linkAccount.mutateAsync({
          address: address.toString(),
          signedMessage,
          layerId: targetLayer.id,
        });

        setLayer({
          layer: targetLayer,
          userLayer: result.data.userLayer,
        });
      } else {
        console.log("New user, logging in/registering");

        // Login/Register
        const result = await login.mutateAsync({
          address: address.toString(),
          signedMessage,
          layerId: targetLayer.id,
        });

        setConnected({
          layer: targetLayer,
          userLayer: result.data.userLayer,
          user: result.data.user,
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to connect wallet and authenticate
  const connectWallet = async (targetLayerId?: string) => {
    console.log("Connecting wallet with target layer:", targetLayerId);

    if (availableLayers.length === 0) {
      throw new Error("Available layers not found");
    }

    setLoading(true);
    setError(null);

    try {
      // If wagmi is already connected, just authenticate
      if (wagmiConnected && address) {
        console.log("Wagmi already connected, authenticating...");
        await authenticateWithWallet(targetLayerId);
        return;
      }

      console.log("Wagmi not connected, proceeding with connection...");

      // Find target layer first to determine which connector to use
      let targetLayer: Layer | undefined;

      if (targetLayerId) {
        targetLayer = availableLayers.find(
          (layer) => layer.id === targetLayerId
        );
      } else {
        // Default to first EVM layer
        targetLayer = availableLayers.find((layer) => isEVMLayer(layer));
      }

      if (!targetLayer) {
        throw new Error("No supported layer found");
      }

      const targetChainId = getChainIdAsNumber(targetLayer.chainId);
      console.log("Target chain ID:", targetChainId);
      if (!targetChainId) {
        throw new Error("target chain id not found");
      }

      // Find appropriate connector (usually MetaMask for EVM)
      const targetConnector =
        connectors.find(
          (conn) =>
            conn.name.toLowerCase().includes("metamask") ||
            conn.name.toLowerCase().includes("injected")
        ) || connectors[0];

      if (!targetConnector) {
        throw new Error("No wallet connector found");
      }

      console.log("Using connector:", targetConnector.name);

      // Connect with wagmi
      const connectResult = await new Promise((resolve, reject) => {
        targetConnector.connect({
          // connector: targetConnector,
          chainId: targetChainId,
        });
      });

      console.log("connectResult", connectResult);
      // Note: After successful connect, the useEffect below will handle authentication
      // when wagmiConnected and address become available
    } catch (error) {
      console.error("Connection error:", error);
      setError(error instanceof Error ? error.message : "Connection failed");
      setLoading(false);
    }
  };

  const switchLayer = async (targetLayer: Layer) => {
    if (!address || !user) return;

    setLoading(true);

    try {
      // For EVM layers, switch chain in wallet first
      if (isEVMLayer(targetLayer)) {
        const targetChainId = getChainIdAsNumber(targetLayer.chainId);
        const networkConfig = getNetworkConfigForLayer(targetLayer);

        if (targetChainId && targetChainId !== chainId) {
          try {
            await switchChain({ chainId: targetChainId });
          } catch (switchError: any) {
            // If chain doesn't exist, try to add it
            if (switchError?.code === 4902 && networkConfig) {
              throw new Error(
                `Please add ${targetLayer.name} to your wallet first`
              );
            }
            throw switchError;
          }
        }
      }

      // Check if we already have userLayer for this layer
      let userLayer = getUserLayerFromCache(targetLayer.id);

      if (!userLayer) {
        // Generate message and link account for new layer
        const messageResponse = await generateMessage.mutateAsync({
          address: address.toString(),
        });
        const signedMessage = await signMessageAsync({
          message: messageResponse.data.message,
        });

        const result = await linkAccount.mutateAsync({
          address,
          signedMessage,
          layerId: targetLayer.id,
        });

        userLayer = result.data.userLayer;
      }

      setLayer({
        layer: targetLayer,
        userLayer,
      });

      // Invalidate queries that depend on layer/userLayer
      queryClient.invalidateQueries({ queryKey: ["myAssets"] });
      queryClient.invalidateQueries({ queryKey: ["chainSpecific"] });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Layer switch failed");
    }
  };

  const disconnectWallet = () => {
    disconnect();
    storeDisconnect();
    queryClient.clear();

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  // Listen to wagmi account changes
  useEffect(() => {
    if (!wagmiConnected && storeIsConnected) {
      disconnectWallet();
    }
  }, [wagmiConnected]);

  // Listen to wagmi chain changes
  useEffect(() => {
    if (
      wagmiConnected &&
      address &&
      storeIsConnected &&
      availableLayers.length
    ) {
      const matchingLayer = availableLayers.find((layer) => {
        if (!isEVMLayer(layer)) return false;
        const layerChainId = getChainIdAsNumber(layer.chainId);
        return layerChainId === chainId;
      });

      if (matchingLayer && matchingLayer.id !== currentLayer?.id) {
        switchLayer(matchingLayer);
      }
    }
  }, [chainId, wagmiConnected, address, availableLayers.length]);

  return {
    // State
    isConnected: storeIsConnected,
    currentLayer,
    currentUserLayer,
    user,
    isLoading,
    error,
    availableLayers,
    selectedLayerId,

    // Actions
    setLayer,
    setSelectedLayerId,
    connectWallet,
    authenticateWithWallet,
    switchLayer,
    disconnectWallet,
    getUserLayerFromCache,
  };
};
