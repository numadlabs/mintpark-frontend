"use client";
import React, { useMemo } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreationFlow } from "./CreationFlowProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "../provider/auth-context-provider";
import { getCurrencyImage } from "@/lib/service/currencyHelper";
import Image from "next/image";
import { toast } from "sonner";

interface ChainSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChainSelectionModal({
  isOpen,
  onClose,
}: ChainSelectionModalProps) {
  const { updateCollectionData, setCurrentStep } = useCreationFlow();
  const router = useRouter();

  const {
    availableLayers,
    currentLayer,
    selectedLayerId,
    setSelectedLayerId,
    switchLayer,
    isConnected,
    user,
  } = useAuth();

  const displayLayers = useMemo(() => {
    return availableLayers.filter(
      (layer) =>
        layer.layer !== "BITCOIN" &&
        layer.name !== "Hemi Testnet" &&
        layer.name !== "EDU Chain Testnet" &&
        layer.name !== "EDU Chain" &&
        layer.name !== "CORE Testnet"
    );
  }, [availableLayers]);

  console.log("availableLayers in modal", availableLayers);

  // const handleChainSelect = async (layerId: string) => {
  //   const selected = availableLayers.find((l) => l.id === layerId);
  //   if (!selected) return;

  //   if (layerId === selectedLayerId) {
  //     toast.info("Already on this chain.");
  //     return;
  //   }

  //   setSelectedLayerId(layerId); // update UI selection immediately
  //   updateCollectionData({ layerId }); // update creation flow
  //   setCurrentStep(1);
  //   onClose();

  //   try {
  //     if (isConnected && user) {
  //       console.log("Switching layer from modal:", selected.name);
  //       await switchLayer(selected);
  //       toast.success(`Switched to ${selected.name}`);
  //     } else {
  //       localStorage.setItem("selectedLayer", selected.layer);
  //       localStorage.setItem("selectedNetwork", selected.network);
  //       toast.success(`Selected ${selected.name} for future connection`);
  //     }
  //   } catch (err) {
  //     console.error("Layer switch failed", err);
  //     toast.error("Failed to switch layer");
  //     setSelectedLayerId(currentLayer?.id || null); // revert on error
  //   }
  // };

  const handleChainSelect = async (layerId: string) => {
    const selected = availableLayers.find((l) => l.id === layerId);
    if (!selected) return;

    if (layerId === selectedLayerId) {
      updateCollectionData({ layerId });
      setCurrentStep(1);
      onClose();
      return;
    }

    setSelectedLayerId(layerId);
    updateCollectionData({ layerId });
    setCurrentStep(1);
    onClose();

    try {
      if (isConnected && user) {
        console.log("Switching layer from modal:", selected.name);
        await switchLayer(selected);
        toast.success(`Switched to ${selected.name}`);
      } else {
        localStorage.setItem("selectedLayer", selected.layer);
        localStorage.setItem("selectedNetwork", selected.network);
        toast.success(`Selected ${selected.name} for future connection`);
      }
    } catch (err) {
      console.error("Layer switch failed", err);
      toast.error("Failed to switch layer");
      setSelectedLayerId(currentLayer?.id || null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-darkPrimary border border-transLight4 rounded-2xl p-8 max-w-6xl w-full mx-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            Choose a Chain to Create a Collection
          </h2>
          <button
            onClick={() => router.push("/creater-tool")}
            className="text-lightSecondary hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
          {displayLayers.map((layer) => (
            <div
              key={layer.id}
              className="bg-darkSecondary border border-transLight4 rounded-xl p-5 w-[320px] h-auto cursor-pointer hover:border-transLight16"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-transLight8 rounded-xl flex items-center justify-center mb-4">
                  <Image
                    src={getCurrencyImage(layer.layer)}
                    alt={layer.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {layer.name}
                </h3>
              </div>

              {layer.name === "Citrea Testnet" ? (
                <Button
                  disabled
                  className="w-full bg-transLight12 text-white cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              ) : (
                <Button
                  onClick={() => handleChainSelect(layer.id)}
                  className="w-full bg-white cursor-pointer text-black hover:bg-gray-200"
                >
                  Choose
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
