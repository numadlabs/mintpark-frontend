"use client";

import React, { useState } from "react";
import Banner from "@/components/section/create-banner";
import Header from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import UploadFile from "@/components/section/upload-file";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import Layout from "@/components/layout/layout";
import UploadCardFill from "@/components/atom/cards/upload-card-fill";
import Image from "next/image";
import CollectiblePreviewCard from "@/components/atom/cards/collectible-preview-card";
import {
  ImageFile,
  CollectionData,
  CreateLaunchParams,
  LaunchParams,
} from "@/lib/types";
import TextArea from "@/components/ui/textArea";
import {
  addPhase,
  createCollection,
  createLaunch,
  createLaunchItemsIPFS,
  whitelistAddresses,
} from "@/lib/service/postRequest";
import useCreateFormState from "@/lib/store/createFormStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CollectionUploadFile from "@/components/section/collection-upload-file";
import { Calendar2, Clock, Bitcoin, DocumentDownload } from "iconsax-react";
import OrderPayModal from "@/components/modal/order-pay-modal";
import { useAuth } from "@/components/provider/auth-context-provider";
import moment from "moment";
import SuccessModal from "@/components/modal/success-modal";
import { getLayerById } from "@/lib/service/queryHelper";
import { formatFileSize } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import UploadJsonCard from "@/components/atom/cards/upload-json-card";
import UploadJsonFile from "@/components/section/upload-json-file";
import { ethers } from "ethers";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import CreateBanner from "@/components/section/create-banner";
import { Layer } from "@/lib/types/wallet";
// Wagmi imports
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

// Type definitions for transaction data
interface TransactionData {
  to?: string;
  data?: string;
  value?: string | number;
  gas?: string | number;
  gasPrice?: string | number;
  maxFeePerGas?: string | number;
  maxPriorityFeePerGas?: string | number;
}

