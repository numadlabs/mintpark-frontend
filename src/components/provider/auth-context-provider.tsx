// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import {
//   generateMessageHandler,
//   loginHandler,
// } from "@/lib/service/postRequest";
// import { clearToken, saveToken } from "@/lib/auth";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useWalletStore } from "@/lib/store/walletStore";
// import moment from "moment";
// import { getLayerById } from "@/lib/service/queryHelper";

// // Add MetaMask types
// declare global {
//   interface Window {
//     unisat: any;
//     ethereum: any;
//   }
// }

// interface AuthProps {
//   authState: {
//     token: string | null;
//     authenticated: boolean;
//     loading: boolean;
//     userId: string | null;
//     address: string | null;
//     layerId: string | null;
//     walletType: "unisat" | "metamask" | null;
//     userLayerId: string | null;
//   };
//   onLogin: () => Promise<void>;
//   onLogout: () => void;
//   connect: () => Promise<void>;
//   selectedLayerId: string | null;
//   setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
// }

// interface AuthContextType extends AuthProps {
//   isConnecting: boolean;
//   walletAddress: string;
//   citreaPrice: number;
// }

// const CITREA_CHAIN_CONFIG = {
//   chainId: "0x13FB", // 5115 in hex
//   chainName: "Citrea Testnet",
//   rpcUrls: ["https://rpc.testnet.citrea.xyz"],
//   blockExplorerUrls: ["https://explorer.testnet.citrea.xyz"],
// };

// const PRICE_UPDATE_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
// const CITREA_PRICE_KEY = "CITREA_PRICE";

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: React.ReactNode;
//   connector?: any;
// }

// type LoginParams = {
//   address: string;
//   message: string;
//   walletType: "unisat" | "metamask";
// };

// const generateFallbackMessage = (address: string) => {
//   const timestamp = Date.now();
//   return `Sign this message to verify your ownership of the address ${address}. Timestamp: ${timestamp}`;
// };

// export const AuthProvider: React.FC<AuthProviderProps> = ({
//   children,
//   connector,
// }) => {
//   const router = useRouter();
//   const [isConnecting, setIsConnecting] = useState<boolean>(false);
//   const [walletAddress, setWalletAddress] = useState<string>("");
//   const [loginParams, setLoginParams] = useState<LoginParams | null>(null);
//   const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
//   const [citreaPrice, setCitreaPrice] = useState<number>(0);
//   const { setConnectedAddress, setConnected } = useWalletStore();

//   const [authState, setAuthState] = useState<AuthProps["authState"]>({
//     token: null,
//     authenticated: false,
//     loading: true,
//     userId: null,
//     address: null,
//     layerId: null,
//     walletType: null,
//     userLayerId: null,
//   });

//   const { data: currentLayer = [] } = useQuery({
//     queryKey: ["currentLayerData", selectedLayerId],
//     queryFn: () => getLayerById(selectedLayerId as string),
//     enabled: !!selectedLayerId,
//   });

//   const storePriceData = (price: number) => {
//     localStorage.setItem(CITREA_PRICE_KEY, price.toString());
//     setCitreaPrice(price);
//   };

//   useEffect(() => {
//     if (currentLayer?.layer === "CITREA") {
//       if (currentLayer.price) {
//         storePriceData(currentLayer.price);
//       } else {
//         const storedPrice = localStorage.getItem(CITREA_PRICE_KEY);
//         if (storedPrice) {
//           setCitreaPrice(parseFloat(storedPrice));
//         }
//       }
//     } else {
//       setCitreaPrice(0);
//     }
//   }, [currentLayer]);

//   const generateMessageMutation = useMutation({
//     mutationFn: generateMessageHandler,
//     onError: (error) => {
//       console.error("Generate message error:", error);
//       toast.error(
//         "Failed to generate message from server. Using fallback message.",
//       );
//     },
//   });

//   const loginMutation = useMutation({
//     mutationFn: loginHandler,
//     onError: (error) => {
//       console.error("Login error:", error);
//       toast.error("Failed to login");
//     },
//     onSuccess: (data) => {
//       if (data.success) {
//         saveToken(data.data.auth);
//         const authData = {
//           accessToken: data.data.auth.accessToken,
//           userId: data.data.user.id,
//           walletType: loginParams?.walletType,
//           userLayerId: data.data.userLayer.id,
//           layerId: selectedLayerId,
//         };
//         localStorage.setItem("authToken", JSON.stringify(authData));

//         setAuthState((prev) => ({
//           ...prev,
//           token: data.data.auth.accessToken,
//           authenticated: true,
//           userId: data.data.user.id,
//           address: data.data.user.address,
//           layerId: selectedLayerId,
//           walletType: loginParams?.walletType || null,
//           userLayerId: data.data.userLayer.id,
//         }));
//         if (selectedLayerId) {
//           localStorage.setItem("layerId", selectedLayerId);
//         }
//         toast.success("Successfully logged in");
//       }
//     },
//   });

//   const handleLogout = async () => {
//     try {
//       const currentLayerId = authState.layerId;

