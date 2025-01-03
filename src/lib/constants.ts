import { WalletConfig } from "@/types";

export const rpcUrl = "http://seed2.coordinate.mara.technology",
  rpcPort = 18332;

export const maraUrl =
  "http://btc-testnet-wallet.mara.technology:9130/unspents/list?address=&xpub=";

export const fileSizeLimit = 3145728; //3MB in binary

//native segwit
export const outputSize = 31,
  inputSize = 68;

export const ASSETTYPE = {
  TOKEN: 0,
  NFTOFFCHAIN: 1,
  NFTONCHAIN: 2,
};

export const USED_UTXO_KEY = "used_utxo";

export const RPC_USERNAME = "coordinate";
export const RPC_PASSWORD = "coordinate";

export const STORAGE_KEYS = {
  AUTH_TOKENS: "auth_tokens",
  SELECTED_LAYER: "layerId",
  WALLET_STATE: "wallet-storage",
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  CITREA_PRICE_KEY: "CITREA_PRICE",
} as const;

export const FEERATE = 1;

export const WALLET_CONFIGS: { [key: string]: WalletConfig } = {
  BITCOIN: {
    type: "unisat",
    name: "Bitcoin",
    icon: "/wallets/Bitcoin.png",
    networks: {
      TESTNET: {
        chainId: "btc-testnet",
        chainName: "Bitcoin Testnet",
        rpcUrls: [],
        blockExplorerUrls: ["https://testnet.blockchain.info"],
      },
      MAINNET: {},
    },
  },
  CITREA: {
    type: "metamask",
    chainId: "0x13FB", // 5115 in hex
    name: "Citrea",
    icon: "/wallets/Citrea.png",
    networks: {
      TESTNET: {
        chainId: "0x13FB",
        chainName: "Citrea Testnet",
        rpcUrls: ["https://rpc.testnet.citrea.xyz"],
        blockExplorerUrls: ["https://explorer.testnet.citrea.xyz"],
      },
    },
  },
  EDU: {
    type: "educhain",
    chainId: "656476", // 5115 in hex
    name: "Edu",
    icon: "/wallets/EduChain.png",
    networks: {
      TESTNET: {
        chainName: "Etherscan",
        rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
        blockExplorerUrls: ["https://edu-chain-testnet.blockscout.com/"],
      },
    },
  },
};

export const serviceData = [
  {
    id: 1,
    title: "Launch Collection",
    description: "Create unique digital art on chain today backed by bitcoin",
    image: "service1",
  },
  {
    id: 2,
    title: "Trade",
    description: "Maximize value through seamless NFT market operations",
    image: "service2",
  },
  {
    id: 1,
    title: "Bridge between layer-2s",
    description: "Transfer assets seamlessly across Bitcoin Layer networks",
    image: "service3",
  },
];
