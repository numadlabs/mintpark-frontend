"use client";
import React, { useState } from "react";
import { Folder, FileText, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreationFlow } from "./CreationFlowProvider";
import Toggle from "@/components/ui/toggle";
import { useTraitsStore } from "@/lib/store/traitsStore";
import NFTTraitsUpload from "./NftTraitsUpload";
import { toast } from "sonner";
import { createNewOrder } from "@/lib/service/postRequest";
import { useAuth } from "../provider/auth-context-provider";

// Fee calculation functions
function estimateRecursiveInscriptionFee(numItems: number, feeRate = 1) {
  const baseSize = 1000;
  const perItemSize = 100;
  const inscriptionSize = baseSize + numItems * perItemSize;

  const commitVBytes = 200;
  const commitFee = commitVBytes * feeRate;

  const DUST_THRESHOLD = 546;
  const opCodeOverheadVBytes = Math.ceil(inscriptionSize / 520) * 3;
  const revealVBytes = Math.ceil(inscriptionSize / 4) + 200;
  const revealFee =
    (revealVBytes + opCodeOverheadVBytes) * feeRate + DUST_THRESHOLD;

  return {
    commitFee: commitFee,
    revealFee: revealFee,
    totalFeeSats: commitFee + revealFee,
  };
}

function estimateRegularInscriptionFee(fileSize: number, feeRate = 1) {
  const inscriptionSize = fileSize;
  const commitVBytes = 200;
  const commitFee = commitVBytes * feeRate;

  const DUST_THRESHOLD = 546;
  const opCodeOverheadVBytes = Math.ceil(inscriptionSize / 520) * 3;
  const revealVBytes = Math.ceil(inscriptionSize / 4) + 180;
  const revealFee =
    (revealVBytes + opCodeOverheadVBytes) * feeRate + DUST_THRESHOLD;

  return {
    commitFee: commitFee,
    revealFee: revealFee,
    totalFeeSats: commitFee + revealFee,
  };
}

