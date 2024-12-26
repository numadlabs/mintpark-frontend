"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Banner from "@/components/section/banner";
import UploadFile from "@/components/section/upload-file";
import { Input } from "@/components/ui/input";
import ButtonOutline from "@/components/ui/buttonOutline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UploadCardFit from "@/components/atom/cards/upload-card-fit";
import Layout from "@/components/layout/layout";
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
import { Button } from "@/components/ui/button";
import { CurrentLayerSchema } from "@/lib/validations/layer-validation";

const stepperData = ["Upload", "Confirm"];

const SingleCollectible = () => {
  const { authState } = useAuth();
  const router = useRouter();

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
  const [fileTypeSizes, setFileTypeSizes] = useState<number[]>([]);
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

  const { data: currentLayer } = useQuery<CurrentLayerSchema>({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

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
        (file) => file.type.length
      );
      const newFileTypes = new Set(Array.from(files).map((file) => file.type));

      setFileSizes((prevSizes) => [...prevSizes, ...newFileSizes]);
      setFileTypeSizes((prevSizes) => [...prevSizes, ...newFileTypeSizes]);
    }
  };
  const handleBack = () => {
    reset(); // Reset form state
    setImageFiles([]); // Reset image files
    setFileSizes([]); // Reset file sizes
    setFileTypeSizes([]); // Reset file type sizes
    setError(""); // Reset error message
    router.push("/"); // Navigate back
  };
  const handleNextStep = () => {
    setStep(1);
  };

  const handleDelete = (indexToDelete: number) => {
    // Create new arrays without the deleted items
    const newImageFile = Array.from(imageFile).filter(
      (_, index) => index !== indexToDelete
    );
    const newImageFiles = imageFiles.filter(
      (_, index) => index !== indexToDelete
    );

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
    if (!currentLayer) {
      toast.error("Layer information not available");
      return;
    }
    setIsLoading(true);
    try {
      const collectionParams: CollectionData = {
        logo: files[0],
        description: description,
        name: name,
        priceForLaunchpad: 0.001,
        type: "INSCRIPTION",
        userLayerId: authState.userLayerId,
        layerId: authState.layerId,
      };
      if (collectionParams) {
        let collectionTxid;
        let id;
        let collectionResponse = await createCollectionMutation({
          data: collectionParams,
        });
        if (collectionResponse && collectionResponse.success) {
          id = collectionResponse.data.collection.id;
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
          file: files,
          feeRate: 1,
          txid: collectionTxid,
          collectionId: id,
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
              response.data.order.fundingAmount
            );
            await window.unisat.sendBitcoin(
              response.data.order.fundingAddress,
              Math.ceil(response.data.order.fundingAmount)
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
            <div>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="w-full gap-8 flex flex-col">
                  <div className="flex flex-col gap-4">
                    <p className="text-profileTitle text-neutral50 font-bold">
                      Upload your Collectible
                    </p>
                    <p className="text-neutral200 text-lg">
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
                        onReset={reset}
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
                        onReset={reset}
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
                  <ButtonOutline title="Back" onClick={handleBack} />
                  <Button
                    onClick={handleNextStep}
                    type="submit"
                    variant={"primary"}
                    disabled={isLoading}
                    className="w-full"
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
                <Button
                  type="button"
                  variant={"primary"}
                  // isSelected={true}
                  // isLoading={isLoading}

                  onClick={handlePay}
                  disabled={isLoading}
                  className="w-full"
                  // className="flex w-full justify-center items-center border border-neutral400 rounded-xl text-neutral600 bg-brand font-bold"
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
                </Button>
              </div>
            </div>
          )}
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
