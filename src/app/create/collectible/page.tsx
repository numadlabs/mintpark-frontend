"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Banner from "@/components/section/banner";
import ButtonLg from "@/components/ui/buttonLg";
import UploadFile from "@/components/section/uploadFile";
import { Input } from "@/components/ui/input";
import ButtonOutline from "@/components/ui/buttonOutline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UploadCardFit from "@/components/atom/cards/uploadCardFit";
import Layout from "@/components/layout/layout";
import { useConnector } from "anduro-wallet-connector-react";
import TextArea from "@/components/ui/textArea";
import useCreateFormState from "@/lib/store/createFormStore";
import SubmitPayModal from "@/components/modal/submit-pay-modal";
import {
  CollectionData,
  ImageFile,
  MintCollectibleDataType,
} from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCollection,
  createMintCollectible,
} from "@/lib/service/postRequest";
import { getLayerById } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getSigner } from "@/lib/utils";
import { toast } from "sonner";
import InscribeOrderModal from "@/components/modal/insribe-order-modal";

const stepperData = ["Upload", "Confirm"];

const SingleCollectible = () => {
  const { authState } = useAuth();
  const router = useRouter();
  const { signTransaction, sendTransaction, signAndSendTransaction } =
    React.useContext<any>(useConnector);
  const {
    imageFile,
    setImageFile,
    name,
    setName,
    creator,
    setCreator,
    description,
    setDescription,
    reset,
  } = useCreateFormState();

  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [fileSizes, setFileSizes] = useState<number[]>([]);
  const [totalFileSize, setTotalFileSize] = useState<number>(0);
  const [fileTypeSizes, setFileTypeSizes] = useState<number[]>([]);
  const [fileTypes, setFileTypes] = useState<Set<string>>(new Set());
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [hash, setHash] = useState<string>("");
  const [inscribeModal, setInscribeModal] = useState(false);
  const [data, setData] = useState<string>("");

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createCollection,
  });

  const { mutateAsync: createCollectiblesMutation } = useMutation({
    mutationFn: createMintCollectible,
  });

  const { data: currentLayer } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
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

  // const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();

  //     reader.onloadend = () => {
  //       const base64 = reader.result as string;
  //       const mime = base64
  //         .split(",")[0]
  //         .split(":")[1]
  //         .split(";")[0]
  //         .split("/")[1];
  //       setImageBase64(base64);
  //       setImageMime(mime);
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // };

  const toggleSubmitModal = () => {
    setIsLoading(true);
    setSubmitModal(!submitModal);
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const newImageFiles: ImageFile[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
      setImageFile(Array.from(files));

      // Calculate file sizes and types
      const newFileSizes = Array.from(files).map((file) => file.size);
      const newFileTypeSizes = Array.from(files).map(
        (file) => file.type.length,
      );
      const newFileTypes = new Set(Array.from(files).map((file) => file.type));

      setFileSizes((prevSizes) => [...prevSizes, ...newFileSizes]);
      setFileTypeSizes((prevSizes) => [...prevSizes, ...newFileTypeSizes]);
      setTotalFileSize(
        (prevSize) => prevSize + newFileSizes.reduce((a, b) => a + b, 0),
      );
    }
  };
  const handleBack = () => {
    reset(); // Reset form state
    setImageFiles([]); // Reset image files
    setFileSizes([]); // Reset file sizes
    setTotalFileSize(0); // Reset total file size
    setFileTypeSizes([]); // Reset file type sizes
    setFileTypes(new Set()); // Reset file types
    setError(""); // Reset error message
    router.push("/"); // Navigate back
  };
  const handleNextStep = () => {
    setStep(1);
  };

  // const handleSubmit = async () => {
  //   try {
  //     if (!imageFile) {
  //       throw new Error("Image file is required");
  //     }

  //     const collectibleData: CollectibleDataType = {
  //       name,
  //       creator,
  //       description,
  //       mintLayerType,
  //       feeRate,
  //       imageFile,
  //     };

  //     setIsLoading(true);
  //     const result = await createCollectibleMutation({ data: collectibleData });
  //     if (result.success) {
  //       toast.success("Collectible successfully created");
  //       reset();
  //     } else {
  //       throw new Error(result.message || "Failed to create collectible");
  //     }
  //   } catch (error: any) {
  //     console.error("Error creating collectible:", error);
  //     setError(error.message || "An error occurred while creating the collectible");
  //     toast.error(error.message || "Failed to create collectible");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   setIsLoading(true);
  //   if (!imageFile) {
  //     setError("Image not provided.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   // if (ticker.length > 7) {
  //   //   setError("Invalid ticker. Need to be no longer than 7 characters long");
  //   //   setIsLoading(false);
  //   //   return;
  //   // }

  //   try {
  //     const opReturnValues = [
  //       {
  //         image_data: imageFile,
  //       },
  //     ];

  //     const hexPayload = stringtoHex(JSON.stringify(opReturnValues));

  //     const mintPayload: MintCollectiblePayload = {
  //       payload: hexPayload,
  //       ticker,
  //       headline,
  //       supply: 1,
  //       assetType: ASSETTYPE.NFTONCHAIN,
  //     };
  //     const response = await mintCollectibleHandler(mintPayload);

  //     if (response.success) {
  //       setRawHex(response.data.hex);
  //       setError("");
  //       setStep(2); // Move to signing step
  //     } else {
  //       throw new Error("Failed to mint collectible");
  //     }
  //   } catch (error) {
  //     console.log("🚀 ~ handleSign ~ error:", error);
  //     setError((error as Error).message || "An error occurred during signing");
  //     toast.error(
  //       (error as Error).message || "An error occurred during signing",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSign = async () => {
  //   setIsLoading(true);
  //   try {
  //     console.log("🚀 ~ handleSign ~ rawHex:", rawHex);
  //     const signResult = await signTransaction({
  //       hex: rawHex,
  //     });
  //     console.log("🚀 ~ handleSign ~ signResult:", signResult);

  //     if (signResult.status) {
  //       setSignedHex(signResult.result.signedHex);
  //       setStep(3); // Move to send step
  //     } else {
  //       throw new Error("Failed to sign transaction");
  //     }
  //   } catch (error) {
  //     console.log("🚀 ~ handleSign ~ error:", error);
  //     setError(error.message || "An error occurred during signing");
  //     toast.error(error.message || "An error occurred during signing");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSend = async () => {
  //   setIsLoading(true);
  //   try {
  //     const sendResult = await sendTransaction({
  //       hex: signedHex,
  //       transactionType: "SEND_NFT", // Adjust this based on your requirements
  //     });

  //     if (sendResult.status) {
  //       setTxUrl(`https://testnet.coordiscan.io/tx/${sendResult.result}`);
  //       setStep(4); // Move to final confirmation step
  //       toast.success("Transaction sent successfully");
  //     } else {
  //       throw new Error("Failed to send transaction");
  //     }
  //   } catch (error) {
  //     setError(error.message || "An error occurred during sending");
  //     toast.error(error.message || "An error occurred during sending");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSignandSend = async () => {
  //   setIsLoading(true);
  //   try {
  //     console.log("🚀 ~ handleSign ~ rawHex:", rawHex);
  //     const signResult = await signAndSendTransaction({
  //       hex: rawHex,
  //       transactionType: "normal",
  //     });
  //     console.log("🚀 ~ handleSign ~ signResult:", signResult);

  //     if (signResult.status) {
  //       setSignedHex(signResult.result.signedHex);
  //       setStep(3); // Move to send step
  //     } else {
  //       throw new Error("Failed to sign transaction");
  //     }
  //   } catch (error) {
  //     console.log("🚀 ~ handleSign ~ error:", error);
  //     setError((error as Error).message || "An error occurred during signing");
  //     toast.error(
  //       (error as Error).message || "An error occurred during signing",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleDelete = (indexToDelete: number) => {
    // Create new arrays without the deleted items
    const newImageFile = Array.from(imageFile).filter((_, index) => index !== indexToDelete);
    const newImageFiles = imageFiles.filter((_, index) => index !== indexToDelete);
    
    // Update state with the new arrays directly
    setImageFile(newImageFile);
    setImageFiles(newImageFiles);
  };

  const files = imageFiles.map((image) => image.file);

  const handleNavigateToOrder = () => {
    router.push(`/orders`);
    reset();
  };

  const handleNavigateToCreate = () => {
    router.push(`/create`);
    reset();
  };

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const collectionParams: CollectionData = {
        logo: files[0],
        name: name,
        creator: creator,
        description: description,
        priceForLaunchpad: 0,
      };
      if (collectionParams) {
        let collectionTxid;
        let collectionResponse = await createCollectionMutation({
          data: collectionParams,
        });
        if (collectionResponse && collectionResponse.success) {
          const { id } = collectionResponse.data.collection;
          const { deployContractTxHex } = collectionResponse.data;
          console.log("create collection success", collectionResponse);

          if (currentLayer.layer === "CITREA") {
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(deployContractTxHex);
            await signedTx?.wait();
            if (signedTx?.hash) collectionTxid = signedTx?.hash;
            console.log(signedTx);
          }
        }
        const params: MintCollectibleDataType = {
          orderType: "COLLECTIBLE",
          files: files,
          feeRate: 1,
          txid: collectionTxid,
        };

        const response = await createCollectiblesMutation({ data: params });
        console.log("🚀 ~ handlePay ~ response:", response);
        if (response && response.success) {
          if (currentLayer.layer === "CITREA") {
            const { batchMintTxHex } = response.data;
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(batchMintTxHex);
            await signedTx?.wait();
            if (signedTx?.hash) setHash(signedTx?.hash);
          } else if (currentLayer.layer === "FRACTAL") {
            console.log(
              response.data.order.fundingAddress,
              response.data.order.fundingAmount,
            );
            await window.unisat.sendBitcoin(
              response.data.order.fundingAddress,
              response.data.order.fundingAmount,
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setData(response.data.order.id);
          setInscribeModal(true);
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
      <div className="flex flex-col w-full h-full bg-background items-center pb-[148px]">
        <Header />
        <div className="w-full flex flex-col items-center gap-16 z-50">
          <Banner
            title={"Create Collectible"}
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <div
            // onSubmit={handleSubmit}
            >
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="w-full gap-8 flex flex-col">
                  <div className="flex flex-col gap-4">
                    <p className="text-profileTitle text-neutral50 font-bold">
                      Upload your Collectible
                    </p>
                    <p className="text-neutral200 text-lg2">
                      The NFT you wish to spawn into existence.
                    </p>
                  </div>

                  {imageFiles.length !== 0 ? (
                    <div className="flex flex-row w-full h-full gap-8 overflow-x-auto pt-3 relative">
                      {imageFiles.map((item, index) => (
                        <UploadCardFit
                          key={index}
                          image={item.preview}
                          onDelete={handleDelete}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <UploadFile
                      text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                      handleImageUpload={handleUploadImage}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-8 w-full">
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Details (Optional)
                  </p>
                  <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-3">
                      <p className="font-medium text-lg text-neutral50">Name</p>
                      <Input
                        placeholder="Collectible name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="font-medium text-lg text-neutral50">
                        Creater (optional)
                      </p>
                      <Input
                        placeholder="Collectible creator name"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                      />
                    </div>
                    <TextArea
                      title="Description"
                      text="Collectible description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full flex flex-row gap-8">
                  <ButtonOutline
                    title="Back"
                    // onClick={() => router.push("/")}
                    onClick={handleBack}
                  />
                  <ButtonLg
                    onClick={handleNextStep}
                    type="submit"
                    isSelected={true}
                    isLoading={isLoading}
                    disabled={isLoading}
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
                  </ButtonLg>
                </div>
              </div>
              <div className="text-errorMsg">{error}</div>
            </div>
          )}
          {step == 1 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
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
                    <p className="text-3xl text-neutral50 font-bold">{name}</p>
                    <p className="text-xl text-neutral100 font-medium">
                      By {creator}
                    </p>
                  </div>
                  <p className="text-neutral200 text-lg">{description}</p>
                </div>
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push("/")}
                />
                <ButtonLg
                  type="button"
                  isSelected={true}
                  isLoading={isLoading}
                  onClick={handlePay}
                  disabled={isLoading}
                  className="flex w-full justify-center items-center border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold"
                >
                  {isLoading ? (
                    <Loader2
                      className="animate-spin"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "Confirm"
                  )}
                </ButtonLg>
              </div>
            </div>
          )}
          {/* {step === 2 && (
            <div className="w-[800px] flex flex-col gap-16">
              <p>Please sign the transaction to mint your collectible.</p>
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={() => setStep(1)} />
                <ButtonLg
                  type="button"
                  isSelected={true}
                  isLoading={isLoading}
                  onClick={handleSignandSend}
                >
                  {isLoading ? "...loading" : "Sign Transaction"}
                </ButtonLg>
              </div>
            </div>
          )} */}
          {/* {step === 3 && (
            <div className="w-[800px] flex flex-col gap-16">
              <p>Transaction signed. Ready to send?</p>
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={() => setStep(2)} />
                <ButtonLg
                  type="button"
                  isSelected={true}
                  isLoading={isLoading}
                  onClick={handleSend}
                >
                  {isLoading ? "...loading" : "Send Transaction"}
                </ButtonLg>
              </div>
            </div>
          )} */}
          {/* {step === 3 && (
            <div className="w-[800px] flex flex-col gap-16">
              <p>Successfully sent the transaction</p>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push("/")}
                />
                <ButtonLg
                  type="button"
                  isSelected={true}
                  isLoading={isLoading}
                  onClick={() => triggerRefresh()}
                >
                  Create again
                </ButtonLg>
              </div>
            </div>
          )} */}
        </div>
      </div>
      <SubmitPayModal
        open={submitModal}
        onClose={toggleSubmitModal}
        files={files}
        name={name}
        creator={creator}
        description={description}
        fileSizes={fileSizes}
        fileTypeSizes={fileTypeSizes}
        navigateOrders={handleNavigateToOrder}
        navigateToCreate={handleNavigateToCreate}
      />

      {data && (
        <InscribeOrderModal
          open={inscribeModal}
          onClose={() => setInscribeModal(false)}
          id={data}
          navigateOrders={() => router.push("/orders")}
          navigateToCreate={() => router.push("/create")}
          txid={hash}
        />
      )}
    </Layout>
  );
};

export default SingleCollectible;
