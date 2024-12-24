// // hooks/useWalletConnection.ts
// import { useState, useCallback } from "react";
// import {
//   generateMessageHandler,
//   loginHandler,
// } from "@/lib/service/postRequest";
// import { Layer, WalletState } from "@/types";
// import { WALLET_CONFIGS } from "../constants";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";

// export const useWalletConnection = () => {
//   const { mutateAsync: generateMessageMutation } = useMutation({
//     mutationFn: generateMessageHandler,
//     onError: (error) => {
//       console.error("Generate message error:", error);
//       toast.error(
//         "Failed to generate message from server. Using fallback message.",
//       );
//     },
//   });
//   const [walletState, setWalletState] = useState<WalletState>({
//     address: null,
//     connected: false,
//     walletType: null,
//   });

//   const connectWallet = useCallback(async (layer: Layer) => {
//     const config = WALLET_CONFIGS[layer.layer];
//     if (!config) throw new Error("Unsupported layer");

//     try {
//       let address: string;
//       let signature: string;
//       let pubkey: string | undefined;

//       if (config.type === "unisat") {
//         if (!window.unisat) throw new Error("Unisat wallet not installed");

//         const accounts = await window.unisat.requestAccounts();
//         address = accounts[0];
//         const message = await generateMessageMutation({ address });
//         signature = await window.unisat.signMessage(message);
//         pubkey = await window.unisat.getPublicKey();
//       } else if (config.type === "metamask") {
//         if (!window.ethereum) throw new Error("MetaMask not installed");

//         // Switch or add network
//         const networkConfig = config.networks[layer.network];
//         await setupEthereumChain(networkConfig);

//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts",
//         });
//         address = accounts[0];
//         const message = await generateMessageMutation({ address });
//         signature = await window.ethereum.request({
//           method: "personal_sign",
//           params: [message, address],
//         });
//       }

//       // Login with backend
//       const loginResponse = await loginHandler({
//         address,
//         signedMessage: signature,
//         layerId: layer.id,
//         pubkey,
//       });

//       if (loginResponse.success) {
//         setWalletState({
//           address,
//           connected: true,
//           walletType: config.type,
//           chainId: config.chainId,
//         });

//         // Save to localStorage for persistence
//         saveWalletState({
//           address,
//           signature,
//           walletType: config.type,
//           layerId: layer.id,
//           expiry: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // 7 days
//         });

//         return loginResponse;
//       }
//     } catch (error) {
//       console.error("Wallet connection error:", error);
//       throw error;
//     }
//   }, []);

//   const disconnectWallet = useCallback(async () => {
//     try {
//       if (walletState.walletType === "metamask") {
//         // Optional: Revoke permissions
//         await window.ethereum?.request({
//           method: "wallet_revokePermissions",
//           params: [{ eth_accounts: {} }],
//         });
//       }

//       // Clear state and storage
//       setWalletState({
//         address: null,
//         connected: false,
//         walletType: null,
//       });
//       clearWalletState();
//     } catch (error) {
//       console.error("Disconnect error:", error);
//       throw error;
//     }
//   }, [walletState.walletType]);

//   return {
//     walletState,
//     connectWallet,
//     disconnectWallet,
//   };
// };
