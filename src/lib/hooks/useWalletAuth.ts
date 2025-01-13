import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectMetamask, connectUnisat } from "../wallet";
import { AuthState, Layer, WalletInfo } from "@/types";
import {
  generateMessageHandler,
  linkAccountToAnotherUser,
  loginHandler,
  loginWalletLink,
} from "../service/postRequest";
import { saveToken } from "../auth";
import { STORAGE_KEYS, WALLET_CONFIGS } from "../constants";

// Check for browser environment
const isBrowser = typeof window !== "undefined";

// Define wallet types
type WalletType = "EVM" | "BITCOIN" | null;

export interface Wallet {
  address: string | null;
  type: WalletType;
  layerId: string | null;
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
  setSelectedLayerId: (id: string) => void;
  connectWallet: (layerId: string, isLinking?: boolean) => Promise<void>;
  disconnectWallet: (layerId: string) => Promise<void>;
  isWalletConnected: (layerId: string) => boolean;
  getWalletForLayer: (layerId: string) => ConnectedWallet | undefined;
  setLayers: (layers: Layer[]) => void;
  proceedWithLinking: () => Promise<any>;
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
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

const loadInitialState = () => {
  if (!isBrowser) {
    return initialAuthState;
  }

  try {
    const storedTokens = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    const storedState = localStorage.getItem(STORAGE_KEYS.WALLET_STATE);

    if (!storedTokens || !storedState) {
      return initialAuthState;
    }

    const tokens = JSON.parse(storedTokens);
    const state = JSON.parse(storedState);

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
              msgResponse.data.message
            );
            pubkey = await window.unisat.getPublicKey();
          } else {
            throw new Error("Unsupported wallet type");
          }

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

              if (isBrowser) {
                localStorage.setItem(
                  "pendingWalletLink",
                  JSON.stringify({
                    address,
                    layerId,
                    signedMessage,
                  })
                );
              }
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
            network: layer.network,
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
          if (!isBrowser) {
            throw new Error("Cannot proceed with linking during SSR");
          }

          const pendingLinkStr = localStorage.getItem("pendingWalletLink");
          if (!pendingLinkStr) {
            throw new Error("No pending wallet link found");
          }

          const pendingLink = JSON.parse(pendingLinkStr);
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
            (w) => w.layerId !== layerId
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

        // Return undefined instead of throwing during SSR
        if (!selectedLayerId) {
          if (!isBrowser) return undefined;
          throw new Error("No layer selected");
        }

        const layer = get().layers.find((l) => l.id === selectedLayerId);
        if (!layer) {
          if (!isBrowser) return undefined;
          throw new Error("Layer not found");
        }

        return connectedWallets.find((w) => w.layerId === layer.id);
      },

      onLogout: () => {
        set({
          connectedWallets: [],
          authState: initialAuthState,
        });

        if (isBrowser) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.WALLET_STATE);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
        }
      },
    }),
    {
      name: "wallet-storage",
      skipHydration: true, // Skip hydration during SSR
    }
  )
);

export default useWalletStore;
