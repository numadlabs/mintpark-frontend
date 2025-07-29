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


// import { useEffect, useCallback } from "react";
// import {
//   useAccount,
//   useSignMessage,
//   useSwitchChain,
//   useConnect,
//   useDisconnect,
// } from "wagmi";
// import { injected } from "wagmi/connectors";
// import { toast } from "sonner";
// import useWalletStore from "./useWalletAuth";
// import {
//   generateMessageHandler,
//   loginWalletLink,
// } from "../service/postRequest";
// import { WALLET_CONFIGS } from "../constants";

// export function useWagmiWalletAuth() {
//   const {
//     layers,
//     selectedLayerId,
//     authState,
//     pendingConnection,
//     connectWallet,
//     completeEvmWalletConnection,
//     disconnectWallet,
//     clearPendingConnection,
//     setSelectedLayerId,
//     getWalletForLayer,
//     updateAuthStateForLayer,
//   } = useWalletStore();

//   // Wagmi hooks
//   const { address, isConnected, chainId } = useAccount();
//   const { signMessageAsync, isPending: isSigningPending } = useSignMessage();
//   const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
//   const { connectAsync } = useConnect();
//   const { disconnectAsync } = useDisconnect();

//   // Handle wallet connection completion when address changes
//   useEffect(() => {
//     const handleWalletConnection = async () => {
//       if (
//         !address ||
//         !isConnected ||
//         !pendingConnection.layerId ||
//         authState.loading
//       ) {
//         return;
//       }

//       const layer = layers.find((l) => l.id === pendingConnection.layerId);
//       if (!layer || WALLET_CONFIGS[layer.layer]?.type !== "metamask") {
//         return;
//       }

//       try {
//         // Check if we need to switch to the correct chain
//         const targetChainId = parseInt(layer.chainId);
//         if (chainId && chainId !== targetChainId) {
//           await switchChainAsync({ chainId: targetChainId });
//         }

//         // Generate message to sign
//         const msgResponse = await generateMessageHandler({ address });
//         if (!msgResponse.success) {
//           throw new Error("Failed to generate message");
//         }

//         // Sign the message
//         const signedMessage = await signMessageAsync({
//           message: msgResponse.data.message,
//         });

//         // Complete the wallet connection
//         await completeEvmWalletConnection(
//           address,
//           signedMessage,
//           pendingConnection.layerId,
//           pendingConnection.isLinking
//         );

//         toast.success("Wallet connected successfully!");
//       } catch (error: any) {
//         console.error("Failed to complete wallet connection:", error);
//         toast.error(error.message || "Failed to connect wallet");
//         clearPendingConnection();

//         // Disconnect if there was an error
//         try {
//           await disconnectAsync();
//         } catch (disconnectError) {
//           console.error("Failed to disconnect after error:", disconnectError);
//         }
//       }
//     };

//     handleWalletConnection();
//   }, [
//     address,
//     isConnected,
//     chainId,
//     pendingConnection,
//     layers,
//     authState.loading,
//     signMessageAsync,
//     switchChainAsync,
//     completeEvmWalletConnection,
//     clearPendingConnection,
//     disconnectAsync,
//   ]);

//   // Handle account/chain changes from wallet
//   useEffect(() => {
//     if (!address || !isConnected || !selectedLayerId) return;

//     const currentLayer = layers.find((l) => l.id === selectedLayerId);
//     if (
//       !currentLayer ||
//       WALLET_CONFIGS[currentLayer.layer]?.type !== "metamask"
//     ) {
//       return;
//     }

//     // Check if the current chain matches the selected layer
//     const targetChainId = parseInt(currentLayer.chainId);
//     if (chainId && chainId !== targetChainId) {
//       // Find a layer that matches the current chain
//       const matchingLayer = layers.find(
//         (l) =>
//           parseInt(l.chainId) === chainId &&
//           WALLET_CONFIGS[l.layer]?.type === "metamask"
//       );