export function TraitsUploadStep() {
  const {
    setCurrentStep,
    updateInscriptionData,
    setIsLoading,
    collectionId,
    traitData,
    updateTraitData, // CreationFlow-аас trait data update хийх
  } = useCreationFlow();

  // useTraitsStore-г зөвхөн validation-д ашиглах
  const { validationErrors, isValidating, validateJsonFile } = useTraitsStore();

  const [isOneOfOneEnabled, setIsOneOfOneEnabled] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { currentUserLayer } = useAuth();

  const handleFileUpload =
    (type: "traitAssets" | "oneOfOneEditions" | "metadataJson") =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        if (type === "metadataJson") {
          const file = files[0];
          // CreationFlow-д хадгалах
          updateTraitData({ [type]: file });
          // Validation хийх
          await validateJsonFile(file);
        } else {
          const folderName = files[0].webkitRelativePath.split("/")[0];
          const virtualFile = new File([], folderName, { type: "folder" });
          (virtualFile as any).fileList = files;
          // CreationFlow-д хадгалах
          updateTraitData({ [type]: virtualFile });
        }
      }
    };

  const toggleOneOfOne = () => {
    const newState = !isOneOfOneEnabled;
    setIsOneOfOneEnabled(newState);
    if (!newState) {
      updateTraitData({ oneOfOneEditions: null });
    }
  };

  const handleRemoveFile = (
    type: "traitAssets" | "oneOfOneEditions" | "metadataJson"
  ) => {
    updateTraitData({ [type]: null });
  };

  // Calculate fees based on uploaded data
  const calculateFees = () => {
    let totalFee = 0;
    const feeRate = 1;

    if (traitData.metadataJson) {
      const jsonFee = estimateRecursiveInscriptionFee(1, feeRate);
      totalFee += jsonFee.totalFeeSats;
    }

    if (isOneOfOneEnabled && traitData.oneOfOneEditions) {
      const files = (traitData.oneOfOneEditions as any).fileList as FileList;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file && file.size) {
            const fileFee = estimateRegularInscriptionFee(file.size, feeRate);
            totalFee += fileFee.totalFeeSats;
          }
        }
      }
    }

    if (traitData.traitAssets) {
      const files = (traitData.traitAssets as any).fileList as FileList;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file && file.size) {
            const fileFee = estimateRegularInscriptionFee(file.size, feeRate);
            totalFee += fileFee.totalFeeSats;
          }
        }
      }
    }
    return totalFee;
  };

  const handleContinue = async () => {
    if (!collectionId) {
      toast.error("Collection ID is required");
      return;
    }

    if (!currentUserLayer?.id) {
      toast.error("User Layer ID is required");
      return;
    }

    setIsCreatingOrder(true);
    setIsLoading(true);

    try {
      const estimatedFee = calculateFees();

      const orderResponse = await createNewOrder({
        collectionId: collectionId,
        estimatedFeeInSats: estimatedFee,
        feeRate: 1,
        userLayerId: currentUserLayer?.id || "",
      });

      // Inscription data-г CreationFlow-д хадгалах
      updateInscriptionData({
        orderId: orderResponse.data.order.id,
        walletAddress: orderResponse.data.order.fundingAddress,
        fees: {
          inscription: estimatedFee,
          service: 0,
          total: estimatedFee,
        },
        progress: {
          current: 0,
          total: 1,
          estimatedTime: "5-10 minutes",
        },
      });

      toast.success("Order created successfully!");
      setCurrentStep(3);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error?.message || "Failed to create order");
    } finally {
      setIsCreatingOrder(false);
      setIsLoading(false);
    }
  };

  const getFieldErrors = (field: string) => {
    return validationErrors.filter((error) => error.field === field);
  };

  const hasJsonErrors = getFieldErrors("metadataJson").length > 0;
  const isFormValid =
    traitData.metadataJson &&
    !hasJsonErrors &&
    (!isOneOfOneEnabled || (isOneOfOneEnabled && traitData.oneOfOneEditions));

  return (
    <div className="max-w-2xl py-12 gap-8 mx-auto">
      <div className="text-start grid gap-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Upload Your Collection Assets
        </h1>
        {/* <p className="text-lightSecondary">
          Upload trait groups, one-of-one editions (if any), and your metadata JSON.
        </p> */}
      </div>

      <div className="space-y-6 mt-4">
        {/* Upload trait assets */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <label className="block text-white font-medium">
              Upload Trait Assets
            </label>
          </div>
          <NFTTraitsUpload />
        </div>

        {/* One of one editions toggle */}
        <div className="border-t border-transLight4 pt-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">
                One of One Editions
              </span>
              <span className="text-xs text-lightTertiary bg-transLight8 px-2 py-1 rounded-full">
                Optional
              </span>
            </div>
            <Toggle isChecked={isOneOfOneEnabled} onChange={toggleOneOfOne} />
          </div>
          <p className="text-sm text-lightTertiary mt-2">
            Upload special unique assets that don&apos;t follow the trait
            combination system
          </p>
        </div>

        {/* One of one editions upload */}
        {isOneOfOneEnabled && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            {traitData.oneOfOneEditions ? (
              <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-transLight8 rounded-lg">
                      <Folder size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="text-white font-medium block">
                        {traitData.oneOfOneEditions.name}
                      </span>
                      <span className="text-sm text-lightTertiary">
                        One of One Editions folder
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile("oneOfOneEditions")}
                    className="p-2 text-lightSecondary hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove folder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() =>
                  document.getElementById("one-of-one-upload")?.click()
                }
                className="border-2 border-dashed border-transLight16 rounded-xl p-6 text-center cursor-pointer hover:border-transLight24 hover:bg-transLight4 transition-all duration-200"
              >
                <div className="p-3 bg-transLight8 rounded-full w-fit mx-auto mb-3">
                  <Folder size={24} className="text-lightSecondary" />
                </div>
                <p className="text-white font-medium mb-1">
                  Select One of One Editions folder
                </p>
                <p className="text-sm text-lightTertiary">
                  Upload unique assets that won&apos;t be part of trait
                  combinations
                </p>
              </div>
            )}

            <input
              id="one-of-one-upload"
              type="file"
              {...({ webkitdirectory: "" } as any)}
              multiple
              onChange={handleFileUpload("oneOfOneEditions")}
              className="hidden"
            />
          </div>
        )}

        {/* Metadata JSON */}
        <div className="border-t border-transLight4 pt-6">
          <label className="block text-white font-medium mb-4">
            Metadata JSON
            <span className="text-red-400 ml-1">*</span>
          </label>

          {traitData.metadataJson ? (
            <div
              className={`border rounded-xl p-4 transition-colors ${
                hasJsonErrors
                  ? "border-red-500 bg-red-900/10"
                  : "border-transLight4 bg-darkSecondary"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      hasJsonErrors ? "bg-red-900/20" : "bg-transLight8"
                    }`}
                  >
                    <FileText
                      size={20}
                      className={hasJsonErrors ? "text-red-400" : "text-white"}
                    />
                  </div>
                  <div>
                    <span className="text-white font-medium block">
                      {traitData.metadataJson.name}
                    </span>
                    {isValidating ? (
                      <span className="text-sm text-blue-400">
                        Validating...
                      </span>
                    ) : hasJsonErrors ? (
                      <span className="text-sm text-red-400">
                        Validation failed
                      </span>
                    ) : (
                      <span className="text-sm text-green-400">
                        Valid JSON file
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile("metadataJson")}
                  className="p-2 text-lightSecondary hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {hasJsonErrors && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="text-red-400 mt-0.5 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-400">
                        Validation Errors:
                      </p>
                      {getFieldErrors("metadataJson").map((error, index) => (
                        <p key={index} className="text-sm text-red-300">
                          • {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() =>
                document.getElementById("metadata-upload")?.click()
              }
              className="border-2 border-dashed border-transLight16 rounded-xl p-6 text-center cursor-pointer hover:border-transLight24 hover:bg-transLight4 transition-all duration-200"
            >
              <div className="p-3 bg-transLight8 rounded-full w-fit mx-auto mb-3">
                <FileText size={24} className="text-lightSecondary" />
              </div>
              <p className="text-white font-medium mb-1">
                Upload Metadata JSON
              </p>
              <p className="text-sm text-lightTertiary">
                Provide the metadata file with trait and edition data
              </p>
            </div>
          )}

          <input
            id="metadata-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload("metadataJson")}
            className="hidden"
          />
        </div>

        {/* Fee estimation display */}
        {/* {isFormValid && (
          <div className="bg-transLight8 rounded-xl p-4 border border-transLight16">
            <h3 className="text-white font-medium mb-2">Estimated Fees</h3>
            <p className="text-sm text-lightSecondary">
              Total inscription fee: {calculateFees().toLocaleString()} sats
            </p>
          </div>
        )} */}

        {/* Continue button */}
        <div className="pt-4">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid || isValidating || isCreatingOrder}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-transLight8 disabled:text-lightTertiary transition-all duration-200"
          >
            {isCreatingOrder ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Creating Order...
              </span>
            ) : isValidating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </span>
            ) : (
              "Continue"
            )}
          </Button>

          {!isFormValid && !isValidating && (
            <p className="text-sm text-lightTertiary text-center mt-2">
              {!traitData.metadataJson
                ? "Please upload your metadata JSON file to continue"
                : hasJsonErrors
                ? "Please fix JSON validation errors to continue"
                : isOneOfOneEnabled && !traitData.oneOfOneEditions
                ? "Please upload One of One Editions folder or disable the option"
                : "Please complete all required fields"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
