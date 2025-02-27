import { WALLET_CONFIGS } from "../../lib/constants";

// Helper function to get currency symbol based on layer type
export const getCurrencySymbol = (layerType: string): string => {
  switch (layerType) {
    case "BITCOIN":
      return "BTC";
    case "CITREA":
      return "cBTC";
    case "SEPOLIA":
    case "HEMI":
    case "POLYGON_ZK":
    case "EDU":
      return "ETH";
    default:
      return "BTC"; // Default fallback
  }
};

// Helper function to get appropriate image for currency
export const getCurrencyImage = (layerType: string): string => {
  // You can expand this to use different images for different currencies
  const config = WALLET_CONFIGS[layerType];
  return config?.icon || WALLET_CONFIGS.BITCOIN.icon;
};

// Function to format balance based on layer type
export const formatBalanceForLayer = (amount: number, layerType: string): string => {
  switch (layerType) {
    case "BITCOIN":
    case "CITREA":
      return formatPriceBtc(amount);
    case "SEPOLIA":
    case "HEMI":
    case "POLYGON_ZK":
    case "EDU":
      return formatPriceEth(amount);
    default:
      return formatPriceBtc(amount);
  }
};

// Function to convert layer-specific balance to USD
export const getUsdValueForLayer = (amount: number, layerType: string, currentLayer: any): number => {
  if (!amount || !currentLayer) return 0;
  
  // Use the appropriate price based on layer type
  let price = 0;
  
  if (layerType === "BITCOIN" || layerType === "CITREA") {
    price = 97500; // BTC price example or you can use currentLayer.price
  } else if (["SEPOLIA", "HEMI", "POLYGON_ZK", "EDU"].includes(layerType)) {
    price = currentLayer?.price || 3000; // ETH price example
  }
  
  return amount * price;
};

// Format BTC price (existing function)
export const formatPriceBtc = (value: number): string => {
  if (!value) return "0.00";
  return value.toFixed(8);
};

// Format ETH price
export const formatPriceEth = (value: number): string => {
  if (!value) return "0.00";
  return value.toFixed(6);
};

// Format USD price (existing function)
export const formatPriceUsd = (value: number): string => {
  if (!value) return "0.00";
  return value.toFixed(2);
};
