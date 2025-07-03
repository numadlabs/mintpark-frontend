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
import { useEffect } from "react";

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

// Metamask utility functions (integrated directly)
const isMetamaskAvailable = () => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

const setupWalletEventListeners = (store: any) => {
  if (!isMetamaskAvailable()) return;

  const handleAccountsChanged = (accounts: string[]) => {
    const { connectedWallets, layers, disconnectWallet } = store.getState();

    // console.log("Metamask accounts changed:", accounts);

    if (accounts.length === 0) {
      // User disconnected all accounts from Metamask
      toast.info("Metamask wallet disconnected");

      // Find all wallets that use Metamask and disconnect them
      const metamaskWallets = connectedWallets.filter(
        (wallet: ConnectedWallet) => {
          const layer = layers.find((l: any) => l.id === wallet.layerId);
          return layer && WALLET_CONFIGS[layer.layer]?.type === "metamask";
        },
      );

      metamaskWallets.forEach((wallet: ConnectedWallet) => {
        disconnectWallet(wallet.layerId);
      });
    } else {
      // User switched to a different account in Metamask
      const newAddress = accounts[0];

      // Find all wallets that use Metamask
      const metamaskWallets = connectedWallets.filter(
        (wallet: ConnectedWallet) => {
          const layer = layers.find((l: any) => l.id === wallet.layerId);
          return layer && WALLET_CONFIGS[layer.layer]?.type === "metamask";
        },
      );

      if (
        metamaskWallets.length > 0 &&
        metamaskWallets[0].address !== newAddress
      ) {
        toast.info(
          `Account changed to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
        );

        // Account changed - need to disconnect and reconnect
        toast.info(
          "Your wallet address has changed. Please reconnect your wallet.",
        );

        metamaskWallets.forEach((wallet: ConnectedWallet) => {
          disconnectWallet(wallet.layerId);
        });
      }
    }
  };

  const handleChainChanged = (chainId: string) => {
    const { connectedWallets, layers, selectedLayerId, setSelectedLayerId } =
      store.getState();

    // Convert chainId from hex to decimal
    const chainIdDecimal = parseInt(chainId, 16).toString();
    // console.log("Metamask chain changed to:", chainIdDecimal);

    // Find a matching layer for this chain ID
    const matchingLayer = layers.find(
      (l: Layer) => l.chainId === chainIdDecimal,
    );

    if (matchingLayer) {
      toast.info(`Network changed to ${matchingLayer.name}`);

      // If the selected layer is using metamask, update it
      if (selectedLayerId) {
        const currentLayer = layers.find(
          (l: Layer) => l.id === selectedLayerId,
        );
        if (
          currentLayer &&
          WALLET_CONFIGS[currentLayer.layer]?.type === "metamask"
        ) {
          setSelectedLayerId(matchingLayer.id);
        }
      }
    } else {
      toast.warning("Switched to an unsupported network");
    }
  };

  const handleDisconnect = (error: any) => {
    toast.error("Metamask disconnect event:", error);
    toast.error("Metamask connection lost");
  };

  // Add event listeners
  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", handleChainChanged);
  window.ethereum.on("disconnect", handleDisconnect);

  // Store the handlers so we can remove them later
  if (typeof window !== "undefined") {
    window._metamaskHandlers = {
      accountsChanged: handleAccountsChanged,
      chainChanged: handleChainChanged,
      disconnect: handleDisconnect,
    };
  }

  return () => {
    // Cleanup function
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      window._metamaskHandlers
    ) {
      window.ethereum.removeListener(
        "accountsChanged",
        window._metamaskHandlers.accountsChanged,
      );
      window.ethereum.removeListener(
        "chainChanged",
        window._metamaskHandlers.chainChanged,
      );
      window.ethereum.removeListener(
        "disconnect",
        window._metamaskHandlers.disconnect,
      );
      delete window._metamaskHandlers;
    }
  };
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
        get().updateAuthStateForLayer(id);
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
              userLayerId: wallet.userLayerId, // Use userLayerId from the selected wallet
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
            if (!window?.ethereum) throw new Error("MetaMask is not installed");

            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            });

            const currentChainIdDecimal = parseInt(chainId, 16);

            const targetChainIdDecimal = parseInt(layer.chainId);

            const targetChainIdHex = `0x${targetChainIdDecimal.toString(16)}`;

            // console.log(
            //   "🚀 ~ connectWallet: ~ targetChainIdHex:",
            //   targetChainIdHex,
            // );
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
                    const networkConfig =
                      walletConfig.networks[layer.network] ||
                      walletConfig.networks.TESTNET ||
                      walletConfig.networks.MAINNET;

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

            // Set up Metamask event listeners if not already set up
            if (isMetamaskAvailable() && !window._metamaskHandlers) {
              setupWalletEventListeners(useWalletStore);
            }
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
          // Clean up Metamask event listeners when all wallets are disconnected
          if (typeof window !== "undefined" && window._metamaskHandlers) {
            window.ethereum.removeListener(
              "accountsChanged",
              window._metamaskHandlers.accountsChanged,
            );
            window.ethereum.removeListener(
              "chainChanged",
              window._metamaskHandlers.chainChanged,
            );
            window.ethereum.removeListener(
              "disconnect",
              window._metamaskHandlers.disconnect,
            );
            delete window._metamaskHandlers;
          }
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

        // Disconnect from MetaMask properly first
        if (window.ethereum) {
          // For MetaMask, we need to properly handle connected wallets
          const { connectedWallets, layers } = get();

          // Find all MetaMask wallets that are connected
          const metamaskWallets = connectedWallets.filter((wallet) => {
            const layer = layers.find((l) => l.id === wallet.layerId);
            return layer && WALLET_CONFIGS[layer.layer]?.type === "metamask";
          });

          // Force disconnect by switching to a safe chainId first
          if (metamaskWallets.length > 0) {
            try {
              // Try to switch to Ethereum mainnet (or any valid chain) to ensure clean state
              window.ethereum
                .request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: "0x1" }], // Ethereum mainnet
                })
                .catch((e: any) =>
                  toast.message("Could not switch to mainnet, continuing logout"),
                );
            } catch (error) {
              console.log("Error switching chain during logout:", error);
              // Continue with logout even if switch fails
            }
          }
        }

        // Clean up Metamask event listeners on logout
        if (window._metamaskHandlers) {
          window.ethereum.removeListener(
            "accountsChanged",
            window._metamaskHandlers.accountsChanged,
          );
          window.ethereum.removeListener(
            "chainChanged",
            window._metamaskHandlers.chainChanged,
          );
          window.ethereum.removeListener(
            "disconnect",
            window._metamaskHandlers.disconnect,
          );
          delete window._metamaskHandlers;
        }

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
    // ethereum: any;
    unisat: any;
    _metamaskHandlers?: {
      accountsChanged: (accounts: string[]) => void;
      chainChanged: (chainId: string) => void;
      disconnect: (error: any) => void;
    };
  }
}

// Initialize Metamask event listeners if a wallet is already connected
if (typeof window !== "undefined" && window.ethereum) {
  // Check if there are any Metamask wallets connected in the store
  const state = useWalletStore.getState();

  const hasMetamaskWallets = state.connectedWallets.some((wallet) => {
    const layer = state.layers.find((l) => l.id === wallet.layerId);
    return layer && WALLET_CONFIGS[layer.layer]?.type === "metamask";
  });

  // If there are Metamask wallets connected, set up event listeners
  if (hasMetamaskWallets && !window._metamaskHandlers) {
    setupWalletEventListeners(useWalletStore);
  }
}

// Custom React hook to use in components that need Metamask events
export function useMetamaskEvents() {
  const {
    connectedWallets,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    disconnectWallet,
  } = useWalletStore((state) => ({
    connectedWallets: state.connectedWallets,
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    setSelectedLayerId: state.setSelectedLayerId,
    disconnectWallet: state.disconnectWallet,
  }));

  useEffect(() => {
    // Only set up listeners if Metamask is available
    if (typeof window === "undefined" || !window.ethereum) return;

    // Handle account changes (disconnected or switched accounts)
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected from Metamask
        toast.info("Metamask wallet disconnected");

        // Find all Metamask wallets and disconnect them
        const metamaskWallets = connectedWallets.filter((wallet) => {
          const layer = layers.find((l) => l.id === wallet.layerId);
          return layer && WALLET_CONFIGS[layer.layer]?.type === "metamask";
        });

        metamaskWallets.forEach((wallet) => {
          disconnectWallet(wallet.layerId);
        });
      } else {
        // Account switched - check if it's a new account
        const newAddress = accounts[0];

        // Check if any of our connected wallets match this address
        const matchingWallet = connectedWallets.find(
          (wallet) => wallet.address.toLowerCase() === newAddress.toLowerCase(),
        );

        if (!matchingWallet) {
          // We don't have this account connected - notify user
          toast.info("Account changed. Please reconnect your wallet.");

          // Disconnect all Metamask wallets
          const metamaskWallets = connectedWallets.filter((wallet) => {
            const layer = layers.find((l) => l.id === wallet.layerId);
            return layer && WALLET_CONFIGS[layer.layer]?.type === "metamask";
          });

          metamaskWallets.forEach((wallet) => {
            disconnectWallet(wallet.layerId);
          });
        }
      }
    };

    // Handle chain change - match to our layers
    const handleChainChanged = (chainId: string) => {
      // Convert chainId from hex to decimal
      const chainIdDecimal = parseInt(chainId, 16).toString();

      // Find a matching layer for this chain ID
      const matchingLayer = layers.find((l) => l.chainId === chainIdDecimal);

      if (matchingLayer) {
        // Found a matching layer - update selected layer if current is Metamask
        if (selectedLayerId) {
          const currentLayer = layers.find((l) => l.id === selectedLayerId);
          if (
            currentLayer &&
            WALLET_CONFIGS[currentLayer.layer]?.type === "metamask"
          ) {
            setSelectedLayerId(matchingLayer.id);

            // Also update localStorage for persistence
            localStorage.setItem("selectedLayer", matchingLayer.layer);

            toast.info(`Network changed to ${matchingLayer.name}`);
          }
        }
      } else {
        // Unknown network
        toast.warning("Switched to an unsupported network in Metamask");
      }
    };

    // Handle disconnection events
    const handleDisconnect = (error: any) => {
      console.error("Metamask disconnect event:", error);
      toast.error("Connection to wallet lost");
    };

    // Set up event listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", handleDisconnect);

    // Clean up event listeners when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [
    connectedWallets,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    disconnectWallet,
  ]);
}

export default useWalletStore;
