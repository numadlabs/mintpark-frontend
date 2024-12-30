// import { useCallback, useState } from "react";
// import { getAccessToken } from "../auth";
// import { WALLET_CONFIGS } from "../constants";
// import { Layer } from "@/types";

// // hooks/useAuth.ts
// export const useAuth = () => {
//   const [authState, setAuthState] = useState({
//     token: null,
//     authenticated: false,
//     loading: true,
//     userId: null,
//     addresses: [], // Store multiple addresses
//     layerIds: [], // Store multiple layer IDs
//     walletTypes: [], // Store wallet types for each connection
//   });

//   const checkTokenExpiry = useCallback(() => {
//     const token = getAccessToken();
//     if (token) {
//       try {
//         const decodedToken = jwt_decode(token);
//         const currentTime = Date.now() / 1000;

//         if (decodedToken.exp < currentTime) {
//           handleLogout();
//           toast.error("Session expired. Please login again.");
//           return false;
//         }
//         return true;
//       } catch (error) {
//         handleLogout();
//         return false;
//       }
//     }
//     return false;
//   }, []);

//   const connectWallet = async (layer: Layer) => {
//     try {
//       const config = WALLET_CONFIGS[layer.layer];
//       if (!config) throw new Error("Unsupported layer");

//       let address: string;
//       let signature: string;
//       let pubkey: string | undefined;

//       // Connect wallet based on type
//       if (config.type === "unisat") {
//         ({ address, signature, pubkey } = await connectUnisatWallet());
//       } else if (config.type === "metamask") {
//         ({ address, signature } = await connectMetaMaskWallet(layer));
//       }

//       // If user is already authenticated, add new wallet
//       if (authState.authenticated) {
//         const response = await addWalletToUser({
//           address,
//           signedMessage: signature,
//           layerId: layer.id,
//           pubkey,
//         });

//         if (response.data.success) {
//           setAuthState((prev) => ({
//             ...prev,
//             addresses: [...prev.addresses, address],
//             layerIds: [...prev.layerIds, layer.id],
//             walletTypes: [...prev.walletTypes, config.type],
//           }));

//           // Update localStorage
//           const currentProfile = JSON.parse(
//             localStorage.getItem("userProfile") || "{}",
//           );
//           const updatedProfile = {
//             ...currentProfile,
//             addresses: [...(currentProfile.addresses || []), address],
//             walletTypes: [...(currentProfile.walletTypes || []), config.type],
//           };
//           localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

//           toast.success("Additional wallet connected successfully");
//         }
//       } else {
//         // First time login
//         const loginResponse = await loginHandler({
//           address,
//           signedMessage: signature,
//           layerId: layer.id,
//           pubkey,
//         });

//         if (loginResponse.success) {
//           const { auth, user, userLayer } = loginResponse.data;

//           saveToken(auth);
//           setAuthState({
//             token: auth.accessToken,
//             authenticated: true,
//             loading: false,
//             userId: user.id,
//             addresses: [address],
//             layerIds: [layer.id],
//             walletTypes: [config.type],
//           });

//           localStorage.setItem(
//             "userProfile",
//             JSON.stringify({
//               addresses: [address],
//               walletTypes: [config.type],
//               expiry: moment().add(7, "days").valueOf(),
//             }),
//           );

//           toast.success("Wallet connected successfully");
//         }
//       }
//     } catch (error) {
//       console.error("Wallet connection error:", error);
//       toast.error(error.message || "Failed to connect wallet");
//       throw error;
//     }
//   };

//   useEffect(() => {
//     const initializeAuth = async () => {
//       const isValid = checkTokenExpiry();
//       if (!isValid) return;

//       const storedProfile = localStorage.getItem("userProfile");
//       if (storedProfile) {
//         const profile = JSON.parse(storedProfile);
//         if (moment().isAfter(moment(profile.expiry))) {
//           handleLogout();
//           return;
//         }

//         // Verify all connected wallets
//         try {
//           for (let i = 0; i < profile.addresses.length; i++) {
//             const address = profile.addresses[i];
//             const walletType = profile.walletTypes[i];

//             if (walletType === "unisat" && window.unisat) {
//               const accounts = await window.unisat.getAccounts();
//               if (!accounts.includes(address)) {
//                 handleLogout();
//                 return;
//               }
//             } else if (walletType === "metamask" && window.ethereum) {
//               const accounts = await window.ethereum.request({
//                 method: "eth_accounts",
//               });
//               if (!accounts.includes(address.toLowerCase())) {
//                 handleLogout();
//                 return;
//               }
//             }
//           }

//           // All verifications passed, restore state
//           setAuthState((prev) => ({
//             ...prev,
//             addresses: profile.addresses,
//             walletTypes: profile.walletTypes,
//             authenticated: true,
//             loading: false,
//           }));
//         } catch (error) {
//           handleLogout();
//         }
//       }
//     };

//     initializeAuth();
//   }, []);

//   return {
//     authState,
//     connectWallet,
//     disconnectWallet,
//     checkTokenExpiry,
//   };
// };
