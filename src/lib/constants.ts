import { WalletConfig } from "@/lib/types";

export const BITCOIN_IMAGE = "/wallets/Bitcoin.png";
export const ETH_IMAGE = "/wallets/eth.png";

export const STORAGE_KEYS = {
  AUTH_TOKENS: "auth_tokens",
  SELECTED_LAYER: "layerId",
  WALLET_STATE: "wallet-storage",
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  // CITREA_PRICE_KEY: "CITREA_PRICE",
  // ETH_PRICE_KEY: "ETH_PRICE",
} as const;

export const FEERATE = 1;

export const ETH_PRICE = 1937.96;
export const CITREA_PRICE = 102500;

export const WALLET_CONFIGS: { [key: string]: WalletConfig } = {
  BITCOIN: {
    type: "unisat",
    name: "Bitcoin",
    icon: "/wallets/Bitcoin.png",
    currencyIcon: "/wallets/Bitcoin.png",
    currencyPrice: CITREA_PRICE,
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
    currencyIcon: "/wallets/Bitcoin.png",
    currencyPrice: CITREA_PRICE,
    networks: {
      TESTNET: {
        chainId: "0x13FB",
        chainName: "Citrea Testnet",
        rpcUrls: ["https://rpc.testnet.citrea.xyz"],
        blockExplorerUrls: ["https://explorer.testnet.citrea.xyz"],
        nativeCurrency: {
          name: "cBTC",
          symbol: "cBTC",
          decimals: 18,
        },
      },
    },
  },
  SEPOLIA: {
    type: "metamask",
    chainId: "11155111", // 5115 in hex
    name: "Sepolia",
    icon: "/wallets/Citrea.png",
    currencyIcon: "/wallets/Bitcoin.png",
    currencyPrice: CITREA_PRICE,
    networks: {
      TESTNET: {
        chainId: "11155111",
        chainName: "Sepolia Testnet",
        rpcUrls: ["https://eth-sepolia.public.blastapi.io"],
        blockExplorerUrls: ["https://explorer.testnet.citrea.xyz"],
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
      },
    },
  },
  // HEMI: {
  //   type: "metamask",
  //   chainId: "743111", // 743111 in hex
  //   name: "Hemi",
  //   icon: "/wallets/hemi.png",
  //   networks: {
  //     TESTNET: {
  //       chainId: "0xB56C7",
  //       chainName: "Sepollia Testnet",
  //       rpcUrls: ["https://testnet.rpc.hemi.network/rpc"],
  //       blockExplorerUrls: ["https://eth-sepolia.public.blastapi.io"],
  //     },
  //   },
  // },

  // new implement
  HEMI: {
    type: "metamask",
    chainId: "0xA877",
    name: "Hemi Network",
    icon: "/wallets/hemi.png",
    currencyIcon: "/wallets/eth.png",
    currencyPrice: ETH_PRICE,
    networks: {
      MAINNET: {
        chainId: "0xA877", // Hexadecimal representation of 43111
        chainName: "Hemi Network",
        rpcUrls: ["https://rpc.hemi.network/rpc"],
        blockExplorerUrls: ["https://explorer.hemi.xyz"],
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
      },
      // TESTNET: {
      //   chainId: "0xB56C7", // Hexadecimal representation of 743111
      //   chainName: "Hemi Testnet",
      //   rpcUrls: ["https://testnet.rpc.hemi.network/rpc"],
      //   blockExplorerUrls: ["https://testnet.explorer.hemi.xyz"],
      //   nativeCurrency: {
      //     name: "ETH",
      //     symbol: "ETH",
      //     decimals: 18,
      //   },
      // },
    },
  },
  POLYGON_ZK: {
    type: "metamask",
    chainId: "1101",
    name: "Polygon zkEVM",
    icon: "/wallets/hemi.png",
    currencyIcon: "/wallets/eth.png",
    currencyPrice: ETH_PRICE,
    networks: {
      TESTNET: {
        chainId: "0x44d",
        chainName: "Polygon zkEVM Testnet",
        rpcUrls: ["https://rpc.cardona.zkevm-rpc.com"],
        blockExplorerUrls: ["https://cardona-zkevm.polygonscan.com/"],
      },
    },
  },

  EDUCHAIN: {
    type: "metamask", // Changed from "educhain" to "metamask"
    chainId: "0xa3c3", // 41923 in hex
    name: "Edu",
    icon: "/wallets/edu.png",
    currencyIcon: "/wallets/edu.png", // Added missing currencyIcon
    currencyPrice: ETH_PRICE, // Added missing currencyPrice (or use CITREA_PRICE if preferred)
    networks: {
      TESTNET: {
        chainId: "0xa3c3", // Added chainId here as well for consistency
        chainName: "EDU Chain Testnet",
        rpcUrls: ["https://open-campus-codex-sepolia.drpc.org"],
        blockExplorerUrls: ["https://edu-chain-testnet.blockscout.com"],
        nativeCurrency: {
          // Optional: Add native currency info for consistency
          name: "EDU",
          symbol: "EDU",
          decimals: 18,
        },
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
