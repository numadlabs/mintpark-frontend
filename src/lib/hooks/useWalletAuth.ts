// ==================== 3. lib/hooks/useWalletAuth.ts (Updated) ====================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, Layer, WalletInfo } from "@/lib/types";
import {
  generateMessageHandler,
  linkAccountToAnotherUser,
  loginHandler,
  loginWalletLink,
} from "../service/postRequest";
import { saveToken } from "../auth";
import { STORAGE_KEYS, WALLET_CONFIGS } from "../constants";
import { toast } from "sonner";
import { connectUnisat } from "../wallet";

type WalletType = "EVM" | "BITCOIN" | null;

export interface Wallet {
  address: string | null;
  type: WalletType;
  layerId: string | null;
}

export interface ConnectedWallet {
  address: string;
  layerId: string;
  layer: string;
  layerType: string;
  network: string; 
  userLayerId: string;
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
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

const getStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return null;
  }
};

const setStorageItem = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
  }
};

const loadInitialState = () => {
  try {
    if (typeof window === "undefined") {
      return initialAuthState;
    }

    const storedTokens = getStorageItem(STORAGE_KEYS.AUTH_TOKENS);
    const storedState = getStorageItem(STORAGE_KEYS.WALLET_STATE);

    if (!storedTokens || !storedState) {
      return initialAuthState;
    }

    if (!storedTokens.accessToken || !storedTokens.refreshToken) {
      return initialAuthState;
    }

    return {
      ...storedState.state.authState,
      tokens: storedTokens,
      authenticated: true,
    };
  } catch (error) {
    console.error("Error loading auth state:", error);
    return initialAuthState;
  }
};

export interface WalletStore {
  connectedWallets: ConnectedWallet[];
  authState: AuthState;
  layers: Layer[];
  selectedLayerId: string | null;
  pendingConnection: {
    layerId: string | null;
    isLinking: boolean;
  };
  setSelectedLayerId: (id: string) => void;
  updateAuthStateForLayer: (layerId: string) => void;
  connectWallet: (layerId: string, isLinking?: boolean) => Promise<void>;
  disconnectWallet: (layerId: string) => Promise<void>;
  isWalletConnected: (layerId: string) => boolean;
  getWalletForLayer: (layerId: string) => ConnectedWallet | undefined;
  setLayers: (layers: Layer[]) => void;
  proceedWithLinking: () => Promise<any>;
  getAddressforCurrentLayer: () => ConnectedWallet | undefined;
  onLogout: () => void;
  setPendingConnection: (layerId: string | null, isLinking: boolean) => void;
  clearPendingConnection: () => void;
  completeEvmWalletConnection: (
    address: string,
    signedMessage: string,
    layerId: string,
    isLinking?: boolean
  ) => Promise<void>;
}

