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
  InscriptionCollectible,
  CreateLaunchParams,
  LaunchParams,
} from "@/lib/types";
import TextArea from "@/components/ui/textArea";
import {
  createCollectiblesToCollection,
  createCollection,
  createMintHexCollection,
  launchCollection,
  mintFeeOfCitrea,
  createMintCollection,
  insriptionCollectible,
  invokeOrderMint,
  createLaunchItems,
  createLaunch,
} from "@/lib/service/postRequest";
import useCreateFormState from "@/lib/store/createFormStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toggle from "@/components/ui/toggle";
import {
  Calendar2,
  Clock,
  Bitcoin,
  DocumentUpload,
  DocumentDownload,
} from "iconsax-react";
import { useAuth } from "@/components/provider/auth-context-provider";
import moment from "moment";
import SuccessModal from "@/components/modal/success-modal";
import { getLayerById } from "@/lib/service/queryHelper";
import { Loader2 } from "lucide-react";
import InscribeOrderModal from "@/components/modal/insribe-order-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AddTraitsModal from "@/components/modal/add-traits-modal";

const Recursive = () => {
  const router = useRouter();
  const { authState } = useAuth();
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
    txid,
    setTxid,
    reset,
  } = useCreateFormState();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [payModal, setPayModal] = useState(false);
  const [fileTypes, setFileTypes] = useState<Set<string>>(new Set());
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [fileSizes, setFileSizes] = useState<number[]>([]);
  const [logoImage, setImageLogo] = useState<ImageFile | null>(null);
  const stepperData = ["Details", "Upload", "Launch", "Confirm"];
  const [totalFileSize, setTotalFileSize] = useState<number>(0);
  const [fileTypeSizes, setFileTypeSizes] = useState<number[]>([]);
  const [successModal, setSuccessModal] = useState(false);
  const [inscribeModal, setInscribeModal] = useState(false);
  const [traitModal, setTraitModal] = useState(false);
  const [data, setData] = useState<string>("");

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createCollection,
  });

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: createMintCollection,
  });

  const { mutateAsync: inscriptionMutation } = useMutation({
    mutationFn: insriptionCollectible,
  });

  const { mutateAsync: invokeOrderMutation } = useMutation({
    mutationFn: invokeOrderMint,
  });

  const { mutateAsync: launchItemsMutation } = useMutation({
    mutationFn: createLaunchItems,
  });

  const { mutateAsync: createLaunchMutation } = useMutation({
    mutationFn: createLaunch,
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
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const calculateTimeUntilDate = (
    dateString: string,
    timeString: string
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
    if (currentLayer.layer === "CITREA" && !window.ethereum) {
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
        type: "INSCRIPTION",
        userLayerId: authState.userLayerId,
        layerId: authState.layerId,
      };
      if (params) {
        const response = await createCollectionMutation({ data: params });
        console.log("🚀 ~ handleCreateCollection ~ response:", response);
        if (response && response.success) {
          const { id } = response.data.ordinalCollection;
          const { deployContractTxHex } = response.data;
          setCollectionId(id);
          console.log("create collection success", response);
          toast.success("Create collection success.");

          // if (currentLayer.layer === "CITREA") {
          //   const { signer } = await getSigner();
          //   const signedTx = await signer?.sendTransaction(deployContractTxHex);
          //   await signedTx?.wait();
          //   if (signedTx?.hash) setTxid(signedTx?.hash);
          // }

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

  const toggleTraitModal = () => {
    setTraitModal(!traitModal);
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
    // reset();
  };

  const handleDeleteLogo = () => {
    setImageFile([]); // Clear the imageFile array
    setImageLogo(null);
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

  const files = imageFiles.map((image) => image.file);

  const handleCreateLaunch = async () => {
    setIsLoading(true);
    const poStartsAt = calculateTimeUntilDate(POStartsAtDate, POStartsAtTime);
    const poEndsAt = calculateTimeUntilDate(POEndsAtDate, POEndsAtTime);

    try {
      const batchSize = 10;
      const totalBatches = Math.ceil(files.length / batchSize);
      const params: LaunchParams = {
        collectionId: collectionId,
        isWhitelisted: false,
        poStartsAt: poStartsAt,
        poEndsAt: poEndsAt,
        poMintPrice: POMintPrice,
        poMaxMintPerWallet: POMaxMintPerWallet,
        userLayerId: authState.userLayerId,
      };

      if (params && totalFileSize) {
        // Launch the collection
        const launchResponse = await createLaunchMutation({
          data: params,
          txid: "0x41aad9ebeee10d124f4abd123d1fd41dbb80162e339e9d61db7e90dd6139e89e",
          totalFileSize: totalFileSize,
          feeRate: 1,
        });

        if (!launchResponse?.data?.launch?.collectionId) {
          throw new Error("Launch response missing collection ID");
        }

        const launchCollectionId = launchResponse.data.launch.collectionId;
        console.log("Launch Collection ID:", launchCollectionId);

        // Process files in batches
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

          const response = await launchItemsMutation({ data: launchItemsData });

          if (!response?.success) {
            throw new Error(`Failed to process batch ${batchIndex + 1}`);
          }

          // Add delay between batches except for the last one
          if (batchIndex < totalBatches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        toggleSuccessModal();
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

  const handlePay = async () => {
    if (!currentLayer) {
      toast.error("Layer information not available");
      return false;
    }

    setIsLoading(true);

    // Process files in batches of 10
    const batchSize = 10;
    const totalBatches = Math.ceil(files.length / batchSize);
    try {
      if (collectionId && authState.userLayerId && totalFileSize) {
        const response = await createOrder({
          collectionId: collectionId,
          feeRate: 1,
          txid: "0x41aad9ebeee10d124f4abd123d1fd41dbb80162e339e9d61db7e90dd6139e89e",
          userLayerId: authState.userLayerId,
          totalFileSize: totalFileSize,
          totalCollectibleCount: files.length,
        });
        if (response && response.success) {
          await window.unisat.sendBitcoin(
            response.data.order.fundingAddress,
            Math.ceil(response.data.order.fundingAmount * 10 ** 8)
          );

          const orderID = response.data.order.id;

          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            // Get the current batch of files
            const start = batchIndex * batchSize;
            const end = Math.min(start + batchSize, files.length);
            const currentBatchFiles = files.slice(start, end);

            const names = currentBatchFiles.map(
              (_, index) => `${name.replace(/\s+/g, "")}-${start + index + 1}`
            );
            const params: InscriptionCollectible = {
              files: currentBatchFiles,
              collectionId: collectionId,
              names: names, // Total count of all files
            };

            const colRes = await inscriptionMutation({ data: params });

            if (colRes && colRes.success) {
              // Small delay between batches to prevent rate limiting
              if (batchIndex < totalBatches - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }

              // Store the last successful order ID
              setData(colRes.data.order.id);
            }

            console.log("Batch upload index: ", batchIndex);
          }

          const orderRes = await invokeOrderMutation({ id: orderID });
          if (orderRes && orderRes.success) {
            setInscribeModal(true);
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <Header />
        <div className="flex flex-col items-center gap-16 z-50">
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
                <div className="flex flex-col gap-4">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Include traits
                  </p>
                  <p className="text-lg text-neutral200">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Proin ac ornare nisi. Aliquam eget semper risus, sed commodo
                    elit. Curabitur sed congue magna. Donec ultrices dui nec
                    ullamcorper aliquet.
                  </p>
                </div>
                <Button
                  className="flex flex-row gap-3 items-center w-fit"
                  variant={"outline"}
                  onClick={toggleTraitModal}
                >
                  <DocumentUpload size={24} color="#FFFFFF" />
                  Add traits
                </Button>
              </div>
              <div className="flex flex-col w-full gap-8">
                <div className="flex flex-col gap-4">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Upload JSON file
                  </p>
                  <p className="text-lg text-neutral200">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Proin ac ornare nisi. Aliquam eget semper risus, sed commodo
                    elit. Curabitur sed congue magna. Donec ultrices dui nec
                    ullamcorper aliquet.
                  </p>
                </div>
                <Button
                  className="flex flex-row gap-3 items-center w-fit"
                  variant={"outline"}
                >
                  <DocumentDownload size={24} color="#FFFFFF" />
                  Download sample .CSV for correct formatting
                </Button>
                <UploadFile
                  text="Accepted file types: JSON file"
                  handleImageUpload={handleUploadImage}
                />
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

                  {/* {isLoading ? "...loading" : "Continue"} */}
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
                  <Toggle isChecked={isChecked} onChange={handleToggle} />
                </div>
                <p className="text-neutral200 text-lg">
                  Discover endless possibilities in digital creation. Our
                  platform empowers artists and creators to bring their vision
                  to life through unique NFT collections. With advanced tools
                  and seamless integration, you can focus on what matters most -
                  your creative expression.
                </p>
              </div>
              {isChecked ? (
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
              ) : (
                ""
              )}
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
              {isChecked && (
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
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={isChecked ? handleCreateLaunch : handlePay}
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

      <InscribeOrderModal
        open={inscribeModal}
        onClose={() => setInscribeModal(false)}
        id={data}
        navigateOrders={() => router.push("/orders")}
        navigateToCreate={() => router.push("/create")}
        txid={
          "0x41aad9ebeee10d124f4abd123d1fd41dbb80162e339e9d61db7e90dd6139e89e"
        }
      />
      <SuccessModal
        open={successModal}
        onClose={toggleSuccessModal}
        handleCreate={handleCreate}
      />
      <AddTraitsModal onClose={toggleTraitModal} open={traitModal} />
    </Layout>
  );
};

export default Recursive;
