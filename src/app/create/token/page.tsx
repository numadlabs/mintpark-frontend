"use client";

import React, { useState } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
// import { mintToken } from "@/utils/mint";
import Layout from "@/components/layout/layout";
// import {
//   ASSETTYPE,
//   FEERATE,
//   RECEIVER_ADDRESS,
//   MOCK_MENOMIC,
// } from "@/lib/constants";
import Image from "next/image";
import useFormState from "@/lib/store/useFormStore";

const SingleToken = () => {
  const router = useRouter();

  const {
    ticker,
    setTicker,
    // headline,
    // setHeadline,
    description,
    setDescription,
    supply,
    setSupply,
    imageUrl,
    setImageUrl,
    txUrl,
    reset,
  } = useFormState();

  // const [ticker, setTicker] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError("");
    event.preventDefault();
    setIsLoading(true);

    if (!imageUrl) {
      setIsLoading(false);
      setError("Image not provided.");
      return;
    }
    //headline validation
    // if (!headline) {
    //   setError("headline not provided.");
    //   setIsLoading(false);
    //   return;
    // }

    const opReturnValues = [
      {
        image_url: imageUrl,
      },
    ];

    // const data: tokenData = {
    //   address: RECEIVER_ADDRESS,
    //   opReturnValues,
    //   assetType: ASSETTYPE.TOKEN,
    //   headline,
    //   ticker,
    //   supply,
    // };

    if (supply == 0) {
      setError("Supply can not be 0.");
      setIsLoading(false);
      return;
    }

    if (!supply) {
      setError("Supply can not be empty");
      setIsLoading(false);
      return;
    }

    if (supply == 2100000000000000) {
      setError("Max amount of supply is 2100000000000000");
      setIsLoading(false);
      return;
    }

    // if (data.ticker.length > 7) {
    //   setIsLoading(false);
    //   setError("Invalid ticker. Need to be no longer than 7 character long");
    //   return;
    // }
    // try {
    //   // console.log("🚀 ~ handleSubmit ~ res:", res);
    //   // Call the mintToken function with the required data
    //   const transactionResult = await mintToken(data, MOCK_MENOMIC, FEERATE);

    //   if (transactionResult && transactionResult.error == false) {
    //     setError(transactionResult.message || "An error occurred"); // Set the error state
    //     toast.error(transactionResult.message || "An error occurred");
    //     setIsLoading(false);
    //   } else {
    //     setError("");
    //     setIsLoading(false);
    //     // setTxUrl(`https://testnet.coordiscan.io/tx/${mintResponse.result}`);
    //     setStep(1);
    //   }
    // } catch (error) {
    //   console.log("🚀 ~ handleSubmit ~ error:", error);
    //   setError(error.message || "An error occurred"); // Set the error state
    //   toast.error(error.message || "An error occurred");
    //   setIsLoading(false);
    // }
  };
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setImageBase64(null);
    setImageUrl("");
  };
  const triggerRefresh = () => {
    reset();
    router.push("/create/token");
  };

  const stepperData = ["Upload", "Confirm"];

  return (
    <Layout>
      <div className="flex flex-col w-full h-full pb-[148px]">
        <Header />
        <div className="flex flex-col items-center gap-16 z-50">
          <Banner
            title="Create token"
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <form onSubmit={handleSubmit}>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="flex flex-col w-full gap-8">
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Details
                  </p>
                  <div className="w-full gap-6 flex flex-col">
                    <div className="flex flex-col gap-3">
                      {/* <p>Name</p>
                      <Input
                        title="Name"
                        // text="Collectible name"
                        placeholder="Collectible name"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                      /> */}
                      <p>Name / Ticker</p>
                      <Input
                        title="Ticker"
                        // text="Collectible ticker"
                        placeholder="Collectible ticker"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <p>Supply</p>
                      <div className="flex flex-col gap-3">
                        <Input
                          title="Supply"
                          // text="Collectible supply"
                          placeholder="Collectible supply"
                          value={supply}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSupply(value === "" ? 0 : parseInt(value, 10));
                          }}
                          type="number"
                        />
                      </div>
                    </div>
                    {/* NaN erro */}
                    <div className="flex flex-col gap-3 h-[128px]">
                      <p>Description</p>
                      <Input
                        title="Token logo image url"
                        // text="Collectible logo image"
                        placeholder="Collectible description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    {/* <Input
                      title="Token logo image url"
                      // text="Collectible logo image"
                      placeholder="Collectible logo image"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    /> */}
                  </div>
                </div>
                <div className="flex flex-col gap-8 w-full">
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Token logo (Optional)
                  </p>
                  {/* {imageBase64 ? (
                    <UploadFile image={imageBase64} onDelete={handleDelete} />
                  ) : (
                    <UploadFile
                      text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                      handleImageUpload={handleImageUpload}
                    />
                  )} */}
                </div>
                <div className="flex flex-row gap-8 justify-between w-full">
                  <ButtonOutline
                    title="Back"
                    onClick={() => router.push("/")}
                  />
                  <ButtonLg
                    type="submit"
                    isSelected={true}
                    isLoading={isLoading}
                    // disabled={isLoading}
                  >
                    {isLoading ? "...loading" : "Continue"}
                  </ButtonLg>
                </div>
              </div>
              {error && <div className="text-errorMsg">{error}</div>}
            </form>
          )}
          {step == 1 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <Image
                  src={imageUrl}
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
                      Total supply:{supply}
                    </p>
                  </div>
                  <p className="text-neutral100 text-lg">
                    <a href={txUrl} target="_blank" className="text-blue-600">
                      {txUrl}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push("/")}
                />
                <ButtonLg
                  type="submit"
                  isSelected={true}
                  isLoading={isLoading}
                  disabled={isLoading}
                  onClick={() => triggerRefresh()}
                  // onClick={() => router.reload()}
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

export default SingleToken;
