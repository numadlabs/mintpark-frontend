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
import { getWagmiChainByLayerConfig } from "../wagmiConfig";
import { useEffect, useRef } from "react";
import { Layer } from "../types/wallet";

//todo: switch hiih uyd event sonsdog bolon darahd ajilladag zereg trigger hiij bgag boliulah
export const useWallet = () => {
  const queryClient = useQueryClient();
  const isInitialized = useRef(false);
  const isConnecting = useRef(false);
  // const hasSignedOnce = useRef(false);
  const restorationAttempted = useRef(false); // Track if we've attempted restoration

  //todo: listen metamask disconnect
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

  // Wagmi hooks
  const { address, isConnected: wagmiConnected, connector } = useAccount();
  const connectors = useConnectors();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  // Query hooks
  const { data: layers } = useLayers();
  const generateMessage = useGenerateMessage();
  const login = useLogin();
  const linkAccount = useLinkAccount();

  // Initialize available layers when data loads
  useEffect(() => {
    if (layers && layers.length > 0 && availableLayers.length === 0) {
      useWalletStore.getState().setLayers(layers);
      console.log("Available layers initialized:", layers.length);
    }
  }, [layers, availableLayers.length]);

  // Handle wagmi disconnect - bput only after wagmi has had time to reconnect
  //todo: key g string avj bgag boliulah
  useEffect(() => {
    // Don't clean up immediately on page load - give wagmi time to reconnect
    if (!isInitialized.current) return;

    // Only clean up if wagmi is definitely disconnected and we're not in a connecting state
    if (!wagmiConnected && storeIsConnected && !isConnecting.current) {
      // Add a small delay to ensure this isn't just a momentary disconnect during page load
      const cleanup = setTimeout(() => {
        // Double-check wagmi is still disconnected after the delay
        if (!wagmiConnected && !isConnecting.current) {
          console.log("Wagmi disconnected, cleaning up store");
          storeDisconnect();
          queryClient.clear();
          // hasSignedOnce.current = false;
          restorationAttempted.current = false;

          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(cleanup);
    }
  }, [wagmiConnected, storeIsConnected, isInitialized.current]);

  // Auto-authenticate when wagmi connects and we have stored auth state
  useEffect(() => {
    const shouldAttemptRestore =
      wagmiConnected &&
      address &&
      storeIsConnected &&
      !isLoading &&
      availableLayers.length > 0 &&
      !isConnecting.current &&
      isInitialized.current &&
      !restorationAttempted.current;

    if (shouldAttemptRestore) {
      restorationAttempted.current = true;

      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;

      if (accessToken && refreshToken) {
        console.log("Attempting to restore authenticated session");
        restoreAuthenticatedSession().catch((error) => {
          console.error("Failed to restore authenticated session:", error);
          // Clear invalid tokens and state
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
          // Don't disconnect wagmi, but clear our auth state
          storeDisconnect();
        });
      } else {
        console.log("No existing tokens found, clearing stored auth state");
        // Clear stored auth state if no tokens
        storeDisconnect();
      }
    }
  }, [
    wagmiConnected,
    address,
    storeIsConnected,
    isLoading,
    availableLayers.length,
    isInitialized.current,
  ]);

  // Mark as initialized after wagmi has had time to reconnect
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialized.current = true;
    }, 2000); // Increased delay to ensure wagmi reconnection
    return () => clearTimeout(timer);
  }, []);

  // Handle chain changes from external sources (like MetaMask)
  useEffect(() => {
    if (
      wagmiConnected &&
      address &&
      storeIsConnected &&
      availableLayers.length > 0 &&
      !isConnecting.current &&
      !isSwitchingChain &&
      isInitialized.current
    ) {
      console.log("isSwitching", isSwitchingChain);
      const matchingLayer = availableLayers.find((layer) => {
        if (!isEVMLayer(layer)) return false;
        const layerChainId = getChainIdAsNumber(layer.chainId);
        return layerChainId === chainId;
      });

      if (matchingLayer && matchingLayer.id !== currentLayer?.id) {
        console.log(
          "External chain change detected, switching to matching layer:",
          matchingLayer.name,
        );
        handleLayerSwitch(matchingLayer).catch(console.error);
      }
    }
  }, [
    chainId,
    wagmiConnected,
    address,
    storeIsConnected,
    availableLayers.length,
    currentLayer?.id,
    isSwitchingChain,
    availableLayers,
    isInitialized.current,
  ]);

  // Restore authenticated session with existing tokens
  const restoreAuthenticatedSession = async () => {
    if (!address || !wagmiConnected) {
      throw new Error("Wallet not connected");
    }

    if (availableLayers.length === 0) {
      throw new Error("Available layers not found");
    }

    console.log("Restoring authenticated session for address:", address);
    setLoading(true);
    setError(null);

    try {
      // Find the previously selected layer or default
      let targetLayer: Layer | undefined;

      const savedLayer = localStorage.getItem("selectedLayer");
      const savedNetwork = localStorage.getItem("selectedNetwork");

      if (savedLayer) {
        targetLayer = availableLayers.find(
          (layer) =>
            layer.layer === savedLayer &&
            (savedNetwork ? layer.network === savedNetwork : true),
        );
      }

      // If no saved layer, find layer based on current chain ID
      if (!targetLayer) {
        targetLayer = availableLayers.find((layer) => {
          if (!isEVMLayer(layer)) return false;
          const layerChainId = getChainIdAsNumber(layer.chainId);
          return layerChainId === chainId;
        });
      }

      // Default to first EVM layer if no match
      if (!targetLayer) {
        targetLayer = availableLayers.find((layer) => isEVMLayer(layer));
      }

      if (!targetLayer) {
        throw new Error("No supported layer found");
      }

      // Validate session by attempting to use existing tokens
      try {
        // Since we have persisted user data, we can restore from cache
        if (user && currentLayer && currentUserLayer) {
          console.log("Restoring from cached user data");
          // hasSignedOnce.current = true; // Mark as authenticated

          // Ensure we're on the correct chain for the cached layer
          if (isEVMLayer(currentLayer)) {
            const layerChainId = getChainIdAsNumber(currentLayer.chainId);
            if (layerChainId && layerChainId !== chainId) {
              console.log("Switching to cached layer chain:", layerChainId);
              const wagmiChain = getWagmiChainByLayerConfig(
                currentLayer.layer,
                currentLayer.network,
              );
              if (wagmiChain) {
                await switchChain({ chainId: wagmiChain.id });
              }
            }
          }

          console.log("Authenticated session restored successfully");
          return; // Session is already restored from Zustand persistence
        }

        // If no cached user data but we have tokens, we need to fetch user data
        // This would involve making an API call to get user info with the stored tokens
        throw new Error("No cached user data available");
      } catch (tokenError) {
        console.error("Session validation failed:", tokenError);
        throw new Error("Invalid session, please sign in again");
      }
    } catch (error) {
      console.error("Session restoration error:", error);
      setError(
        error instanceof Error ? error.message : "Session restoration failed",
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize active layer
  useEffect(() => {
    if (!layers) return;
    if (layers.length === 0) return;

    let targetLayerId = "";

    // Priority 1: Use provided selectedLayerId
    if (selectedLayerId) {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (layer) {
        targetLayerId = selectedLayerId;
      }
    }

    // Priority 2: Use current connected layer
    if (!targetLayerId && currentLayer) {
      targetLayerId = currentLayer.id;
    }

    // Priority 3: Use saved layer from localStorage
    if (!targetLayerId) {
      const savedLayer = localStorage.getItem("selectedLayer");
      const savedNetwork = localStorage.getItem("selectedNetwork");

      if (savedLayer) {
        const matchingLayer = layers.find(
          (layer) =>
            layer.layer === savedLayer &&
            (savedNetwork ? layer.network === savedNetwork : true),
        );
        if (matchingLayer) {
          targetLayerId = matchingLayer.id;
        }
      }
    }

    // Priority 4: Default to HEMI or first available
    if (!targetLayerId) {
      const hemiLayer = layers.find((layer) => layer.layer === "HEMI");
      targetLayerId = hemiLayer ? hemiLayer.id : layers[0]?.id || "";
    }

    if (targetLayerId && targetLayerId !== selectedLayerId) {
      setSelectedLayerId(targetLayerId);
    }
  }, [layers, selectedLayerId, currentLayer]);

  const authenticateWithWallet = async (targetLayerId?: string) => {
    if (!address || !wagmiConnected) {
      throw new Error("Wallet not connected");
    }

    if (availableLayers.length === 0) {
      throw new Error("Available layers not found");
    }

    console.log("Authenticating with wallet address:", address);
    setLoading(true);
    setError(null);

    try {
      // Find target layer
      let targetLayer: Layer | undefined;

      if (targetLayerId) {
        targetLayer = availableLayers.find(
          (layer) => layer.id === targetLayerId,
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

      if (!targetLayer) {
        throw new Error("No supported layer found");
      }

      const targetChainId = getChainIdAsNumber(targetLayer.chainId);

      // For EVM layers, ensure wallet is on correct chain using wagmi
      if (
        isEVMLayer(targetLayer) &&
        targetChainId &&
        targetChainId !== chainId
      ) {
        console.log("Switching to target chain with wagmi:", targetChainId);
        const wagmiChain = getWagmiChainByLayerConfig(
          targetLayer.layer,
          targetLayer.network,
        );
        if (wagmiChain) {
          await switchChain({ chainId: wagmiChain.id });
        }
      }

      // Generate message to sign
      const messageResponse = await generateMessage.mutateAsync({
        address: address.toString(),
      });

      // Sign message - this should only happen once for initial authentication
      const signedMessage = await signMessageAsync({
        message: messageResponse.data.message,
      });

      // hasSignedOnce.current = true; // Mark that user has signed once

      // Check if user already exists
      const hasExistingUser = user !== null;

      if (hasExistingUser) {
        console.log("Existing user found, linking account");
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

      console.log("Authentication successful");
    } catch (error) {
      console.error("Authentication error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed",
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (targetLayerId?: string) => {
    console.log("Connecting wallet with target layer:", targetLayerId);

    if (availableLayers.length === 0) {
      throw new Error("Available layers not found");
    }

    // Prevent concurrent connections
    if (isConnecting.current) {
      console.log("Connection already in progress");
      return;
    }

    isConnecting.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log("Initiating new wallet connection...");

      // Find target layer
      let targetLayer: Layer | undefined;
      if (targetLayerId) {
        targetLayer = availableLayers.find(
          (layer) => layer.id === targetLayerId,
        );
      } else {
        targetLayer = availableLayers.find((layer) => isEVMLayer(layer));
      }

      if (!targetLayer) {
        throw new Error("No supported layer found");
      }

      const targetChainId = getChainIdAsNumber(targetLayer.chainId);
      if (!targetChainId) {
        throw new Error("Invalid chain ID for target layer");
      }

      // Find appropriate connector
      const targetConnector =
        connectors.find(
          (conn) =>
            conn.name.toLowerCase().includes("metamask") ||
            conn.name.toLowerCase().includes("injected"),
        ) || connectors[0];

      if (!targetConnector) {
        throw new Error("No wallet connector found");
      }

      console.log("Using connector:", targetConnector.name);

      // Get wagmi chain for connection
      const wagmiChain = getWagmiChainByLayerConfig(
        targetLayer.layer,
        targetLayer.network,
      );
      const connectChainId = wagmiChain ? wagmiChain.id : targetChainId;

      // Connect with wagmi
      await targetConnector.connect({ chainId: connectChainId });

      // Authentication will be handled by the useEffect when wagmi connection is established
      console.log("Wallet connection initiated");
    } catch (error) {
      console.error("Connection error:", error);
      setError(error instanceof Error ? error.message : "Connection failed");
      throw error;
    } finally {
      setLoading(false);
      isConnecting.current = false;
    }
  };

  // Internal function to handle layer switching logic
  const handleLayerSwitch = async (
    targetLayer: Layer,
    // requiresSigning = true,
  ) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // For EVM layers, switch chain in wallet first using wagmi
      if (isEVMLayer(targetLayer)) {
        const targetChainId = getChainIdAsNumber(targetLayer.chainId);

        if (targetChainId && targetChainId !== chainId) {
          console.log("Switching chain with wagmi:", targetChainId);
          const wagmiChain = getWagmiChainByLayerConfig(
            targetLayer.layer,
            targetLayer.network,
          );
          if (wagmiChain) {
            await switchChain({ chainId: wagmiChain.id });
          } else {
            throw new Error(
              `Wagmi chain configuration not found for ${targetLayer.name}`,
            );
          }
        }
      }

      // Check if we already have userLayer for this layer
      let userLayer = getUserLayerFromCache(targetLayer.id);

      if (!userLayer) {
        // For authenticated users, we can link without signing again
        if (user) {
          console.log(
            "Linking account without signing (user already authenticated)",
          );

          const result = await linkAccount.mutateAsync({
            address,
            signedMessage: "", // Empty string for already authenticated users
            layerId: targetLayer.id,
          });

          userLayer = result.data.userLayer;
        } else {
          // Generate message and sign for new accounts or when signing is required
          console.log("Generating message and signing for layer switch");

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

        addUserLayerToCache(targetLayer.id, userLayer);
      }

      setLayer({
        layer: targetLayer,
        userLayer,
      });

      // Update selected layer ID
      setSelectedLayerId(targetLayer.id);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["myAssets"] });
      queryClient.invalidateQueries({ queryKey: ["chainSpecific"] });

      console.log("Layer switched successfully:", targetLayer.name);
      return userLayer.id;
    } catch (error) {
      console.error("Layer switch error:", error);
      setError(error instanceof Error ? error.message : "Layer switch failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Public function for switching layers (called from UI)
  const switchLayer = async (targetLayer: Layer) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // For header switches when user is already logged in, no signing required
    // const requiresSigning = !hasSignedOnce.current;

    console.log(
      "Switching layer from UI:",
      targetLayer.name,
      // "requires signing:",
      // requiresSigning,
    );

    const userLayerId = await handleLayerSwitch(targetLayer);
    return userLayerId;
  };

  const disconnectWallet = () => {
    console.log("Disconnecting wallet");
    isConnecting.current = false;
    // hasSignedOnce.current = false;
    restorationAttempted.current = false;
    disconnect();
    storeDisconnect();
    queryClient.clear();

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  return {
    // State
    isConnected: storeIsConnected,
    currentLayer,
    currentUserLayer,
    user,
    isLoading: isLoading || isSwitchingChain,
    error,
    availableLayers,
    selectedLayerId,

    // Actions
    setSelectedLayerId,
    connectWallet,
    authenticateWithWallet,
    switchLayer,
    disconnectWallet,
    getUserLayerFromCache,
    setLayer,
  };
};
