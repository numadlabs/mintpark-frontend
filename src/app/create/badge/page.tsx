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
import {
  LaunchType,
  LaunchItemType,
  MintFeeType,
  BadgeType,
} from "@/lib/types";
import TextArea from "@/components/ui/textArea";
import {
  createBadgeCollection,
  createBadgeLaunch,
  launchItems,
  mintFeeOfCitrea,
} from "@/lib/service/postRequest";
import useCreateFormState from "@/lib/store/createFormStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar2, Clock, Bitcoin } from "iconsax-react";
import { useAuth } from "@/components/provider/auth-context-provider";
import moment from "moment";
import SuccessModal from "@/components/modal/success-modal";
import { getLayerById } from "@/lib/service/queryHelper";
import { cn, getSigner } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BADGE_BATCH_SIZE } from "@/lib/utils";

const Badge = () => {
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
    txid,
    setTxid,
    supply,
    setSupply,
    reset,
  } = useCreateFormState();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const stepperData = ["Details", "Launch", "Upload", "Confirm"];
  const [successModal, setSuccessModal] = useState(false);
  const [date, setDate] = React.useState<Date>();

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createBadgeCollection,
  });

  const { mutateAsync: createLaunchMutation } = useMutation({
    mutationFn: createBadgeLaunch,
  });

  const { mutateAsync: launchItemMutation } = useMutation({
    mutationFn: launchItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launchData"] });
      queryClient.invalidateQueries({ queryKey: ["collectionData"] });
    },
  });

  const { mutateAsync: mintFeeOfCitreaMutation } = useMutation({
    mutationFn: mintFeeOfCitrea,
  });

  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
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
    if (currentLayer.layer === "EDUCHAIN" && !window.ethereum) {
      toast.error("Please install MetaMask extension to continue");
      return;
    }
    setIsLoading(true);
    try {
      const params: BadgeType = {
        name: name,
        description: description,
        priceForLaunchpad: 0.001,
        type: "IPFS",
        userLayerId: authState.userLayerId,
        layerId: selectedLayerId,
        isBadge: true,
        creator: creator,
      };
      if (params) {
        const response = await createCollectionMutation({ data: params });
        console.log("🚀 ~ handleCreateCollection ~ response:", response);
        if (response && response.success) {
          const { id } = response.data.collection;
          const { deployContractTxHex } = response.data;
          setCollectionId(id);
          console.log("create collection success", response);

          if (currentLayer.layer === "EDUCHAIN") {
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
    }
  };

  const handleDeleteLogo = () => {
    setImageFile([]); // Clear the imageFile array
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

  const handleNavigation = () => {
    router.push("/launchpad");
    reset();
  };

  const toggleSuccessModal = () => {
    setSuccessModal(!successModal);
  };

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
      const response = await mintFeeOfCitreaMutation({
        data: params,
        userLayerId: authState.userLayerId,
      });
      if (response && response.success) {
        const { singleMintTxHex } = response.data;
        if (currentLayer.layer === "EDUCHAIN") {
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(singleMintTxHex);
          await signedTx?.wait();
        }
        setStep(2);
      }
    } catch (error) {
      toast.error("Error creating launch.");
      console.error("Error creating launch: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLaunch = async () => {
    if (!imageFile || imageFile.length === 0) {
      toast.error("Please upload a badge image first");
      return;
    }

    setIsLoading(true);
    const poStartsAt = calculateTimeUntilDate(POStartsAtDate, POStartsAtTime);
    const poEndsAt = calculateTimeUntilDate(POEndsAtDate, POEndsAtTime);

    try {
      const params: LaunchType = {
        collectionId: collectionId,
        isWhitelisted: false,
        poStartsAt: poStartsAt,
        poEndsAt: poEndsAt,
        poMintPrice: POMintPrice,
        poMaxMintPerWallet: POMaxMintPerWallet,
        userLayerId: authState.userLayerId,
      };

      if (params) {
        // Launchx the collection using the imageFile instead of files array
        const launchResponse = await createLaunchMutation({
          data: params,
          txid: txid,
          badge: imageFile[0], // Pass the first (and only) file from imageFile array
          badgeSupply: supply,
        });

        if (launchResponse && launchResponse.success) {
          let response;
          const launchCollectionId = launchResponse.data.launch.collectionId;

          const launchItemsData: LaunchItemType = {
            collectionId: launchCollectionId,
          };

          for (
            let i = 0;
            i < Math.ceil(Number(supply) / BADGE_BATCH_SIZE);
            i++
          ) {
            response = await launchItemMutation({ data: launchItemsData });
          }

          if (response && response.success) {
            console.log("create collection success", response);
            toggleSuccessModal();
          }
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

  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <Header />
        <div className="flex flex-col items-center gap-16 z-50">
          <Banner
            title={"Create Badge"}
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
                    title="Description"
                    text="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  type="submit"
                  title="Continue"
                  onClick={handleCreateCollection}
                  disabled={isLoading}
                  className="w-full"
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
                  <p className="text-lg text-neutral50 font-medium">Supply</p>
                  <Input
                    onReset={reset}
                    placeholder="0"
                    value={supply}
                    type="number"
                    onChange={(e) => setSupply(parseInt(e.target.value))}
                  />
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
                      <p className="text-md text-neutral200 font-medium">EDU</p>
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
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={handleMintfeeChange}
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
          {step == 2 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-8">
                <div className="w-full flex flex-col gap-4">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Upload your Badge
                  </p>
                  <p className="text-lg text-neutral200">
                    The NFTs you want to include for this brand or project.
                    Please name your files sequentially, like ‘1.png’, ‘2.jpg’,
                    ‘3.webp’, etc., according to their order and file type.
                  </p>
                </div>
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
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  className="flex w-full border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold items-center justify-center"
                  onClick={() => setStep(3)}
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
                    <p className="text-neutral200 text-lg">Supply</p>
                    <p className="text-neutral50 text-lg font-bold">{supply}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-neutral200 text-lg">Public mint price</p>
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
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={handleCreateLaunch}
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
                    "Confirm"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SuccessModal
        open={successModal}
        onClose={toggleSuccessModal}
        handleCreate={handleCreate}
      />
    </Layout>
  );
};

export default Badge;