//       if (matchingLayer) {
//         // Switch to the matching layer and update userLayerId
//         setSelectedLayerId(matchingLayer.id);
//         toast.info(`Switched to ${matchingLayer.name}`);
//       } else {
//         toast.warning("Please switch to a supported network");
//       }
//     }
//   }, [
//     address,
//     isConnected,
//     chainId,
//     selectedLayerId,
//     layers,
//     setSelectedLayerId,
//   ]);

//   // Connect to EVM wallet
//   const connectEvmWallet = useCallback(
//     async (layerId: string, isLinking: boolean = false) => {
//       try {
//         const layer = layers.find((l) => l.id === layerId);
//         if (!layer) throw new Error("Layer not found");

//         const walletConfig = WALLET_CONFIGS[layer.layer];
//         if (walletConfig.type !== "metamask") {
//           // Use the original connectWallet for non-EVM wallets
//           return await connectWallet(layerId, isLinking);
//         }

//         // For EVM wallets, use wagmi
//         const targetChainId = parseInt(layer.chainId);

//         // Set pending connection first
//         useWalletStore.getState().setPendingConnection(layerId, isLinking);

//         // Connect to wallet
//         if (!isConnected) {
//           await connectAsync({ connector: injected() });
//         }

//         // Switch to correct chain if needed
//         if (chainId !== targetChainId) {
//           await switchChainAsync({ chainId: targetChainId });
//         }

//         // The rest of the connection process will be handled by the useEffect above
//       } catch (error: any) {
//         clearPendingConnection();
//         console.error("Failed to connect EVM wallet:", error);

//         if (error.name === "UserRejectedRequestError") {
//           toast.error("Connection rejected by user");
//         } else if (error.name === "ChainNotConfiguredError") {
//           toast.error("Please add this network to your wallet");
//         } else {
//           toast.error(error.message || "Failed to connect wallet");
//         }
//         throw error;
//       }
//     },
//     [
//       layers,
//       connectWallet,
//       isConnected,
//       chainId,
//       connectAsync,
//       switchChainAsync,
//       clearPendingConnection,
//     ]
//   );

//   // Disconnect EVM wallet
//   const disconnectEvmWallet = useCallback(
//     async (layerId: string) => {
//       try {
//         const layer = layers.find((l) => l.id === layerId);
//         if (
//           layer &&
//           WALLET_CONFIGS[layer.layer]?.type === "metamask" &&
//           isConnected
//         ) {
//           await disconnectAsync();
//         }
//         await disconnectWallet(layerId);
//       } catch (error: any) {
//         console.error("Failed to disconnect wallet:", error);
//         // Still disconnect from our store even if wagmi disconnect fails
//         await disconnectWallet(layerId);
//       }
//     },
//     [layers, isConnected, disconnectAsync, disconnectWallet]
//   );

//   // Switch chain for selected layer - Simple version without auto-linking
//   const switchToLayer = useCallback(
//     async (layerId: string) => {
//       try {
//         const layer = layers.find((l) => l.id === layerId);
//         if (!layer) throw new Error("Layer not found");

//         const walletConfig = WALLET_CONFIGS[layer.layer];
//         if (walletConfig.type === "metamask" && isConnected) {
//           const targetChainId = parseInt(layer.chainId);
//           if (chainId !== targetChainId) {
//             await switchChainAsync({ chainId: targetChainId });
//           }
//         }

//         // Update selected layer (this will call updateAuthStateForLayer)
//         setSelectedLayerId(layerId);
//       } catch (error: any) {
//         console.error("Failed to switch chain:", error);
//         if (error.name === "UserRejectedRequestError") {
//           toast.error("Chain switch rejected by user");
//         } else {
//           toast.error(error.message || "Failed to switch network");
//         }
//         throw error;
//       }
//     },
//     [layers, isConnected, chainId, switchChainAsync, setSelectedLayerId]
//   );

//   // Function to link account to current layer (for my-assets page)
//   const linkAccountToCurrentLayer = useCallback(async () => {
//     console.log("linkAccountToCurrentLayer called with:", {
//       address,
//       isConnected,
//       selectedLayerId,
//       authenticated: authState.authenticated,
//     });

