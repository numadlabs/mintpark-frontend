import { NetworkConfig } from "@/types";

// utils/wallet.ts
export const setupEthereumChain = async (
  networkConfig: NetworkConfig,
): Promise<void> => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  if (!networkConfig.chainId) {
    throw new Error("Chain ID is required");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkConfig.chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Only add the network if all required fields are present
      if (!networkConfig.chainName || !networkConfig.rpcUrls) {
        throw new Error("Network configuration is incomplete");
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: networkConfig.chainId,
            chainName: networkConfig.chainName,
            rpcUrls: networkConfig.rpcUrls,
            blockExplorerUrls: networkConfig.blockExplorerUrls || [],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};

export const connectMetamask = async (chainId?: string | number) => {
  if (!window.ethereum) throw new Error("Metamask not installed");

  try {
    if (chainId) {
      const hexChainId =
        typeof chainId === "string"
          ? chainId.startsWith("0x")
            ? chainId
            : `0x${parseInt(chainId).toString(16)}`
          : `0x${chainId.toString(16)}`;

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (error) {
    console.error("Metamask connection failed:", error);
    throw error;
  }
};

export const connectUnisat = async () => {
  if (!window.unisat) throw new Error("Unisat not installed");

  try {
    const accounts = await window.unisat.requestAccounts();
    return accounts[0];
  } catch (error) {
    console.error("Unisat connection failed:", error);
    throw error;
  }
};
