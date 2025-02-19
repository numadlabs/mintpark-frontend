import { WalletConfig } from "@/types";

export const ASSETTYPE = {
  TOKEN: 0,
  NFTOFFCHAIN: 1,
  NFTONCHAIN: 2,
};

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
  HEMI: {
    type: "metamask",
    chainId: "743111", // 743111 in hex
    name: "Hemi",
    icon: "/wallets/hemi.png",
    networks: {
      TESTNET: {
        chainId: "0xB56C7",
        chainName: "Sepollia Testnet",
        rpcUrls: ["https://testnet.rpc.hemi.network/rpc"],
        blockExplorerUrls: ["https://eth-sepolia.public.blastapi.io"],
      },
    },
  },

  POLYGON_ZK: {
    type: "metamask",
    chainId: "1101",
    name: "Polygon zkEVM",
    icon: "/wallets/hemi.png",
    networks: {
      TESTNET: {
        chainId: "0x44d",
        chainName: "Polygon zkEVM Testnet",
        rpcUrls: ["https://rpc.cardona.zkevm-rpc.com"],
        blockExplorerUrls: ["https://cardona-zkevm.polygonscan.com/"],
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
    bg: "serviceBgFirst",
  },
  {
    id: 2,
    title: "Trade",
    description: "Maximize value through seamless NFT market operations",
    image: "service2",
    bg: "serviceBgSecond",
  },
  {
    id: 3,
    title: "Bridge between layer-2s",
    description: "Transfer assets seamlessly across Bitcoin Layer networks",
    image: "service3",
    bg: "serviceBgThird",
  },
];
