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
import { LaunchType, BadgeType } from "@/lib/types";
import TextArea from "@/components/ui/textArea";
import {
  addPhase,
  createBadgeCollection,
  createBadgeLaunch,
  ifpsLaunchItem,
  whitelistAddresses,
} from "@/lib/service/postRequest";
import useCreateFormState from "@/lib/store/createFormStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar2, Clock, Bitcoin, DocumentDownload } from "iconsax-react";
import { useAuth } from "@/components/provider/auth-context-provider";
import moment from "moment";
import SuccessModal from "@/components/modal/success-modal";
import { getLayerById } from "@/lib/service/queryHelper";
import { cn, formatFileSize, getSigner } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BADGE_BATCH_SIZE } from "@/lib/utils";
import Toggle from "@/components/ui/toggle";
import UploadJsonFile from "@/components/section/upload-json-file";
import UploadJsonCard from "@/components/atom/cards/upload-json-card";
import { ethers } from "ethers";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";

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
    // whiteList phase
    WLStartsAtDate,
    setWLStartsAtDate,
    // asdasd
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
    supply,
    setSupply,
    reset,
  } = useCreateFormState();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fcfsjsonFile, setFcfsJsonFile] = useState<File | null>();
  const stepperData = ["Details", "Launch", "Upload", "Confirm"];
  const [successModal, setSuccessModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSecondChecked, setIsSecondChecked] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState<string[]>([]);
  const [fcfslistAddress, setfcfslistAddress] = useState<string[]>([]);

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createBadgeCollection,
  });

  const { mutateAsync: createLaunchMutation } = useMutation({
    mutationFn: createBadgeLaunch,
  });

  const { mutateAsync: launchItemMutation } = useMutation({
    mutationFn: ifpsLaunchItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launchData"] });
      queryClient.invalidateQueries({ queryKey: ["collectionData"] });
    },
  });

  const { mutateAsync: addPhaseMutation } = useMutation({
    mutationFn: addPhase,
  });

  const { mutateAsync: whitelistAddressesMutation } = useMutation({
    mutationFn: whitelistAddresses,
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

  const handleFcfsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setFcfsJsonFile(file);
      // Read and parse the JSON file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          // Assuming the JSON file contains an array of addresses
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
      const params: BadgeType = {
        name: name,
        description: description,
        priceForLaunchpad: 0.001,
        type: "IPFS_CID",
        userLayerId: authState.userLayerId,
        layerId: selectedLayerId,
        isBadge: true,
        creator: creator,
      };
      if (params) {
        const response = await createCollectionMutation({ data: params });
        console.log("🚀 ~ handleCreateCollection ~ response:", response);
        if (response && response.success) {
          const { id } = response.data.l2Collection;
          const { deployContractTxHex } = response.data;
          setCollectionId(id);
          console.log("create collection success", response);

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

  const handleDeleteJson = () => {
    setJsonFile(null);
  };
  const handleFcfsDeleteJson = () => {
    setFcfsJsonFile(null);
  };

  const toggleSuccessModal = () => {
    setSuccessModal(!successModal);
  };

  // const handleMintfeeChange = async () => {
  //   if (!currentLayer) {
  //     toast.error("Layer information not available");
  //     return false;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const params: MintFeeType = {
  //       collectionTxid: txid,
  //       mintFee: POMintPrice.toString(),
  //     };
  //     const response = await mintFeeOfCitreaMutation({
  //       data: params,
  //       userLayerId: authState.userLayerId,
  //     });
  //     if (response && response.success) {
  //       const { singleMintTxHex } = response.data;
  //       if (currentLayer.layer === "CITREA") {
  //         const { signer } = await getSigner();
  //         const signedTx = await signer?.sendTransaction(singleMintTxHex);
  //         await signedTx?.wait();
  //       }
  //       setStep(2);
  //     }
  //   } catch (error) {
  //     toast.error("Error creating launch.");
  //     console.error("Error creating launch: ", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleCreateLaunch = async () => {
    if (!imageFile || imageFile.length === 0) {
      toast.error("Please upload a badge image first");
      return;
    }

    if (!selectedLayerId) {
      return toast.error("No selected layer");
    }

    setIsLoading(true);
    const poStartsAt = calculateTimeUntilDate(POStartsAtDate, POStartsAtTime);
    const poEndsAt = calculateTimeUntilDate(POEndsAtDate, POEndsAtTime);
    const wlStartsAt = calculateTimeUntilDate(WLStartsAtDate, WLStartsAtTime);
    const wlEndsAt = calculateTimeUntilDate(WLEndsAtDate, WLEndsAtTime);
    // fcfs
    const fcfsStartsAt = calculateTimeUntilDate(
      FCFSStartsAtDate,
      FCFSStartsAtTime
    );
    const fcfsEndsAt = calculateTimeUntilDate(FCFSEndsAtDate, FCFSEndsAtTime);

    try {
      const params: LaunchType = {
        collectionId: collectionId,
        isWhitelisted: isChecked ? true : false,
        hasFCFS: isSecondChecked ? true : false,
        poStartsAt: poStartsAt,
        poEndsAt: poEndsAt,
        poMintPrice: POMintPrice,
        poMaxMintPerWallet: POMaxMintPerWallet,
        // white list types
        wlStartsAt: wlStartsAt,
        wlEndsAt: wlEndsAt,
        wlMintPrice: WLMintPrice,
        wlMaxMintPerWallet: WLMaxMintPerWallet,
        // FCFS
        fcfsStartsAt: fcfsStartsAt,
        fcfsEndsAt: fcfsEndsAt,
        fcfsMintPrice: FCFSMintPrice,
        fcfsMaxMintPerWallet: FCFSMaxMintPerWallet,
        userLayerId: authState.userLayerId,
      };

      if (params) {
        const launchResponse = await createLaunchMutation({
          data: params,
          txid: txid,
          badge: imageFile[0],
          badgeSupply: supply,
        });

        if (launchResponse && launchResponse.success) {
          const collectionId = launchResponse.data.launch.collectionId;
          const launchId = launchResponse.data.launch.id;

          if (isChecked) {
            // Add white list
            const whresponse = await addPhaseMutation({
              collectionId,
              phaseType: 0, // PhaseType.whiteList
              price: WLMintPrice.toString(),
              startTime: wlStartsAt,
              endTime: wlEndsAt,
              maxSupply: WLMaxMintPerWallet * whitelistAddress.length, // Heden address bgag tus bur hed mint hiih bolomjtoigoor urjeed maxSupply ni garj irne
              maxPerWallet: WLMaxMintPerWallet,
              maxMintPerPhase: WLMaxMintPerWallet, // Unlimited mints for public phase
              layerId: selectedLayerId,
              userLayerId: authState.userLayerId,
            });

            if (currentLayer.layerType === "EVM") {
              const { signer } = await getSigner();
              const signedTx = await signer?.sendTransaction(
                whresponse.data.unsignedTx
              );
              await signedTx?.wait();
            }
          }

          if (isSecondChecked) {
            // Add FCFS
            const FCFSresponse = await addPhaseMutation({
              collectionId,
              phaseType: 1, // PhaseType.FSFS
              price: FCFSMintPrice.toString(),
              startTime: fcfsStartsAt,
              endTime: fcfsEndsAt,
              maxSupply: FCFSMaxMintPerWallet * fcfslistAddress.length, // Heden address bgag tus bur hed mint hiih bolomjtoigoor urjeed maxSupply ni garj irne
              maxPerWallet: FCFSMaxMintPerWallet,
              maxMintPerPhase: FCFSMaxMintPerWallet, // Unlimited mints for public phase
              layerId: selectedLayerId,
              userLayerId: authState.userLayerId,
              merkleRoot: "",
            });

            if (currentLayer.layerType === "EVM") {
              const { signer } = await getSigner();
              const signedTx = await signer?.sendTransaction(
                FCFSresponse.data.unsignedTx
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
            layerId: selectedLayerId,
            userLayerId: authState.userLayerId,
          });

          if (currentLayer.layerType === "EVM") {
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(
              publicPhaseResponse.data.unsignedTx
            );
            await signedTx?.wait();
          }

          for (let i = 0; i < Math.ceil(supply / 25); i++) {
            const response = await launchItemMutation({
              collectionId: collectionId,
            });
          }

          // while (!isDone && retryCount < maxRetries) {

          //   if (response && response.success) {
          //     isDone = response.data.isDone;
          //   }

          //   retryCount++;
          //   if (!isDone && retryCount < maxRetries) {
          //     await new Promise((resolve) => setTimeout(resolve, retryDelay));
          //   }
          // }

          // if (!isDone) {
          //   toast.error("Launch item creation timed out. Please try again.");
          // }

          // if (isDone) {
          // Process whitelist if enabled
          if (isChecked) {
            try {
              let whResponse;
              // Process whitelist addresses in batches of 50
              for (
                let i = 0;
                i < Math.ceil(whitelistAddress.length / 50);
                i++
              ) {
                const batch = whitelistAddress.slice(i * 50, (i + 1) * 50);
                whResponse = await whitelistAddressesMutation({
                  phase: "WHITELIST",
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
          // Process fcfs if enabled
          if (isSecondChecked) {
            try {
              let whResponse;
              // Process whitelist addresses in batches of 50
              for (let i = 0; i < Math.ceil(fcfslistAddress.length / 50); i++) {
                const batch = fcfslistAddress.slice(i * 50, (i + 1) * 50);
                whResponse = await whitelistAddressesMutation({
                  phase: "FCFS_WHITELIST",
                  launchId: launchId,
                  addresses: batch,
                });
              }
              if (whResponse && whResponse.success) {
                console.log("FCFS processing completed");
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
      }
      // }
    } catch (error) {
      console.error("Error creating launch:", error);
      toast.error(
        error instanceof Error ? error.message : "Error creating launch"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWhiteList = () => {
    setIsChecked(!isChecked);
  };

  const toggleSecondWhiteList = () => {
    setIsSecondChecked(!isSecondChecked);
  };

  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <div className="flex flex-col items-center gap-16 z-50 mt-16">
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
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Launch on Mint Park
                  </p>
                </div>
                <p className="text-neutral200 text-lg">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                  ac ornare nisi. Aliquam eget semper risus, sed commodo elit.
                  Curabitur sed congue magna. Donec ultrices dui nec ullamcorper
                  aliquet. Nunc efficitur mauris id mi venenatis imperdiet.
                  Integer mauris lectus, pretium eu nibh molestie, rutrum
                  lobortis tortor. Duis sit amet sem fermentum, consequat est
                  nec, ultricies justo.
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
              <div className="flex flex-col gap-8">
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-row justify-between items-center">
                    <p className="font-bold text-profileTitle text-neutral50">
                      Public phase
                    </p>
                  </div>
                  <p className="text-neutral200 text-lg">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Proin ac ornare nisi. Aliquam eget semper risus, sed commodo
                    elit. Curabitur sed congue magna. Donec ultrices dui nec
                    ullamcorper aliquet. Nunc efficitur mauris id mi venenatis
                    imperdiet. Integer mauris lectus, pretium eu nibh molestie,
                    rutrum lobortis tortor. Duis sit amet sem fermentum,
                    consequat est nec, ultricies justo.
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
                      <p className="text-md text-neutral200 font-medium">
                        {getCurrencySymbol(currentLayer.layer)}
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
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={handleBack} />
                <Button
                  onClick={() => setStep(2)}
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
                    draggable="false"
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
              {isSecondChecked && (
                <div className="flex flex-col gap-8 w-full">
                  <p className="text-[28px] leading-9 text-neutral50 font-bold">
                    WhiteList phase
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
                        {FCFSStartsAtDate},{FCFSStartsAtDate}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-neutral200 text-lg">
                        Public mint price
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
