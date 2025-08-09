import { WALLET_CONFIGS } from "../constants";
import { Layer, NetworkConfig, WalletConfig } from "../types/wallet";

// utils/wallet.ts
export const getWalletConfigForLayer = (layer: Layer): WalletConfig | null => {
  return WALLET_CONFIGS[layer.layer] || null;
};

export const getNetworkConfigForLayer = (
  layer: Layer
): NetworkConfig | null => {
  const walletConfig = getWalletConfigForLayer(layer);
  if (!walletConfig) return null;

  return walletConfig.networks[layer.network] || null;
};

export const isEVMLayer = (layer: Layer): boolean => {
  return layer.layerType === "EVM";
};

export const getChainIdAsNumber = (chainId: string | null): number | null => {
  if (!chainId) return null;

  // Handle hex format
  if (chainId.startsWith("0x")) {
    return parseInt(chainId, 16);
  }

  // Handle decimal format
  return parseInt(chainId, 10);
};

export const getChainIdAsHex = (chainId: string | null): string | null => {
  if (!chainId) return null;

  // Already hex format
  if (chainId.startsWith("0x")) {
    return chainId;
  }

  // Convert decimal to hex
  return `0x${parseInt(chainId, 10).toString(16)}`;
};
