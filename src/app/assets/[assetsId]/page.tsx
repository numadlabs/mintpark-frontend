"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
import { getSigner, ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";
import PendingListModal from "@/components/modal/pending-list-modal";
import moment from "moment";
import { createApprovalTransaction } from "@/lib/service/postRequest";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ActivityCard from "@/components/atom/cards/activity-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetDetailSkeleton from "@/components/atom/skeleton/asset-detail-skeleton";

export default function AssetsDetails() {
  const params = useParams();
  const id = params.assetsId as string;
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txid, setTxid] = useState<string>("");

  const { mutateAsync: createApprovalMutation } = useMutation({
    mutationFn: createApprovalTransaction,
  });

  const { data: collectionData, isLoading: isCollectionLoading } = useQuery({
    queryKey: ["collectionData", id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["acitivtyData", id],
    queryFn: () => getCollectibleActivity(id as string),
    enabled: !!id,
  });

  const formatTimeAgo = (dateString: string) => {
    const now = moment();
    const createdDate = moment(dateString);
    const duration = moment.duration(now.diff(createdDate));
    const minutes = duration.asMinutes();

    if (minutes < 60) {
      // Less than an hour
      return `${Math.floor(minutes)}m`;
    } else if (minutes < 1440) {
      // Less than a day
      return `${Math.floor(minutes / 60)}h`;
    } else {
      // Days
      return `${Math.floor(minutes / 1440)}d`;
    }
  };

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const HandleList = async () => {
    setIsLoading(true);
    try {
      const collectionId = collectionData?.[0]?.collectionId;
      const response = await createApprovalMutation({
        collectionId: collectionId,
      });
      if (response && response.success) {
        const { transaction, isApproved } = response.data.approveTxHex;
        console.log(transaction);
        if (isApproved === false) {
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(transaction);
          await signedTx?.wait();
          if (signedTx?.hash) setTxid(signedTx?.hash);
          toggleModal();
        } else if (isApproved === true) {
          toggleModal();
        } else {
          toast.error("Unknown issue");
        }
      }
    } catch (error) {
      toast.error("Error list");
      console.error("Error list:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatPrice = (price: number) => {
    const btcAmount = price;
    return btcAmount?.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };
  return (
    <Layout>
      <Header />
      {isCollectionLoading || isActivityLoading ? (
        <AssetDetailSkeleton />
      ) : (
        <div className="flex flex-col gap-32 w-full">
          <div className="flex justify-between pt-16 relative z-50">
            <div>
              <Image
                width={560}
                height={560}
                src={
                  collectionData?.[0]?.fileKey
                    ? s3ImageUrlBuilder(collectionData?.[0]?.fileKey)
                    : ordinalsImageCDN(collectionData?.[0]?.uniqueIdx)
                }
                className="aspect-square rounded-xl"
                alt={`${collectionData?.[0]?.name} logo`}
              />
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-xl text-brand">
                  {collectionData?.[0]?.collectionName}
                </p>
                <span className="flex text-3xl font-bold text-neutral50">
                  {collectionData?.[0]?.name}
                </span>
              </div>
              <div className="w-[592px] h-[1px] bg-neutral500" />
              <div className="flex flex-col justify-center gap-6">
                {collectionData?.[0]?.price === 0 ? (
                  "This asset is not listed"
                ) : (
                  <div className="flex flex-col justify-center gap-6">
                    <div className="flex justify-between w-full">
                      <span className="font-medium pt-3 text-end text-lg text-neutral200">
                        <p>List price</p>
                      </span>
                      <span className="font-bold text-neutral50 text-lg">
                        <h1>{formatPrice(collectionData?.[0]?.price)} cBTC</h1>
                      </span>
                    </div>
                  </div>
                )}
                {collectionData?.[0]?.price === 0 && (
                  <div className="">
                    <Button
                      variant={"primary"}
                      className="w-60 h-12 bg-brand500 flex justify-center items-center"
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
                        // "loading..."
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
                          {collectionData?.[0]?.ownedBy}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <h1 className="font-medium text-md text-neutral200">
                          Floor difference
                        </h1>
                        <p className="font-medium text-md text-success">
                          {collectionData?.[0]?.floorDifference ?? 0}%
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <h1 className="font-medium text-md text-neutral200">
                          Listed time
                        </h1>
                        <p className="font-medium text-md text-neutral50">
                          {formatTimeAgo(collectionData?.[0]?.createdAt)} ago
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="font-medium text-xl text-neutral50">
                      About {collectionData?.[0]?.collectionName}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-neutral200 font-medium text-md">
                        {collectionData?.[0]?.description}
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
                      fileKey={collectionData?.[0]?.fileKey}
                      collectionName={collectionData?.[0]?.collectionName}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="more"></TabsContent>
            </div>
          </Tabs>
        </div>
      )}
      <PendingListModal
        open={isVisible}
        onClose={toggleModal}
        fileKey={collectionData?.[0]?.fileKey}
        uniqueIdx={collectionData?.[0]?.uniqueIdx}
        name={collectionData?.[0]?.name}
        collectionName={collectionData?.[0]?.collectionName}
        collectibleId={collectionData?.[0]?.id}
        txid={txid}
      />
    </Layout>
  );
}