//     if (
//       !address ||
//       !isConnected ||
//       !selectedLayerId ||
//       !authState.authenticated
//     ) {
//       const error = "Wallet not connected or user not authenticated";
//       console.error(error);
//       throw new Error(error);
//     }

//     const layer = layers.find((l) => l.id === selectedLayerId);
//     if (!layer) {
//       const error = "Layer not found";
//       console.error(error);
//       throw new Error(error);
//     }

//     const walletConfig = WALLET_CONFIGS[layer.layer];
//     if (walletConfig.type !== "metamask") {
//       const error = "Account linking only supported for EVM wallets";
//       console.error(error);
//       throw new Error(error);
//     }

//     // Check if this wallet is already connected to this layer
//     const existingWallet = getWalletForLayer(selectedLayerId);
//     console.log("Existing wallet for layer:", existingWallet);

//     if (existingWallet) {
//       // Already connected, just update auth state
//       console.log("Wallet already connected to layer, updating auth state");
//       updateAuthStateForLayer(selectedLayerId);
//       return existingWallet;
//     }

//     try {
//       console.log("Generating message for account linking...");
//       // Generate message to sign for account linking
//       const msgResponse = await generateMessageHandler({ address });
//       if (!msgResponse.success) {
//         throw new Error("Failed to generate message");
//       }

//       console.log("Signing message...");
//       // Sign the message
//       const signedMessage = await signMessageAsync({
//         message: msgResponse.data.message,
//       });

//       console.log("Linking account to layer...");
//       // Link account to this layer using loginWalletLink (same as in useWalletAuth)
//       const linkResponse = await loginWalletLink({
//         address,
//         layerId: selectedLayerId,
//         signedMessage,
//       });

//       console.log("Link response:", linkResponse);

//       if (!linkResponse.success) {
//         console.error("Link response failed:", linkResponse);
//         throw new Error(
//           `Failed to link account to layer: ${
//             linkResponse.error || "Unknown error"
//           }`
//         );
//       }

//       // Check if wallet is already linked to another user
//       if (linkResponse.data.hasAlreadyBeenLinkedToAnotherUser) {
//         console.log("Wallet already linked to another user");
//         throw new Error("WALLET_ALREADY_LINKED");
//       }

//       console.log("Account linked successfully, updating store...");
//       // Add the new wallet to connected wallets and update auth state
//       const newWallet = {
//         address,
//         layerId: selectedLayerId,
//         layerType: layer.layerType,
//         layer: layer.layer,
//         network: layer.network,
//         userLayerId: linkResponse.data.userLayer.id,
//       };

//       // Update the store with the new wallet connection
//       useWalletStore.setState((state) => ({
//         connectedWallets: [...state.connectedWallets, newWallet],
//         authState: {
//           ...state.authState,
//           userLayerId: linkResponse.data.userLayer.id,
//           layerId: selectedLayerId,
//         },
//       }));

//       console.log("Store updated, showing success toast");
//       toast.success(`Account linked to ${layer.name}`);
//       return newWallet;
//     } catch (error: any) {
//       console.error("Failed to link account:", error);
//       if (error.message.includes("WALLET_ALREADY_LINKED")) {
//         toast.error("This wallet is already linked to another account");
//       } else {
//         toast.error(error.message || "Failed to link account to layer");
//       }
//       throw error;
//     }
//   }, [
//     address,
//     isConnected,
//     selectedLayerId,
//     authState.authenticated,
//     layers,
//     getWalletForLayer,
//     updateAuthStateForLayer,
//     signMessageAsync,
//   ]);

//   return {
//     // Wagmi state
//     address,
//     isConnected,
//     chainId,
//     isSigningPending,
//     isSwitchingChain,

//     // Custom methods
//     connectEvmWallet,
//     disconnectEvmWallet,
//     switchToLayer,
//     linkAccountToCurrentLayer,

//     // Store state
//     authState,
//     selectedLayerId,
//     layers,
//     pendingConnection,
//   };
// }
