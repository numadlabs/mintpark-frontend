import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getAllLayers } from "@/lib/service/queryHelper";
import { useAuth } from "../provider/auth-context-provider";
import { WALLET_CONFIGS } from "@/lib/constants";
import { getCurrencyImage } from "@/lib/service/currencyHelper";
import { capitalizeFirstLetter } from "@/lib/utils";

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
  onTabChange: (tab: string) => void;
  onLayerSelect: (layer: string, network: string) => void;
}

export function WalletConnectionModal({
  open,
  onClose,
  activeTab,
  onTabChange,
  onLayerSelect,
}: WalletConnectionModalProps) {
  const [showLinkAlert, setShowLinkAlert] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<LayerTypes | null>(null);
  // Track the complete selectedLayerId with network
  const [activeLayerId, setActiveLayerId] = useState<string>("");

  const {
    authState,
    setLayers,
    proceedWithLinking,
    connectWallet,
    disconnectWallet,
    isWalletConnected,
  } = useAuth();

  const { data: layers = [] } = useQuery({
    queryKey: ["layerData"],
    queryFn: getAllLayers,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (layers.length > 0) {
      setLayers(layers);
      
      // Get saved layer and network from localStorage
      const savedLayer = localStorage.getItem("selectedLayer");
      const savedNetwork = localStorage.getItem("selectedNetwork");
      
      // Find active layer based on saved values or the activeTab prop
      if (savedLayer) {
        // Try to find layer with matching name+network
        const matchingLayer = layers.find(
          layer => layer.layer === savedLayer && 
                  (savedNetwork ? layer.network === savedNetwork : true)
        );
        
        if (matchingLayer) {
          setActiveLayerId(matchingLayer.id);
        } else {
          // Fallback to any layer with the matching name
          const anyLayer = layers.find(layer => layer.layer === savedLayer);
          if (anyLayer) {
            setActiveLayerId(anyLayer.id);
          }
        }
      } else if (activeTab) {
        // If no saved preferences but we have an activeTab from props
        const matchingLayer = layers.find(layer => layer.layer === activeTab);
        if (matchingLayer) {
          setActiveLayerId(matchingLayer.id);
        }
      }
      
      // If no layer is selected yet, pick a default
      if (!activeLayerId && layers.length > 0) {
        // Try to find HEMI layer
        const hemiLayer = layers.find(layer => layer.layer === "HEMI");
        if (hemiLayer) {
          setActiveLayerId(hemiLayer.id);
        } else {
          // Fallback to first layer
          setActiveLayerId(layers[0].id);
        }
      }
    }
  }, [layers, setLayers, activeTab, activeLayerId]);

  // Function to switch or add chain in Metamask
  const switchOrAddChain = async (layer: LayerTypes): Promise<boolean> => {
    if (!layer.chainId || typeof window === 'undefined' || !window.ethereum) return false;
    
    try {
      // Convert to hex format if needed
      let chainIdHex = layer.chainId;
      if (!chainIdHex.startsWith('0x')) {
        chainIdHex = `0x${parseInt(layer.chainId).toString(16)}`;
      }
      
      // Try to switch chain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      return true;
    } catch (error: any) {
      // Chain not added to Metamask yet
      if (error.code === 4902) {
        try {
          // Get wallet configuration
          const walletConfig = WALLET_CONFIGS[layer.layer];
          if (!walletConfig) return false;
          
          const networkType = layer.network.toUpperCase();
          const networkConfig = walletConfig.networks[networkType];
          if (!networkConfig) return false;
          
          // Add the chain to Metamask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: layer.name || `${layer.layer} ${capitalizeFirstLetter(layer.network)}`,
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
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex }],
          });
          
          return true;
        } catch (addError: any) {
          console.error("Failed to add chain:", addError);
          return false;
        }
      } else if (error.code === 4001) {
        // User rejected request
        console.log("User rejected chain switch");
        return false;
      } else {
        console.error("Error switching chain:", error);
        return false;
      }
    }
  };

  const handleConnection = async (layer: LayerTypes) => {
    if (isWalletConnected(layer.id)) {
      try {
        await disconnectWallet(layer.id);
        toast.success(`Disconnected from ${layer.name}`);
      } catch (error) {
        toast.error(`Failed to disconnect wallet. ${error}`);
      }
      return;
    }

    try {
      // If this is a Metamask wallet, try to switch chain first
      if (layer.chainId && window.ethereum && WALLET_CONFIGS[layer.layer]?.type === "metamask") {
        await switchOrAddChain(layer);
      }

      // Proceed with wallet connection
      await connectWallet(layer.id, authState.authenticated);
      onClose();
      toast.success(
        `${authState.authenticated ? "Linked" : "Connected to"} ${layer.name}`
      );
    } catch (error: any) {
      if (error instanceof Error && error.message === "WALLET_ALREADY_LINKED") {
        setCurrentLayer(layer);
        setShowLinkAlert(true);
      } else {
        toast.error(`Failed to connect: ${error.message}`);
      }
    }
  };

  const handleProceedWithLinking = async () => {
    try {
      await proceedWithLinking();
      toast.success(`Successfully linked wallet.`);
      setShowLinkAlert(false);
    } catch (error) {
      toast.error(`Failed to link wallet: ${error}`);
    }
  };

  // Handle layer selection
  const handleLayerSelect = (layerId: string) => {
    setActiveLayerId(layerId);
    
    // Find the selected layer
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      // Update state
      onTabChange(layer.layer);
      onLayerSelect(layer.layer, layer.network);
      
      // Store in localStorage
      localStorage.setItem("selectedLayer", layer.layer);
      localStorage.setItem("selectedNetwork", layer.network);
      
      // If this is a Metamask layer and we're using Metamask, try to switch chain
      if (
        layer.chainId && 
        window.ethereum &&
        WALLET_CONFIGS[layer.layer]?.type === "metamask"
      ) {
        switchOrAddChain(layer);
      }
    }
  };

  // Generate unique layer+network tabs
  const getLayerTabs = () => {
    // Sort layers so mainnet appears before testnet
    return [...layers].sort((a, b) => {
      // First sort by layer name
      if (a.layer !== b.layer) {
        return a.layer.localeCompare(b.layer);
      }
      // Then sort by network, prioritizing "mainnet" over others
      return a.network === "mainnet" ? -1 : 1;
    });
  };

  const layerTabs = getLayerTabs();
  
  // Get the current selected layer
  const getCurrentLayer = () => {
    return layers.find(l => l.id === activeLayerId) || null;
  };
  
  const currentLayerObject = getCurrentLayer();

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
                      {/* Show testnet badge for non-mainnet networks */}
                      {layer.network !== "MAINNET" && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded-full">
                          TEST
                        </div>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
            
            <div className="h-[1px] w-full bg-white8 my-6" />
            
            {/* Content for each tab */}
            {layerTabs.map((layer) => (
              <TabsContent key={layer.id} value={layer.id} className="flex flex-col gap-4">
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
    </>
  );
}
