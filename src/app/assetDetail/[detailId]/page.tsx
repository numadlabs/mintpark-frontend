"use client";

import { useQuery } from "@tanstack/react-query";
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
  getEstimateFee,
} from "@/lib/service/queryHelper";
import { ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import { useState } from "react";
import { useParams } from "next/navigation";
import BuyAssetModal from "@/components/modal/buy-asset-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityCard from "@/components/atom/cards/activity-card";
import AssetDetailSkeleton from "@/components/atom/skeleton/asset-detail-skeleton";

export default function AssetDetail() {
  const params = useParams();
  const id = params.detailId as string;
  const [isVisible, setIsVisible] = useState(false);

  const { data: collectionData = [], isLoading: isCollectionLoading } =
    useQuery({
      queryKey: ["collectionData", id],
      queryFn: () => getCollectionById(id as string),
      enabled: !!id,
    });

  const { data: estimateFee = [] } = useQuery({
    queryKey: ["feeData"],
    queryFn: () => getEstimateFee(collectionData?.[0]?.listId ?? ""),
    enabled: !!collectionData?.[0]?.listId,
  });

  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["acitivtyData", id],
    queryFn: () => getCollectibleActivity(id as string),
    enabled: !!id,
  });

  const formatDaysAgo = (dateString: string) => {
    const createdDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "1 day ago";
    } else {
      return `${diffDays} days ago`;
    }
  };

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };
  const formatPrice = (price: number) => {
    const btcAmount = price;
    return btcAmount?.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <Layout>
      <Header />
      {isCollectionLoading ? (
        <AssetDetailSkeleton />
      ) : (
        <div className="flex flex-col w-full gap-32">
          <div className="md:grid grid-cols-2 flex flex-col gap-16 justify-between pt-16 relative z-20">
            <div className="w-full h-full relative flex items-center justify-center">
              <div className="z-10 w-full h-full blur-[90px] opacity-35 scale-120">
                <Image
                  width={560}
                  height={560}
                  src={
                    collectionData[0]?.fileKey
                      ? s3ImageUrlBuilder(collectionData[0]?.fileKey)
                      : ordinalsImageCDN(collectionData[0]?.uniqueIdx)
                  }
                  className="aspect-square rounded-xl relative z-20 md:h-full w-full h-[360px]"
                  alt={`${collectionData[0]?.name} logo`}
                />
              </div>
              <Image
                width={560}
                height={560}
                src={
                  collectionData[0]?.fileKey
                    ? s3ImageUrlBuilder(collectionData[0]?.fileKey)
                    : ordinalsImageCDN(collectionData[0]?.uniqueIdx)
                }
                className="aspect-square rounded-xl absolute z-20 w-[360px] h-[320px] md:h-[340px] lg:w-full lg:h-full top-0"
                alt={`${collectionData[0]?.name} logo`}
              />
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-xl text-brand">
                  {collectionData[0]?.collectionName}
                </p>
                <span className="flex text-3xl font-bold text-neutral50">
                  {collectionData[0]?.name}
                </span>
              </div>
              <div className="w-full h-[1px] bg-neutral500" />
              <div className="flex flex-col justify-center gap-6">
                {collectionData[0]?.price > 0 ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between w-full">
                      <span className="font-medium pt-3 text-end text-lg text-neutral200">
                        <p>List price</p>
                      </span>
                      <span className="font-bold text-neutral50 text-lg">
                        <h1>
                          {formatPrice(estimateFee?.estimation?.price)} cBTC
                        </h1>
                      </span>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <div className="flex gap-4">
                  {collectionData[0]?.price > 0 ? (
                    <Button
                      variant={"primary"}
                      className="w-60 h-12 bg-brand500"
                      onClick={toggleModal}
                    >
                      Buy now
                    </Button>
                  ) : (
                    <p className="text-xl text-neutral50 font-medium">
                      This asset is not listed
                    </p>
                  )}
                </div>
              </div>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-medium text-xl text-neutral50 w-full">
                    Detail
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-6">
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Owned by
                      </h1>
                      <p className="font-medium text-md text-neutral50">
                        {collectionData[0]?.ownedBy}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Floor difference
                      </h1>
                      <p className="font-medium text-md text-success">
                        {collectionData[0]?.floorDifference}%
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Listed time
                      </h1>
                      <p className="font-medium text-md text-neutral50">
                        {formatDaysAgo(collectionData[0]?.createdAt)}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    About {collectionData[0]?.collectionName}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-neutral200 font-medium text-md">
                      {collectionData[0]?.description}
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
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div className="overflow-hidden">
                      {/* Table Headers */}
                      <div className="flex flex-row items-center px-3 pb-4 justify-between border-b border-neutral500">
                        <div
                          style={{ width: "360px" }}
                          className="text-neutral200 text-md font-medium whitespace-nowrap"
                        >
                          Item
                        </div>
                        <div
                          style={{ width: "220px" }}
                          className="text-neutral200 text-md font-medium whitespace-nowrap"
                        >
                          Event
                        </div>
                        <div
                          style={{ width: "200px" }}
                          className="text-neutral200 text-md font-medium whitespace-nowrap"
                        >
                          Price
                        </div>
                        <div
                          style={{ width: "260px" }}
                          className="text-neutral200 text-md font-medium whitespace-nowrap"
                        >
                          Address
                        </div>
                        <div
                          style={{ width: "152px" }}
                          className="text-neutral200 text-md font-medium whitespace-nowrap"
                        >
                          Date
                        </div>
                      </div>

                      {/* Table Content */}
                      <div className="flex flex-col gap-3 pt-3">
                        {activity.map((item: any) => (
                          <ActivityCard
                            key={item.id}
                            data={item}
                            fileKey={collectionData[0]?.fileKey}
                            collectionName={collectionData[0]?.collectionName}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="more"></TabsContent>
            </div>
          </Tabs>
        </div>
      )}
      <BuyAssetModal
        open={isVisible}
        onClose={toggleModal}
        fileKey={collectionData[0]?.fileKey}
        uniqueIdx={collectionData[0]?.uniqueIdx}
        name={collectionData[0]?.name}
        collectionName={collectionData[0]?.collectionName}
        price={estimateFee?.estimation?.price}
        serviceFee={estimateFee?.estimation?.serviceFee}
        networkFee={estimateFee?.estimation?.networkFee}
        total={estimateFee?.estimation?.total}
        listId={collectionData?.[0]?.listId}
      />
    </Layout>
  );
}
