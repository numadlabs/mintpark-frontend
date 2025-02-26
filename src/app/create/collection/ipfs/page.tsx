"use client";

import React, { useState } from "react";
import Banner from "@/components/section/banner";
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
import { formatFileSize, getSigner } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import UploadJsonCard from "@/components/atom/cards/upload-json-card";
import UploadJsonFile from "@/components/section/upload-json-file";
import { ethers } from "ethers";
// import { MerkleTree } from 'merkletreejs';

const IPFS = () => {
  const router = useRouter();
  const { authState, selectedLayerId } = useAuth();
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
    txid,
    setTxid,
    reset,
  } = useCreateFormState();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [payModal, setPayModal] = useState(false);
  const [fileTypes, setFileTypes] = useState<Set<string>>(new Set());
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [fileSizes, setFileSizes] = useState<number[]>([]);
  const [whitelistAddress, setWhitelistAddress] = useState<string[]>([]);
  const [jsonFile, setJsonFile] = useState<File | null>(null);

  const stepperData = ["Details", "Upload", "Launch", "Confirm"];
  const [totalFileSize, setTotalFileSize] = useState<number>(0);
  const [fileTypeSizes, setFileTypeSizes] = useState<number[]>([]);
  const [successModal, setSuccessModal] = useState(false);

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

  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
  });

  const calculateTimeUntilDate = (
    dateString: string,
    timeString: string,
  ): number => {
    try {
      // Input validation
      if (!dateString || !timeString) {
        console.error("Missing date or time input");
        toast.error("Missing date or time input");
        return 0;
      }

      // Normalize the time string to ensure proper format (HH:mm)
      const normalizedTime = timeString.replace(" ", ":");

      // Combine date and time
      const dateTimeString = `${dateString} ${normalizedTime}`;

      // Parse using moment with explicit format
      const momentDate = moment(dateTimeString, "YYYY-MM-DD HH:mm");

      // Validate the parsed date
      if (!momentDate.isValid()) {
        console.error("Invalid date/time combination:", dateTimeString);
        toast.error("Invalid date and time combination.");
        return 0;
      }

      // Get Unix timestamp in seconds
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
    if (currentLayer.layerType === "EVM" && !window.ethereum) {
      toast.error("Please install MetaMask extension to continue");
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
        userLayerId: authState.userLayerId,
        layerId: selectedLayerId,
      };
      if (params) {
        const response = await createCollectionMutation({ data: params });
        console.log("🚀 ~ handleCreateCollection ~ response:", response);
        if (response && response.success) {
          const { id } = response.data.l2Collection;
          const { deployContractTxHex } = response.data;
          setCollectionId(id);
          console.log("create collection success", response);
          toast.success("Create collection success.");

          if (currentLayer.layerType === "EVM") {
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(deployContractTxHex);
            await signedTx?.wait();
            if (signedTx?.hash) setTxid(signedTx?.hash);
          }

          setStep(1);
        }
      }
    } catch (error) {
      toast.error("Error creating collection.");
      console.error("Error creating collection:", error);
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
      const filteredFiles = Array.from(files).filter((file) => file.size > 0); // Only process non-empty files

      const newImageFiles: ImageFile[] = filteredFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);

      // Calculate sizes only for valid files
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
      // Read and parse the JSON file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          // Assuming the JSON file contains an array of addresses
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

  const togglePayModal = () => {
    setPayModal(!payModal);
    // reset();
  };

  const handleDeleteLogo = () => {
    setImageFile([]); // Clear the imageFile array
    // setImageLogo(null);
  };

  const handleDeleteJson = () => {
    setJsonFile(null);
  };

  const handleBack = () => {
    if (step > 0 || step > 3) {
      setStep(step - 1);
      reset(); // Reset form data when going back
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

  const files = imageFiles.map((image) => image.file);

  // Add helper function for merkle root generation
  function generateMerkleRoot(addresses: string[]): string {
    const leaves = addresses.map((addr) =>
      // ethers.keccak256(ethers.encodePacked(["address"], [addr]))
      ethers.solidityPacked(["address"], [addr]),
    );
    // const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
    return "";
    // return tree.getHexRoot();
  }

  const handleCreateLaunch = async () => {
    setIsLoading(true);
    const poStartsAt = calculateTimeUntilDate(POStartsAtDate, POStartsAtTime);
    const poEndsAt = calculateTimeUntilDate(POEndsAtDate, POEndsAtTime);
    const wlStartsAt = calculateTimeUntilDate(WLStartsAtDate, WLStartsAtTime);
    const wlEndsAt = calculateTimeUntilDate(WLEndsAtDate, WLEndsAtTime);

    try {
      const batchSize = 10;
      const totalBatches = Math.ceil(files.length / batchSize);
      const params: LaunchParams = {
        collectionId: collectionId,
        isWhitelisted: isChecked ? true : false,
        poStartsAt: poStartsAt,
        poEndsAt: poEndsAt,
        poMintPrice: POMintPrice,
        poMaxMintPerWallet: POMaxMintPerWallet,
        wlStartsAt: wlStartsAt,
        wlEndsAt: wlEndsAt,
        wlMintPrice: WLMintPrice,
        wlMaxMintPerWallet: WLMaxMintPerWallet,
        userLayerId: authState.userLayerId,
      };
      if (!selectedLayerId) {
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

        if (!launchResponse?.data?.launch?.collectionId) {
          throw new Error("Launch response missing collection ID");
        }

        if (isChecked) {
          const wlStartsAt = calculateTimeUntilDate(
            WLStartsAtDate,
            WLStartsAtTime,
          );
          const wlEndsAt = calculateTimeUntilDate(WLEndsAtDate, WLEndsAtTime);

          // Add whitelist phase
          const whitelistPhaseResponse = await addPhaseMutation({
            collectionId,
            phaseType: 1, // PhaseType.WHITELIST
            price: WLMintPrice.toString(),
            startTime: wlStartsAt,
            endTime: wlEndsAt,
            maxSupply: whitelistAddress.length, // Set max supply to whitelist size
            maxPerWallet: WLMaxMintPerWallet,
            maxMintPerPhase: whitelistAddress.length,
            merkleRoot: generateMerkleRoot(whitelistAddress),
            layerId: selectedLayerId,
            userLayerId: authState.userLayerId,
          });

          if (currentLayer.layerType === "EVM") {
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(
              whitelistPhaseResponse.data.unsignedTx,
            );
            await signedTx?.wait();
          }
        }

        // Add public phase
        const publicPhaseResponse = await addPhaseMutation({
          collectionId,
          phaseType: 2, // PhaseType.PUBLIC
          price: POMintPrice.toString(),
          startTime: poStartsAt,
          endTime: poEndsAt,
          maxSupply: 0, // Unlimited supply for public phase
          maxPerWallet: POMaxMintPerWallet,
          maxMintPerPhase: 0, // Unlimited mints for public phase
          merkleRoot: ethers.ZeroHash, // No merkle root needed for public phase
          layerId: selectedLayerId,
          userLayerId: authState.userLayerId,
        });

        if (currentLayer.layerType === "EVM") {
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(
            publicPhaseResponse.data.unsignedTx,
          );
          await signedTx?.wait();
        }

        const launchCollectionId = launchResponse.data.launch.collectionId;
        console.log("Launch Collection ID:", launchCollectionId);
        const launchId = launchResponse.data.launch.id;

        // Process files in batches
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const start = batchIndex * batchSize;
          const end = Math.min(start + batchSize, files.length);
          const currentBatchFiles = files.slice(start, end);

          const names = currentBatchFiles.map(
            (_, index) => `${name.replace(/\s+/g, "")}-${start + index + 1}`,
          );

          const launchItemsData: CreateLaunchParams = {
            files: currentBatchFiles,
            names: names,
            collectionId: launchCollectionId,
            isLastBatch: batchIndex === totalBatches - 1,
          };

          const response = await launchItemsMutation({ data: launchItemsData });

          if (!response?.success) {
            throw new Error(`Failed to process batch ${batchIndex + 1}`);
          }

          // Add delay between batches except for the last one
          if (batchIndex < totalBatches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
        if (isChecked) {
          try {
            let whResponse;
            // Process whitelist addresses in batches of 50
            for (let i = 0; i < Math.ceil(whitelistAddress.length / 50); i++) {
              const batch = whitelistAddress.slice(i * 50, (i + 1) * 50);
              whResponse = await whitelistAddressesMutation({
                launchId: launchId,
                addresses: batch,
              });
            }
            if (whResponse && whResponse.success) {
              console.log("Whitelist processing completed");
              toggleSuccessModal();
            }
          } catch (error) {
            console.error("Error processing whitelist:", error);
            toast.error("Error processing whitelist addresses");
          }
        } else {
          toggleSuccessModal();
        }
      }
    } catch (error) {
      console.error("Error creating launch:", error);
      toast.error(
        error instanceof Error ? error.message : "Error creating launch",
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

  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <Header />
        <div className="flex flex-col items-center gap-16 z-50 mt-12">
          <Banner
            title={"Create Collection"}
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
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
                      Creater (optional)
                    </p>
                    <Input
                      onReset={reset}
                      name="Creater optional"
                      title="Description"
                      placeholder="Collection creator name"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                    />
                  </div>

                  <TextArea
                    // onReset={reset}
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
                  disabled={isLoading}
                  className="w-full"
                  // isLoading={isLoading}
                >
                  {isLoading ? (
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
                  // type="submit"
                  onClick={() => setStep(2)}
                  // isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
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
              <div className="flex flex-col gap-8">
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-row justify-between items-center">
                    <p className="font-bold text-profileTitle text-neutral50">
                      Public phase
                    </p>
                  </div>
                  <p className="text-neutral200 text-lg">
                    Take control of your digital creations. Our platform
                    provides the tools you need to mint, manage, and monetize
                    your NFT collections. Join a growing ecosystem of artists
                    redefining the boundaries of digital art.
                  </p>
                </div>
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
                      onChange={(e) => setPOMintPrice(Number(e.target.value))}
                    />
                    <div className="absolute left-4">
                      <Bitcoin size={20} color="#D7D8D8" />
                    </div>
                    <div className="absolute right-4">
                      <p className="text-md text-neutral200 font-medium">
                        cBTC
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
                      setPOMaxMintPerWallet(Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={() => setStep(3)}
                  // isLoading={isLoading}
                  disabled={isLoading}
                  className="flex items-center   border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold  w-full justify-center"
                >
                  {isLoading ? (
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
                          Public mint price
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
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={handleCreateLaunch}
                  // isLoading={isLoading}
                  disabled={isLoading}
                  className="flex justify-center border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold  w-full items-center"
                >
                  {isLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    // "Loading"
                    "Confirm"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
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