const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      connectedWallets: [],
      authState: loadInitialState(),
      layers: [],
      selectedLayerId: null,
      pendingConnection: {
        layerId: null,
        isLinking: false,
      },

      setLayers: (layers: Layer[]) => {
        set({ layers });
      },

      setSelectedLayerId: (id: string) => {
        set({ selectedLayerId: id });
        get().updateAuthStateForLayer(id);
      },

      setPendingConnection: (layerId: string | null, isLinking: boolean) => {
        set({ pendingConnection: { layerId, isLinking } });
      },

      clearPendingConnection: () => {
        set({ pendingConnection: { layerId: null, isLinking: false } });
      },

      updateAuthStateForLayer: (layerId: string) => {
        const { connectedWallets, authState } = get();
        const wallet = connectedWallets.find((w) => w.layerId === layerId);

        if (wallet) {
          set((state) => ({
            authState: {
              ...state.authState,
              layerId: layerId,
              authenticated: state.authState.authenticated,
              userId: state.authState.userId,
              tokens: state.authState.tokens,
              userLayerId: wallet.userLayerId,
            },
          }));
        } else {
          set((state) => ({
            authState: {
              ...state.authState,
              layerId: layerId,
            },
          }));
        }
      },

      connectWallet: async (layerId: string, isLinking: boolean = false) => {
        const { layers, connectedWallets, authState } = get();
        const layer = layers.find((l) => l.id === layerId);
        if (!layer) throw new Error("Layer not found");

        const walletConfig = WALLET_CONFIGS[layer.layer];

        set((state) => ({ authState: { ...state.authState, loading: true } }));

        try {
          let address: string;
          let signedMessage: string;
          let pubkey: string | undefined;

          if (walletConfig.type === "metamask") {
            // For EVM wallets, the actual signing will be handled by wagmi hooks
            // This method just sets up the pending connection
            set({ pendingConnection: { layerId, isLinking } });
            
            // The actual connection will be completed by the wagmi hooks
            // Return early here as the hooks will handle the rest
            set((state) => ({ authState: { ...state.authState, loading: false } }));
            return;
          } else if (walletConfig.type === "unisat") {
            if (!window?.unisat)
              throw new Error("Unisat wallet is not installed");

            // Connect to Unisat wallet
            address = await connectUnisat();
            if (!address) throw new Error("Failed to connect to Unisat wallet");

            // Get message to sign
            const msgResponse = await generateMessageHandler({ address });
            if (!msgResponse.success)
              throw new Error("Failed to generate message");

            // Sign message with Unisat
            signedMessage = await window.unisat.signMessage(
              msgResponse.data.message,
            );
            pubkey = await window.unisat.getPublicKey();

            let response;
            if (isLinking && authState.authenticated) {
              response = await loginWalletLink({
                address,
                layerId,
                signedMessage,
                pubkey,
              });

              if (response.data.hasAlreadyBeenLinkedToAnotherUser) {
                set((state) => ({
                  authState: { ...state.authState, loading: false },
                }));

                setStorageItem("pendingWalletLink", {
                  address,
                  layerId,
                  signedMessage,
                  pubkey,
                });

                throw new Error("WALLET_ALREADY_LINKED");
              }
            } else {
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

            const newWallet: ConnectedWallet = {
              address,
              layerId,
              layerType: layer.layer,
              layer: layer.layer,
              network: layer.network,
              userLayerId: response.data.userLayer.id,
            };

            set((state) => ({
              connectedWallets: [...state.connectedWallets, newWallet],
              authState: {
                ...state.authState,
                authenticated: true,
                userLayerId: response.data.userLayer.id,
                userId: response.data.user.id,
                layerId,
                tokens: response.data.tokens,
                loading: false,
              },
            }));
          } else {
            throw new Error("Unsupported wallet type");
          }
        } catch (error: any) {
          set((state) => ({
            authState: { ...state.authState, loading: false },
          }));
          console.error("Wallet connection failed:", error);
          toast.error(error.message);
          throw error;
        }
      },

      // Method to complete EVM wallet connection after wagmi hooks
      completeEvmWalletConnection: async (
        address: string,
        signedMessage: string,
        layerId: string,
        isLinking: boolean = false
      ) => {
        const { layers, authState } = get();
        const layer = layers.find((l) => l.id === layerId);
        if (!layer) throw new Error("Layer not found");

        set((state) => ({ authState: { ...state.authState, loading: true } }));

        try {
          let response;
          if (isLinking && authState.authenticated) {
            response = await loginWalletLink({
              address,
              layerId,
              signedMessage,
            });

            if (response.data.hasAlreadyBeenLinkedToAnotherUser) {
              set((state) => ({
                authState: { ...state.authState, loading: false },
              }));

              setStorageItem("pendingWalletLink", {
                address,
                layerId,
                signedMessage,
              });

              throw new Error("WALLET_ALREADY_LINKED");
            }
          } else {
            response = await loginHandler({
              address,
              layerId,
              signedMessage,
            });
            saveToken(response.data.auth);
          }

          if (!response.success) {
            throw new Error(`Authentication failed ${response.error}`);
          }

          const newWallet: ConnectedWallet = {
            address,
            layerId,
            layerType: layer.layerType,
            layer: layer.layer,
            network: layer.network,
            userLayerId: response.data.userLayer.id,
          };

          set((state) => ({
            connectedWallets: [...state.connectedWallets, newWallet],
            authState: {
              ...state.authState,
              authenticated: true,
              userLayerId: response.data.userLayer.id,
              userId: response.data.user.id,
              layerId,
              tokens: response.data.tokens,
              loading: false,
            },
          }));

          // Clear pending connection
          get().clearPendingConnection();
        } catch (error: any) {
          set((state) => ({
            authState: { ...state.authState, loading: false },
          }));
          get().clearPendingConnection();
          throw error;
        }
      },

      proceedWithLinking: async () => {
        set((state) => ({ authState: { ...state.authState, loading: true } }));

        try {
          const pendingLink = getStorageItem("pendingWalletLink");
          if (!pendingLink) {
            throw new Error("No pending wallet link found");
          }

          const { address, layerId, signedMessage } = pendingLink;

          const response = await linkAccountToAnotherUser({
            address,
            layerId,
            signedMessage,
          });

          if (!response.success) {
            throw new Error("Failed to link wallet to account");
          }

          const layer = get().layers.find((l) => l.id === layerId);
          if (!layer) {
            throw new Error("Layer not found");
          }

          const newWallet: ConnectedWallet = {
            address,
            layerId,
            layerType: layer.layerType,
            layer: layer.layer,
            network: layer.network,
            userLayerId: response.data.userLayer.id,
          };

          set((state) => ({
            connectedWallets: [...state.connectedWallets, newWallet],
            authState: {
              ...state.authState,
              authenticated: true,
              userLayerId: response.data.userLayer.id,
              userId: response.data.user.id,
              layerId,
              tokens: response.data.tokens,
              loading: false,
            },
          }));

          if (typeof window !== "undefined") {
            localStorage.removeItem("pendingWalletLink");
          }

          return response.data;
        } catch (error: any) {
          set((state) => ({
            authState: { ...state.authState, loading: false },
          }));
          toast.error(error.message);
          throw error;
        }
      },

      disconnectWallet: async (layerId: string) => {
        set((state) => ({
          connectedWallets: state.connectedWallets.filter(
            (w) => w.layerId !== layerId,
          ),
        }));

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
        if (!selectedLayerId) return undefined;
        return connectedWallets.find((w) => w.layerId === selectedLayerId);
      },

      onLogout: () => {
        if (typeof window === "undefined") return;

        // Clear all wallet connections
        set({
          connectedWallets: [],
          authState: initialAuthState,
          selectedLayerId: null,
        });

        // Clear localStorage entries
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.WALLET_STATE);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      },
    }),
    {
      name: "wallet-storage",
      skipHydration: typeof window === "undefined",
      partialize: (state) => ({
        connectedWallets: state.connectedWallets,
        authState: state.authState,
        selectedLayerId: state.selectedLayerId,
      }),
    },
  ),
);

// Add type declaration for window
declare global {
  interface Window {
    ethereum?: any;
    unisat: any;
  }
}

export default useWalletStore;