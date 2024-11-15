"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import UploadFile from "@/components/section/upload-file";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import Layout from "@/components/layout/layout";
import UploadCardFill from "@/components/atom/cards/upload-card-fill";
import useFormState from "@/lib/store/useFormStore";
import { Calendar2, Clock, DocumentDownload } from "iconsax-react";
import Toggle from "@/components/ui/toggle";
import FileCard from "@/components/atom/cards/file-card";
import Image from "next/image";
import CollectiblePreviewCard from "@/components/atom/cards/collectible-preview-card";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { JsonDataItem, MergedObject } from "@/types";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const stepperData = ["Details", "Upload", "Launch", "Confirm"];

const CollectionDetail = () => {
  const router = useRouter();
  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    imageBase64,
    setImageBase64,
    description,
    setDescription,
    imageMime,
    setImageMime,
    mergedArray,
    setMergedArray,
    reset,
  } = useFormState();
  const [step, setStep] = useState<number>(0);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [secondChecked, setSecondChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [files, setFiles] = useState<
    { base64: string; mimeType: string; fileName: string }[]
  >([]);
  const [jsonData, setJsonData] = useState<JsonDataItem[]>([]);
  // const [mergedArray, setMergedArray] = useState([]);
  const [jsonMetaData, setJsonMetaData] = useState<File | null>(null);

  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState({ value: 0, total: 0, message: "" });
  const [date, setDate] = React.useState<Date>();
  // useEffect
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  useEffect(() => {
    // Function to set start date to 00:00:00.000 UTC
    const setStartToBeginningOfDay = () => {
      const newStart = new Date();
      newStart.setUTCHours(0, 0, 0, 0);
      setStart(newStart);
    };

    // Function to set end date to 23:59:59.999 UTC
    const setEndToEndOfDay = () => {
      const newEnd = new Date();
      newEnd.setUTCHours(23, 59, 59, 999);
      setEnd(newEnd);
    };

    // Call the functions to initialize start and end dates
    setStartToBeginningOfDay();
    setEndToEndOfDay();

    // You can optionally alert the values here if needed
    alert(start.toUTCString() + ":" + end.toUTCString());
  }, []); // Empty dependency array ensures this effect runs only once

  const handleCheckBox = () => {
    setIsChecked(!isChecked);
  };
  const handleSecondCheckBox = () => {
    setSecondChecked(!secondChecked);
  };
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

  const handleDeleteImage = (indexToDelete: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToDelete),
    );
  };

  const handleDelete = () => {
    setImageBase64("");
  };

  useEffect(() => {
    if (jsonData && files && jsonData.length === files.length) {
      const merged: MergedObject[] = jsonData.map((item, index) => {
        const fileItem = files[index];
        return {
          attributes: item.attributes,
          meta: item.meta,
          base64: fileItem.base64,
          fileName: fileItem.fileName,
          mimeType: fileItem.mimeType,
        };
      });
      setMergedArray(merged);
    }
  }, [jsonData, files]);

  const handleCollectionImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles).map((file) => {
        return new Promise<{
          base64: string;
          mimeType: string;
          fileName: string;
        }>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const fileName = file.name;
            const base64 = reader.result as string;
            const mimeType = base64
              .split(",")[0]
              .split(":")[1]
              .split(";")[0]
              .split("/")[1];
            resolve({ base64, mimeType, fileName });
          };

          reader.onerror = (error) => {
            reject(error);
          };

          reader.readAsDataURL(file);
        });
      });

      Promise.all(fileArray)
        .then((fileData) => {
          setFiles((prevFiles) => [...prevFiles, ...fileData]);
        })
        .catch((error) => {
          console.error("Error reading files:", error);
        });
    }
  };

  const validateJsonStructure = (jsonData: any[]): string | null => {
    if (!Array.isArray(jsonData)) {
      return "JSON data must be an array";
    }

    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      if (!item || typeof item !== "object") {
        return `Item at index ${i} is not an object`;
      }

      if (!item.meta || typeof item.meta !== "object" || !item.meta.name) {
        return `Item at index ${i} does not have a valid meta object with a name property`;
      }
    }

    return null;
  };

  const validateJsonInput = (isChecked: boolean): string | null => {
    if (isChecked) {
      if (!(jsonData && files && jsonData.length === files.length)) {
        toast.error("Images or JSON upload count doesn't match");
        return "Images or JSON upload count doesn't match";
      }
      if (mergedArray.length === 0) {
        return "No items to mint";
      }

      // Validate JSON structure
      const jsonValidationError = validateJsonStructure(jsonData);
      if (jsonValidationError) {
        // toast.error(jsonValidationError)
        return jsonValidationError;
      }
    } else {
      if (files.length === 0) {
        // toast.error("No files uploaded");
        return "No files uploaded";
      }
    }
    return null;
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setJsonMetaData(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          try {
            const jsonData = JSON.parse(e.target.result);
            setJsonData(jsonData); // Assuming setJsonData is a state setter function
          } catch (error) {
            toast.error("Error parsing JSON:");
            console.error("Error parsing JSON:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const validateInput = (isChecked: boolean): string | null => {
    if (isChecked) {
      if (!(jsonData && files && jsonData.length === files.length)) {
        return "Images count and JSON traits upload count doesn't match";
      }
      if (mergedArray.length === 0) {
        return "No items to mint";
      }
    } else {
      if (files.length === 0) {
        return "No files uploaded";
      }
    }
    return null;
  };

  // dood taliin code bol error handler
  const handleSubmit = async () => {
    setStep(2);
    reset();
  };
  const triggerRefresh = () => {
    setStep(0);
    router.push("/create");
    reset();
  };

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      setStart(day);
      reset();
    }
  };
  const handleBack = (resetType: "create" | "step") => {
    reset();
    setFiles([]);
    setJsonData([]);
    setJsonMetaData(null);
    setError("");
    setProgress({ value: 0, total: 0, message: "" });
    setIsChecked(false);
    setSecondChecked(false);
    setDate(undefined);
    setStart(new Date());
    setEnd(new Date());

    if (resetType === "create") {
      router.push("/create");
    } else {
      setStep(Math.max(0, step - 1));
    }
  };
  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <Header />
        <div className="flex flex-col items-center gap-16 z-50">
          <Banner
            title={
              step == 0 || step == 3
                ? "Create collection"
                : "Your Collection is successfully created!"
            }
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Details
                </p>
                <div className="flex flex-col w-full gap-6">
                  <Input
                    title="Name"
                    // text="Collection name"
                    onReset={reset}
                    value={headline}
                    onChange={(e: any) => setHeadline(e.target.value)}
                  />
                  {/* setHeadline */}
                  {/* <Input
                    title="Creater (optional)"
                    text="Collection create name"
                    value={setHeadline}
                    onChange={(e) => setHeadline(e.target.value)}
                  /> */}
                  {/* add to height description height  */}
                  <Input
                    title="Description"
                    onReset={reset}
                    // text="Collection description"
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Collection logo (Optional)
                </p>
                {imageBase64 ? (
                  <UploadCardFill image={imageBase64} onDelete={handleDelete} />
                ) : (
                  <UploadFile
                    text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                    handleImageUpload={handleImageUpload}
                  />
                )}
              </div>
              <div className="flex flex-row justify-between w-full gap-8">
                <ButtonOutline
                  title="Back"
                  // onClick={() => router.push("/create")}
                  onClick={() => handleBack("create")}
                />
                <ButtonLg
                  title="Continue"
                  isSelected={true}
                  onClick={() => setStep(1)}
                >
                  Continue
                </ButtonLg>
              </div>
              {error && <div className="text-errorMsg -mt-3">{error}</div>}
            </div>
          )}

          {step == 1 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-4">
                <p className="font-bold text-profileTitle text-neutral50">
                  Upload your Collection
                </p>
                <p className="font-normal text-neutral200 text-lg2">
                  The NFTs you want to include for this brand or project. Please
                  name your files sequentially, like ‘1.png’, ‘2.jpg’, ‘3.webp’,
                  etc., according to their order and file type.
                </p>
                {files.length !== 0 ? (
                  <div className="flex flex-row w-full h-full gap-8 overflow-x-auto text-neutral00">
                    {files.map((item, index) => (
                      <div key={index} className="w-full h-full">
                        <CollectiblePreviewCard
                          image={item.base64}
                          key={index}
                          title={item.fileName}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <UploadFile
                    text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                    handleImageUpload={handleCollectionImageUpload}
                  />
                )}
              </div>
              <div className="flex flex-col w-full gap-8">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Include traits
                  </p>
                  <Toggle isChecked={isChecked} onChange={handleCheckBox} />
                </div>
                <p className="text-neutral100 text-lg2">
                  Extra data linked to each NFT in this collection that
                  describes or quantifies unique qualities.
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
                    />
                  )}
                </div>
              </div>
              {isLoading && (
                <div>
                  <progress value={progress.value} max={progress.total} />
                  <p>{progress.message}</p>
                  <p>{`${progress.value}/${progress.total} NFTs minted`}</p>
                </div>
              )}
              {/* <div className="text-red-500">{error}</div> */}
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline
                  title="Back"
                  // onClick={() => router.push("/create")}
                  onClick={() => handleBack("step")}
                />
                <ButtonLg
                  // type="submit"
                  isSelected={true}
                  onClick={() => handleSubmit()}
                  isLoading={isLoading}
                  // disabled={isLoading}
                >
                  {isLoading ? "...loading" : "Continue"}
                </ButtonLg>
              </div>
              {error && <div className="text-errorMsg -mt-5">{error}</div>}
            </div>
          )}
          {/* launchpad step */}
          {step == 2 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-8">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Launch on Coordinals
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
                <div className={isChecked ? `flex` : `hidden`}>
                  <div className="grid gap-8">
                    <div className="flex flex-col w-full gap-8">
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-profileTitle text-neutral50">
                          Include traits
                        </p>
                        <Toggle
                          isChecked={secondChecked}
                          onChange={handleSecondCheckBox}
                        />
                      </div>
                      <p className="text-neutral100 text-lg2">
                        Extra data linked to each NFT in this collection that
                        describes or quantifies unique qualities.
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
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-profileTitle text-neutral50">
                        Public phase
                      </p>
                      <p className="text-neutral100 text-lg2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Proin ac ornare nisi. Aliquam eget semper risus, sed
                        commodo elit. Curabitur sed congue magna. Donec ultrices
                        dui nec ullamcorper aliquet. Nunc efficitur mauris id mi
                        venenatis imperdiet. Integer mauris lectus, pretium eu
                        nibh molestie, rutrum lobortis tortor. Duis sit amet sem
                        fermentum, consequat est nec, ultricies justo.
                      </p>
                    </div>
                    <div className="grid gap-4 w-full">
                      <div className="flex justify-between items-center">
                        <span>
                          <p className="font-medium text-xl text-neutral50">
                            Start date
                          </p>
                        </span>
                        <span className="flex gap-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[184px] h-[48px] justify-around",
                                  !date && "text-muted-foreground",
                                )}
                              >
                                <Calendar2 size="17" color="#f8f9fa" />
                                {date ? (
                                  format(date, "PPP")
                                ) : (
                                  <span className="font-normal text-neutral200 text-lg2">
                                    YYYY-MM-DD
                                  </span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[184px] h-[48px] justify-start",
                                  !date && "text-muted-foreground",
                                )}
                              >
                                <Clock size="17" color="#f8f9fa" />
                                {date ? (
                                  format(date, "HH:mm")
                                ) : (
                                  <span className="font-normal text-neutral200 text-lg2 pl-3">
                                    HH : MM
                                  </span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={start}
                                onSelect={handleSelect}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isLoading && (
                <div>
                  <progress value={progress.value} max={progress.total} />
                  <p>{progress.message}</p>
                  <p>{`${progress.value}/${progress.total} NFTs minted`}</p>
                </div>
              )}
              {/* <div className="text-red-500">{error}</div> */}
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline
                  title="Back"
                  // onClick={() => router.push("/create")}
                  onClick={() => handleBack("step")}
                />
                <ButtonLg
                  // type="submit"
                  isSelected={true}
                  onClick={() => setStep(3)}
                  isLoading={isLoading}
                  // disabled={isLoading}
                >
                  {isLoading ? "...loading" : "Continue"}
                </ButtonLg>
              </div>
              {error && <div className="text-errorMsg -mt-5">{error}</div>}
            </div>
          )}
          {step == 3 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="flex flex-row items-center justify-start w-full gap-8">
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
                    <p className="text-3xl font-bold text-neutral50">
                      {headline}
                    </p>
                    <p className="text-xl font-medium text-neutral100">
                      {ticker}
                    </p>
                  </div>
                  {/* <p className="text-neutral100 text-lg2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Proin ac ornare nisi. Aliquam eget semper risus, sed commodo
                    elit. Curabitur sed congue magna. Donec ultrices dui nec
                    ullamcorper aliquet. Nunc efficitur mauris id mi venenatis
                    imperdiet. Integer mauris lectus, pretium eu nibh molestie,
                    rutrum lobortis tortor. Duis sit amet sem fermentum,
                    consequat est nec.
                  </p> */}
                </div>
              </div>
              <div className="relative flex flex-row w-full h-auto gap-8 overflow-x-auto">
                {mergedArray.map((item, index) => (
                  <div key={index} className="w-full h-full">
                    <CollectiblePreviewCard
                      image={item.base64}
                      key={index}
                      title={item.fileName}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
                {/* todo ene gradient iig zasah */}
                {/* <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-neutral600 via-transparent to-neutral600" /> */}
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  // onClick={() => router.push("/")}
                  onClick={() => handleBack("create")}
                />
                <ButtonLg isSelected={true} onClick={() => triggerRefresh()}>
                  Create Again
                </ButtonLg>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CollectionDetail;
