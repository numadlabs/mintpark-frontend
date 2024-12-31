import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";
import { connectMetamask, connectUnisat } from "../wallet";
import { AuthState, AuthTokens, Layer, WalletInfo } from "@/types";
import {
  generateMessageHandler,
  linkAccountToAnotherUser,
  loginHandler,
  loginWalletLink,
} from "../service/postRequest";
import { saveToken } from "../auth";
import { STORAGE_KEYS, WALLET_CONFIGS } from "../constants";

// Define the wallet types
type WalletType = "EVM" | "BITCOIN" | null;

export interface Wallet {
  address: string | null;
  type: WalletType;
  layerId: string | null;
}

export interface WalletState {
  primaryWallet: Wallet;
  secondaryWallet: Wallet;
}
export interface ConnectedWallet {
  address: string;
  layerId: string;
  layerType: string;
  network: string;
}

export interface WalletStore {
  connectedWallets: ConnectedWallet[];
  authState: AuthState;
  layers: Layer[];
  selectedLayerId: string | null;

  // Actions
  setSelectedLayerId: (id: string) => void;

  connectWallet: (layerId: string, isLinking?: boolean) => Promise<void>;
  disconnectWallet: (layerId: string) => Promise<void>;
  isWalletConnected: (layerId: string) => boolean;
  getWalletForLayer: (layerId: string) => ConnectedWallet | undefined;

  setLayers: (layers: Layer[]) => void;
  proceedWithLinking: () => void;
  getAddressforCurrentLayer: () => ConnectedWallet | undefined;
  onLogout: () => void;
}

const initialWalletInfo: WalletInfo = {
  address: null,
  type: null,
  layerId: null,
};

