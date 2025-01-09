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
  getListedCollectionById,
} from "@/lib/service/queryHelper";
import {
  formatPrice,
  s3ImageUrlBuilder,
  formatDaysAgo,
  truncateAddress,
} from "@/lib/utils";
import { useState } from "react";
import { useParams } from "next/navigation";
import BuyAssetModal from "@/components/modal/buy-asset-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityCard from "@/components/atom/cards/activity-card";
import AssetDetailSkeleton from "@/components/atom/skeleton/asset-detail-skeleton";
import { Collectible } from "@/lib/validations/collection-validation";
import { useAuth } from "@/components/provider/auth-context-provider";
import { toast } from "sonner";
import Link from "next/link";
import MoreCollection from "@/components/section/more-collection";

export default function AssetDetail() {
  const params = useParams();
  const { authState } = useAuth();

  const id = params.detailId as string;
  const [isVisible, setIsVisible] = useState(false);

  const { data: collectible, isLoading: isCollectionLoading } = useQuery<
    Collectible[] | null
  >({
    queryKey: ["collectionData", id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

  const currentAsset = collectible?.[0];
  const collectionId = currentAsset?.collectionId;

  const { data: activity = [] } = useQuery({
    queryKey: ["acitivtyData", id],
    queryFn: () => getCollectibleActivity(id),
    enabled: !!id,
  });

  const { data: collection, isLoading: isQueryLoading } = useQuery({
    queryKey: ["collectionData", collectionId],
    queryFn: () => getListedCollectionById(collectionId as string),
    enabled: !!collectionId,
    retry: 1,
    initialData: {
      collectibles: [],
      listedCollectibleCount: "0",
      totalOwnerCount: 0,
    },
  });

  const toggleModal = () => {
    if (!authState.authenticated)
      return toast.error("Please connect wallet first");
    setIsVisible(!isVisible);
  };

  if (isCollectionLoading) {
    return (
      <Layout>
        <Header />
        <AssetDetailSkeleton />
      </Layout>
    );
  }

  if (!currentAsset) {
    return (
      <Layout>
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-neutral200">Asset not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <div className="flex flex-col w-full gap-16 pt-10 pr-10 pl-10 3xl:px-[312px]">
        <div className="md:grid grid-cols-2 flex flex-col gap-16 justify-between pt-16 relative z-20">
          <div className="w-full h-auto relative flex items-center justify-center">
            <div className="z-10 w-full h-full blur-[90px] opacity-35 scale-120">
              <Image
                width={560}
                height={560}
                src={
                  currentAsset.highResolutionImageUrl
                    ? currentAsset.highResolutionImageUrl
                    : s3ImageUrlBuilder(currentAsset.fileKey)
                  // currentAsset.fileKey
                  //   ? s3ImageUrlBuilder(currentAsset.fileKey)
                  //   : ordinalsImageCDN(currentAsset.uniqueIdx)
                }
                className="aspect-square rounded-xl relative z-20 md:h-[343px] 3xl:h-[560px] 3xl:w-[560px] w-[343px] h-auto md2:h-auto md2:w-full"
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
              className="aspect-square rounded-xl absolute z-20 w-[330px] h-auto md:h-[340px] md2:h-auto md2:w-full 2xl:w-[560px] 2xl:h-[560px] top-0"
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
            <div className="w-full h-[1px] bg-neutral500 my-8" />
            <div className="flex flex-col justify-center gap-6">
              {currentAsset.price > 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium pt-3 text-end text-lg text-neutral200">
                      <p>List price</p>
                    </span>
                    <span className="font-bold text-neutral50 text-lg">
                      <h1>
                        {currentAsset.price && formatPrice(currentAsset.price)}{" "}
                        cBTC
                      </h1>
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-4">
                {currentAsset.price > 0 ? (
                  <Button
                    variant="primary"
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
            <Accordion type="multiple" className="w-full mt-8">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-medium text-xl text-neutral50 w-full">
                  Detail
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-6">
                  {currentAsset.inscriptionId && (
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Original Asset (Inscription ID)
                      </h1>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://testnet4.ordinals.com/${currentAsset.inscriptionId}`}
                        className="font-medium cursor-pointer text-md hover:underline text-neutral50"
                      >
                        {truncateAddress(currentAsset.inscriptionId)}
                      </Link>
                    </div>
                  )}
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
                      {currentAsset.floorDifference}%
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <h1 className="font-medium text-md text-neutral200">
                      Listed time
                    </h1>
                    <p className="font-medium text-md text-neutral50">
                      {formatDaysAgo(currentAsset.createdAt)}
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
            <TabsContent value="activity">
              <div className="overflow-x-auto 3xl:overflow-x-hidden w-full">
                <div className="min-w-[1216px]">
                  <div className="flex flex-row items-center px-3 pb-4 justify-between border-b border-neutral500">
                    <div className="w-[360px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                      Item
                    </div>
                    <div className="w-[220px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                      Event
                    </div>
                    <div className="w-[200px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                      Price
                    </div>
                    <div className="w-[260px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                      Address
                    </div>
                    <div className="w-[152px] shrink-0  text-neutral200 text-md font-medium whitespace-nowrap">
                      Date
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-3">
                    {activity?.map((item: any) => (
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
            <TabsContent value="more">
              <MoreCollection
                collection={collection}
                currentAssetId={currentAsset.id}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <BuyAssetModal
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
        price={currentAsset.price}
        listId={currentAsset.listId}
      />
    </Layout>
  );
}
