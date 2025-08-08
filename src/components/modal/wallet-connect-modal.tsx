import React, { useState, useCallback, useMemo, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../provider/auth-context-provider";
import { getCurrencyImage } from "@/lib/service/currencyHelper";
import { useAccount, useSwitchChain } from "wagmi";
import { getWagmiChainByLayerConfig } from "@/lib/wagmiConfig";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { WalletCard } from "../atom/cards/wallet-card";
import { LayerTypes } from "@/lib/types";
import Image from "next/image";

interface WalletConnectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedLayerId?: string | null;
}

type ConnectionStep = "select" | "connect" | "sign";

export function WalletConnectionModal({
  open,
  onClose,
}: WalletConnectionModalProps) {
  const {
    isConnected,
    currentLayer,
    isLoading,
    availableLayers,
    connectWallet,
    switchLayer,
    authenticateWithWallet,
    disconnectWallet,
    selectedLayerId,
    setSelectedLayerId,
  } = useAuth();

  const { switchChain } = useSwitchChain();
  const { isConnected: isWagmiConnected } = useAccount();

  const [currentStep, setCurrentStep] = useState<ConnectionStep>("select");
  const [selectedLayer, setSelectedLayer] = useState<LayerTypes | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Filter and sort layers for display
  const displayLayers = useMemo(() => {
    if (process.env.NODE_ENV == "development") {
      return availableLayers;
    }
    return [...availableLayers]
      .filter(
        (layer) =>
          layer.layer !== "BITCOIN" &&
          layer.name !== "Hemi Testnet" &&
          layer.name !== "EDU Chain Testnet" &&
          layer.name !== "EDU Chain" &&
          layer.name !== "CORE Testnet"
      )
      .sort((a, b) => {
        if (a.layer !== b.layer) {
          return a.layer.localeCompare(b.layer);
        }
        return a.network.toUpperCase() === "MAINNET" ? -1 : 1;
      });
  }, [availableLayers]);

  // Helper functions
  const isMainnet = useCallback((network: string) => {
    return network.toUpperCase() === "MAINNET";
  }, []);

  // Chain switching functionality using wagmi
  const switchToChain = useCallback(
    async (layer: LayerTypes): Promise<boolean> => {
      if (!layer.chainId) {
        console.warn("No chain ID provided for layer:", layer.name);
        return false;
      }

      try {
        const wagmiChain = getWagmiChainByLayerConfig(
          layer.layer,
          layer.network
        );

        if (!wagmiChain) {
          console.error("Wagmi chain configuration not found for:", layer.name);
          toast.error(`Chain configuration not found for ${layer.name}`);
          return false;
        }

        console.log(
          "Switching to chain with wagmi:",
          wagmiChain.name,
          wagmiChain.id
        );

        await switchChain({ chainId: wagmiChain.id });
        return true;
      } catch (error: any) {
        console.error("Chain switch error:", error);

        if (error.code === 4001) {
          toast.message("User rejected chain switch");
        } else if (error.code === 4902) {
          toast.error(`Please add ${layer.name} to your wallet first`);
        } else {
          toast.error("Error switching chain");
        }

        return false;
      }
    },
    [switchChain]
  );

  //todo: switch chain ene component dotroos avj hayh

  // Handle wallet connection step
  const handleWalletConnect = useCallback(
    async (layer: LayerTypes) => {
      try {
        setSelectedLayer(layer);
        setIsConnecting(true);
        setCurrentStep("connect");

        // Switch chain if needed
        if (layer.chainId) {
          const chainSwitchSuccess = await switchToChain(layer);
          if (!chainSwitchSuccess) {
            setCurrentStep("select");
            setIsConnecting(false);
            return;
          }
          connectWallet(layer.id);
        }

        // Connect wallet without auto-signing
        console.log("Connecting to layer:", layer.name);

        // Here we would call a modified connectWallet that doesn't auto-sign
        // For now, we'll simulate the connection and move to sign step

        setCurrentStep("sign");
        setIsConnecting(false);
      } catch (error: any) {
        console.error("Connection error:", error);
        setCurrentStep("select");
        setIsConnecting(false);

        if (error.message?.includes("User rejected") || error.code === 4001) {
          toast.message("Connection cancelled by user");
        } else {
          toast.error(`Failed to connect: ${error.message || "Unknown error"}`);
        }
      }
    },
    [disconnectWallet, switchToChain]
  );

  // Handle signing step
  const handleSign = useCallback(async () => {
    if (!selectedLayer) return;

    try {
      setIsSigning(true);

      // Call the authentication with wallet
      await authenticateWithWallet(selectedLayer.id);

      onClose();
      toast.success(`Connected to ${selectedLayer.name}`);

      // Reset state
      setCurrentStep("select");
      setSelectedLayer(null);
    } catch (error: any) {
      console.error("Signing error:", error);

      if (error.message?.includes("User rejected") || error.code === 4001) {
        toast.message("Signing cancelled by user");
      } else if (error.message?.includes("WALLET_ALREADY_LINKED")) {
        toast.message("Wallet already linked to another account");
      } else {
        toast.error(`Failed to sign: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSigning(false);
    }
  }, [selectedLayer, connectWallet, onClose]);

  // Handle layer selection in tabs
  const handleLayerSelect = useCallback(
    async (layerId: string) => {
      if (!layerId || layerId === selectedLayerId) return;

      setSelectedLayerId(layerId);

      const layer = displayLayers.find((l) => l.id === layerId);
      if (!layer) return;

      // Store selection in localStorage
      localStorage.setItem("selectedLayer", layer.layer);
      localStorage.setItem("selectedNetwork", layer.network);

      // If already connected and this is a different layer, switch to it
      if (isConnected && currentLayer?.id !== layerId) {
        try {
          if (layer.chainId) {
            await switchToChain(layer);
          }

          await switchLayer(layer);
          toast.success(`Switched to ${layer.name}`);
        } catch (error) {
          console.error("Failed to switch layer:", error);
          toast.error("Failed to switch layer");
        }
      } else if (!isConnected && layer.chainId) {
        await switchToChain(layer);
      }
    },
    [
      selectedLayerId,
      displayLayers,
      isConnected,
      currentLayer,
      switchLayer,
      switchToChain,
    ]
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setCurrentStep("select");
      setSelectedLayer(null);
      setIsConnecting(false);
      setIsSigning(false);

      const targetLayerId = currentLayer?.id || selectedLayerId || "";
      if (targetLayerId && targetLayerId !== selectedLayerId) {
        setSelectedLayerId(targetLayerId);
      }
    }
  }, [open, currentLayer, selectedLayerId]);

  const handleBack = () => {
    if (currentStep === "connect" || currentStep === "sign") {
      setCurrentStep("select");
      setSelectedLayer(null);
      setIsConnecting(false);
      setIsSigning(false);
    }
  };

  //todo:refactor hiigeed gazraas helper function uud duudah
  const getWalletImage = (layer: string) => {
    switch (layer) {
      case "BITCOIN":
        return "/wallets/Unisat.png";
      case "CITREA":
        return "/wallets/Metamask.png";
      case "SEPOLIA":
        return "/wallets/Metamask.png";
      case "HEMI":
        return "/wallets/Metamask.png";
      case "EDUCHAIN":
        return "/wallets/Metamask.png";
      case "CORE":
        return "/wallets/Metamask.png";
      default:
        return "/wallets/Unisat.png";
    }
  };

  const getWalletName = (layer: string) => {
    switch (layer) {
      case "BITCOIN":
        return "Unisat Wallet";
      case "CITREA":
        return "MetaMask Wallet";
      case "SEPOLIA":
        return "MetaMask Wallet";
      case "HEMI":
        return "MetaMask Wallet";
      case "EDUCHAIN":
        return "MetaMask Wallet";
      case "CORE":
        return "MetaMask Wallet";
      default:
        return "Wallet";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[384px] w-full items-center">
        {/* Header */}
        <DialogTitle className="flex w-full">
          <div className="text-xl text-neutral00 font-bold text-center">
            {currentStep === "select" && "Connect Wallet"}
            {currentStep === "connect" && "Connecting..."}
            {currentStep === "sign" && "Sign Message"}
          </div>
        </DialogTitle>

        <div className="h-[1px] w-full bg-white8" />

        {/* Select Layer Step */}
        {currentStep === "select" && selectedLayerId && (
          <Tabs
            value={selectedLayerId}
            onValueChange={handleLayerSelect}
            className="w-full"
          >
            <TabsList className="w-full">
              <div
                className="grid gap-3 items-center w-full"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    displayLayers.length,
                    3
                  )}, 1fr)`,
                }}
              >
                {displayLayers.map((layer) => (
                  <TabsTrigger
                    key={layer.id}
                    value={layer.id}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={getCurrencyImage(layer.layer)}
                          alt={layer.layer.toLowerCase()}
                          sizes="100%"
                        />
                      </Avatar>
                      {!isMainnet(layer.network) && (
                        <div className="absolute flex -top-5 gap-1 items-center -right-12 bg-brand px-2 rounded-full">
                          <span className="w-2 h-2 bg-neutral500 rounded-full animate-pulse"></span>
                          <p className="text-black text-[9px] font-bold">
                            Testnet
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>

            <div className="h-[1px] w-full bg-white8 my-6" />

            {displayLayers.map((layer) => (
              <TabsContent
                key={layer.id}
                value={layer.id}
                className="flex flex-col gap-4"
              >
                <WalletCard
                  layer={layer}
                  // isWalletConnected={isWalletConnected}
                  loading={isLoading}
                  onConnect={handleWalletConnect}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Connection Step */}
        {currentStep === "connect" && selectedLayer && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={getCurrencyImage(selectedLayer.layer)}
                  alt={selectedLayer.layer.toLowerCase()}
                />
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral00">
                  Connecting to {selectedLayer.name}
                </h3>
                <p className="text-sm text-neutral100 mt-1">
                  Please approve the connection in your wallet
                </p>
              </div>
            </div>

            {isConnecting && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-neutral100">Connecting...</span>
              </div>
            )}
          </div>
        )}

        {/* Sign Message Step */}
        {currentStep === "sign" && selectedLayer && (
          <div className="flex flex-col items-center gap-6 w-full">
            {/* {!isConnecting } */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={getCurrencyImage(selectedLayer.layer)}
                    alt={selectedLayer.layer.toLowerCase()}
                  />
                </Avatar>
                <div className="w-8 h-[1px] bg-white8"></div>
                <Image
                  src={getWalletImage(selectedLayer.layer)}
                  alt="wallet"
                  className="w-12 h-12 rounded-lg"
                  height={48}
                  width={48}
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral00">
                  Sign Message
                </h3>
                <p className="text-sm text-neutral100 mt-1">
                  Sign the message in {getWalletName(selectedLayer.layer)} to
                  complete the connection
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleSign}
                disabled={isSigning}
                className="w-full py-3 px-4 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-xl transition-colors"
              >
                {isSigning ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing...
                  </div>
                ) : (
                  "Sign Message"
                )}
              </button>

              <button
                onClick={handleBack}
                disabled={isSigning}
                className="w-full py-3 px-4 border border-white8 hover:bg-white8 disabled:opacity-50 disabled:cursor-not-allowed text-neutral00 font-medium rounded-xl transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {currentStep === "select" && (
          <DialogFooter className="text-md text-neutral100">
            {isConnected
              ? "Switch between your connected wallets"
              : "Choose wallet to Log In or Sign Up"}
          </DialogFooter>
        )}

        {/* Close Button */}
        <button
          className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
          onClick={onClose}
          disabled={isConnecting || isSigning}
        >
          <X size={24} color="#D7D8D8" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