const initialAuthState: AuthState = {
  authenticated: false,
  loading: false,
  userLayerId: null,
  layerId: null,
  userId: null,
  // primaryWallet: initialWalletInfo,
  // secondaryWallet: initialWalletInfo,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

const loadInitialState = () => {
  try {
    const storedTokens = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    console.log("🚀 ~ loadInitialState ~ storedTokens:", storedTokens);
    const storedState = localStorage.getItem(STORAGE_KEYS.WALLET_STATE);

    if (!storedTokens || !storedState) {
      return initialAuthState;
    }

    const tokens = JSON.parse(storedTokens);
    const state = JSON.parse(storedState);

    // Validate stored state structure
    if (!tokens.accessToken || !tokens.refreshToken) {
      return initialAuthState;
    }

    return {
      ...state.state.authState,
      tokens,
      authenticated: true,
    };
  } catch (error) {
    console.error("Error loading auth state:", error);
    return initialAuthState;
  }
};
const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      connectedWallets: [],
      authState: loadInitialState(),
      layers: [],
      selectedLayerId: null,

      setLayers: (layers: Layer[]) => {
        set({ layers });
      },

      setSelectedLayerId: (id: string) => {
        set({ selectedLayerId: id });
      },
      // setTokens: (tokens) => {
      //   set((state) => ({
      //     authState: {
      //       ...state.authState,
      //       tokens: {
      //         accessToken: tokens.accessToken,
      //         refreshToken: tokens.refreshToken,
      //       },
      //     },
      //   }));
      //   localStorage.setItem("auth_tokens", JSON.stringify(tokens));
      // },

      // clearTokens: () => {
      //   set((state) => ({
      //     authState: {
      //       ...state.authState,
      //       tokens: {
      //         accessToken: null,
      //         refreshToken: null,
      //       },
      //     },
      //   }));
      //   localStorage.removeItem("auth_tokens");
      // },

      connectWallet: async (layerId: string, isLinking: boolean = false) => {
        const { layers, connectedWallets, authState } = get();

        const layer = layers.find((l) => l.id === layerId);
        if (!layer) throw new Error("Layer not found");

        const walletConfig = WALLET_CONFIGS[layer.layer];
        if (!walletConfig) throw new Error("Wallet configuration not found");

        set((state) => ({ authState: { ...state.authState, loading: true } }));

        try {
          let address: string;
          let signedMessage: string;
          let pubkey: string | undefined;

          // Connect based on wallet type
          if (walletConfig.type === "metamask") {
            address = await connectMetamask(walletConfig.chainId);
            const msgResponse = await generateMessageHandler({ address });
            signedMessage = await window.ethereum.request({
              method: "personal_sign",
              params: [msgResponse.data.message, address],
            });
          } else if (walletConfig.type === "unisat") {
            address = await connectUnisat();
            const msgResponse = await generateMessageHandler({ address });
            signedMessage = await window.unisat.signMessage(
              msgResponse.data.message,
            );
            pubkey = await window.unisat.getPublicKey();
          } else {
            throw new Error("Unsupported wallet type");
          }

          let response;
          if (isLinking && authState.authenticated) {
            // Link wallet to existing account
            response = await loginWalletLink({
              address,
              layerId,
              signedMessage,
              pubkey,
            });

            // If wallet is already linked, throw specific error
            if (response.data.hasAlreadyBeenLinkedToAnotherUser) {
              set((state) => ({
                authState: { ...state.authState, loading: false },
              }));
              // Store the connection info for later use if user confirms
              localStorage.setItem(
                "pendingWalletLink",
                JSON.stringify({
                  address,
                  layerId,
                  signedMessage,
                }),
              );
              throw new Error("WALLET_ALREADY_LINKED");
            }
          } else {
            // Regular login/wallet connection
            response = await loginHandler({
              address,
              layerId,
              signedMessage,
              pubkey,
            });
            saveToken(response.data.auth);
          }
          if (!response.success) {
            throw new Error(`Authentication failed ${response.error}`);
          }

          // Add to connected wallets
          const newWallet: ConnectedWallet = {
            address,
            layerId,
            layerType: layer.layer,
            network: layer.network,
          };

          set((state) => ({
            connectedWallets: [...state.connectedWallets, newWallet],
            authState: {
              ...state.authState,
              authenticated: true,
              userLayerId: response.data.userLayer.id,
              userId: response.data.user.id,
              //todo current layer id yahu
              layerId,
              tokens: response.data.tokens,
              loading: false,
            },
          }));
        } catch (error) {
          set((state) => ({
            authState: { ...state.authState, loading: false },
          }));
          console.error("Wallet connection failed:", error);
          throw error;
        }
      },

      proceedWithLinking: async () => {
        set((state) => ({ authState: { ...state.authState, loading: true } }));

        try {
          const pendingLinkStr = localStorage.getItem("pendingWalletLink");
          if (!pendingLinkStr) {
            throw new Error("No pending wallet link found");
          }

          const pendingLink = JSON.parse(pendingLinkStr);
          const { address, layerId, signedMessage } = pendingLink;

          // Call the API to link the wallet to the current account
          const response = await linkAccountToAnotherUser({
            address,
            layerId,
            signedMessage,
          });

          if (!response.success) {
            throw new Error("Failed to link wallet to account");
          }

          // Find the layer details
          const layer = get().layers.find((l) => l.id === layerId);
          if (!layer) {
            throw new Error("Layer not found");
          }

          // Add to connected wallets
          const newWallet: ConnectedWallet = {
            address,
            layerId,
            layerType: layer.layer,
            network: layer.network,
          };

          set((state) => ({
            connectedWallets: [...state.connectedWallets, newWallet],
            authState: {
              ...state.authState,
              loading: false,
            },
          }));

          // Clean up the pending link data
          localStorage.removeItem("pendingWalletLink");

          return response.data;
        } catch (error) {
          set((state) => ({
            authState: { ...state.authState, loading: false },
          }));
          console.error("Failed to proceed with linking:", error);
          throw error;
        }
      },

      disconnectWallet: async (layerId: string) => {
        const { connectedWallets } = get();

        set((state) => ({
          connectedWallets: state.connectedWallets.filter(
            (w) => w.layerId !== layerId,
          ),
        }));

        // If no wallets left, logout
        if (get().connectedWallets.length === 0) {
          get().onLogout();
        }
      },

      isWalletConnected: (layerId: string) => {
        const { connectedWallets } = get();
        return connectedWallets.some((w) => w.layerId === layerId);
      },

      getWalletForLayer: (layerId: string) => {
        const { connectedWallets } = get();
        return connectedWallets.find((w) => w.layerId === layerId);
      },
      getAddressforCurrentLayer: () => {
        const { selectedLayerId, connectedWallets } = get();
        if (!selectedLayerId) throw new Error("No layer selected");
        const layer = get().layers.find((l) => l.id === selectedLayerId);
        if (!layer) throw new Error("Layer not found");

        return connectedWallets.find((w) => w.layerId === layer.id);
      },

      // connectPrimary: async () => {
      //   const { selectedLayerId } = get();
      //   if (!selectedLayerId) throw new Error("No layer selected");

      //   set((state) => ({
      //     authState: { ...state.authState, loading: true },
      //   }));

      //   try {
      //     const layer = get().layers.find((l) => {
      //       return l.id === selectedLayerId;
      //     });
      //     console.log("🚀 ~ connectPrimary: ~ layer:", layer);
      //     if (!layer) throw new Error("Layer not found");

      //     let address: string;
      //     let message: string;
      //     let pubkey: string | undefined;
      //     if (layer.layer === "CITREA") {
      //       address = await connectMetamask(layer.chainId);
      //     } else if (layer.layer === "BITCOIN") {
      //       address = await connectUnisat();
      //     } else {
      //       throw new Error("Unsupported layer type");
      //     }

      //     const msgResponse = await generateMessageHandler({ address });
      //     message = msgResponse.data.message;
      //     let signedMessage = await window.ethereum.request({
      //       method: "personal_sign",
      //       params: [message, address],
      //     });

      //     const response = await loginHandler({
      //       address: address,
      //       layerId: selectedLayerId,
      //       signedMessage,
      //       pubkey,
      //     });
      //     console.log("login res", response);
      //     saveToken(response.data.auth);

      //     set((state) => ({
      //       authState: {
      //         ...state.authState,
      //         authenticated: true,
      //         layerId: layer.id,
      //         userLayerId: response.data.userLayer.id,
      //         userId: response.data.user.id,
      //         primaryWallet: {
      //           address,
      //           type: layer.type,
      //           layerId: selectedLayerId,
      //         },
      //         tokens: response.data.tokens,
      //         loading: false,
      //       },
      //     }));
      //   } catch (error) {
      //     set((state) => ({
      //       authState: { ...state.authState, loading: false },
      //     }));
      //     console.error("Primary wallet connection failed:", error);
      //     throw error;
      //   }
      // },

      // connectSecondary: async () => {
      //   const { selectedLayerId, authState } = get();
      //   if (!selectedLayerId) throw new Error("No layer selected");
      //   if (!authState.tokens.accessToken)
      //     throw new Error("No access token found");

      //   set((state) => ({
      //     authState: { ...state.authState, loading: true },
      //   }));

      //   try {
      //     const layer = get().layers.find((l) => l.id === selectedLayerId);
      //     if (!layer) throw new Error("Layer not found");

      //     let address: string;
      //     if (layer.type === "EVM") {
      //       address = await connectMetamask(layer.chainId);
      //     } else if (layer.type === "BITCOIN") {
      //       address = await connectUnisat();
      //     } else {
      //       throw new Error("Unsupported layer type");
      //     }

      //     const response = await axios.post(
      //       "/api/auth/connect-secondary",
      //       {
      //         address,
      //         layerId: selectedLayerId,
      //       },
      //       {
      //         headers: {
      //           Authorization: `Bearer ${authState.tokens.accessToken}`,
      //         },
      //       },
      //     );

      //     set((state) => ({
      //       authState: {
      //         ...state.authState,
      //         secondaryWallet: {
      //           address,
      //           type: layer.type,
      //           layerId: selectedLayerId,
      //         },
      //         loading: false,
      //       },
      //     }));
      //   } catch (error) {
      //     set((state) => ({
      //       authState: { ...state.authState, loading: false },
      //     }));
      //     console.error("Secondary wallet connection failed:", error);
      //     throw error;
      //   }
      // },
      // switchWallets: async () => {
      //   const { authState } = get();
      //   if (!authState.secondaryWallet.address) {
      //     throw new Error("No secondary wallet to switch with");
      //   }

      //   set((state) => ({
      //     authState: { ...state.authState, loading: true },
      //   }));

      //   try {
      //     const response = await axios.post(
      //       "/api/auth/switch-wallets",
      //       {
      //         primaryAddress: authState.secondaryWallet.address,
      //         primaryLayerId: authState.secondaryWallet.layerId,
      //         secondaryAddress: authState.primaryWallet.address,
      //         secondaryLayerId: authState.primaryWallet.layerId,
      //       },
      //       {
      //         headers: {
      //           Authorization: `Bearer ${authState.tokens.accessToken}`,
      //         },
      //       },
      //     );

      //     set((state) => ({
      //       authState: {
      //         ...state.authState,
      //         primaryWallet: state.authState.secondaryWallet,
      //         secondaryWallet: state.authState.primaryWallet,
      //         tokens: response.data.tokens,
      //         loading: false,
      //       },
      //     }));
      //   } catch (error) {
      //     set((state) => ({
      //       authState: { ...state.authState, loading: false },
      //     }));
      //     console.error("Wallet switch failed:", error);
      //     throw error;
      //   }
      // },

      onLogout: () => {
        set({
          connectedWallets: [],
          authState: initialAuthState,
        });
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.WALLET_STATE);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      },
    }),
    {
      name: "wallet-storage",
    },
  ),
);

export default useWalletStore;
