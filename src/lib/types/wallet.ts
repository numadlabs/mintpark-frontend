// types/wallet.ts
export interface UserLayer {
  id: string;
  address: string;
  layerId: string;
  isActive: boolean;
  createdAt: string;
  pubkey?: string;
  xpub?: string;
  deactivatedAt?: string;
  userId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  role: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    userLayer: UserLayer;
    auth: AuthTokens;
  };
}

export interface LinkAccountResponse {
  success: boolean;
  data: {
    hasAlreadyBeenLinkedToAnotherUser: boolean;
    userLayer: UserLayer;
    user: User;
  };
}

export interface Layer {
  id: string;
  name: string;
  layer:
    | "BITCOIN"
    | "CITREA"
    | "SEPOLIA"
    | "HEMI"
    | "POLYGON_ZK"
    | "EDUCHAIN"
    | "FRACTAL";
  network: "TESTNET" | "MAINNET";
  chainId: string | null;
  currencyId: string;
  layerType: "EVM" | "UTXO" | null;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface WalletConfig {
  type: "metamask" | "unisat" | "educhain";
  chainId?: string;
  name: string;
  icon: string;
  currencyIcon: string;
  currencyPrice: number;
  networks: {
    TESTNET?: NetworkConfig;
    MAINNET?: NetworkConfig;
  };
}

export interface WalletState {
  isConnected: boolean;
  currentLayer: Layer | null;
  currentUserLayer: UserLayer | null;
  user: User | null;
  selectedLayerId: string | null;
  isLoading: boolean;
  error: string | null;
  availableLayers: Layer[];
  userLayerCache: Map<string, UserLayer>;
}
