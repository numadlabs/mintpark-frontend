import { CITREA_PRICE, ETH_IMAGE, ETH_PRICE, WALLET_CONFIGS } from "../../lib/constants";

//todo: change network to dynamic
// Helper function to get currency symbol based on layer type
export const getCurrencySymbol = (layerType: string): string => {
  const config = WALLET_CONFIGS[layerType];
  if (!config) return "ETH"; // Default fallback

  // Get the native currency symbol from the config if available
  return (
    config.networks?.TESTNET?.nativeCurrency?.symbol ||
    // For Bitcoin and fallback cases
    (layerType === "BITCOIN" ? "BTC" : "ETH")
  );
};

// Helper function to get appropriate image for currency
export const getCurrencyImage = (layerType: string): string => {
  const config = WALLET_CONFIGS[layerType];
  return config?.icon || WALLET_CONFIGS.BITCOIN.icon;
};

export const getCurrencyIcon = (layerType: string): string => {
  const config = WALLET_CONFIGS[layerType];
  return config?.currencyIcon || WALLET_CONFIGS.BITCOIN.icon;
};

export const getCurrencyPrice = (layerType: string): number => {
  const config = WALLET_CONFIGS[layerType];

  // If there's a config with a bannerImage path, use that
  if (config && config.currencyPrice) {
    return config.currencyPrice;
  }
  // Check if we should use Bitcoin image based on layerType
  return layerType === "BITCOIN" ? CITREA_PRICE : ETH_PRICE;
};

// todo: evm checking logic is faulty
// Function to format balance based on layer type
export const formatBalanceForLayer = (
  amount: number,
  layerType: string,
): string => {
  // Check if the currency is Bitcoin-based or Ethereum-based
  const isBitcoinBased = ["BITCOIN", "CITREA"].includes(layerType);
  return isBitcoinBased ? formatPriceBtc(amount) : formatPriceEth(amount);
};

// Get decimal places for a specific currency based on layer type
export const getDecimalsForLayer = (layerType: string): number => {
  const config = WALLET_CONFIGS[layerType];
  return (
    config?.networks?.TESTNET?.nativeCurrency?.decimals ||
    (["BITCOIN", "CITREA"].includes(layerType) ? 8 : 18)
  );
};


// new currency helper function
export const getInscriptionExplorerUrl = (
  layerType: string,
  inscriptionId: string,
  networkType: "TESTNET" | "MAINNET" = "TESTNET"
): string => {
  // For Bitcoin-based layers, use ordinals explorer
  if (layerType === "BITCOIN") {
    const isTestnet = networkType === "TESTNET";
    const baseUrl = isTestnet 
      ? "https://testnet4.ordinals.com" 
      : "https://ordinals.com";
    return `${baseUrl}/${inscriptionId}`;
  }
  
  // For other layers, use their block explorer
  const baseUrl = getBlockExplorerBaseUrl(layerType, networkType);
  if (!baseUrl) return "";
  
  // Different explorers might have different patterns for inscriptions
  return `${baseUrl}/inscription/${inscriptionId}`;
};

// Format BTC price (8 decimal places)
export const formatPriceBtc = (value: number): string => {
  if (!value && value !== 0) return "0.000000";
  return value.toFixed(8);
};

// Format ETH price (6 decimal places)
export const formatPriceEth = (value: number): string => {
  if (!value && value !== 0) return "0.000000";
  return value.toFixed(6);
};

// Format USD price (2 decimal places)
export const formatPriceUsd = (value: number): string => {
  if (!value && value !== 0) return "0.00";
  return value.toFixed(2);
};

// Get a list of all supported currencies
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(WALLET_CONFIGS);
};

// Check if a currency is Bitcoin-based (BTC or cBTC)
export const isBitcoinBasedCurrency = (layerType: string): boolean => {
  return ["BITCOIN", "CITREA"].includes(layerType);
};

//todo: layer is HEMI, CITREA. layerType is supposed to be EVM or BTC
// Get network information for a given layer
export const getNetworkInfo = (layerType: string) => {
  const config = WALLET_CONFIGS[layerType];
  return config?.networks?.TESTNET || null;
};

// todo: what is layerType conditional return?
// Helper function to get block explorer URL for an address
export const getAddressExplorerUrl = (
  layerType: string,
  address: string,
): string => {
  const config = WALLET_CONFIGS[layerType];

  // If no config is found, return empty string
  if (!config) return "";

  // Get the block explorer URL from the config
  const blockExplorerUrl = config.networks?.TESTNET?.blockExplorerUrls?.[0];

  // If no block explorer URL is found, return empty string
  if (!blockExplorerUrl) return "";

  // Format the address URL based on layer type
  if (layerType === "BITCOIN") {
    return `${blockExplorerUrl}/address/${address}`;
  } else {
    // For Ethereum-based chains
    const baseUrl = blockExplorerUrl.endsWith("/")
      ? blockExplorerUrl.slice(0, -1)
      : blockExplorerUrl;

    return `${baseUrl}/address/${address}`;
  }
};

// Helper function to get block explorer URL for a token contract
export const getCollectibleExplorerUrl = (
  layerType: string,
  contractAddress: string,
): string => {
  const baseUrl = getBlockExplorerBaseUrl(layerType);

  if (!baseUrl) return "";

  // Different explorers might have different URL patterns for tokens
  if (layerType === "BITCOIN") {
    return `${baseUrl}/token/${contractAddress}`;
  } else if (layerType === "HEMI" || layerType === "HEMI_TESTNET") {
    return `${baseUrl}/tokens/${contractAddress}`;
  } else {
    // Default format for most Ethereum-based explorers
    return `${baseUrl}/token/${contractAddress}`;
  }
};

export const getBlockExplorerBaseUrl = (
  layerType: string,
  networkType: "TESTNET" | "MAINNET" = "TESTNET",
): string => {
  const config = WALLET_CONFIGS[layerType];

  // If no config is found, return empty string
  if (!config) return "";

  // Check if the requested network type exists
  if (!config.networks?.[networkType]) {
    // If requested network type doesn't exist, try to fallback to the other type
    const fallbackType = networkType === "TESTNET" ? "MAINNET" : "TESTNET";

    // If fallback exists, use it
    if (config.networks?.[fallbackType]) {
      networkType = fallbackType;
    } else {
      // If no networks are defined, return empty string
      return "";
    }
  }

  // Get the block explorer URL from the config
  const blockExplorerUrl = config.networks[networkType]?.blockExplorerUrls?.[0];

  // If no block explorer URL is found, return empty string
  if (!blockExplorerUrl) return "";

  // Remove trailing slash if it exists
  return blockExplorerUrl.endsWith("/")
    ? blockExplorerUrl.slice(0, -1)
    : blockExplorerUrl;
};
