import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, Layer, WalletInfo } from "@/types";
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
}

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
        // Update the authState when the selected layer changes
        get().updateAuthStateForLayer(id);
      },

      // New function to update authState based on the selected layer
      updateAuthStateForLayer: (layerId: string) => {
        const { connectedWallets, authState } = get();

        // If the wallet for this layer is connected, update the authState to use this layer
        const wallet = connectedWallets.find((w) => w.layerId === layerId);

        if (wallet) {
          set((state) => ({
            authState: {
              ...state.authState,
              layerId: layerId,
              // Maintain authentication state and other properties
              authenticated: state.authState.authenticated,
              userId: state.authState.userId,
              tokens: state.authState.tokens,
              // Update userLayerId for the current connected layer if needed
              // (This can be layer-specific in some architectures)
              userLayerId: state.authState.userLayerId,
            },
          }));
        } else {
          // If the selected layer is not connected, we don't change authentication status
          // but we do update the layerId to reflect the selected layer
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
            if (!window?.ethereum) throw new Error("MetaMask is not installed");

            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            });

            const currentChainIdDecimal = parseInt(chainId, 16);

            const targetChainIdDecimal = parseInt(layer.chainId);

            const targetChainIdHex = `0x${targetChainIdDecimal.toString(16)}`;

            // console.log(
            //   "🚀 ~ connectWallet: ~ currentChainIdDecimal:",
            //   currentChainIdDecimal,
            // );
            // console.log("🚀 ~ connectWallet: ~  layer.chainId:", layer.chainId);

            // if (currentChainIdDecimal.toString() !== layer.chainId) {
            //   try {
            //     await window.ethereum.request({
            //       method: "wallet_addEthereumChain",
            //       params: [
            //         {
            //           chainId: targetChainIdHex,
            //           chainName: layer.name,
            //           rpcUrls: walletConfig.networks.TESTNET.rpcUrls,
            //           // rpcUrls: [layer.rpcUrl],
            //           nativeCurrency: {
            //             name: "cBTC",
            //             symbol: "cBTC",
            //             decimals: 18,
            //           },
            //         },
            //       ],
            //     });
            //   } catch (addError: any) {
            //     console.log("add error", addError);
            //     if (addError.code === 4902) {
            //       try {
            //         await window.ethereum.request({
            //           method: "wallet_switchEthereumChain",
            //           params: [{ chainId: targetChainIdHex }],
            //         });
            //       } catch (switchError) {
            //         throw new Error(
            //           `Failed to switch network (Chain ID: ${layer.chainId})`,
            //         );
            //       }
            //     } else {
            //       throw new Error(
            //         `Failed to add network (Chain ID: ${layer.chainId})`,
            //       );
            //     }
            //   }
            // }

            //new implement
            if (currentChainIdDecimal.toString() !== layer.chainId) {
              try {
                // Try to switch to the network first before trying to add it
                await window.ethereum.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: targetChainIdHex }],
                });
              } catch (switchError: any) {
                // This error code indicates the chain hasn't been added to MetaMask
                if (switchError.code === 4902) {
                  try {
                    // Get the network config from our WALLET_CONFIGS
                    const networkConfig = walletConfig.networks.TESTNET;

                    await window.ethereum.request({
                      method: "wallet_addEthereumChain",
                      params: [
                        {
                          chainId: targetChainIdHex,
                          chainName: layer.name,
                          rpcUrls: networkConfig.rpcUrls,
                          blockExplorerUrls: networkConfig.blockExplorerUrls,
                          nativeCurrency: networkConfig.nativeCurrency || {
                            name: layer.name,
                            symbol: layer.name.toUpperCase().substring(0, 5),
                            decimals: 18,
                          },
                        },
                      ],
                    });
                  } catch (addError: any) {
                    throw new Error(
                      `Failed to add network (Chain ID: ${layer.chainId}): ${addError.message}`,
                    );
                  }
                } else {
                  throw new Error(
                    `Failed to switch network (Chain ID: ${layer.chainId}): ${switchError.message}`,
                  );
                }
              }
            }

            // address = await window.ethereum
            //   .request({
            //     method: "eth_requestAccounts",
            //   })
            //   .then((accounts: string[]) => accounts[0]);

            // const msgResponse = await generateMessageHandler({ address });
            // console.log("🚀 ~ connectWallet: ~ msgResponse:", msgResponse);
            // signedMessage = await window.ethereum.request({
            //   method: "personal_sign",
            //   params: [msgResponse.data.message, address],
            // });
            // console.log("🚀 ~ connectWallet: ~ signedMessage:", signedMessage);

            // new implemment

            // new implemment
            address = await window.ethereum
              .request({
                method: "eth_requestAccounts",
              })
              .then((accounts: string[]) => accounts[0]);

            const msgResponse = await generateMessageHandler({ address });

            signedMessage = await window.ethereum.request({
              method: "personal_sign",
              params: [msgResponse.data.message, address],
            });
            //new implemment

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
              layerType: layer.layerType,
              layer: layer.layer,
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
            };

            const updatedWallets = [...get().connectedWallets, newWallet];
            const hasOnlyBitcoin = updatedWallets.every((w) => {
              const layerInfo = get().layers.find((l) => l.id === w.layerId);
              return layerInfo?.layer === "BITCOIN";
            });

            set((state) => ({
              connectedWallets: [...state.connectedWallets, newWallet],
              authState: {
                ...state.authState,
                authenticated: true,
                userLayerId: hasOnlyBitcoin ? null : response.data.userLayer.id,
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
          // console.error("Failed to proceed with linking:", error);
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

        set({
          connectedWallets: [],
          authState: initialAuthState,
          selectedLayerId: null,
        });

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

export default useWalletStore;
