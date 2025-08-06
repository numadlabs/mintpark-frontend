"use client";
import React, { useState } from "react";
import { Upload, Edit, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewCollectionData, useCreationFlow } from "./CreationFlowProvider";
import Image from "next/image";
import {
  newCreateCollection,
  newCreateLaunch,
} from "@/lib/service/postRequest";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../provider/auth-context-provider";
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmiConfig";

export function ContractDeploymentStep() {
  const { collectionData, updateCollectionData, setCurrentStep, setCollectionId } =
    useCreationFlow();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { currentLayer, currentUserLayer } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: newCreateCollection,
  });

  const { mutateAsync: createLaunchMutation } = useMutation({
    mutationFn: newCreateLaunch,
  });
  
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
      // Step 1: Create the collection
      const collectionParams: NewCollectionData = {
        name: collectionData?.name,
        logo: collectionData?.logo,
        description: collectionData?.description,
        type: "RECURSIVE_INSCRIPTION",
        layerId: currentLayer?.id || null,
        userLayerId: currentUserLayer?.id || null,
      };

      // Call the API to create collection
      const collectionResponse = await createCollectionMutation({
        data: collectionParams,
      });

      if (!collectionResponse.success) {
        if (collectionResponse.error) {
          toast.error(`Error: ${collectionResponse.error}`);
        } else {
          throw new Error(
            "Unknown error creating collection. Please try again later or contact support"
          );
        }
        return;
      }

      console.log("Collection created successfully:", {
        deployContractTxHex: collectionResponse.data.deployContractTxHex,
      });

      // Store the collectionId in the context
      const collectionId = collectionResponse.data.l2Collection.id;
      setCollectionId(collectionId);

      // Initialize contractTxHash variable
      let contractTxHash = "";

      // Handle contract deployment for EVM chains
      const { deployContractTxHex } = collectionResponse.data;
      if (deployContractTxHex && currentLayer.layerType === "EVM") {
        // Send the transaction
        const txHash = await sendTransaction(wagmiConfig, {
          to: deployContractTxHex.to,
          data: deployContractTxHex.data,
          value: deployContractTxHex.value || "0x0",
          gas: deployContractTxHex.gas,
          gasPrice: deployContractTxHex.gasPrice,
        });

        // Wait for 1 block confirmation
        toast.info("Waiting for transaction confirmation...");
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
          confirmations: 1,
        });

        contractTxHash = txHash;
        toast.success("Contract deployed successfully!");
      }

      // Step 2: Create the launch
      const launchResponse = await createLaunchMutation({
        collectionId: collectionId, // Use the stored collectionId
        poStartsAt: 1,
        poEndsAt: 10,
        poMintPrice: 0,
        poMaxMintPerWallet: 1,
        userLayerId: currentUserLayer?.id || "",
        txid: contractTxHash || "",
      });

      if (!launchResponse.success) {
        if (launchResponse.error) {
          toast.error(`Error: ${launchResponse.error}`);
        } else {
          toast.error("Unknown error creating launch. Please try again later or contact support");
        }
        return;
      }

      console.log("Launch created successfully:", launchResponse.data);
      toast.success("Collection and launch created successfully!");

      // Move to next step only if both collection and launch are successful
      setCurrentStep(2);

    } catch (error) {
      console.error("Error in handleCreateCollection:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
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
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex gap-16">
        {/* Logo Upload */}
        <div className="w-full">
          {logoPreview ? (
            <div className="relative">
              <div className="h-[400px] w-[400px] bg-darkSecondary border border-transLight4 rounded-lg overflow-hidden">
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
              className="w-[400px] h-[400px] border-2 border-dashed border-transLight16 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-transLight24 transition-colors"
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
        <div className="w-full grid gap-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Let&apos;s Upload Your Contract
            </h1>
            <p className="text-lightSecondary text-lg">
              Enter your collection details to deploy ERC-721 contract.
            </p>
          </div>
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
              placeholder="Enter your collection description"
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
            disabled={!isFormValid || isLoading}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-transLight8 disabled:text-lightTertiary"
          >
            {isLoading ? (
              <Loader2
                className="animate-spin w-full"
                color="#111315"
                size={24}
              />
            ) : (
              "Publish Contract"
            )}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}