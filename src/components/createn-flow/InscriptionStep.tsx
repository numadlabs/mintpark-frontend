"use client";
import React, { useState, useEffect } from "react";
import { Copy, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreationFlow } from "./CreationFlowProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  calculateUploadParameters,
  truncateAddress,
  parseMetadataJson,
  formatTimeRemaining,
} from "@/lib/utils";
import {
  checkPaymentStatus,
  getInscriptionProgress,
} from "@/lib/service/queryHelper";
import {
  createTraitTypes,
  createTraitValues,
  createRecursiveInscription,
  createOneOfOneEditions,
  postInvokeMint,
} from "@/lib/service/postRequest";
import { useAuth } from "../provider/auth-context-provider";

// Utility function to chunk arrays
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

interface TraitGroup {
  type: string;
  zIndex: number;
  files: File[];
}

export function InscriptionStep({ onComplete }: { onComplete?: () => void }) {
  const { traitData, inscriptionData, collectionId, updateInscriptionData } =
    useCreationFlow();
  const { currentUserLayer } = useAuth();
  const [currentView, setCurrentView] = useState<
    "payment" | "uploading" | "progress" | "complete"
  >("payment");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    currentStep: "",
    error: null as string | null,
  });
  const [progressData, setProgressData] = useState<{
    totalTraitValueCount: number;
    doneTraitValueCount: number;
    totalCollectibleCount: number;
    doneCollectibleCount: number;
    done: number;
    total: number;
    etaInMinutes: number;
  } | null>(null);

  const router = useRouter();

  const satsToBTC = (sats: number): number => sats / 10 ** 8;
  const btcToUsd = (btc: number, btcPrice = 31500) =>
    (btc * btcPrice).toLocaleString();

  useEffect(() => {
    if (inscriptionData?.walletAddress) {
      const amount = satsToBTC(inscriptionData.fees.total);
      const walletQrString = `bitcoin:${inscriptionData.walletAddress}?amount=${amount}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        walletQrString
      )}`;
      setQrCodeUrl(qrUrl);
    }
  }, [inscriptionData]);

  // Function to extract trait groups from uploaded files
  useEffect(() => {
    const fetchProgress = async () => {
      if (currentView !== "progress") return;
      if (!collectionId) return;

      const res = await getInscriptionProgress({
        collectionId,
        userLayerId: currentUserLayer?.id || "",
      });
      setProgressData(res);
    };

    fetchProgress();

    const interval = setInterval(fetchProgress, 8000);
    return () => clearInterval(interval);
  }, [currentView, collectionId, inscriptionData?.walletAddress]);

  const extractTraitGroups = async (): Promise<TraitGroup[]> => {
    if (!traitData.traitAssets) return [];

    const fileList = (traitData.traitAssets as any).fileList as FileList;
    if (!fileList) return [];

    const traitGroups: Record<string, TraitGroup> = {};

    // Parse metadata to get trait order map
    let traitOrderMap: { [key: string]: number } = {};

    if (traitData.metadataJson) {
      try {
        const jsonText = await traitData.metadataJson.text();
        const metadata = JSON.parse(jsonText);

        // Get the first item's attributes to determine order
        let attributesSource: any[] | null = null;

        if (
          metadata.collection &&
          Array.isArray(metadata.collection) &&
          metadata.collection[0]?.attributes
        ) {
          attributesSource = metadata.collection[0].attributes;
        } else if (Array.isArray(metadata) && metadata[0]?.attributes) {
          attributesSource = metadata[0].attributes;
        }

        if (attributesSource && Array.isArray(attributesSource)) {
          attributesSource.forEach((attr: any, index: number) => {
            if (attr.trait_type && typeof attr.trait_type === "string") {
              traitOrderMap[attr.trait_type.toLowerCase()] = index;
            }
          });
        }

        console.log("Trait order map from metadata:", traitOrderMap);
      } catch (error) {
        console.error("Error parsing metadata for trait order:", error);
      }
    }

    // Get the stored traits data with z-index values from NFTTraitsUpload
    const storedTraitsData = (traitData.traitAssets as any).traitsData || {};

    console.log("Stored traits data from NFTTraitsUpload:", storedTraitsData);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const pathParts = file.webkitRelativePath?.split("/") || [];

      if (pathParts.length >= 2 && file.type.startsWith("image/")) {
        let traitType: string;

        if (pathParts.length === 2) {
          traitType = pathParts[0];
        } else if (pathParts[0] === "traits") {
          traitType = pathParts[1];
        } else {
          traitType = pathParts[pathParts.length - 2];
        }

        if (!traitGroups[traitType]) {
          // First try to get z-index from metadata order
          let zIndex = 5; // default fallback

          if (Object.keys(traitOrderMap).length > 0) {
            // Normalize trait type name for matching
            const normalizedTraitType = traitType.toLowerCase();

            // Try exact match first
            if (traitOrderMap.hasOwnProperty(normalizedTraitType)) {
              zIndex = traitOrderMap[normalizedTraitType];
            } else {
              // Try partial matching
              for (const [metadataTraitType, index] of Object.entries(
                traitOrderMap
              )) {
                const normalizedMetadataName = metadataTraitType.toLowerCase();

                if (
                  normalizedTraitType.includes(normalizedMetadataName) ||
                  normalizedMetadataName.includes(normalizedTraitType)
                ) {
                  zIndex = index;
                  break;
                }
              }
            }
          } else if (storedTraitsData[traitType]?.zIndex !== undefined) {
            // Fallback to stored traits data if no metadata available
            zIndex = storedTraitsData[traitType].zIndex;
          }

          console.log(
            `Setting trait type "${traitType}" with z-index: ${zIndex}`
          );

          traitGroups[traitType] = {
            type: traitType,
            zIndex: zIndex,
            files: [],
          };
        }

        traitGroups[traitType].files.push(file);
      }
    }

    const result = Object.values(traitGroups);
    console.log(
      "Final trait groups with z-index:",
      result.map((g) => ({ name: g.type, zIndex: g.zIndex }))
    );

    return result;
  };

  // Main upload process function
  function formatTrait(value: string) {
    return value.replace(/\s+/g, "_").toLowerCase();
  }

  // Main upload process function - FIXED VERSION
  const handleUploadProcess = async () => {
    if (!collectionId) {
      toast.error("Collection ID is required");
      return;
    }

    setCurrentView("uploading");
    setUploadProgress({
      current: 0,
      total: 0,
      currentStep: "Initializing...",
      error: null,
    });

    try {
      // Extract trait groups and metadata
      const traitGroups = await extractTraitGroups();
      console.log("Extracted trait groups:", traitGroups);

      let metadata: any[] = [];

      if (traitData.metadataJson) {
        const { collectionItems } = await parseMetadataJson(
          traitData.metadataJson
        );
        metadata = collectionItems;
      }

      // Get one-of-one files
      const oooFiles: File[] = [];
      if (traitData.oneOfOneEditions) {
        const oooFileList = (traitData.oneOfOneEditions as any)
          .fileList as FileList;
        if (oooFileList) {
          for (let i = 0; i < oooFileList.length; i++) {
            const file = oooFileList[i];
            if (file.type.startsWith("image/")) {
              oooFiles.push(file);
            }
          }
        }
      }

      // Calculate total steps
      const totalSteps =
        traitGroups.length + // trait types
        traitGroups.reduce(
          (acc, g) => acc + Math.ceil(g.files.length / 10),
          0
        ) + // trait values
        Math.ceil(metadata.length / 10) + // recursive inscriptions
        Math.ceil(oooFiles.length / 10); // 1-of-1 editions

      setUploadProgress((prev) => ({ ...prev, total: totalSteps }));

      let currentStep = 0;

      // Step 1: Create trait types in batches
      setUploadProgress((prev) => ({
        ...prev,
        currentStep: "Creating trait types...",
      }));

      const traitTypeBatches = chunkArray(traitGroups, 10);
      let traitTypeIdMap: Record<string, string> = {};

      for (const batch of traitTypeBatches) {
        console.log(
          "Creating trait types batch:",
          batch.map((g) => ({ name: g.type, zIndex: g.zIndex }))
        );

        const res = await createTraitTypes({
          collectionId,
          data: batch.map((g) => ({ name: g.type, zIndex: g.zIndex })),
        });

        console.log("Trait types created:", res.data.traitTypes);

        for (const tt of res.data.traitTypes) {
          const formattedTraitTypeName = formatTrait(tt.name);
          traitTypeIdMap[formattedTraitTypeName] = tt.id;
        }

        currentStep++;
        setUploadProgress((prev) => ({ ...prev, current: currentStep }));
      }

      console.log("Final traitTypeIdMap:", traitTypeIdMap);

      // Step 2: Upload trait values for each trait type
      setUploadProgress((prev) => ({
        ...prev,
        currentStep: "Uploading trait values...",
      }));

      let traitValueIdMap: Record<string, string> = {};

      for (const group of traitGroups) {
        console.log(`Processing trait group: ${group.type}`);
        console.log(`Looking for traitTypeId with key: "${group.type}"`);
        console.log(
          `Available keys in traitTypeIdMap:`,
          Object.keys(traitTypeIdMap)
        );

        const formattedTraitTypeName = formatTrait(group.type);
        const traitTypeId = traitTypeIdMap[formattedTraitTypeName];

        if (!traitTypeId) {
          console.error(
            `traitTypeId not found for group.type: "${group.type}"`
          );
          console.error(`Available trait type IDs:`, traitTypeIdMap);
          throw new Error(`Trait type ID not found for: ${group.type}`);
        }

        const fileBatches = chunkArray(group.files, 10);

        for (const files of fileBatches) {
          console.log(
            `Uploading ${files.length} files for trait type: ${group.type}`
          );

          const res = await createTraitValues({
            traitTypeId: traitTypeId, // Use the found ID
            files,
          });

          for (const tv of res.data.traitValues) {
            const formattedTraitValueName = formatTrait(tv.value);
            traitValueIdMap[
              `${formattedTraitTypeName}:${formattedTraitValueName}`
            ] = tv.id;
          }

          currentStep++;
          setUploadProgress((prev) => ({ ...prev, current: currentStep }));
        }
      }

      // Step 3: Map metadata to traitValueIds and create recursive inscriptions
      if (metadata.length > 0) {
        setUploadProgress((prev) => ({
          ...prev,
          currentStep: "Creating recursive inscriptions...",
        }));

        let matrix: string[][] = [];
        try {
          matrix = metadata.map((item, idx) => {
            if (!item.attributes || !Array.isArray(item.attributes))
              throw new Error(`Item ${idx} missing attributes array`);

            return item.attributes.map((attr: any) => {
              // FIXED: Use the same normalization as in trait groups
              const type = formatTrait(attr.trait_type);
              const value = formatTrait(attr.value);
              const key = `${type}:${value}`;
              const id = traitValueIdMap[key];

              console.log(
                `Looking for trait value: ${key} -> ${
                  id ? "FOUND" : "NOT FOUND"
                }`
              );

              if (!id) {
                console.error(
                  `Available trait value IDs:`,
                  Object.keys(traitValueIdMap)
                );
                throw new Error(`No traitValueId for ${key}`);
              }
              return id;
            });
          });
        } catch (err: any) {
          throw new Error(`Failed to map metadata: ${err.message}`);
        }

        // Submit recursive inscriptions in batches
        const matrixBatches = chunkArray(matrix, 10);
        let totalRecursive = 0;

        for (const batch of matrixBatches) {
          const recursiveRes = await createRecursiveInscription({
            collectionId,
            data: batch.map((row) => row.map((id) => ({ traitValueId: id }))),
          });

          totalRecursive += recursiveRes.data?.collectibles?.length || 0;
          currentStep++;
          setUploadProgress((prev) => ({ ...prev, current: currentStep }));
        }
      }

      // Step 4: Upload 1-of-1 editions if any
      if (oooFiles.length > 0) {
        setUploadProgress((prev) => ({
          ...prev,
          currentStep: "Uploading 1-of-1 editions...",
        }));

        const oooBatches = chunkArray(oooFiles, 10);
        let totalOoo = 0;

        for (const files of oooBatches) {
          const oooRes = await createOneOfOneEditions({
            collectionId,
            files,
          });

          totalOoo += oooRes.data?.collectibles?.length || 0;
          currentStep++;
          setUploadProgress((prev) => ({ ...prev, current: currentStep }));
        }
      }

      // Step 5: Invoke mint if order ID exists
      if (inscriptionData?.orderId) {
        setUploadProgress((prev) => ({
          ...prev,
          currentStep: "Invoking mint...",
        }));

        try {
          const mintResult = await postInvokeMint(inscriptionData.orderId);

          if (mintResult.success) {
            console.log("Mint invoked successfully:", mintResult.data);
            toast.success("Mint invoked successfully!");

            if (mintResult.data?.order) {
              updateInscriptionData({
                progress: {
                  ...inscriptionData.progress,
                  estimatedTime: "Mint process initiated",
                },
              });
            }
          } else {
            console.error("Mint invoke failed:", mintResult.error);
            toast.warning(
              "Upload completed but mint invoke failed: " +
                (mintResult.error || "Unknown error")
            );
          }
        } catch (err: any) {
          console.error("Failed to invoke mint:", err);
          const errorMessage =
            err?.response?.data?.error || err?.message || "Unknown error";
          toast.warning(
            "Upload completed but mint invoke failed: " + errorMessage
          );
        }
      }

      setUploadProgress((prev) => ({
        ...prev,
        current: totalSteps,
        currentStep: "Upload completed!",
      }));
      setCurrentView("progress");
      toast.success("All files uploaded successfully!");
    } catch (error: any) {
      console.error("Upload process failed:", error);
      setUploadProgress((prev) => ({
        ...prev,
        error: error?.message || "Upload failed",
      }));
      toast.error(error?.message || "Upload failed");
    }
  };

  const handleCheckPayment = async () => {
    if (!inscriptionData?.orderId || !collectionId) {
      toast.error("Order ID or Collection ID missing");
      return;
    }

    setIsCheckingPayment(true);

    try {
      const result = await checkPaymentStatus(inscriptionData.orderId);

      if (result.success && result.data?.isPaid === true) {
        toast.success("Payment confirmed! Starting upload process...");

        try {
          // Get the calculated values from localStorage or recalculate
          const storedData = localStorage.getItem("calculatedUploadData");
          let calculatedValues;

          if (storedData) {
            calculatedValues = JSON.parse(storedData);
            console.log("Using stored calculated values:", calculatedValues);
          } else {
            // Recalculate if not stored (fallback)
            console.log("Recalculating upload parameters...");
            const isOneOfOneEnabled = !!traitData.oneOfOneEditions;
            calculatedValues = await calculateUploadParameters(
              traitData,
              isOneOfOneEnabled
            );
            console.log("Recalculated values:", calculatedValues);
          }

          // Validate that we have meaningful values
          if (
            calculatedValues.expectedTraitTypes === 0 &&
            calculatedValues.expectedTraitValues === 0
          ) {
            console.warn("No trait data found! Check file upload structure.");
            toast.error("No trait data found. Please check your file uploads.");
            return;
          }

          console.log(
            "Final values being sent to upload session:",
            calculatedValues
          );

          // // Initiate upload session with correct values
          // const uploadResponse = await initiateUploadSession({
          //   collectionId,
          //   expectedTraitTypes: calculatedValues.expectedTraitTypes,
          //   expectedTraitValues: calculatedValues.expectedTraitValues,
          //   expectedRecursive: calculatedValues.expectedRecursive,
          //   expectedOOOEditions: calculatedValues.expectedOOOEditions,
          // });

          // console.log("Upload session response:", uploadResponse);

          const startedAt = new Date();
          updateInscriptionData({
            progress: {
              current: 0,
              total:
                calculatedValues.expectedTraitTypes +
                calculatedValues.expectedTraitValues +
                calculatedValues.expectedRecursive +
                (calculatedValues.expectedOOOEditions || 0),
              estimatedTime: new Date(startedAt).toLocaleTimeString(),
            },
          });

          // Clean up stored data
          localStorage.removeItem("calculatedUploadData");

          // Start the actual upload process
          await handleUploadProcess();
        } catch (uploadError) {
          console.error("Upload session failed:", uploadError);
          const uploadErrorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown upload error";
          toast.error(
            `Failed to initiate upload session: ${uploadErrorMessage}`
          );
          return;
        }
      } else {
        toast.error(result?.error || "Payment not yet confirmed");
      }
    } catch (error: unknown) {
      console.error("Payment check error:", error);

      // Extract the actual error message
      let errorMessage = "Failed to check payment status";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }

      toast.error(errorMessage);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleGoToCollections = () => router.push("/creater-tool");
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  if (!inscriptionData) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-lightSecondary">Loading inscription data...</p>
      </div>
    );
  }

  if (currentView === "payment") {
    const inscriptionFeeBTC = satsToBTC(inscriptionData.fees.inscription);
    const serviceFeeBTC = satsToBTC(inscriptionData.fees.service);
    const totalBTC = satsToBTC(inscriptionData.fees.total);

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-start mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Pay Inscription Fee
          </h1>
          <p className="text-lightSecondary">
            Submit the required fee to start the inscription process, ensuring
            your NFT assets are securely recorded on the blockchain.
          </p>
        </div>

        <div className="space-y-8">
          {/* QR Code Section */}
          <div className="text-center">
            <p className="text-lightSecondary mb-4">
              Scan the QR code with your wallet to pay
            </p>
            <div className="w-48 h-48 bg-white mx-auto rounded-xl flex items-center justify-center">
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 bg-black flex items-center justify-center text-xs text-white">
                  Generating QR Code...
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex items-center justify-between bg-darkSecondary border border-transLight4 rounded-xl p-4">
            <div className="flex justify-between items-center w-full">
              <p className="text-lightSecondary text-sm mb-1">Wallet Address</p>
              <p className="text-white font-medium">
                {truncateAddress(inscriptionData.walletAddress)}
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  await copyToClipboard(inscriptionData.walletAddress);
                  toast.success("Address copied to clipboard!");
                } catch (error) {
                  toast.error("Failed to copy address", {
                    description: "Please try again.",
                  });
                }
              }}
              className="p-2 text-lightSecondary hover:text-white bg-transparent hover:bg-transparent transition-colors"
            >
              <Copy size={16} />
            </Button>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Network Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">
                    {inscriptionFeeBTC.toFixed(6)} BTC
                  </span>
                  {/* <span className="text-lightSecondary text-sm ml-2">
                    ~${btcToUsd(inscriptionFeeBTC)}
                  </span> */}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Service Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">
                    {serviceFeeBTC.toFixed(6)} BTC
                  </span>
                  {/* <span className="text-lightSecondary text-sm ml-2">
                    ~${btcToUsd(serviceFeeBTC)}
                  </span> */}
                </div>
              </div>

              <div className="border-t border-transLight8 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-white font-semibold">
                      {totalBTC.toFixed(6)} BTC
                    </span>
                    {/* <span className="text-lightSecondary text-sm ml-2">
                      ~${btcToUsd(totalBTC)}
                    </span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-transparent border border-lightSecondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lightSecondary text-xs font-bold">i</span>
              </div>
              <p className="text-sm text-lightSecondary">
                This is an estimated fee and may be insufficient during
                inscribing or exceed the final cost. You can claim any excess
                amount if applicable.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCheckPayment}
            disabled={isCheckingPayment}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {isCheckingPayment ? "Checking Payment..." : "Check Payment"}
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === "uploading") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Uploading Your Assets
          </h1>
          <p className="text-lightSecondary">
            Please wait while we process and upload your NFT collection to the
            blockchain.
          </p>
        </div>

        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload size={24} className="text-white" />
            <h3 className="text-lg font-semibold text-white">
              Upload Progress
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Current Step:</span>
              <span className="text-white font-medium">
                {uploadProgress.currentStep}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Progress:</span>
              <span className="text-white font-medium">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-300"
                style={{
                  width:
                    uploadProgress.total > 0
                      ? `${
                          (uploadProgress.current / uploadProgress.total) * 100
                        }%`
                      : "0%",
                }}
              />
            </div>

            {uploadProgress.error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  Error: {uploadProgress.error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "progress") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Inscription Progress
          </h1>
        </div>

        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lightSecondary text-sm mb-1">Order ID</p>
              <p className="text-white font-medium">
                {inscriptionData.orderId}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(inscriptionData.orderId)}
              className="p-2 text-lightSecondary hover:text-white transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {!progressData ? (
          <p className="text-lightSecondary h-[300px]">Loading progress...</p>
        ) : (
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={24} className="text-white" />
              <h3 className="text-lg font-semibold text-white">
                Inscription Progress
              </h3>
            </div>
            <p className="text-lightSecondary mb-6">
              Track the real-time status of your Ordinal inscriptions as we
              record your assets on Bitcoin.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-lightSecondary text-sm mb-1">Progress</p>
                <p className="text-white font-medium">
                  {progressData.done} / {progressData.total}
                </p>
              </div>
              <div>
                <p className="text-lightSecondary text-sm mb-1">
                  Estimated remaining time
                </p>
                <p className="text-white font-medium">
                  {/* {progressData.etaInMinutes} minutes */}
                  {formatTimeRemaining(progressData.etaInMinutes)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleGoToCollections}
            className="flex-1 bg-white text-black hover:bg-gray-200"
          >
            {/* Go to My Collections → */}
            {progressData ? "Go to My Collections →" : "Loading..."}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
