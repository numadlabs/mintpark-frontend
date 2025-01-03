export type tokenData = {
  address: string;
  opReturnValues: any[];
  assetType: number;
  headline: string;
  ticker: string;
  supply: number;
};

export type collectionData = {
  address: string;
  opReturnValues: any[];
  assetType: number;
  headline: string;
  ticker: string;
  supply: number;
  traits: Attribute[];
  //traits optional, logo optional
};

export type utxo = {
  txid: string;
  vout: number;
  value: number;
  coinbase: boolean;
  height: number;
  derviation_index: number;
  confirmations: number;
};

/* export type utxo = {
  txid: string;
  vout: number;
  value: string;
  coinbase: boolean;
  derivation_index: number;
  confirmation: boolean;
  height: string;
}; */

export type rpcResponse = {
  result: string;
  error: boolean;
  id: string;
};

type Attribute = {
  trait_type: string;
  value: string;
};

type Meta = {
  name: string;
};

export type MergedObject = {
  attributes: Attribute[];
  base64: string;
  fileName: string;
  meta: Meta;
  mimeType: string;
};

export type TokenType = {
  accessToken: string;
  refreshToken: string;
};

export interface JsonDataItem {
  attributes: Attribute[];
  meta: Meta;
  // Add other properties that exist in your JSON data
}

export interface WalletConfig {
  type: "unisat" | "metamask" | "educhain";
  chainId?: string;
  name: string;
  icon: string;
  networks: {
    [key: string]: NetworkConfig;
  };
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  chainId?: string;
  walletType: "unisat" | "metamask" | null;
}

// export interface Layer {
//   id: string;
//   name: string;
//   layer: string;
//   network: string;
//   currencyId: string;
// }

export interface NetworkConfig {
  chainId?: string;
  chainName?: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
}

export interface WalletStorage {
  address: string;
  signature: string;
  walletType: "unisat" | "metamask";
  layerId: string;
  expiry: number;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface WalletState {
  primaryWallet: {
    address: string | null;
    type: "EVM" | "BITCOIN" | null;
    layerId: string | null;
  };
  secondaryWallet: {
    address: string | null;
    type: "EVM" | "BITCOIN" | null;
    layerId: string | null;
  };
}

export interface AuthState {
  authenticated: boolean;
  loading: boolean;
  userLayerId: string | null;
  userId: string | null;
  layerId: string | null;
  // primaryWallet: WalletInfo;
  // secondaryWallet: WalletInfo;
  // hasAlreadyBeenLinkedToAnotherUser
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export interface WalletInfo {
  address: string | null;
  type: "EVM" | "BITCOIN" | null;
  layerId: string | null;
}

export interface Layer {
  id: string;
  name: string;
  layer: string;
  network: string;
  currencyId: string;
}
