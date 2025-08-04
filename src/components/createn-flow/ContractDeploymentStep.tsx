"use client";
import React, { useState } from "react";
import { Upload, Edit, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewCollectionData, useCreationFlow } from "./CreationFlowProvider";
import Image from "next/image";
import { newCreateCollection } from "@/lib/service/postRequest";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../provider/auth-context-provider";
import { sendTransaction } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmiConfig';

export function ContractDeploymentStep() {
  const { collectionData, updateCollectionData, setCurrentStep } =
    useCreationFlow();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { currentLayer, currentUserLayer } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: newCreateCollection,
  });

  console.log("currenLayer layerID", currentLayer?.id);
  console.log("currenUserLayer useLayerId", currentUserLayer?.id);

  const handleCreateCollection = async () => {
    // Validation
    if (!collectionData.name || !collectionData.logo) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!currentLayer) {
      toast.error("Layer information not available");
      return;
    }

    if (currentLayer.layerType === "EVM" && !window.ethereum) {
      toast.error("Please install MetaMask extension to continue");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the collection data
      const collectionParams: NewCollectionData = {
        name: collectionData?.name,
        // symbol: collectionData?.symbol || "",
        logo: collectionData?.logo,
        description: collectionData?.description,
        type: "RECURSIVE_INSCRIPTION",
        layerId: currentLayer?.id || null, // Use selectedChain or fallback
        userLayerId: currentUserLayer?.id || null, // Use currentLayer.id directly, not from collectionData
      };
      
      // Call the API to create collection
      const response = await createCollectionMutation({
        data: collectionParams,
      });

      if (response && response.success) {
        const { deployContractTxHex } = response.data;
        console.log("Collection created successfully:", {
          deployContractTxHex,
        });
        
        // If we have a contract deployment transaction and we're on EVM
        if (deployContractTxHex && currentLayer.layerType === "EVM") {
          try {
            // Parse the transaction hex data to get transaction parameters
            // Assuming deployContractTxHex contains the necessary transaction data
            const txHash = await sendTransaction(wagmiConfig, {
              to: deployContractTxHex.to,
              data: deployContractTxHex.data,
              value: deployContractTxHex.value || '0x0',
              gas: deployContractTxHex.gas,
              gasPrice: deployContractTxHex.gasPrice,
              // Add other necessary transaction parameters as needed
            });

            console.log("Contract deployed with tx hash:", txHash);
            // You might want to store this tx hash somewhere
            
          } catch (contractError) {
            console.error("Error deploying contract:", contractError);
            toast.error("Collection created but contract deployment failed");
            // You might still want to proceed to next step even if contract deployment fails
          }
        }

        // call to Create launch api logic.  collectionData
        // Move to next step
        setCurrentStep(2);

        toast.success("Collection created successfully!");
      } else {
        throw new Error("Failed to create collection");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error creating collection. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateCollectionData({ logo: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateCollectionData({ logo: null });
    setLogoPreview(null);
  };

  const isFormValid = collectionData.name && collectionData.logo;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Let&apos;s Upload Your Contract
        </h1>
        <p className="text-lightSecondary">
          Enter your collection details to deploy ERC-721 contract.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="text-white font-medium">Collection logo</label>

          {logoPreview ? (
            <div className="relative">
              <div className="w-full h-48 bg-darkSecondary border border-transLight4 rounded-xl overflow-hidden">
                <Image
                  src={logoPreview}
                  alt="Collection logo preview"
                  className="w-full h-full object-cover"
                  width={300}
                  height={200}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                  className="p-2 bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-opacity"
                >
                  <Edit size={16} className="text-white" />
                </button>
                <button
                  onClick={handleRemoveLogo}
                  className="p-2 bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-opacity"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="w-full h-48 border-2 border-dashed border-transLight16 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-transLight24 transition-colors"
            >
              <Upload size={32} className="text-lightSecondary mb-2" />
              <p className="text-lightSecondary font-medium">
                Click to upload Collection logo
              </p>
              <p className="text-sm text-lightTertiary mt-1">
                Supports: JPG, PNG, WEBP, GIF
              </p>
            </div>
          )}

          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Collection name
            </label>
            <Input
              value={collectionData.name}
              onChange={(e) => updateCollectionData({ name: e.target.value })}
              placeholder="Enter your collection name (Hemi Bros etc.)"
              className="bg-darkSecondary border-transLight8 text-white placeholder:text-lightTertiary"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">
              Description
            </label>
            <Input
              value={collectionData.description}
              onChange={(e) =>
                updateCollectionData({ description: e.target.value })
              }
              placeholder="Enter your collection name (Hemi Bros etc.)"
              className="bg-darkSecondary border-transLight8 text-white placeholder:text-lightTertiary"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Token symbol
            </label>
            <Input
              value={collectionData.symbol}
              onChange={(e) => updateCollectionData({ symbol: e.target.value })}
              placeholder="Enter your token symbol (HEMI etc.)"
              className="bg-darkSecondary border-transLight8 text-white placeholder:text-lightTertiary"
            />
          </div>

          <Button
            onClick={handleCreateCollection}
            disabled={!isFormValid}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-transLight8 disabled:text-lightTertiary"
          >
            {isLoading ? (
              <Loader2
                className="animate-spin w-full"
                color="#111315"
                size={24}
              />
            ) : (
              "   Publish Contract"
            )}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}