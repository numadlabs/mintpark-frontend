import { useEffect, useCallback } from "react";
import { useAccount, useSignMessage, useSwitchChain, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { toast } from "sonner";
import useWalletStore from "./useWalletAuth";
import { generateMessageHandler } from "../service/postRequest";
import { WALLET_CONFIGS } from "../constants";

export function useWagmiWalletAuth() {
  const {
    layers,
    selectedLayerId,
    authState,
    pendingConnection,
    connectWallet,
    completeEvmWalletConnection,
    disconnectWallet,
    clearPendingConnection,
    setSelectedLayerId,
  } = useWalletStore();

  // Wagmi hooks
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync, isPending: isSigningPending } = useSignMessage();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();

  // Handle wallet connection completion when address changes
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (
        !address ||
        !isConnected ||
        !pendingConnection.layerId ||
        authState.loading
      ) {
        return;
      }

      const layer = layers.find((l) => l.id === pendingConnection.layerId);
      if (!layer || WALLET_CONFIGS[layer.layer]?.type !== "metamask") {
        return;
      }

      try {
        // Check if we need to switch to the correct chain
        const targetChainId = parseInt(layer.chainId);
        if (chainId && chainId !== targetChainId) {
          await switchChainAsync({ chainId: targetChainId });
        }

        // Generate message to sign
        const msgResponse = await generateMessageHandler({ address });
        if (!msgResponse.success) {
          throw new Error("Failed to generate message");
        }

        // Sign the message
        const signedMessage = await signMessageAsync({
          message: msgResponse.data.message,
        });

        // Complete the wallet connection
        await completeEvmWalletConnection(
          address,
          signedMessage,
          pendingConnection.layerId,
          pendingConnection.isLinking
        );

        toast.success("Wallet connected successfully!");
      } catch (error: any) {
        console.error("Failed to complete wallet connection:", error);
        toast.error(error.message || "Failed to connect wallet");
        clearPendingConnection();
        
        // Disconnect if there was an error
        try {
          await disconnectAsync();
        } catch (disconnectError) {
          console.error("Failed to disconnect after error:", disconnectError);
        }
      }
    };

    handleWalletConnection();
  }, [
    address,
    isConnected,
    chainId,
    pendingConnection,
    layers,
    authState.loading,
    signMessageAsync,
    switchChainAsync,
    completeEvmWalletConnection,
    clearPendingConnection,
    disconnectAsync,
  ]);

  // Handle account/chain changes from wallet
  useEffect(() => {
    if (!address || !isConnected || !selectedLayerId) return;

    const currentLayer = layers.find((l) => l.id === selectedLayerId);
    if (!currentLayer || WALLET_CONFIGS[currentLayer.layer]?.type !== "metamask") {
      return;
    }

    // Check if the current chain matches the selected layer
    const targetChainId = parseInt(currentLayer.chainId);
    if (chainId && chainId !== targetChainId) {
      // Find a layer that matches the current chain
      const matchingLayer = layers.find(
        (l) => parseInt(l.chainId) === chainId && WALLET_CONFIGS[l.layer]?.type === "metamask"
      );

      if (matchingLayer) {
        // Switch to the matching layer
        setSelectedLayerId(matchingLayer.id);
        toast.info(`Switched to ${matchingLayer.name}`);
      } else {
        toast.warning("Please switch to a supported network");
      }
    }
  }, [address, isConnected, chainId, selectedLayerId, layers, setSelectedLayerId]);

  // Connect to EVM wallet
  const connectEvmWallet = useCallback(
    async (layerId: string, isLinking: boolean = false) => {
      try {
        const layer = layers.find((l) => l.id === layerId);
        if (!layer) throw new Error("Layer not found");

        const walletConfig = WALLET_CONFIGS[layer.layer];
        if (walletConfig.type !== "metamask") {
          // Use the original connectWallet for non-EVM wallets
          return await connectWallet(layerId, isLinking);
        }

        // For EVM wallets, use wagmi
        const targetChainId = parseInt(layer.chainId);

        // Set pending connection first
        useWalletStore.getState().setPendingConnection(layerId, isLinking);

        // Connect to wallet
        if (!isConnected) {
          await connectAsync({ connector: injected() });
        }

        // Switch to correct chain if needed
        if (chainId !== targetChainId) {
          await switchChainAsync({ chainId: targetChainId });
        }

        // The rest of the connection process will be handled by the useEffect above
      } catch (error: any) {
        clearPendingConnection();
        console.error("Failed to connect EVM wallet:", error);
        
        if (error.name === "UserRejectedRequestError") {
          toast.error("Connection rejected by user");
        } else if (error.name === "ChainNotConfiguredError") {
          toast.error("Please add this network to your wallet");
        } else {
          toast.error(error.message || "Failed to connect wallet");
        }
        throw error;
      }
    },
    [
      layers,
      connectWallet,
      isConnected,
      chainId,
      connectAsync,
      switchChainAsync,
      clearPendingConnection,
    ]
  );

  // Disconnect EVM wallet
  const disconnectEvmWallet = useCallback(
    async (layerId: string) => {
      try {
        const layer = layers.find((l) => l.id === layerId);
        if (layer && WALLET_CONFIGS[layer.layer]?.type === "metamask" && isConnected) {
          await disconnectAsync();
        }
        await disconnectWallet(layerId);
      } catch (error: any) {
        console.error("Failed to disconnect wallet:", error);
        // Still disconnect from our store even if wagmi disconnect fails
        await disconnectWallet(layerId);
      }
    },
    [layers, isConnected, disconnectAsync, disconnectWallet]
  );

  // Switch chain for selected layer
  const switchToLayer = useCallback(
    async (layerId: string) => {
      try {
        const layer = layers.find((l) => l.id === layerId);
        if (!layer) throw new Error("Layer not found");

        const walletConfig = WALLET_CONFIGS[layer.layer];
        if (walletConfig.type === "metamask" && isConnected) {
          const targetChainId = parseInt(layer.chainId);
          if (chainId !== targetChainId) {
            await switchChainAsync({ chainId: targetChainId });
          }
        }

        // Update selected layer
        setSelectedLayerId(layerId);
      } catch (error: any) {
        console.error("Failed to switch chain:", error);
        if (error.name === "UserRejectedRequestError") {
          toast.error("Chain switch rejected by user");
        } else {
          toast.error(error.message || "Failed to switch network");
        }
        throw error;
      }
    },
    [layers, isConnected, chainId, switchChainAsync, setSelectedLayerId]
  );

  return {
    // Wagmi state
    address,
    isConnected,
    chainId,
    isSigningPending,
    isSwitchingChain,

    // Custom methods
    connectEvmWallet,
    disconnectEvmWallet,
    switchToLayer,

    // Store state
    authState,
    selectedLayerId,
    layers,
    pendingConnection,
  };
}