import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getAllLayers } from "@/lib/service/queryHelper";
import { useAuth } from "../provider/auth-context-provider";
import { WALLET_CONFIGS } from "@/lib/constants";
import { getCurrencyImage } from "@/lib/service/currencyHelper";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WalletCard } from "../atom/cards/wallet-card";
import { LayerTypes } from "@/lib/types";

interface WalletConnectionModalProps {
  open: boolean;
  onClose: () => void;
  activeTab: string;
  selectedLayerId: string;
  onTabChange: (tab: string) => void;
  onLayerSelect: (layer: string, network: string) => void;
}

export function WalletConnectionModal({
  open,
  onClose,
  activeTab,
  selectedLayerId,
  onTabChange,
  onLayerSelect,
}: WalletConnectionModalProps) {
  // State management
  const [showLinkAlert, setShowLinkAlert] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<LayerTypes | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string>("");
  const initialSetupDone = useRef(false);

  // Get auth context
  const {
    authState,
    setLayers,
    proceedWithLinking,
    connectWallet,
    disconnectWallet,
    isWalletConnected,
  } = useAuth();

  // Fetch layer data
  const { data: allLayers = [] } = useQuery({
    queryKey: ["layerData"],
    queryFn: getAllLayers,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Memoize filtered layers to avoid re-filtering on every render
  const layers = useMemo(() => allLayers, [allLayers]);

  // Memoize filtered and sorted layer tabs
  const layerTabs = useMemo(() => {
    return [...layers]
      .filter((layer) => layer.layer !== "BITCOIN" 
      // && layer.layer !== "CITREA"
    )
      .sort((a, b) => {
        if (a.layer !== b.layer) {
          return a.layer.localeCompare(b.layer);
        }
        return a.network.toUpperCase() === "MAINNET" ? -1 : 1;
      });
  }, [layers]);

  // Memoize current layer object
  const currentLayerObject = useMemo(
    () => layers.find((l) => l.id === activeLayerId) || null,
    [layers, activeLayerId]
  );

  // Helper functions memoized to prevent recreating on every render
  const isMainnet = useCallback((network: string) => {
    return network.toUpperCase() === "MAINNET";
  }, []);

  // Set layers in auth context once
  useEffect(() => {
    if (layers.length > 0) {
      setLayers(layers);
    }
  }, [layers, setLayers]);

  // Initialize active layer ID
  useEffect(() => {
    if (layers.length === 0 || initialSetupDone.current) return;

    let newActiveLayerId = "";

    // Prioritized layer selection logic
    if (selectedLayerId) {
      newActiveLayerId = selectedLayerId;
    } else {
      const savedLayer = localStorage.getItem("selectedLayer");
      const savedNetwork = localStorage.getItem("selectedNetwork");

      if (savedLayer) {
        // First try exact layer + network match
        const matchingLayer = layers.find(
          (layer) =>
            layer.layer === savedLayer &&
            (savedNetwork ? layer.network === savedNetwork : true)
        );

        if (matchingLayer) {
          newActiveLayerId = matchingLayer.id;
        } else {
          // Fallback to any layer with matching name
          const anyLayer = layers.find((layer) => layer.layer === savedLayer);
          if (anyLayer) {
            newActiveLayerId = anyLayer.id;
          }
        }
      } else if (activeTab) {
        const matchingLayer = layers.find((layer) => layer.layer === activeTab);
        if (matchingLayer) {
          newActiveLayerId = matchingLayer.id;
        }
      }

      // Default fallbacks
      if (!newActiveLayerId) {
        const hemiLayer = layers.find((layer) => layer.layer === "HEMI");
        if (hemiLayer) {
          newActiveLayerId = hemiLayer.id;
        } else if (layers.length > 0) {
          newActiveLayerId = layers[0].id;
        }
      }
    }

    if (newActiveLayerId) {
      setActiveLayerId(newActiveLayerId);

      // Update parent component if needed
      const layer = layers.find((l) => l.id === newActiveLayerId);
      if (layer) {
        onTabChange(layer.layer);
      }

      initialSetupDone.current = true;
    }
  }, [layers, activeTab, selectedLayerId, onTabChange]);

  // Update when selectedLayerId changes from parent
  useEffect(() => {
    if (
      selectedLayerId &&
      selectedLayerId !== activeLayerId &&
      initialSetupDone.current
    ) {
      setActiveLayerId(selectedLayerId);

      const layer = layers.find((l) => l.id === selectedLayerId);
      if (layer) {
        onTabChange(layer.layer);
      }
    }
  }, [selectedLayerId, activeLayerId, layers, onTabChange]);

  // Switch or add chain in Metamask - memoized to prevent recreation
  const switchOrAddChain = useCallback(
    async (layer: LayerTypes): Promise<boolean> => {
      if (!layer.chainId || typeof window === "undefined" || !window.ethereum)
        return false;

      try {
        // Convert to hex format if needed
        let chainIdHex = layer.chainId;
        if (!chainIdHex.startsWith("0x")) {
          chainIdHex = `0x${parseInt(layer.chainId).toString(16)}`;
        }

        // Try to switch chain
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });

        return true;
      } catch (error: any) {
        // Handle different error cases
        if (error.code === 4902) {
          try {
            const walletConfig = WALLET_CONFIGS[layer.layer];
            if (!walletConfig) return false;

            const networkType = layer.network.toUpperCase();
            const networkConfig = walletConfig.networks[networkType];
            if (!networkConfig) return false;

            // Add the chain to Metamask
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: layer.chainId,
                  chainName: layer.name || `${layer.layer} ${layer.network}`,
                  rpcUrls: networkConfig.rpcUrls,
                  blockExplorerUrls: networkConfig.blockExplorerUrls,
                  nativeCurrency: networkConfig.nativeCurrency || {
                    name: layer.name,
                    symbol: layer.layer.substring(0, 5),
                    decimals: 18,
                  },
                },
              ],
            });

            // Try switching again after adding
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: layer.chainId }],
            });

            return true;
          } catch (addError: any) {
            console.error("Failed to add chain:", addError);
            return false;
          }
        } else if (error.code === 4001) {
          console.log("User rejected chain switch");
          return false;
        } else {
          console.error("Error switching chain:", error);
          return false;
        }
      }
    },
    []
  );

  // Handle wallet connection
  const handleConnection = useCallback(
    async (layer: LayerTypes) => {
      // Handle disconnect
      if (isWalletConnected(layer.id)) {
        try {
          await disconnectWallet(layer.id);
          toast.success(`Disconnected from ${layer.name}`);
        } catch (error) {
          toast.error(`Failed to disconnect wallet. ${error}`);
        }
        return;
      }

      // Handle connect
      try {
        // Switch chain for Metamask wallets
        if (
          layer.chainId &&
          window.ethereum &&
          WALLET_CONFIGS[layer.layer]?.type === "metamask"
        ) {
          await switchOrAddChain(layer);
        }

        // Connect wallet
        await connectWallet(layer.id, authState.authenticated);
        onClose();
        toast.success(
          `${authState.authenticated ? "Linked" : "Connected to"} ${layer.name}`
        );
      } catch (error: any) {
        if (
          error instanceof Error &&
          error.message === "WALLET_ALREADY_LINKED"
        ) {
          setCurrentLayer(layer);
          setShowLinkAlert(true);
        } else {
          toast.error(`Failed to connect: ${error.message}`);
        }
      }
    },
    [
      isWalletConnected,
      disconnectWallet,
      switchOrAddChain,
      connectWallet,
      authState.authenticated,
      onClose,
    ]
  );

  // Handle wallet linking confirmation
  const handleProceedWithLinking = useCallback(async () => {
    try {
      await proceedWithLinking();
      toast.success(`Successfully linked wallet.`);
      setShowLinkAlert(false);
    } catch (error) {
      toast.error(`Failed to link wallet: ${error}`);
    }
  }, [proceedWithLinking]);

  // Handle layer selection
  const handleLayerSelect = useCallback(
    (layerId: string) => {
      if (!layerId || layerId === activeLayerId) return;

      setActiveLayerId(layerId);

      // Find the selected layer
      const layer = layers.find((l) => l.id === layerId);
      if (layer) {
        // Update parent state
        onTabChange(layer.layer);
        onLayerSelect(layer.layer, layer.network);

        // Store in localStorage
        localStorage.setItem("selectedLayer", layer.layer);
        localStorage.setItem("selectedNetwork", layer.network);

        // Switch chain if needed
        if (
          layer.chainId &&
          window.ethereum &&
          WALLET_CONFIGS[layer.layer]?.type === "metamask"
        ) {
          switchOrAddChain(layer);
        }
      }
    },
    [activeLayerId, layers, onTabChange, onLayerSelect, switchOrAddChain]
  );

  // Memoize alert dialog to prevent unnecessary re-renders
  const alertDialog = useMemo(
    () => (
      <AlertDialog open={showLinkAlert} onOpenChange={setShowLinkAlert}>
        <AlertDialogContent className="border rounded-2xl border-white8">
          <AlertDialogHeader className="grid gap-4">
            <AlertDialogTitle className="text-xl text-white font-bold">
              Wallet Already Linked
            </AlertDialogTitle>
            <AlertDialogDescription className="font-semibold text-white text-md2">
              This wallet is already linked to another account. Would you like
              to move it to your current account instead?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLinkAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedWithLinking}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [showLinkAlert, setShowLinkAlert, handleProceedWithLinking]
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[384px] w-full items-center">
          <DialogTitle className="flex w-full">
            <div className="text-xl text-neutral00 font-bold text-center">
              Connect Wallet
            </div>
          </DialogTitle>
          <div className="h-[1px] w-full bg-white8" />
          <Tabs
            value={activeLayerId}
            defaultValue={activeLayerId}
            onValueChange={handleLayerSelect}
            className="w-full"
          >
            <TabsList className="w-full">
              <div className="grid grid-cols-3 gap-3 items-center w-full">
                {layerTabs.map((layer) => (
                  <TabsTrigger
                    key={layer.id}
                    value={layer.id}
                    className="w-full"
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

            {layerTabs.map((layer) => (
              <TabsContent
                key={layer.id}
                value={layer.id}
                className="flex flex-col gap-4"
              >
                <WalletCard
                  layer={layer}
                  isWalletConnected={isWalletConnected}
                  loading={authState.loading}
                  onConnect={handleConnection}
                />
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter className="text-md text-neutral100">
            Choose wallet to Log In or Sign Up
          </DialogFooter>
          <button
            className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
            onClick={onClose}
          >
            <X size={24} color="#D7D8D8" />
          </button>
        </DialogContent>
      </Dialog>

      {alertDialog}
    </>
  );
}
