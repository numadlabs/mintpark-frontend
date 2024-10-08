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
import { mintCollectibleHandler } from "@/lib/service/postRequest";
import { MintCollectiblePayload } from "@/lib/types";
import { useConnector } from "anduro-wallet-connector-react";

const stepperData = ["Upload", "Confirm", "Sign", "Send Transaction"];

const SingleCollectible = () => {
  const router = useRouter();
  const { signTransaction, sendTransaction, signAndSendTransaction } =
    React.useContext<any>(useConnector);
  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    imageBase64,
    setImageBase64,
    imageMime,
    setImageMime,
    setTxUrl,
    reset,
  } = useFormState();

  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rawHex, setRawHex] = useState<string>("");
  const [signedHex, setSignedHex] = useState<string>("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        const mime = base64
          .split(",")[0]
          .split(":")[1]
          .split(";")[0]
          .split("/")[1];
        setImageBase64(base64);
        setImageMime(mime);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if (!imageBase64) {
      setError("Image not provided.");
      setIsLoading(false);
      return;
    }

    if (ticker.length > 7) {
      setError("Invalid ticker. Need to be no longer than 7 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const opReturnValues = [
        {
          image_data: imageBase64,
          mime: imageMime,
        },
      ];

      const hexPayload = stringtoHex(JSON.stringify(opReturnValues));

      const mintPayload: MintCollectiblePayload = {
        payload: hexPayload,
        ticker,
        headline,
        supply: 1,
        assetType: ASSETTYPE.NFTONCHAIN,
      };
      const response = await mintCollectibleHandler(mintPayload);

      if (response.success) {
        setRawHex(response.data.hex);
        setError("");
        setStep(2); // Move to signing step
      } else {
        throw new Error("Failed to mint collectible");
      }
    } catch (error) {
      console.log("🚀 ~ handleSign ~ error:", error);
      setError((error as Error).message || "An error occurred during signing");
      toast.error(
        (error as Error).message || "An error occurred during signing",
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSignandSend = async () => {
    setIsLoading(true);
    try {
      console.log("🚀 ~ handleSign ~ rawHex:", rawHex);
      const signResult = await signAndSendTransaction({
        hex: rawHex,
        transactionType: "normal",
      });
      console.log("🚀 ~ handleSign ~ signResult:", signResult);

      if (signResult.status) {
        setSignedHex(signResult.result.signedHex);
        setStep(3); // Move to send step
      } else {
        throw new Error("Failed to sign transaction");
      }
    } catch (error) {
      console.log("🚀 ~ handleSign ~ error:", error);
      setError((error as Error).message || "An error occurred during signing");
      toast.error(
        (error as Error).message || "An error occurred during signing",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setImageBase64("");
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
            title={
              step === 0
                ? "Create single Collectible"
                : step === 1
                  ? "Confirm Details"
                  : step === 2
                    ? "Sign Transaction"
                    : step === 3
                      ? "Send Transaction"
                      : "Your Collectible is successfully created!"
            }
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
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Upload your Collectible
                  </p>
                  {imageBase64 ? (
                    <UploadCardFit
                      image={imageBase64}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <UploadFile
                      text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                      handleImageUpload={handleImageUpload}
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
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                    <Input
                      title="Ticker"
                      text="Collectable ticker"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                    />
                    {/* <TextArea title="Description" text="Collectible description" /> */}
                  </div>
                </div>
                <div className="w-full flex flex-row gap-8">
                  <ButtonOutline
                    title="Back"
                    onClick={() => router.push("/")}
                  />
                  <ButtonLg
                    type="submit"
                    isSelected={true}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "...loading" : "Continue"}
                  </ButtonLg>
                </div>
              </div>
              <div className="text-red-500">{error}</div>
            </div>
          )}
          {step == 1 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <Image
                  src={imageBase64}
                  alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl text-neutral50 font-bold">
                      ${ticker}
                    </p>
                    <p className="text-xl text-neutral100 font-medium">
                      Total supply: {1}
                    </p>
                  </div>
                  {/* <p className="text-neutral100 text-lg2">
                    <a href={txUrl} target="_blank" className="text-blue-600">
                      {txUrl}
                    </a>
                  </p> */}
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
                  onClick={handleSubmit}
                >
                  {isLoading ? "...loading" : "Mint Collectible"}
                </ButtonLg>
              </div>
            </div>
          )}
          {step === 2 && (
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
          )}
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
          {step === 3 && (
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SingleCollectible;
