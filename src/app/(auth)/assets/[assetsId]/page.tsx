"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
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
} from "@/lib/service/queryHelper";
import {
  getSigner,
  ordinalsImageCDN,
  s3ImageUrlBuilder,
  formatPrice,
} from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";
import PendingListModal from "@/components/modal/pending-list-modal";
import moment from "moment";
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

export default function AssetsDetails() {
  const queryClient = useQueryClient();
  const params = useParams();
  const { authState } = useAuth();

  const id = params.assetsId as string;
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txid, setTxid] = useState<string>("");

  const { mutateAsync: createApprovalMutation } = useMutation({
    mutationFn: createApprovalTransaction,
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
    //   queryClient.invalidateQueries({ queryKey: ["acitivtyData", id] });
    // },
  });

  const { mutateAsync: checkAndCreateRegisterMutation } = useMutation({
    mutationFn: checkAndCreateRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["acitivtyData", id] });
    },
  });

  const { data: collectionData, isLoading: isCollectionLoading } = useQuery<
    Collectible[] | null
  >({
    queryKey: ["collectionData", id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["acitivtyData", id],
    queryFn: () => getCollectibleActivity(id as string),
    enabled: !!id,
  });

  const currentAsset = collectionData?.[0];

  const formatTimeAgo = (dateString: string) => {
    const now = moment();
    const createdDate = moment(dateString);
    const duration = moment.duration(now.diff(createdDate));
    const minutes = duration.asMinutes();

    if (minutes < 60) {
      return `${Math.floor(minutes)}m`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)}h`;
    } else {
      return `${Math.floor(minutes / 1440)}d`;
    }
  };

  const toggleModal = () => {
    setIsVisible(!isVisible);
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
        });
        if (registerRes.success) {
          if (!registerRes.data.isRegistered) {
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(
              registerRes.data.registrationTx,
            );
            await signedTx?.wait();
          }
        } else {
          return toast.error("Error registering asset");
        }
        toggleModal();
        // } else {
        //   toast.error("Unknown issue");
        // }
      }
    } catch (error) {
      toast.error("Error listing asset");
      console.error("Error listing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const formatPrice = (price: number) => {
  //   return price.toLocaleString("en-US", {
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 4,
  //   });
  // };

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
  //todo tur fileKey gd yvsan imageUrl bolgoj oorchloh

  return (
    <Layout>
      <Header />
      <div className="flex flex-col gap-32 w-full">
        <div className="flex justify-between pt-16 relative z-50">
          <div className="relative z-10 w-[580px] h-[580px] blur-[90px] opacity-35 scale-120">
            <Image
              width={560}
              height={560}
              src={
                currentAsset.highResolutionImageUrl
                  ? currentAsset.highResolutionImageUrl
                  : s3ImageUrlBuilder(currentAsset.fileKey)
              }
              className="aspect-square rounded-xl"
              alt={`${currentAsset.name} logo`}
            />
          </div>
          <Image
            width={560}
            height={560}
            src={
              currentAsset.highResolutionImageUrl
                ? currentAsset.highResolutionImageUrl
                : s3ImageUrlBuilder(currentAsset.fileKey)
            }
            className="aspect-square rounded-xl absolute z-50"
            alt={`${currentAsset.name} logo`}
          />
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-xl text-brand">
                {currentAsset.collectionName}
              </p>
              <span className="flex text-3xl font-bold text-neutral50">
                {currentAsset.name}
              </span>
            </div>
            <div className="w-[592px] h-[1px] bg-neutral500" />
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
                      <h1>{formatPrice(currentAsset.price)} cBTC</h1>
                    </span>
                  </div>
                </div>
              )}
              {currentAsset.price === 0 && (
                <div className="">
                  <Button
                    variant="primary"
                    className="w-60 h-12 bg-brand500 flex justify-center items-center"
                    onClick={HandleList}
                    disabled
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
            <div className="w-[592px] h-[1px] bg-neutral500" />
            <div>
              <Accordion type="multiple" className="w-[592px]">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    Detail
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-6">
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Owned by
                      </h1>
                      <p className="font-medium text-md text-neutral50">
                        {currentAsset.ownedBy}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Floor difference
                      </h1>
                      <p className="font-medium text-md text-success">
                        {currentAsset.floorDifference ?? 0}%
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
            <TabsContent value="activity" className="flex flex-col">
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
                    fileKey={
                      currentAsset.highResolutionImageUrl
                        ? currentAsset.highResolutionImageUrl
                        : s3ImageUrlBuilder(currentAsset.fileKey)
                    }
                    collectionName={currentAsset.collectionName}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="more"></TabsContent>
          </div>
        </Tabs>
      </div>
      <PendingListModal
        open={isVisible}
        onClose={toggleModal}
        fileKey={
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
      />
    </Layout>
  );
}
