"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Banner from "@/components/section/banner";
import ButtonLg from "@/components/ui/buttonLg";
import UploadFile from "@/components/section/uploadFile";
import Input from "@/components/ui/input";
import ButtonOutline from "@/components/ui/buttonOutline";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { mintToken, stringtoHex } from "@/utils/mint";
import { stringtoHex } from "@/lib/utils";
import UploadCardFit from "@/components/atom/cards/uploadCardFit";
import Layout from "@/components/layout/layout";
import { ASSETTYPE } from "@/lib/constants";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { mintCollectibleHandler, createCollectible } from "@/lib/service/postRequest";
import { MintCollectiblePayload } from "@/lib/types";
import { useConnector } from "anduro-wallet-connector-react";
import TextArea from "@/components/ui/textArea";
import useCreateFormState from "@/lib/store/createFormStore";
import { CollectibleDataType } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SubmitPayModal from "@/components/modal/submit-pay-modal";
import InscribeOrderModal from "@/components/modal/insribe-order-modal";

const stepperData = ["Upload", "Confirm"];

const SingleCollectible = () => {
  const queryClient = useQueryClient();
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
      mintLayerType,
      setMintLayerType,
      feeRate,
      setFeeRate,
      reset
    } = useCreateFormState();

  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rawHex, setRawHex] = useState<string>("");
  const [submitModal, setSubmitModal] = useState(false);

  const { mutateAsync: createCollectibleMutation } = useMutation({
    mutationFn: createCollectible,
    onSuccess: () => {
      toast.success("collectible successfully created");
    },
  });

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
    setSubmitModal(!submitModal);
  }

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if(file){
      console.log("Image file", file)
      setImageFile(file);
    }
  };

  const handleNextStep = () => {
    setStep(1)
  }

  const handleSubmit = async () => {
    try {
      if (!imageFile) {
        throw new Error("Image file is required");
      }
  
      const collectibleData: CollectibleDataType = {
        name,
        creator,
        description,
        mintLayerType,
        feeRate,
        imageFile,
      };
  
      setIsLoading(true);
      const result = await createCollectibleMutation({ data: collectibleData });
      if (result.success) {
        toast.success("Collectible successfully created");
        reset();
      } else {
        throw new Error(result.message || "Failed to create collectible");
      }
    } catch (error: any) {
      console.error("Error creating collectible:", error);
      setError(error.message || "An error occurred while creating the collectible");
      toast.error(error.message || "Failed to create collectible");
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleDelete = () => {
    setImageFile(null);
  };

  const triggerRefresh = () => {
    reset();
    router.push("/create/collectible");
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
                  {imageFile ? (
                    <UploadCardFit
                      image={URL.createObjectURL(imageFile)}
                      onDelete={handleDelete}
                    />
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
                    <Input
                      title="Name"
                      text="Collectable name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      title="Creator (Optional)"
                      text="Collectible creator name"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                    />
                    <TextArea title="Description" text="Collectible description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-8">
                  <ButtonOutline
                    title="Back"
                    onClick={() => router.push("/")}
                  />
                  <ButtonLg
                    onClick={handleNextStep}
                    type="submit"
                    isSelected={true}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "...loading" : "Continue"}
                  </ButtonLg>
                </div>
              </div>
              <div className="text-errorMsg">{error}</div>
            </div>
          )}
          {step == 1 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <Image
                  src={URL.createObjectURL(imageFile)}
                  alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl text-neutral50 font-bold">
                      {name}
                    </p>
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
                  onClick={toggleSubmitModal}
                >
                  {isLoading ? "...loading" : "Confirm"}
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
      <SubmitPayModal open={submitModal} onClose={toggleSubmitModal} />
    </Layout>
  );
};

export default SingleCollectible;
