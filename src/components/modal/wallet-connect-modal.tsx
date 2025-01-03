import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getAllLayers } from "@/lib/service/queryHelper";
import { useAuth } from "../provider/auth-context-provider";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
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

  const {
    authState,
    setLayers,
    proceedWithLinking,
    connectWallet,
    disconnectWallet,
    isWalletConnected,
    selectedLayerId,
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
    }
  }, [layers, setLayers]);

  const getLayerImage = (layer: string) => {
    switch (layer) {
      case "BITCOIN":
        return "/wallets/Bitcoin.png";
      case "FRACTAL":
        return "/wallets/Fractal.png";
      case "CITREA":
        return "/wallets/Citrea.png";
      case "NUBIT":
        return "/wallets/nubit.webp";
      default:
        return "/wallets/Citrea.png";
    }
  };

  const handleConnection = async (layer: LayerTypes) => {
    if (isWalletConnected(layer.id)) {
      try {
        await disconnectWallet(layer.id);
        toast.success(`Disconnected from ${layer.layer}`);
      } catch (error) {
        toast.error(`Failed to disconnect wallet. ${error}`);
      }
      return;
    }

    try {
      await connectWallet(layer.id, authState.authenticated);
      toast.success(
        `${authState.authenticated ? "Linked" : "Connected to"} ${layer.layer}`
      );
    } catch (error) {
      if (error instanceof Error && error.message === "WALLET_ALREADY_LINKED") {
        setCurrentLayer(layer);
        setShowLinkAlert(true);
      } else {
        toast.error(
          `Failed to ${
            authState.authenticated ? "link" : "connect"
          } wallet. ${error}`
        );
      }
    }
  };

  const handleProceedWithLinking = async () => {
    try {
      await proceedWithLinking();
      toast.success(`Successfully linked wallet`);
      setShowLinkAlert(false);
    } catch (error) {
      toast.error(`Failed to link wallet: ${error}`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[384px] w-full items-center">
          <DialogHeader className="flex w-full">
            <div className="text-xl text-neutral00 font-bold text-center">
              Connect Wallet
            </div>
          </DialogHeader>
          <div className="h-[1px] w-full bg-white8" />
          <Tabs
            value={activeTab}
            defaultValue={activeTab}
            onValueChange={(value) => {
              onTabChange(value);
              const selectedLayer = layers.find(
                (layer) => layer.layer === value
              );
              if (selectedLayer) {
                onLayerSelect(selectedLayer.layer, selectedLayer.network);
              }
            }}
            className="w-full"
          >
            <TabsList className="w-full">
              <div className="grid grid-cols-3 gap-3 items-center w-full">
                {layers.map((layer: LayerTypes) => (
                  <TabsTrigger
                    key={layer.layer}
                    value={layer.layer}
                    className="w-full"
                    disabled={layer.comingSoon}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={getLayerImage(layer.layer)}
                        alt={layer.layer.toLowerCase()}
                        sizes="100%"
                      />
                    </Avatar>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
            <div className="h-[1px] w-full bg-white8 my-6" />
            {layers.map((layer: LayerTypes) => (
              <TabsContent
                key={layer.layer}
                value={layer.layer}
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
