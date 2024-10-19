"use client";

import React, { useState } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import UploadFile from "@/components/section/uploadFile";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import Layout from "@/components/layout/layout";
import UploadCardFill from "@/components/atom/cards/uploadCardFill";
import Image from "next/image";
import CollectiblePreviewCard from "@/components/atom/cards/collectiblePreviewCard";
import { ImageFile, CollectionData } from "@/lib/types";
import TextArea from "@/components/ui/textArea";
import {
  createCollection,
  createCollectiblesToCollection,
} from "@/lib/service/postRequest";
import useCreateFormState from "@/lib/store/createFormStore";
import { useMutation } from "@tanstack/react-query";
import CollectionUploadFile from "@/components/section/collectionUploadFile";
import Toggle from "@/components/ui/toggle";
import { Calendar2, Clock, Bitcoin } from "iconsax-react";
import OrderPayModal from "@/components/modal/order-pay-modal";


const CollectionDetail = () => {
  const router = useRouter();
  const {
    imageFile,
    setImageFile,
    name,
    setName,
    description,
    setDescription,
    creator,
    setCreator,
  } = useCreateFormState();
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [payModal, setPayModal] = useState(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [fileTypes, setFileTypes] = useState<Set<string>>(new Set());
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [logoImage, setImageLogo] = useState<ImageFile | null>(null);
  const stepperData = ["Details", "Upload", "Launch", "Confirm"];

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createCollection,
  });

  const { mutateAsync: createCollectiblesMutation } = useMutation({
    mutationFn: createCollectiblesToCollection,
  });

  const formatFileTypes = (types: Set<string>): string => {
    return Array.from(types)
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');
  };

  const updateFileInfo = (files: File[]) => {
    const newSize = files.reduce((acc, file) => acc + file.size, 0);
    const newTypes = files.map(file => file.type);

    setTotalSize(prevSize => prevSize + newSize);
    setFileTypes(prevTypes => {
      const updatedTypes = new Set(prevTypes);
      newTypes.forEach(type => updatedTypes.add(type));
      return updatedTypes;
    });
  };

  const handleCreateCollection = async () => {
    try {
      const params: CollectionData = {
        logo: imageFile[0],
        name: name,
        creator: creator,
        description: description,
        layerType: "BITCOIN_TESTNET",
        feeRate: 1,
      };
      if (params) {
        const response = await createCollectionMutation({ data: params });
        if (response && response.success) {
          const { id } = response.data;
          setCollectionId(id);
          console.log("create collection success", response);
          setStep(1);
        }
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleCreateCollectibles = async () => {
    const images = imageFiles.map((image) => image.file);
    try {
      if (images.length > 0 && collectionId) {
        const response = await createCollectiblesMutation({
          id: collectionId,
          images: images,
        });
        if (response && response.success) {
          console.log("create collectibles success", response);
          setStep(2);
        }
      }
    } catch (error) {
      console.error("Error creating collectibles:", error);
      // You might want to show an error message to the user here
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
    const images = event.target.files;

    if (images) {
      const newImageFiles: ImageFile[] = Array.from(images).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      // setImageLogo(newImageFiles);
      setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
      updateFileInfo(Array.from(images));
    }
  };

  const togglePayModal = () => {
    setPayModal(!payModal);
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  const handleDeleteLogo = () => {
    setImageLogo(null);
  };

  const handleNextStep = () => {
    setStep(3);
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
              <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Details
                </p>
                <div className="flex flex-col w-full gap-6">
                  <Input
                    title="Name"
                    placeholder="Collection name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    title="Description"
                    placeholder="Collection creator name"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                  />
                  <TextArea
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
                <ButtonOutline
                  title="Back"
                  onClick={() => router.push("/create")}
                />
                <ButtonLg
                  title="Continue"
                  isSelected={true}
                  onClick={handleCreateCollection}
                >
                  {isLoading ? "Loading..." : "Continue"}
                </ButtonLg>
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
                <ButtonOutline title="Back" onClick={() => setStep(step - 1)} />
                <ButtonLg
                  // type="submit"
                  isSelected={true}
                  onClick={handleCreateCollectibles}
                  isLoading={isLoading}
                  // disabled={isLoading}
                >
                  {isLoading ? "...loading" : "Continue"}
                </ButtonLg>
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                  ac ornare nisi. Aliquam eget semper risus, sed commodo elit.
                  Curabitur sed congue magna. Donec ultrices dui nec ullamcorper
                  aliquet. Nunc efficitur mauris id mi venenatis imperdiet.
                  Integer mauris lectus, pretium eu nibh molestie, rutrum
                  lobortis tortor. Duis sit amet sem fermentum, consequat est
                  nec, ultricies justo.
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Proin ac ornare nisi. Aliquam eget semper risus, sed
                      commodo elit. Curabitur sed congue magna. Donec ultrices
                      dui nec ullamcorper aliquet. Nunc efficitur mauris id mi
                      venenatis imperdiet. Integer mauris lectus, pretium eu
                      nibh molestie, rutrum lobortis tortor. Duis sit amet sem
                      fermentum, consequat est nec, ultricies justo.
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
                          />
                          <div className="absolute left-4">
                            <Calendar2 size={20} color="#D7D8D8" />
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="HH : MM"
                            className="pl-10 w-[184px]"
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
                          />
                          <div className="absolute left-4">
                            <Calendar2 size={20} color="#D7D8D8" />
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="HH : MM"
                            className="pl-10 w-[184px]"
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
                      <Input placeholder="Amount" className="w-full pl-10" />
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
                      Max mint per wallet dsd
                    </p>
                    <Input placeholder="0" />
                  </div>
                </div>
              ) : (
                ""
              )}
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={() => setStep(step - 1)} />
                <ButtonLg
                  isSelected={true}
                  onClick={handleNextStep}
                  isLoading={isLoading}
                >
                  {isLoading ? "...loading" : "Continue"}
                </ButtonLg>
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
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline title="Back" onClick={() => router.push("/")} />
                <ButtonLg isSelected={true} onClick={togglePayModal}>
                  Confirm
                </ButtonLg>
              </div>
            </div>
          )}
        </div>
      </div>
      <OrderPayModal open={payModal} onClose={togglePayModal} fileSize={totalSize} fileType={formatFileTypes(fileTypes)} id={collectionId}/>
    </Layout>
  );
};

export default CollectionDetail;