const IPFS = () => {
  const router = useRouter();
  const { currentUserLayer } = useAuth();
  const {
    imageFile,
    setImageFile,
    name,
    setName,
    description,
    setDescription,
    creator,
    setCreator,
    POStartsAtDate,
    setPOStartsAtDate,
    POStartsAtTime,
    setPOStartsAtTime,
    POEndsAtDate,
    setPOEndsAtDate,
    POEndsAtTime,
    setPOEndsAtTime,
    POMintPrice,
    setPOMintPrice,
    POMaxMintPerWallet,
    setPOMaxMintPerWallet,
    WLStartsAtDate,
    setWLStartsAtDate,
    WLStartsAtTime,
    setWLStartsAtTime,
    WLEndsAtDate,
    setWLEndsAtDate,
    WLEndsAtTime,
    setWLEndsAtTime,
    WLMintPrice,
    setWLMintPrice,
    WLMaxMintPerWallet,
    setWLMaxMintPerWallet,
    // fcfs phase
    FCFSStartsAtDate,
    setFCFSStartsAtDate,
    FCFSStartsAtTime,
    setFCFSStartsAtTime,
    FCFSEndsAtDate,
    setFCFSEndsAtDate,
    FCFSEndsAtTime,
    setFCFSEndsAtTime,
    FCFSMintPrice,
    setFCFSMintPrice,
    FCFSMaxMintPerWallet,
    setFCFSMaxMintPerWallet,
    txid,
    setTxid,
    reset,
  } = useCreateFormState();

  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [pendingTxHash, setPendingTxHash] = useState<string>("");

  // Wagmi hooks
  const {
    sendTransaction,
    isPending: isSendingTransaction,
    error: sendTransactionError,
  } = useSendTransaction();

  const { isLoading: isWaitingForTransaction, isSuccess: transactionSuccess } =
    useWaitForTransactionReceipt({
      hash: pendingTxHash as `0x${string}`,
      query: {
        enabled: !!pendingTxHash,
      },
    });

  // Other state variables...
  const [payModal, setPayModal] = useState(false);
  const [fileTypes, setFileTypes] = useState<Set<string>>(new Set());
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [fileSizes, setFileSizes] = useState<number[]>([]);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fcfsjsonFile, setFcfsJsonFile] = useState<File | null>();
  const stepperData = ["Details", "Upload", "Launch", "Confirm"];
  const [totalFileSize, setTotalFileSize] = useState<number>(0);
  const [fileTypeSizes, setFileTypeSizes] = useState<number[]>([]);
  const [successModal, setSuccessModal] = useState(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isSecondChecked, setIsSecondChecked] = useState(false);
  const [isPubChecked, setIsPubChecked] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState<string[]>([]);
  const [fcfslistAddress, setfcfslistAddress] = useState<string[]>([]);

  // Helper function to check if collection is ready
  const checkCollectionStatus = async (
    collectionId: string
  ): Promise<boolean> => {
    try {
      // You might need to implement this endpoint in your API
      // For now, we'll add a simple delay and assume it's ready
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return true;
    } catch (error) {
      console.error("Error checking collection status:", error);
      return false;
    }
  };

  // Helper function to send transaction using Wagmi
  const sendTransactionWithWagmi = async (
    txData: TransactionData | string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate transaction data
      if (!txData) {
        reject(new Error("Transaction data is missing"));
        return;
      }

      // Handle different possible formats of transaction data
      let transactionRequest;

      if (typeof txData === "string") {
        // If it's a raw hex string, we need more info to construct the transaction
        if (!txData.startsWith("0x")) {
          reject(new Error("Invalid transaction hex format"));
          return;
        }
        transactionRequest = {
          data: txData as `0x${string}`,
        };
      } else if (typeof txData === "object" && txData !== null) {
        // If it's an object with transaction properties
        transactionRequest = {
          to: txData.to as `0x${string}` | undefined,
          data: txData.data as `0x${string}` | undefined,
          value: txData.value ? BigInt(txData.value) : undefined,
          gas: txData.gas ? BigInt(txData.gas) : undefined,
          gasPrice: txData.gasPrice ? BigInt(txData.gasPrice) : undefined,
          maxFeePerGas: txData.maxFeePerGas
            ? BigInt(txData.maxFeePerGas)
            : undefined,
          maxPriorityFeePerGas: txData.maxPriorityFeePerGas
            ? BigInt(txData.maxPriorityFeePerGas)
            : undefined,
        };

        // Validate required fields for object format
        if (!transactionRequest.to && !transactionRequest.data) {
          reject(
            new Error('Transaction must have either "to" address or "data"')
          );
          return;
        }
      } else {
        reject(new Error("Invalid transaction data format"));
        return;
      }

      console.log("Sending transaction with data:", transactionRequest);

      sendTransaction(transactionRequest, {
        onSuccess: (hash) => {
          console.log("Transaction sent successfully:", hash);
          setPendingTxHash(hash);
          setTxid(hash);
          resolve(hash);
        },
        onError: (error) => {
          console.error("Transaction failed:", error);

          // Handle specific error types
          if (error.message.toLowerCase().includes("unsigned")) {
            toast.error("Transaction data is not properly formatted");
          } else if (error.message.toLowerCase().includes("user rejected")) {
            toast.error("Transaction was rejected by user");
          } else {
            toast.error("Transaction failed: " + error.message);
          }

          reject(error);
        },
      });
    });
  };

  // Mutations...
  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createCollection,
  });

  const { mutateAsync: launchItemsMutation } = useMutation({
    mutationFn: createLaunchItemsIPFS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData"] });
      queryClient.invalidateQueries({ queryKey: ["launchData"] });
    },
  });

  const { mutateAsync: createLaunchMutation } = useMutation({
    mutationFn: createLaunch,
  });

  const { mutateAsync: whitelistAddressesMutation } = useMutation({
    mutationFn: whitelistAddresses,
  });

  const { mutateAsync: addPhaseMutation } = useMutation({
    mutationFn: addPhase,
  });

  const updateFileInfo = (files: File[]) => {
    const newSizes = files.map((file) => file.size);
    setFileSizes((prevSizes) => [...prevSizes, ...newSizes]);

    const newTotalSize = newSizes.reduce((acc, size) => acc + size, 0);
    setTotalFileSize((prevTotal) => prevTotal + newTotalSize);

    const newTypes = files.map((file) => file.type.length);
    setFileTypeSizes((prevTypes) => [...prevTypes, ...newTypes]);

    setFileTypes((prevTypes) => {
      const updatedTypes = new Set(prevTypes);
      files.forEach((file) => updatedTypes.add(file.type));
      return updatedTypes;
    });
  };

  const { data: currentLayer } = useQuery<Layer>({
    queryKey: ["currentLayerData", currentUserLayer?.layerId],
    queryFn: () => getLayerById(currentUserLayer!.layerId),
    enabled: !!currentUserLayer?.layerId,
  });

  const calculateTimeUntilDate = (
    dateString: string,
    timeString: string
  ): number => {
    try {
      if (!dateString || !timeString) {
        console.error("Missing date or time input");
        toast.error("Missing date or time input");
        return 0;
      }

      const normalizedTime = timeString.replace(" ", ":");
      const dateTimeString = `${dateString} ${normalizedTime}`;
      const momentDate = moment(dateTimeString, "YYYY-MM-DD HH:mm");

      if (!momentDate.isValid()) {
        console.error("Invalid date/time combination:", dateTimeString);
        toast.error("Invalid date and time combination.");
        return 0;
      }

      return momentDate.unix();
    } catch (error) {
      console.error("Error calculating timestamp:", error);
      toast.error("Error calculating timestamp.");
      return 0;
    }
  };

  const handleCreateCollection = async () => {
    if (!currentLayer) {
      toast.error("Layer information not available");
      return;
    }
    if (!currentUserLayer) {
      toast.error("User layer not available");
      return;
    }
    if (currentLayer.layerType !== "EVM") {
      toast.error("This feature requires an EVM-compatible layer");
      return;
    }

    setIsLoading(true);
    try {
      const params: CollectionData = {
        name: name,
        description: description,
        logo: imageFile[0],
        priceForLaunchpad: 0.001,
        type: "IPFS_FILE",
        userLayerId: currentUserLayer!.id,
        layerId: currentUserLayer!.layerId,
      };

      if (params) {
        const response = await createCollectionMutation({ data: params });
        if (response && response.success) {
          const { id } = response.data.l2Collection;
          const { deployContractTxHex } = response.data;
          setCollectionId(id);

          toast.success("Collection created successfully.");

          if (currentLayer.layerType === "EVM" && deployContractTxHex) {
            try {
              // Debug: Log the transaction data structure
              console.log("deployContractTxHex:", deployContractTxHex);
              console.log(
                "Type of deployContractTxHex:",
                typeof deployContractTxHex
              );

              // Use Wagmi to send transaction
              await sendTransactionWithWagmi(deployContractTxHex);
              toast.success("Transaction sent successfully.");
            } catch (txError) {
              console.error("Transaction error:", txError);
              toast.error("Transaction failed. Please try again.");
              return; // Don't proceed to next step if transaction fails
            }
          }

          // Add a small delay to ensure backend processing is complete
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setStep(1);
        } else {
          toast.error("Failed to create collection. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error creating collection:", error);
      // Check if it's a specific error about collection processing
      if (
        error?.response?.data?.error?.includes(
          "Collection processing has not been completed"
        )
      ) {
        toast.error(
          "Collection is still processing. Please wait a moment and try again."
        );
      } else if (error?.message?.toLowerCase().includes("unsigned")) {
        toast.error(
          "Transaction data is not ready. Please wait and try again."
        );
      } else {
        toast.error("Error creating collection. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setImageFile([file]);
      updateFileInfo([file]);
    }
  };

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const filteredFiles = Array.from(files).filter((file) => file.size > 0);

      const newImageFiles: ImageFile[] = filteredFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);

      const newSizes = filteredFiles.map((file) => file.size);
      setFileSizes((prevSizes) => [...prevSizes, ...newSizes]);

      const newTotalSize = newSizes.reduce((acc, size) => acc + size, 0);
      setTotalFileSize((prevTotal) => prevTotal + newTotalSize);

      const newTypes = filteredFiles.map((file) => file.type.length);
      setFileTypeSizes((prevTypes) => [...prevTypes, ...newTypes]);

      setFileTypes((prevTypes) => {
        const updatedTypes = new Set(prevTypes);
        filteredFiles.forEach((file) => updatedTypes.add(file.type));
        return updatedTypes;
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (Array.isArray(jsonData.addresses)) {
            setWhitelistAddress(jsonData.addresses);
          } else {
            toast.error("Invalid JSON format. Expected an array of addresses.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFcfsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setFcfsJsonFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (Array.isArray(jsonData.addresses)) {
            setfcfslistAddress(jsonData.addresses);
          } else {
            toast.error("Invalid JSON format. Expected an array of addresses.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const togglePayModal = () => {
    setPayModal(!payModal);
  };

  const handleDeleteLogo = () => {
    setImageFile([]);
  };

  const handleDeleteJson = () => {
    setJsonFile(null);
  };

  const handleFcfsDeleteJson = () => {
    setFcfsJsonFile(null);
  };

  const handleBack = () => {
    if (step > 0 || step > 3) {
      setStep(step - 1);
      reset();
    } else {
      router.push("/create");
      reset();
    }
  };

  const handleCreate = () => {
    router.push("/create");
    reset();
  };

  const toggleSuccessModal = () => {
    setSuccessModal(!successModal);
  };

  const toggleWhiteList = () => {
    setIsChecked(!isChecked);
  };

  const toggleSecondWhiteList = () => {
    setIsSecondChecked(!isSecondChecked);
  };

  const togglePubList = () => {
    setIsPubChecked(!isPubChecked);
  };

  const files = imageFiles.map((image) => image.file);

  const handleCreateLaunch = async () => {
    setIsLoading(true);
    const poStartsAt = calculateTimeUntilDate(POStartsAtDate, POStartsAtTime);
    const poEndsAt = calculateTimeUntilDate(POEndsAtDate, POEndsAtTime);
    const wlStartsAt = calculateTimeUntilDate(WLStartsAtDate, WLStartsAtTime);
    const wlEndsAt = calculateTimeUntilDate(WLEndsAtDate, WLEndsAtTime);
    const fcfsStartsAt = calculateTimeUntilDate(
      FCFSStartsAtDate,
      FCFSStartsAtTime
    );
    const fcfsEndsAt = calculateTimeUntilDate(FCFSEndsAtDate, FCFSEndsAtTime);

    try {
      const batchSize = 10;
      const totalBatches = Math.ceil(files.length / batchSize);
      const params: LaunchParams = {
        collectionId: collectionId,
        isWhitelisted: isChecked ? true : false,
        hasFCFS: isSecondChecked ? true : false,
        poStartsAt: poStartsAt,
        poEndsAt: poEndsAt,
        poMintPrice: POMintPrice,
        poMaxMintPerWallet: POMaxMintPerWallet,
        wlStartsAt: wlStartsAt,
        wlEndsAt: wlEndsAt,
        wlMintPrice: WLMintPrice,
        wlMaxMintPerWallet: WLMaxMintPerWallet,
        fcfsStartsAt: fcfsStartsAt,
        fcfsEndsAt: fcfsEndsAt,
        fcfsMintPrice: FCFSMintPrice,
        fcfsMaxMintPerWallet: FCFSMaxMintPerWallet,
        userLayerId: currentUserLayer!.id,
      };

      if (!currentUserLayer?.layerId) {
        return toast.error("layer not selected");
      }

      if (params && totalFileSize) {
        // Launch the collection
        const launchResponse = await createLaunchMutation({
          data: params,
          txid: txid,
          totalFileSize: totalFileSize,
          feeRate: 1,
        });

        console.log(launchResponse?.data, "helloo");
        if (!launchResponse?.data?.launch?.collectionId) {
          throw new Error("Launch response missing collection ID");
        }

        const launchCollectionId = launchResponse.data.launch.collectionId;
        const launchId = launchResponse.data.launch.id;

        // Handle whitelist phase
        if (isChecked) {
          const whresponse = await addPhaseMutation({
            collectionId,
            phaseType: 0,
            price: WLMintPrice.toString(),
            startTime: wlStartsAt,
            endTime: wlEndsAt,
            maxSupply: WLMaxMintPerWallet * whitelistAddress.length,
            maxPerWallet: WLMaxMintPerWallet,
            maxMintPerPhase: WLMaxMintPerWallet,
            layerId: currentUserLayer!.layerId,
            userLayerId: currentUserLayer!.id,
          });

          console.log("Whitelist phase response:", whresponse);

          if (currentLayer!.layerType === "EVM") {
            if (whresponse?.data?.unsignedTx) {
              try {
                await sendTransactionWithWagmi(whresponse.data.unsignedTx);
                toast.success("Whitelist phase transaction sent successfully.");
              } catch (txError) {
                console.error("Whitelist transaction error:", txError);
                toast.error("Whitelist phase transaction failed.");
                // Continue with the process even if transaction fails
              }
            } else {
              console.error(
                "No unsigned transaction data received for whitelist phase"
              );
              toast.warning(
                "Whitelist phase created but no transaction data received."
              );
            }
          }
        }

        // Handle FCFS phase
        if (isSecondChecked) {
          const FCFSresponse = await addPhaseMutation({
            collectionId,
            phaseType: 1,
            price: FCFSMintPrice.toString(),
            startTime: fcfsStartsAt,
            endTime: fcfsEndsAt,
            maxSupply: FCFSMaxMintPerWallet * fcfslistAddress.length,
            maxPerWallet: FCFSMaxMintPerWallet,
            maxMintPerPhase: FCFSMaxMintPerWallet,
            layerId: currentLayer!.id,
            userLayerId: currentUserLayer!.id,
            merkleRoot: "",
          });

          console.log("FCFS phase response:", FCFSresponse);

          if (currentLayer!.layerType === "EVM") {
            if (FCFSresponse?.data?.unsignedTx) {
              try {
                await sendTransactionWithWagmi(FCFSresponse.data.unsignedTx);
                toast.success("FCFS phase transaction sent successfully.");
              } catch (txError) {
                console.error("FCFS transaction error:", txError);
                toast.error("FCFS phase transaction failed.");
                // Continue with the process even if transaction fails
              }
            } else {
              console.error(
                "No unsigned transaction data received for FCFS phase"
              );
              toast.warning(
                "FCFS phase created but no transaction data received."
              );
            }
          }
        }

        // Handle public phase
        if (isPubChecked) {
          const publicPhaseResponse = await addPhaseMutation({
            collectionId,
            phaseType: 2,
            price: POMintPrice.toString(),
            startTime: poStartsAt,
            endTime: poEndsAt,
            maxSupply: 0,
            maxPerWallet: POMaxMintPerWallet,
            maxMintPerPhase: 0,
            layerId: currentLayer!.id,
            userLayerId: currentUserLayer!.id,
          });

          console.log("Public phase response:", publicPhaseResponse);

          if (currentLayer!.layerType === "EVM") {
            if (publicPhaseResponse?.data?.unsignedTx) {
              try {
                await sendTransactionWithWagmi(
                  publicPhaseResponse.data.unsignedTx
                );
                toast.success("Public phase transaction sent successfully.");
              } catch (txError) {
                console.error("Public transaction error:", txError);
                toast.error("Public phase transaction failed.");
                // Continue with the process even if transaction fails
              }
            } else {
              console.error(
                "No unsigned transaction data received for public phase"
              );
              toast.warning(
                "Public phase created but no transaction data received."
              );
            }
          }
        }

        // Process files in batches
        try {
          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const start = batchIndex * batchSize;
            const end = Math.min(start + batchSize, files.length);
            const currentBatchFiles = files.slice(start, end);

            const names = currentBatchFiles.map(
              (_, index) => `${name.replace(/\s+/g, "")}-${start + index + 1}`
            );

            const launchItemsData: CreateLaunchParams = {
              files: currentBatchFiles,
              names: names,
              collectionId: launchCollectionId,
              isLastBatch: batchIndex === totalBatches - 1,
            };

            console.log(
              `Processing batch ${batchIndex + 1}/${totalBatches}:`,
              launchItemsData
            );

            const response = await launchItemsMutation({
              data: launchItemsData,
            });

            if (!response?.success) {
              throw new Error(
                `Failed to process batch ${batchIndex + 1}: ${
                  response?.error || "Unknown error"
                }`
              );
            }

            console.log(`Batch ${batchIndex + 1} processed successfully`);

            if (batchIndex < totalBatches - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          console.log("All file batches processed successfully");
        } catch (batchError) {
          console.error("Error processing file batches:", batchError);
          toast.error(`Error uploading files: ${batchError}`);
          // Don't throw here, continue with the rest of the process
        }

        // Process whitelist addresses
        if (isChecked) {
          try {
            let whResponse;
            for (let i = 0; i < Math.ceil(whitelistAddress.length / 50); i++) {
              const batch = whitelistAddress.slice(i * 50, (i + 1) * 50);
              whResponse = await whitelistAddressesMutation({
                phase: "WHITELIST",
                launchId: launchId,
                addresses: batch,
              });
            }
            if (whResponse && whResponse.success) {
              toggleSuccessModal();
            }
          } catch (error) {
            console.error("Error processing whitelist:", error);
            toast.error("Error processing whitelist addresses");
          }
        } else {
          toggleSuccessModal();
        }

        // Process FCFS addresses
        if (isSecondChecked) {
          try {
            let whResponse;
            for (let i = 0; i < Math.ceil(fcfslistAddress.length / 50); i++) {
              const batch = fcfslistAddress.slice(i * 50, (i + 1) * 50);
              whResponse = await whitelistAddressesMutation({
                phase: "FCFS_WHITELIST",
                launchId: launchId,
                addresses: batch,
              });
            }
            if (whResponse && whResponse.success) {
              toggleSuccessModal();
            }
          } catch (error) {
            console.error("Error processing FCFS list:", error);
            toast.error("Error processing FCFS addresses");
          }
        } else {
          toggleSuccessModal();
        }
      }
    } catch (error) {
      console.error("Error creating launch:", error);
      toast.error(
        error instanceof Error ? error.message : "Error creating launch"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToOrder = () => {
    router.push(`/orders`);
    reset();
  };

  const handleNavigateToCreate = () => {
    router.push(`/create`);
    reset();
  };

  // Check if any transaction is pending
  const isTransactionLoading = isSendingTransaction || isWaitingForTransaction;

  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <div className="flex flex-col items-center gap-16 z-50 mt-12">
          <CreateBanner
            title={"Create Collection"}
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />

          {/* Step 0 - Details */}
          {step == 0 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-6">
                <p className="font-bold text-profileTitle text-neutral50">
                  Details
                </p>
                <div className="flex flex-col w-full gap-6">
                  <div className="grid gap-3">
                    <p className="font-medium text-lg text-neutral50">Name</p>
                    <Input
                      onReset={reset}
                      title="Name"
                      placeholder="Collection name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <p className="font-medium text-lg text-neutral50">
                      Creator (optional)
                    </p>
                    <Input
                      onReset={reset}
                      name="Creator optional"
                      title="Description"
                      placeholder="Collection creator name"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                    />
                  </div>

                  <TextArea
                    title="Description"
                    text="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Collection logo
                </p>
                {imageFile && imageFile[0] ? (
                  <UploadCardFill
                    image={URL.createObjectURL(imageFile[0])}
                    onDelete={handleDeleteLogo}
                  />
                ) : (
                  <UploadFile
                    text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                    handleImageUpload={handleUploadImage}
                  />
                )}
              </div>
              <div className="flex flex-row justify-between w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  type="submit"
                  title="Continue"
                  onClick={handleCreateCollection}
                  disabled={isLoading || isTransactionLoading}
                  className="w-full"
                >
                  {isLoading || isTransactionLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 1 - Upload */}
          {step == 1 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Upload your Collection
                </p>
                {imageFiles.length !== 0 ? (
                  <div className="flex flex-row w-full h-full gap-8 overflow-x-auto">
                    {imageFiles.map((item, index) => (
                      <div key={index} className="w-full h-full">
                        <CollectiblePreviewCard
                          image={item.preview}
                          key={index}
                          title={item.file.name}
                          onDelete={handleDeleteLogo}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <CollectionUploadFile
                    text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                    handleImageUpload={handleUploadChange}
                  />
                )}
              </div>
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  className="flex w-full border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold items-center justify-center"
                  onClick={() => setStep(2)}
                  disabled={isLoading || isTransactionLoading}
                >
                  {isLoading || isTransactionLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 - Launch Settings */}
          {step == 2 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Launch on Mint Park
                  </p>
                </div>
                <p className="text-neutral200 text-lg">
                  Discover endless possibilities in digital creation. Our
                  platform empowers artists and creators to bring their vision
                  to life through unique NFT collections. With advanced tools
                  and seamless integration, you can focus on what matters most -
                  your creative expression.
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-row w-full justify-between">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Include whitelist phase
                  </p>
                  <Toggle isChecked={isChecked} onChange={toggleWhiteList} />
                </div>
                {isChecked && (
                  <div className="w-full flex flex-col gap-8">
                    <p className="text-neutral200 text-lg">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Proin ac ornare nisi. Aliquam eget semper risus, sed
                      commodo elit. Curabitur sed congue magna. Donec ultrices
                      dui nec ullamcorper aliquet. Nunc efficitur mauris id mi
                      venenatis imperdiet. Integer mauris lectus, pretium eu
                      nibh molestie, rutrum lobortis tortor. Duis sit amet sem
                      fermentum, consequat est nec, ultricies justo.
                    </p>
                    <Button
                      className="w-fit flex gap-3 items-center"
                      variant={"outline"}
                    >
                      <span>
                        <DocumentDownload size={24} color="#FFFFFF" />
                      </span>
                      Download sample .json for connect formatting
                    </Button>
                    {jsonFile ? (
                      <UploadJsonCard
                        title={jsonFile.name}
                        size={formatFileSize(jsonFile.size)}
                        onDelete={handleDeleteJson}
                      />
                    ) : (
                      <UploadJsonFile
                        text="Accepted file types: JSON"
                        handleImageUpload={handleFileUpload}
                      />
                    )}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral50 text-xl font-medium">
                          Start date
                        </p>
                        <div className="flex flex-row gap-4">
                          <div className="relative flex items-center">
                            <Input
                              type="birthdaytime"
                              placeholder="YYYY - MM - DD"
                              className="pl-10 w-[184px]"
                              value={WLStartsAtDate}
                              onChange={(e) =>
                                setWLStartsAtDate(e.target.value)
                              }
                            />
                            <div className="absolute left-4">
                              <Calendar2 size={20} color="#D7D8D8" />
                            </div>
                          </div>
                          <div className="relative flex items-center">
                            <Input
                              placeholder="HH : MM"
                              className="pl-10 w-[184px]"
                              value={WLStartsAtTime}
                              onChange={(e) =>
                                setWLStartsAtTime(e.target.value)
                              }
                            />
                            <div className="absolute left-4">
                              <Clock size={20} color="#D7D8D8" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral50 text-xl font-medium">
                          End date
                        </p>
                        <div className="flex flex-row gap-4">
                          <div className="relative flex items-center">
                            <Input
                              type="birthdaytime"
                              placeholder="YYYY - MM - DD"
                              className="pl-10 w-[184px]"
                              value={WLEndsAtDate}
                              onChange={(e) => setWLEndsAtDate(e.target.value)}
                            />
                            <div className="absolute left-4">
                              <Calendar2 size={20} color="#D7D8D8" />
                            </div>
                          </div>
                          <div className="relative flex items-center">
                            <Input
                              placeholder="HH : MM"
                              className="pl-10 w-[184px]"
                              value={WLEndsAtTime}
                              onChange={(e) => setWLEndsAtTime(e.target.value)}
                            />
                            <div className="absolute left-4">
                              <Clock size={20} color="#D7D8D8" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-neutral50 text-lg font-medium">
                        Whitelist mint price
                      </p>
                      <div className="relative flex items-center">
                        <Input
                          onReset={reset}
                          placeholder="Amount"
                          className="w-full pl-10"
                          type="number"
                          value={WLMintPrice}
                          onChange={(e) =>
                            setWLMintPrice(Number(e.target.value))
                          }
                        />
                        <div className="absolute left-4">
                          <Bitcoin size={20} color="#D7D8D8" />
                        </div>
                        <div className="absolute right-4">
                          <p className="text-md text-neutral200 font-medium">
                            BTC
                          </p>
                        </div>
                      </div>
                      <p className="text-neutral200 text-sm pl-4">
                        Enter 0 for free mints
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-lg text-neutral50 font-medium">
                        Max mint per wallet
                      </p>
                      <Input
                        onReset={reset}
                        placeholder="0"
                        value={WLMaxMintPerWallet}
                        type="number"
                        onChange={(e) =>
                          setWLMaxMintPerWallet(parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-row w-full justify-between">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Include first come, first serve
                  </p>
                  <Toggle
                    isChecked={isSecondChecked}
                    onChange={toggleSecondWhiteList}
                  />
                </div>
                {isSecondChecked && (
                  <div className="w-full flex flex-col gap-8">
                    <p className="text-neutral200 text-lg">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Proin ac ornare nisi. Aliquam eget semper risus, sed
                      commodo elit. Curabitur sed congue magna. Donec ultrices
                      dui nec ullamcorper aliquet. Nunc efficitur mauris id mi
                      venenatis imperdiet. Integer mauris lectus, pretium eu
                      nibh molestie, rutrum lobortis tortor. Duis sit amet sem
                      fermentum, consequat est nec, ultricies justo.
                    </p>
                    <Button
                      className="w-fit flex gap-3 items-center"
                      variant={"outline"}
                    >
                      <span>
                        <DocumentDownload size={24} color="#FFFFFF" />
                      </span>
                      Download sample .json for connect formatting
                    </Button>
                    {fcfsjsonFile ? (
                      <UploadJsonCard
                        title={fcfsjsonFile.name}
                        size={formatFileSize(fcfsjsonFile.size)}
                        onDelete={handleFcfsDeleteJson}
                      />
                    ) : (
                      <UploadJsonFile
                        text="Accepted file types: JSON"
                        handleImageUpload={handleFcfsFileUpload}
                      />
                    )}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral50 text-xl font-medium">
                          Start date
                        </p>
                        <div className="flex flex-row gap-4">
                          <div className="relative flex items-center">
                            <Input
                              type="birthdaytime"
                              placeholder="YYYY - MM - DD"
                              className="pl-10 w-[184px]"
                              value={FCFSStartsAtDate}
                              onChange={(e) =>
                                setFCFSStartsAtDate(e.target.value)
                              }
                            />
                            <div className="absolute left-4">
                              <Calendar2 size={20} color="#D7D8D8" />
                            </div>
                          </div>
                          <div className="relative flex items-center">
                            <Input
                              placeholder="HH : MM"
                              className="pl-10 w-[184px]"
                              value={FCFSStartsAtTime}
                              onChange={(e) =>
                                setFCFSStartsAtTime(e.target.value)
                              }
                            />
                            <div className="absolute left-4">
                              <Clock size={20} color="#D7D8D8" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral50 text-xl font-medium">
                          End date
                        </p>
                        <div className="flex flex-row gap-4">
                          <div className="relative flex items-center">
                            <Input
                              type="birthdaytime"
                              placeholder="YYYY - MM - DD"
                              className="pl-10 w-[184px]"
                              value={FCFSEndsAtDate}
                              onChange={(e) =>
                                setFCFSEndsAtDate(e.target.value)
                              }
                            />
                            <div className="absolute left-4">
                              <Calendar2 size={20} color="#D7D8D8" />
                            </div>
                          </div>
                          <div className="relative flex items-center">
                            <Input
                              placeholder="HH : MM"
                              className="pl-10 w-[184px]"
                              value={FCFSEndsAtTime}
                              onChange={(e) =>
                                setFCFSEndsAtTime(e.target.value)
                              }
                            />
                            <div className="absolute left-4">
                              <Clock size={20} color="#D7D8D8" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-neutral50 text-lg font-medium">
                        FCFS mint price
                      </p>
                      <div className="relative flex items-center">
                        <Input
                          onReset={reset}
                          placeholder="Amount"
                          className="w-full pl-10"
                          type="number"
                          value={FCFSMintPrice}
                          onChange={(e) =>
                            setFCFSMintPrice(Number(e.target.value))
                          }
                        />
                        <div className="absolute left-4">
                          <Bitcoin size={20} color="#D7D8D8" />
                        </div>
                        <div className="absolute right-4">
                          <p className="text-md text-neutral200 font-medium">
                            BTC
                          </p>
                        </div>
                      </div>
                      <p className="text-neutral200 text-sm pl-4">
                        Enter 0 for free mints
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-lg text-neutral50 font-medium">
                        Max mint per wallet
                      </p>
                      <Input
                        onReset={reset}
                        placeholder="0"
                        value={FCFSMaxMintPerWallet}
                        type="number"
                        onChange={(e) =>
                          setFCFSMaxMintPerWallet(parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-row justify-between items-center">
                    <p className="font-bold text-profileTitle text-neutral50">
                      Public phase
                    </p>
                    <Toggle isChecked={isPubChecked} onChange={togglePubList} />
                  </div>
                </div>
                {isPubChecked && (
                  <div className="flex w-full flex-col gap-6">
                    <p className="text-neutral200 text-lg">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Proin ac ornare nisi. Aliquam eget semper risus, sed
                      commodo elit. Curabitur sed congue magna. Donec ultrices
                      dui nec ullamcorper aliquet. Nunc efficitur mauris id mi
                      venenatis imperdiet. Integer mauris lectus, pretium eu
                      nibh molestie, rutrum lobortis tortor. Duis sit amet sem
                      fermentum, consequat est nec, ultricies justo.
                    </p>
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-neutral50 text-xl font-medium">
                        Start date
                      </p>
                      <div className="flex flex-row gap-4">
                        <div className="relative flex items-center">
                          <Input
                            type="birthdaytime"
                            placeholder="YYYY - MM - DD"
                            className="pl-10 w-[184px]"
                            value={POStartsAtDate}
                            onChange={(e) => setPOStartsAtDate(e.target.value)}
                          />
                          <div className="absolute left-4">
                            <Calendar2 size={20} color="#D7D8D8" />
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="HH : MM"
                            className="pl-10 w-[184px]"
                            value={POStartsAtTime}
                            onChange={(e) => setPOStartsAtTime(e.target.value)}
                          />
                          <div className="absolute left-4">
                            <Clock size={20} color="#D7D8D8" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-neutral50 text-xl font-medium">
                        End date
                      </p>
                      <div className="flex flex-row gap-4">
                        <div className="relative flex items-center">
                          <Input
                            type="birthdaytime"
                            placeholder="YYYY - MM - DD"
                            className="pl-10 w-[184px]"
                            value={POEndsAtDate}
                            onChange={(e) => setPOEndsAtDate(e.target.value)}
                          />
                          <div className="absolute left-4">
                            <Calendar2 size={20} color="#D7D8D8" />
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="HH : MM"
                            className="pl-10 w-[184px]"
                            value={POEndsAtTime}
                            onChange={(e) => setPOEndsAtTime(e.target.value)}
                          />
                          <div className="absolute left-4">
                            <Clock size={20} color="#D7D8D8" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-neutral50 text-lg font-medium">
                        Public mint price
                      </p>
                      <div className="relative flex items-center">
                        <Input
                          onReset={reset}
                          placeholder="Amount"
                          className="w-full pl-10"
                          type="number"
                          value={POMintPrice}
                          onChange={(e) =>
                            setPOMintPrice(Number(e.target.value))
                          }
                        />
                        <div className="absolute left-4">
                          <Bitcoin size={20} color="#D7D8D8" />
                        </div>
                        <div className="absolute right-4">
                          <p className="text-md text-neutral200 font-medium">
                            {currentLayer &&
                              getCurrencySymbol(currentLayer.layer)}
                          </p>
                        </div>
                      </div>
                      <p className="text-neutral200 text-sm pl-4">
                        Enter 0 for free mints
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-lg text-neutral50 font-medium">
                        Max mint per wallet
                      </p>
                      <Input
                        onReset={reset}
                        placeholder="0"
                        value={POMaxMintPerWallet}
                        type="number"
                        onChange={(e) =>
                          setPOMaxMintPerWallet(parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={() => setStep(3)}
                  disabled={isLoading || isTransactionLoading}
                  className="flex items-center border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold w-full justify-center"
                >
                  {isLoading || isTransactionLoading ? (
                    <Loader2
                      className="animate-spin"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 - Confirmation */}
          {step == 3 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="flex flex-row items-center justify-start w-full gap-8">
                {imageFile && imageFile[0] && (
                  <Image
                    src={URL.createObjectURL(imageFile[0])}
                    alt="background"
                    width={0}
                    draggable="false"
                    height={160}
                    sizes="100%"
                    className="w-[280px] h-[280px] object-cover rounded-3xl"
                  />
                )}

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl font-bold text-neutral50">{name}</p>
                    <p className="text-xl font-medium text-neutral100">
                      By {creator}
                    </p>
                  </div>
                  <p className="text-neutral100 text-lg">{description}</p>
                </div>
              </div>
              <div className="relative flex flex-row w-full h-auto gap-8 overflow-x-auto">
                {imageFiles.length > 0 && (
                  <div className="flex flex-row w-full h-full gap-8 overflow-x-auto">
                    {imageFiles.map((item, index) => (
                      <div key={index} className="w-full h-full">
                        <CollectiblePreviewCard
                          image={item.preview}
                          key={index}
                          title={name + " " + "#" + index}
                          onDelete={handleDeleteLogo}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-16 w-full">
                {isChecked && (
                  <div className="flex flex-col gap-8 w-full">
                    <p className="text-[28px] leading-9 text-neutral50 font-bold">
                      WhiteList phase
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">Start date</p>
                        <p className="text-neutral50 text-lg font-bold">
                          {WLStartsAtDate},{WLStartsAtTime}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">End date</p>
                        <p className="text-neutral50 text-lg font-bold">
                          {WLEndsAtDate},{WLEndsAtTime}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">
                          Whitelist mint price
                        </p>
                        <p className="text-neutral50 text-lg font-bold">
                          {WLMintPrice}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">
                          Max mint per wallet
                        </p>
                        <p className="text-neutral50 text-lg font-bold">
                          {WLMaxMintPerWallet}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {isSecondChecked && (
                  <div className="flex flex-col gap-8 w-full">
                    <p className="text-[28px] leading-9 text-neutral50 font-bold">
                      FCFS phase
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">Start date</p>
                        <p className="text-neutral50 text-lg font-bold">
                          {FCFSStartsAtDate},{FCFSStartsAtTime}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">End date</p>
                        <p className="text-neutral50 text-lg font-bold">
                          {FCFSEndsAtDate},{FCFSEndsAtTime}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">
                          FCFS mint price
                        </p>
                        <p className="text-neutral50 text-lg font-bold">
                          {FCFSMintPrice}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">
                          Max mint per wallet
                        </p>
                        <p className="text-neutral50 text-lg font-bold">
                          {FCFSMaxMintPerWallet}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {isPubChecked && (
                  <div className="flex flex-col gap-8 w-full">
                    <p className="text-[28px] leading-9 text-neutral50 font-bold">
                      Public phase
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">Start date</p>
                        <p className="text-neutral50 text-lg font-bold">
                          {POStartsAtDate},{POStartsAtTime}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">End date</p>
                        <p className="text-neutral50 text-lg font-bold">
                          {POEndsAtDate},{POEndsAtTime}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">
                          Public mint price
                        </p>
                        <p className="text-neutral50 text-lg font-bold">
                          {POMintPrice}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-neutral200 text-lg">
                          Max mint per wallet
                        </p>
                        <p className="text-neutral50 text-lg font-bold">
                          {POMaxMintPerWallet}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={handleCreateLaunch}
                  disabled={isLoading || isTransactionLoading}
                  className="flex justify-center border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold w-full items-center"
                >
                  {isLoading || isTransactionLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show transaction status */}
      {sendTransactionError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded z-50">
          Transaction Error: {sendTransactionError.message}
        </div>
      )}

      {transactionSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded z-50">
          Transaction Successful!
        </div>
      )}

      <OrderPayModal
        open={payModal}
        onClose={togglePayModal}
        fileTypeSizes={fileTypeSizes}
        id={collectionId}
        fileSizes={fileSizes}
        files={files}
        navigateOrders={handleNavigateToOrder}
        navigateToCreate={handleNavigateToCreate}
        hash={
          "0x41aad9ebeee10d124f4abd123d1fd41dbb80162e339e9d61db7e90dd6139e89e"
        }
      />
      <SuccessModal
        open={successModal}
        onClose={toggleSuccessModal}
        handleCreate={handleCreate}
      />
    </Layout>
  );
};

export default IPFS;