//       // Clear all wallet-related state
//       setConnectedAddress("");
//       setConnected(false);
//       setWalletAddress("");

//       // Clear auth state
//       setAuthState({
//         token: null,
//         authenticated: false,
//         loading: false,
//         userId: null,
//         address: null,
//         layerId: currentLayerId, // Preserve layerId
//         walletType: null,
//         userLayerId: null,
//       });

//       if (currentLayerId) {
//         localStorage.setItem("layerId", currentLayerId);
//       }

//       // Clear tokens
//       clearToken();

//       window.location.reload();
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Error during logout process");
//     }
//   };

//   const disconnectMetaMask = async () => {
//     if (window.ethereum) {
//       try {
//         // Clear the ethereum permissions
//         const permissions = await window.ethereum.request({
//           method: "wallet_requestPermissions",
//           params: [
//             {
//               eth_accounts: {},
//             },
//           ],
//         });

//         // After getting permissions, request to disconnect
//         await window.ethereum.request({
//           method: "wallet_revokePermissions",
//           params: [
//             {
//               eth_accounts: {},
//             },
//           ],
//         });
//       } catch (error) {
//         console.error("Error disconnecting from MetaMask:", error);
//       }
//     }
//   };

//   const setupMetaMaskListeners = () => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", (accounts: string[]) => {
//         const storedProfile = localStorage.getItem("userProfile");
//         if (storedProfile) {
//           const profileData = JSON.parse(storedProfile);
//           if (
//             accounts.length === 0 ||
//             accounts[0].toLowerCase() !== profileData.address.toLowerCase()
//           ) {
//             handleLogout();
//           }
//         }
//       });

//       window.ethereum.on("chainChanged", () => {
//         window.location.reload();
//       });
//     }
//   };

//   const setupUnisatListeners = () => {
//     if (window.unisat) {
//       window.unisat.on("accountsChanged", (accounts: string[]) => {
//         const storedProfile = localStorage.getItem("userProfile");
//         if (storedProfile) {
//           const profileData = JSON.parse(storedProfile);
//           if (accounts.length === 0 || accounts[0] !== profileData.address) {
//             handleLogout();
//           }
//         }
//       });
//     }
//   };

//   const connectMetaMask = async () => {
//     if (!window.ethereum) {
//       toast.error("MetaMask not found. Please install MetaMask.");
//       throw new Error("MetaMask not found");
//     }

//     try {
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       try {
//         await window.ethereum.request({
//           method: "wallet_addEthereumChain",
//           params: [CITREA_CHAIN_CONFIG],
//         });
//       } catch (error) {
//         console.log("Chain may already be added or user rejected");
//       }

//       try {
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: CITREA_CHAIN_CONFIG.chainId }],
//         });
//       } catch (error) {
//         console.error("Failed to switch network:", error);
//         toast.error("Please switch to Citrea Testnet network");
//         throw error;
//       }

//       if (accounts && accounts.length > 0) {
//         const address = accounts[0];
//         let message: string;

//         try {
//           const messageData = await generateMessageMutation.mutateAsync({
//             address,
//           });
//           message = messageData.data.message;
//         } catch (error) {
//           message = generateFallbackMessage(address);
//         }

//         return { address, message };
//       }
//     } catch (error) {
//       console.error("MetaMask connection error:", error);
//       toast.error("Failed to connect to MetaMask");
//       throw error;
//     }
//   };

//   const connectUnisat = async () => {
//     if (!window.unisat) {
//       toast.error("Unisat wallet not found. Please install Unisat.");
//       throw new Error("Unisat wallet not found");
//     }

//     try {
//       const accounts = await window.unisat.requestAccounts();

//       if (accounts && accounts.length > 0) {
//         const address = accounts[0];
//         let message: string;

//         try {
//           const messageData = await generateMessageMutation.mutateAsync({
//             address,
//           });
//           message = messageData.data.message;
//         } catch (error) {
//           message = generateFallbackMessage(address);
//         }

//         return { address, message };
//       }
//     } catch (error) {
//       console.error("Unisat connection error:", error);
//       toast.error("Failed to connect to Unisat");
//       throw error;
//     }
//   };

//   const connect = async () => {
//     try {
//       setIsConnecting(true);

//       if (!currentLayer) {
//         toast.error("Please select a layer first");
//         return;
//       }

//       const layerType = currentLayer.layer;
//       let connectionResult;
//       let walletType: "unisat" | "metamask";

//       if (layerType === "BITCOIN") {
//         connectionResult = await connectUnisat();
//         walletType = "unisat";
//       } else if (layerType === "CITREA") {
//         connectionResult = await connectMetaMask();
//         walletType = "metamask";
//       } else {
//         throw new Error("Unsupported layer type");
//       }

