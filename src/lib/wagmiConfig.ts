// lib/wagmiConfig.ts - Updated with icons
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { coreDao, coreTestnet2, mainnet, sepolia } from "wagmi/chains";
import { defineChain } from "viem";

// Define chains with iconUrl property
export const citreaTestnet = defineChain({
  id: 5115, // 0x13FB in decimal
  name: "Citrea Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "cBTC",
    symbol: "cBTC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.citrea.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Citrea Explorer",
      url: "https://explorer.testnet.citrea.xyz",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/Citrea.png",
  testnet: true,
});

export const hemiMainnet = defineChain({
  id: 43111, // 0xA877 in decimal
  name: "Hemi Network",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hemi.network/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hemi Explorer",
      url: "https://explorer.hemi.xyz",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/hemi.png",
  testnet: false,
});

export const hemiTestnet = defineChain({
  id: 743111, // 0xB56C7 in decimal
  name: "Hemi Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.hemi.network/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hemi Explorer",
      url: "https://explorer.hemi.xyz",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/hemi.png",
  testnet: true,
});

export const polygonZkEvmTestnet = defineChain({
  id: 1101, // 0x44d in decimal
  name: "Polygon zkEVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.cardona.zkevm-rpc.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polygon zkEVM Explorer",
      url: "https://cardona-zkevm.polygonscan.com/",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/polygon.png", // You may need to add this icon
  testnet: true,
});

export const eduChainMainnet = defineChain({
  id: 41923, // 0xa3c3 in decimal
  name: "EDU Chain",
  nativeCurrency: {
    decimals: 18,
    name: "EDU",
    symbol: "EDU",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.edu-chain.raas.gelato.cloud"],
    },
  },
  blockExplorers: {
    default: {
      name: "EDU Chain Explorer",
      url: "https://educhain.blockscout.com",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/edu.png",
  testnet: false,
});

export const eduChainTestnet = defineChain({
  id: 656476, // 0xa045c in decimal
  name: "EDU Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "EDU",
    symbol: "EDU",
  },
  rpcUrls: {
    default: {
      http: ["https://open-campus-codex-sepolia.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "EDU Chain Testnet Explorer",
      url: "https://opencampus-codex.blockscout.com",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/edu.png",
  testnet: true,
});

export const coreTestnet = defineChain({
  id: 1114, // 0xa045c in decimal
  name: "CORE Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CORE",
    symbol: "CORE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.test2.btcs.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "CORE Testnet Explorer",
      url: "https://scan.test2.btcs.network",
    },
  },
  // Add icon URL
  iconUrl: "/wallets/core.png",
  testnet: true,
});

// export const coreMainnet = defineChain({
//   id: 1116, // 0xa045c in decimal
//   name: "CORE Mainnet",
//   nativeCurrency: {
//     decimals: 18,
//     name: "CORE",
//     symbol: "CORE",
//   },
//   rpcUrls: {
//     default: {
//       http: ["https://api.zan.top/core-mainnet"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "CORE Testnet Explorer",
//       url: "https://scan.coredao.org",
//     },
//   },
//   // Add icon URL
//   iconUrl: "/wallets/core.png",
//   testnet: true,
// });

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [
    // Ethereum chains
    mainnet,
    sepolia,

    // Your custom chains
    citreaTestnet,
    hemiMainnet,
    hemiTestnet,
    polygonZkEvmTestnet,
    eduChainMainnet,
    eduChainTestnet,
    coreTestnet2,
    coreDao,

    // Core chains
    coreDao, // Core Mainnet (from wagmi/chains)
    coreTestnet, // Core Testnet (custom definition)
  ],
  transports: {
    // Ethereum
    [mainnet.id]: http(),
    [sepolia.id]: http(),

    // Custom chains
    [citreaTestnet.id]: http(),
    [hemiMainnet.id]: http(),
    [hemiTestnet.id]: http(),
    [polygonZkEvmTestnet.id]: http(),
    [eduChainMainnet.id]: http(),
    [eduChainTestnet.id]: http(),
    [coreTestnet2.id]: http(),
    [coreDao.id]: http(),
  },
  connectors: [injected()],
  ssr: true,
});

// Chain icon mapping helper (Alternative approach)
export const CHAIN_ICONS = {
  [citreaTestnet.id]: "/wallets/Citrea.png",
  [hemiMainnet.id]: "/wallets/hemi.png",
  [hemiTestnet.id]: "/wallets/hemi.png",
  [polygonZkEvmTestnet.id]: "/wallets/polygon.png",
  [eduChainMainnet.id]: "/wallets/edu.png",
  [eduChainTestnet.id]: "/wallets/edu.png",
  [mainnet.id]: "/wallets/eth.png",
  [sepolia.id]: "/wallets/eth.png",
  [coreDao.id]: "/wallets/core.png",
  [coreTestnet2.id]: "/wallets/core.png",
} as const;

// Helper function to get chain icon by chain ID
export const getChainIcon = (chainId: number): string => {
  return (
    CHAIN_ICONS[chainId as keyof typeof CHAIN_ICONS] || "/wallets/default.png"
  );
};

// Helper function to get wagmi chain by your layer config
export const getWagmiChainByLayerConfig = (layer: string, network: string) => {
  const mapping = {
    CITREA_TESTNET: citreaTestnet,
    HEMI_MAINNET: hemiMainnet,
    HEMI_TESTNET: hemiTestnet,
    POLYGON_ZK_TESTNET: polygonZkEvmTestnet,
    EDUCHAIN_MAINNET: eduChainMainnet,
    EDUCHAIN_TESTNET: eduChainTestnet,
    SEPOLIA_TESTNET: sepolia,
    CORE_MAINNET: coreDao,
    CORE_TESTNET: coreTestnet2,
  };

  const key = `${layer}_${network}`;
  return mapping[key as keyof typeof mapping];
};
// Export chain IDs for easy reference
export const CHAIN_IDS = {
  CITREA_TESTNET: 5115,
  HEMI_MAINNET: 43111,
  HEMI_TESTNET: 743111,
  POLYGON_ZK_TESTNET: 1101,
  EDUCHAIN_MAINNET: 41923,
  EDUCHAIN_TESTNET: 656476,
  SEPOLIA: 11155111,
  MAINNET: 1,
  CORE_MAINNET: 1116,
  CORE_TESTNET: 1114,
} as const;
