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
  LaunchCollectionData,
  MintFeeType,
  MintDataType,
} from "@/lib/types";
import TextArea from "@/components/ui/textArea";
import {
  createCollectiblesToCollection,
  createCollection,
  createMintHexCollection,
  launchCollection,
  mintFeeOfCitrea,
} from "@/lib/service/postRequest";
import useCreateFormState from "@/lib/store/createFormStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CollectionUploadFile from "@/components/section/collection-upload-file";
import Toggle from "@/components/ui/toggle";
import { Calendar2, Clock, Bitcoin } from "iconsax-react";
import OrderPayModal from "@/components/modal/order-pay-modal";
import { useAuth } from "@/components/provider/auth-context-provider";
import moment from "moment";
import SuccessModal from "@/components/modal/success-modal";
import { getLayerById } from "@/lib/service/queryHelper";
import { ethers } from "ethers";
import { getSigner } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import InscribeOrderModal from "@/components/modal/insribe-order-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrentLayerSchema } from "@/lib/validations/layer-validation";

const CollectionDetail = () => {
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
  const [step, setStep] = useState<number>(0);
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
  const [data, setData] = useState<string>("");

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createCollection,
  });

  const { mutateAsync: launchCollectionMutation } = useMutation({
    mutationFn: launchCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launchData"] });
    },
  });

  const { mutateAsync: mintFeeOfCitreaMutation } = useMutation({
    mutationFn: mintFeeOfCitrea,
  });

  const { mutateAsync: createCollectiblesMutation } = useMutation({
    mutationFn: createCollectiblesToCollection,
  });

  const { mutateAsync: createHexCollectionMutation } = useMutation({
    mutationFn: createMintHexCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData"] });
    },
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

  const { data: currentLayer } = useQuery<CurrentLayerSchema>({
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
    setIsLoading(true);
    try {
      const params: CollectionData = {
        logo: imageFile[0],
        name: name,
        creator: creator,
        description: description,
        priceForLaunchpad: 0.001,
      };
      if (params) {
        const response = await createCollectionMutation({ data: params });
        console.log("🚀 ~ handleCreateCollection ~ response:", response);
        if (response && response.success) {
          const { id } = response.data.collection;
          const { deployContractTxHex } = response.data;
          setCollectionId(id);
          console.log("create collection success", response);
          toast.success("Create collection success.");

          if (currentLayer.layer === "CITREA") {
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
      const newImageFiles: ImageFile[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      // setImageLogo(newImageFiles);
      setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
      updateFileInfo(Array.from(files));
    }
  };

  const togglePayModal = () => {
    setPayModal(!payModal);
    // reset();
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

  const handleMintfeeChange = async () => {
    if (!currentLayer) {
      toast.error("Layer information not available");
      return false;
    }
    setIsLoading(true);
    try {
      const params: MintFeeType = {
        collectionTxid: txid,
        mintFee: POMintPrice.toString(),
      };
      const response = await mintFeeOfCitreaMutation({ data: params });
      if (response && response.success) {
        const { singleMintTxHex } = response.data;
        console.log("create collection success", response);
        toast.success("Create collection success.");

        if (currentLayer.layer === "CITREA") {
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(singleMintTxHex);
          await signedTx?.wait();
        }
        setStep(3);
      }
    } catch (error) {
      toast.error("Error creating launch.");
      console.error("Error creating launch: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLaunch = async () => {
    setIsLoading(true);
    const POStartsAt = calculateTimeUntilDate(POStartsAtDate, POStartsAtTime);
    const POEndsAt = calculateTimeUntilDate(POEndsAtDate, POEndsAtTime);

    try {
      const batchSize = 10;
      const totalBatches = Math.ceil(files.length / batchSize);
      let response;
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Get the current batch of files
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, files.length);
        const currentBatchFiles = files.slice(start, end);

        const params: LaunchCollectionData = {
          files: currentBatchFiles,
          POStartsAt: POStartsAt,
          POEndsAt: POEndsAt,
          POMintPrice: POMintPrice,
          POMaxMintPerWallet: POMaxMintPerWallet,
          isWhiteListed: false,
          txid: txid,
          totalFileCount: files.length,
        };

        response = await launchCollectionMutation({
          data: params,
          collectionId: collectionId,
        });

        if (response && response.success) {
          // Small delay between batches to prevent rate limiting
          if (batchIndex < totalBatches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        console.log("Batch upload index: ", batchIndex);
      }
      toggleSuccessModal();
    } catch (error) {
      console.error("Error creating launch:", error);
      toast.error("Error creating launch.");
      toast.error("Error creating launch.");
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
    try {
      // Process files in batches of 10
      const batchSize = 10;
      const totalBatches = Math.ceil(files.length / batchSize);
      let response;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Get the current batch of files
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, files.length);
        const currentBatchFiles = files.slice(start, end);

        const params: MintDataType = {
          orderType: "COLLECTION",
          files: currentBatchFiles,
          collectionId: collectionId,
          feeRate: 1,
          txid: txid,
          totalFileCount: files.length, // Total count of all files
        };

        response = await createCollectiblesMutation({ data: params });

        if (response && response.success) {
          // Small delay between batches to prevent rate limiting
          if (batchIndex < totalBatches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Store the last successful order ID
          setData(response.data.order.id);
        }

        console.log("Batch upload index: ", batchIndex);
      }

      if (currentLayer.layer === "CITREA") {
        const hexRes = await createHexCollectionMutation({
          orderId: response.data.order.id,
        });
        if (hexRes && hexRes.success) {
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(
            hexRes.data.batchMintTxHex
          );
          setInscribeModal(true);
          await signedTx?.wait();
          setInscribeModal(true);
        }
      } else if (currentLayer.layer === "FRACTAL") {
        await window.unisat.sendBitcoin(
          response.data.order.fundingAddress,
          response.data.order.fundingAmount
        );
        setInscribeModal(true);
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
              {/* <div className="flex flex-col w-full gap-8">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Include traits
                  </p>
                  <Toggle isChecked={isChecked} onChange={handleCheckBox} />
                </div>
                <p className="text-neutral100 text-lg2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                  ac ornare nisi. Aliquam eget semper risus, sed commodo elit.
                  Curabitur sed congue magna. Donec ultrices dui nec ullamcorper
                  aliquet. Nunc efficitur mauris id mi venenatis imperdiet.
                  Integer mauris lectus, pretium eu nibh molestie, rutrum
                  lobortis tortor. Duis sit amet sem fermentum, consequat est
                  nec, ultricies justo.
                </p>
                <div className="flex flex-row rounded-xl border-neutral400 border w-[443px] gap-3 justify-center items-center py-3">
                  <DocumentDownload size={24} color="#ffffff" />
                  <p className="text-lg font-semibold text-neutral50">
                    Download sample .CSV for correct formatting
                  </p>
                </div>
                <div className={isChecked ? `flex` : `hidden`}>
                  {jsonData.length !== 0 && jsonMetaData ? (
                    <FileCard
                      onDelete={handleDelete}
                      fileName={jsonMetaData.name}
                      fileSize={jsonMetaData.size}
                    />
                  ) : (
                    <UploadFile
                      text="Accepted file types: .JSON"
                      handleImageUpload={handleJsonUpload}
                      acceptedFileTypes=".json"
                    />
                  )}
                </div>
              </div> */}
              {/* {isLoading && (
                <div>
                  <progress value={progress.value} max={progress.total} />
                  <p>{progress.message}</p>
                  <p>{`${progress.value}/${progress.total} NFTs minted`}</p>
                </div>
              )} */}
              {/* <div className="text-red-500">{error}</div> */}
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
                  onClick={isChecked ? handleMintfeeChange : () => setStep(3)}
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
                  <p className="text-neutral100 text-lg2">{description}</p>
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
      <OrderPayModal
        open={payModal}
        onClose={togglePayModal}
        fileTypeSizes={fileTypeSizes}
        id={collectionId}
        fileSizes={fileSizes}
        files={files}
        navigateOrders={handleNavigateToOrder}
        navigateToCreate={handleNavigateToCreate}
        hash={txid}
      />

      <InscribeOrderModal
        open={inscribeModal}
        onClose={() => setInscribeModal(false)}
        id={data}
        navigateOrders={() => router.push("/orders")}
        navigateToCreate={() => router.push("/create")}
        txid={txid}
      />
      <SuccessModal
        open={successModal}
        onClose={toggleSuccessModal}
        handleCreate={handleCreate}
      />
    </Layout>
  );
};

export default CollectionDetail;