//       if (connectionResult) {
//         setLoginParams({
//           address: connectionResult.address,
//           message: connectionResult.message,
//           walletType,
//         });
//       }
//     } catch (error) {
//       console.error("Connection error:", error);
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   const handleLogin = async () => {
//     if (!loginParams || !selectedLayerId) {
//       toast.error("Please select a layer before logging in");
//       return;
//     }

//     const { address, message, walletType } = loginParams;

//     try {
//       let signedMessage: string;
//       let pubkey: string | undefined;

//       if (walletType === "unisat") {
//         signedMessage = await window.unisat.signMessage(message);
//         pubkey = await window.unisat.getPublicKey();
//       } else {
//         signedMessage = await window.ethereum.request({
//           method: "personal_sign",
//           params: [message, address],
//         });
//       }

//       if (signedMessage) {
//         const loginResponse = await loginMutation.mutateAsync({
//           address,
//           signedMessage,
//           layerId: selectedLayerId,
//           pubkey,
//         });

//         if (loginResponse.success) {
//           setWalletAddress(address);
//           const item = {
//             address,
//             signature: signedMessage,
//             expiry: moment().add(7, "days").format(),
//             walletType,
//           };
//           setConnectedAddress(address);
//           setConnected(true);
//           localStorage.setItem("userProfile", JSON.stringify(item));
//         } else {
//           throw new Error("Login failed");
//         }
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error("Error during login process");
//     } finally {
//       setLoginParams(null);
//     }
//   };

//   // Modified connectWalletOnLoad
//   const connectWalletOnLoad = async () => {
//     try {
//       const storedAuth = localStorage.getItem("authToken");
//       const userProfile = localStorage.getItem("userProfile");
//       const storedLayerId = localStorage.getItem("layerId");
//       // console.log("storedLayerId",storedLayerId)
//       // console.log("here is debug",storedLayerId ||selectedLayerId || null)

//       if (storedAuth && userProfile) {
//         const authData = JSON.parse(storedAuth);
//         const profileData = JSON.parse(userProfile);

//         if (moment().isAfter(moment(profileData.expiry))) {
//           handleLogout();
//           return;
//         }

//         // Verify correct wallet is connected
//         if (profileData.walletType === "unisat" && window.unisat) {
//           const accounts = await window.unisat.getAccounts();
//           if (!accounts.includes(profileData.address)) {
//             handleLogout();
//             return;
//           }
//         } else if (profileData.walletType === "metamask" && window.ethereum) {
//           const accounts = await window.ethereum.request({
//             method: "eth_accounts",
//           });
//           if (!accounts.includes(profileData.address.toLowerCase())) {
//             handleLogout();
//             return;
//           }
//         }

//         setWalletAddress(profileData.address);
//         setAuthState({
//           token: authData.accessToken,
//           authenticated: true,
//           loading: false,
//           userId: authData.userId,
//           address: profileData.address,
//           layerId: storedLayerId || authData.layerId || null,
//           walletType: profileData.walletType,
//           userLayerId: authData.userLayerId,
//         });
//         setConnectedAddress(profileData.address);
//         setConnected(true);
//       } else {
//         setAuthState((prev) => ({
//           ...prev,
//           loading: false,
//           layerId: storedLayerId || selectedLayerId || null,
//         }));
//         if (storedLayerId) {
//           setSelectedLayerId(storedLayerId);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading wallet:", error);
//       setAuthState((prev) => ({ ...prev, loading: false }));
//     }
//   };

//   useEffect(() => {
//     setupMetaMaskListeners();
//     setupUnisatListeners();
//     connectWalletOnLoad();
//   }, [selectedLayerId]);

//   useEffect(() => {
//     if (loginParams) {
//       handleLogin();
//     }
//   }, [loginParams]);

//   return (
//     <AuthContext.Provider
//       value={{
//         authState,
//         onLogin: handleLogin,
//         onLogout: handleLogout,
//         connect,
//         isConnecting,
//         walletAddress,
//         selectedLayerId,
//         setSelectedLayerId,
//         citreaPrice,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import React, { createContext, useContext, useEffect } from "react";
import useWalletStore, {
  ConnectedWallet,
  Wallet,
  WalletStore,
} from "@/lib/hooks/useWalletAuth";
import { AuthState, AuthTokens, Layer } from "@/types";
import { initializeAxios } from "@/lib/axios";

const WalletAuthContext = createContext<WalletStore | null>(null);

export const WalletAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = useWalletStore();

  useEffect(() => {
    initializeAxios(store.onLogout);
  }, []);

  const value: WalletStore = {
    authState: store.authState,
    selectedLayerId: store.selectedLayerId,
    setSelectedLayerId: store.setSelectedLayerId,
    //todo layers iig store context dotroos ashiglah. API req 1 l udaa yvuulj hadgalj avna
    layers: store.layers,
    // connectPrimary: store.connectPrimary,
    // connectSecondary: store.connectSecondary,
    // switchWallets: store.switchWallets,
    onLogout: store.onLogout,
    setLayers: store.setLayers,

    connectedWallets: store.connectedWallets,
    connectWallet: store.connectWallet,
    disconnectWallet: store.disconnectWallet,
    isWalletConnected: store.isWalletConnected,
    getWalletForLayer: store.getWalletForLayer,
    getAddressforCurrentLayer: store.getAddressforCurrentLayer,
    proceedWithLinking: store.proceedWithLinking,
  };

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error("useWalletAuth must be used within a WalletAuthProvider");
  }
  return context;
};
