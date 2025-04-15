"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getCollectibleActivity,
  getCollectionById,
  getLayerById,
} from "@/lib/service/queryHelper";
import {
  getSigner,
  s3ImageUrlBuilder,
  formatPrice,
  formatTimeAgo,
} from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";
import PendingListModal from "@/components/modal/pending-list-modal";
import {
  checkAndCreateRegister,
  createApprovalTransaction,
} from "@/lib/service/postRequest";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ActivityCard from "@/components/atom/cards/activity-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetDetailSkeleton from "@/components/atom/skeleton/asset-detail-skeleton";
import { Collectible } from "@/lib/validations/collection-validation";
import { useAuth } from "@/components/provider/auth-context-provider";
import CancelListModal from "@/components/modal/cancel-list-modal";
import Link from "next/link";
import {
  getCurrencySymbol,
  getAddressExplorerUrl,
} from "@/lib/service/currencyHelper";

export default function AssetsDetails() {
  const queryClient = useQueryClient();
  const params = useParams();
  const { authState } = useAuth();

  const id = params.assetsId as string;
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [txid, setTxid] = useState<string>("");

  const { mutateAsync: createApprovalMutation } = useMutation({
    mutationFn: createApprovalTransaction,
  });

  const { mutateAsync: checkAndCreateRegisterMutation } = useMutation({
    mutationFn: checkAndCreateRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["activityData", id] });
    },
  });

  const { data: collectionData = [], isLoading: isCollectionLoading } =
    useQuery<Collectible[] | null>({
      queryKey: ["collectionData", id],
      queryFn: () => getCollectionById(id),
      enabled: !!id,
    });

  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["activityData", id],
    queryFn: () => getCollectibleActivity(id as string),
    enabled: !!id,
  });
  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const currentAsset = collectionData?.[0];

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const toggleCancelModal = () => {
    setCancelModal(!cancelModal);
  };

  const HandleList = async () => {
    if (!currentAsset?.collectionId) {
      toast.error("Collection ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createApprovalMutation({
        collectionId: currentAsset.collectionId,
        // tokenId: currentAsset.,
        userLayerId: authState.userLayerId as string,
      });

      if (response?.success) {
        const { transaction, isApproved } = response.data.approveTxHex;

        if (isApproved === false) {
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(transaction);
          await signedTx?.wait();
          if (signedTx?.hash) setTxid(signedTx.hash);
        }
        // else if (isApproved === true) {
        const registerRes = await checkAndCreateRegisterMutation({
          collectionId: currentAsset.collectionId,
          userLayerId: authState.userLayerId as string,

          tokenId: currentAsset.uniqueIdx.split("i")[1],
          contractAddress: currentAsset.uniqueIdx.split("i")[0],
        });
        if (registerRes.success) {
          if (!registerRes.data.isRegistered) {
            toggleModal();
          }
        }
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollectionLoading) {
    return (
      <>
        <Header />
        <AssetDetailSkeleton />
      </>
    );
  }

  if (!currentAsset) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-neutral200">Asset not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col gap-16 w-full max-w-[1216px]">
          <div className="md:grid grid-cols-2 flex flex-col gap-16 justify-between pt-16 relative z-20">
            <div className="w-full h-auto relative flex items-center justify-center">
              <div className="z-10 w-full h-full blur-[80px]">
                <Image
                  width={560}
                  height={560}
                  draggable="false"
                  src={
                    currentAsset.highResolutionImageUrl
                      ? currentAsset.highResolutionImageUrl
                      : s3ImageUrlBuilder(currentAsset.fileKey)
                  }
                  className="aspect-square  opacity-60 inset-y-0 rounded-xl relative z-20 md:h-[343px] 3xl:h-[560px] 3xl:w-[560px] w-[343px] h-auto md2:h-auto md2:w-full"
                  alt={`${currentAsset.name} logo`}
                />
              </div>
              <Image
                width={560}
                draggable="false"
                height={560}
                src={
                  currentAsset.highResolutionImageUrl
                    ? currentAsset.highResolutionImageUrl
                    : s3ImageUrlBuilder(currentAsset.fileKey)
                }
                className="aspect-square rounded-xl absolute z-20  w-[330px] h-auto md:h-[340px] md2:h-auto md2:w-full 2xl:w-[560px] 2xl:h-[560px] top-0"
                alt={`${currentAsset.name} logo`}
              />
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-xl text-brand">
                  {currentAsset.collectionName}
                </p>
                <span className="flex text-3xl font-bold text-neutral50">
                  {currentAsset.name}
                </span>
              </div>
              <div className="w-full h-[1px] bg-neutral500" />
              <div className="flex flex-col justify-center gap-6">
                {currentAsset.price === 0 ? (
                  "This asset is not listed"
                ) : (
                  <div className="flex flex-col justify-center gap-6">
                    <div className="flex justify-between w-full">
                      <span className="font-medium pt-3 text-end text-lg text-neutral200">
                        <p>List price</p>
                      </span>
                      <span className="font-bold text-neutral50 text-lg">
                        <h1>
                          {formatPrice(currentAsset.price)}{" "}
                          {getCurrencySymbol(currentLayer.layer)}
                        </h1>
                      </span>
                    </div>
                  </div>
                )}
                {currentAsset.price > 0 ? (
                  <div className="">
                    <Button
                      variant="secondary"
                      className="w-60 h-12 flex justify-center items-center"
                      onClick={toggleCancelModal}
                    >
                      {isLoading ? (
                        <Loader2
                          className="animate-spin w-full"
                          color="#111315"
                          size={24}
                        />
                      ) : (
                        "Cancel Listing"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="">
                    <Button
                      variant="primary"
                      className="w-60 h-12 flex justify-center items-center"
                      onClick={HandleList}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2
                          className="animate-spin w-full"
                          color="#111315"
                          size={24}
                        />
                      ) : (
                        "List"
                      )}
                    </Button>
                  </div>
                )}
              </div>
              <div className="w-full h-[1px] bg-neutral500" />
              <Accordion
                type="multiple"
                defaultValue={["item-1", "item-2"]}
                className="w-full"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    Detail
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-6">
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Owned by
                      </h1>
                      {/* <p className="font-medium text-md text-neutral50">
                        {currentAsset.ownedBy}
                      </p> */}
                      <Link
                        href={
                          collectionData &&
                          collectionData[0] &&
                          currentAsset.ownedBy
                            ? getAddressExplorerUrl(
                                collectionData[0].layer,
                                currentAsset.ownedBy
                              )
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-md text-neutral50 hover:text-brand transition-colors"
                      >
                        {currentAsset.ownedBy}
                      </Link>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Floor difference
                      </h1>
                      <p className="font-medium text-md text-success">
                        {/* {currentAsset.floorDifference ?? "-"}% */}
                        {currentAsset.floorDifference === 0 ||
                        currentAsset.floorDifference === 1
                          ? "-"
                          : `${currentAsset.floorDifference}%`}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Listed time
                      </h1>
                      <p className="font-medium text-md text-neutral50">
                        {formatTimeAgo(currentAsset.createdAt)} ago
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    About {currentAsset.collectionName}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-neutral200 font-medium text-md">
                      {currentAsset.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="w-full h-[1px] bg-white8" />
          <Tabs defaultValue="activity">
            <div className="flex flex-col gap-8">
              <TabsList className="border border-neutral400 p-1 rounded-xl h-12 w-fit">
                <TabsTrigger
                  value="activity"
                  className="px-5 rounded-lg border-0 font-semibold"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger value="more" className="px-5 rounded-lg border-0">
                  More from collection
                </TabsTrigger>
              </TabsList>
              <TabsContent value="activity" className="w-full">
                <div className="overflow-x-auto w-full">
                  <div className="flex flex-col min-w-[1216px] w-full">
                    <div className="flex flex-row items-center px-3 pb-4 justify-between border-b border-neutral500">
                      <p className="max-w-[360px] w-full text-neutral200 text-md font-medium">
                        Item
                      </p>
                      <p className="max-w-[220px] w-full text-neutral200 text-md font-medium">
                        Event
                      </p>
                      <p className="max-w-[200px] w-full text-neutral200 text-md font-medium">
                        Price
                      </p>
                      <p className="max-w-[260px] w-full text-neutral200 text-md font-medium">
                        Address
                      </p>
                      <p className="max-w-[152px] w-full text-neutral200 text-md font-medium">
                        Date
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-3">
                      {activity.map((item: any) => (
                        <ActivityCard
                          key={item.id}
                          data={item}
                          imageUrl={
                            currentAsset.highResolutionImageUrl
                              ? currentAsset.highResolutionImageUrl
                              : s3ImageUrlBuilder(currentAsset.fileKey)
                          }
                          collectionName={currentAsset.collectionName}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="more"></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <PendingListModal
        open={isVisible}
        onClose={toggleModal}
        imageUrl={
          currentAsset.highResolutionImageUrl
            ? currentAsset.highResolutionImageUrl
            : s3ImageUrlBuilder(currentAsset.fileKey)
        }
        uniqueIdx={currentAsset.uniqueIdx}
        name={currentAsset.name}
        collectionName={currentAsset.collectionName}
        collectibleId={currentAsset.id}
        txid={txid}
        id={id}
        isOwnListing={currentAsset.isOwnListing}
      />
      <CancelListModal
        open={cancelModal}
        onClose={toggleCancelModal}
        id={currentAsset.id}
        listId={currentAsset.listId}
      />
    </>
  );
}
