import { WALLET_CONFIGS } from "../../lib/constants";

// Helper function to get currency symbol based on layer type
export const getCurrencySymbol = (layerType: string): string => {
  const config = WALLET_CONFIGS[layerType];
  if (!config) return "ETH"; // Default fallback
  
  // Get the native currency symbol from the config if available
  return config.networks?.TESTNET?.nativeCurrency?.symbol || 
    // For Bitcoin and fallback cases
    (layerType === "BITCOIN" ? "BTC" : "ETH");
};

// Helper function to get appropriate image for currency
export const getCurrencyImage = (layerType: string): string => {
  const config = WALLET_CONFIGS[layerType];
  return config?.icon || WALLET_CONFIGS.BITCOIN.icon;
};

// Function to format balance based on layer type
export const formatBalanceForLayer = (amount: number, layerType: string): string => {
  // Check if the currency is Bitcoin-based or Ethereum-based
  const isBitcoinBased = ["BITCOIN", "CITREA"].includes(layerType);
  return isBitcoinBased ? formatPriceBtc(amount) : formatPriceEth(amount);
};

// Get decimal places for a specific currency based on layer type
export const getDecimalsForLayer = (layerType: string): number => {
  const config = WALLET_CONFIGS[layerType];
  return config?.networks?.TESTNET?.nativeCurrency?.decimals || 
    (["BITCOIN", "CITREA"].includes(layerType) ? 8 : 18);
};

// Function to convert layer-specific balance to USD
export const getUsdValueForLayer = (amount: number, layerType: string, currentLayer: any): number => {
  if (!amount || !currentLayer) return 0;
  
  // Use the appropriate price based on layer type
  let price = 0;
  
  if (["BITCOIN", "CITREA"].includes(layerType)) {
    price = currentLayer?.price || 97500; // BTC price with fallback
  } else {
    price = currentLayer?.price || 3000; // ETH price with fallback
  }
  
  return amount * price;
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

// Get network information for a given layer
export const getNetworkInfo = (layerType: string) => {
  const config = WALLET_CONFIGS[layerType];
  return config?.networks?.TESTNET || null;
};

// Helper function to get the block explorer URL for a transaction hash
export const getBlockExplorerUrl = (layerType: string, txHash: string): string => {
  const config = WALLET_CONFIGS[layerType];
  
  // If no config is found, return empty string
  if (!config) return "";
  
  // Get the block explorer URL from the config
  const blockExplorerUrl = config.networks?.TESTNET?.blockExplorerUrls?.[0];
  
  // If no block explorer URL is found, return empty string
  if (!blockExplorerUrl) return "";
  
  // Format the transaction URL based on layer type
  if (layerType === "BITCOIN") {
    return `${blockExplorerUrl}/tx/${txHash}`;
  } else {
    // For Ethereum-based chains like CITREA, SEPOLIA, HEMI, etc.
    // Remove trailing slash if it exists to ensure consistent formatting
    const baseUrl = blockExplorerUrl.endsWith("/") 
      ? blockExplorerUrl.slice(0, -1) 
      : blockExplorerUrl;
    
    return `${baseUrl}/tx/${txHash}`;
  }
};

// Helper function to get block explorer URL for an address
export const getAddressExplorerUrl = (layerType: string, address: string): string => {
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

// Helper function to get the raw block explorer base URL
export const getBlockExplorerBaseUrl = (layerType: string): string => {
  const config = WALLET_CONFIGS[layerType];
  
  // If no config is found, return empty string
  if (!config) return "";
  
  // Get the block explorer URL from the config
  const blockExplorerUrl = config.networks?.TESTNET?.blockExplorerUrls?.[0];
  
  // If no block explorer URL is found, return empty string
  if (!blockExplorerUrl) return "";
  
  // Remove trailing slash if it exists
  return blockExplorerUrl.endsWith("/") 
    ? blockExplorerUrl.slice(0, -1) 
    : blockExplorerUrl;
};
