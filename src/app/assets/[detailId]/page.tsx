"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
  getCollectibleTraits,
  getCollectionById,
  getLayerById,
  getListedCollectionById,
} from "@/lib/service/queryHelper";
import {
  formatPrice,
  s3ImageUrlBuilder,
  formatDaysAgo,
  truncateAddress,
} from "@/lib/utils";
import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import BuyAssetModal from "@/components/modal/buy-asset-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityCard from "@/components/atom/cards/activity-card";
import AssetDetailSkeleton from "@/components/atom/skeleton/asset-detail-skeleton";
import { Collectible } from "@/lib/validations/collection-validation";
import { useAuth } from "@/components/provider/auth-context-provider";
import { toast } from "sonner";
import Link from "next/link";
import MoreCollection from "@/components/section/more-collection";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import { getAddressExplorerUrl } from "@/lib/service/currencyHelper";

const ACTIVITY_PER_PAGE = 20;

export default function AssetDetail() {
  const params = useParams();
  const router = useRouter();
  const { authState } = useAuth();
  const id = params.detailId as string;
  const [isVisible, setIsVisible] = useState(false);
  const [activityPageSize] = useState(ACTIVITY_PER_PAGE);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);

  const { data: collectible, isLoading: isCollectionLoading } = useQuery<
    Collectible[] | null
  >({
    queryKey: ["collectionData", id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const currentAsset = collectible?.[0];
  const collectionId = currentAsset?.collectionId;

  // Replace regular query with infinite query for activities
  const {
    data: activityData,
    fetchNextPage: fetchNextActivity,
    isFetchingNextPage: isFetchingNextActivity,
    hasNextPage: hasNextActivityPage,
    isLoading: isActivityLoading,
  } = useInfiniteQuery({
    queryKey: ["activityData", id, activityPageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!id) {
        throw new Error("Asset ID is required");
      }
      const response = await getCollectibleActivity(
        id,
        activityPageSize,
        pageParam * activityPageSize
      );

      // Determine if we have more activities to load
      const hasMore = response.length === activityPageSize;
      setHasMoreActivity(hasMore);

      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return hasMoreActivity ? allPages.length : undefined;
    },
    enabled: Boolean(id),
  });

  // Memoize all activities from all pages
  const allActivities = activityData?.pages?.flat() ?? [];

  // Activity infinite scroll observer
  const loadMoreActivityRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMoreActivity &&
            !isFetchingNextActivity
          ) {
            fetchNextActivity();
          }
        },
        {
          rootMargin: "200px",
          threshold: 0.1,
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMoreActivity, isFetchingNextActivity, fetchNextActivity]
  );

  const { data: attribute = [] } = useQuery({
    queryKey: ["attributeData", id],
    queryFn: () => getCollectibleTraits(id),
    enabled: !!id,
  });

  const { data: collection, isLoading: isQueryLoading } = useQuery({
    queryKey: ["collectionData", collectionId, "recent", "desc"],
    queryFn: () =>
      getListedCollectionById(
        collectionId as string,
        "recent",
        "desc",
        10,
        0,
        "",
        false,
        {}
      ),
    enabled: !!collectionId,
    retry: 1,
    initialData: {
      collectibles: [],
      listedCollectibleCount: "10",
      hasMore: false,
    },
  });

  const handlBackCollection = () => {
    router.push(`/collections/${collectionId}`);
  };

  const toggleModal = () => {
    if (!authState.authenticated)
      return toast.error("Please connect wallet first");
    setIsVisible(!isVisible);
  };
  if (isCollectionLoading) {
    return (
      <Layout>
        <AssetDetailSkeleton />
      </Layout>
    );
  }

  if (!currentAsset) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <p className="text-neutral200">Asset not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full flex justify-center ">
        <div className="flex flex-col w-full gap-16 max-w-[1216px]">
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
                <p
                  className="font-medium text-xl text-brand cursor-pointer"
                  onClick={handlBackCollection}
                >
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
                          {currentAsset.price &&
                            formatPrice(currentAsset.price)}{" "}
                          {getCurrencySymbol(currentLayer.layer)}
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
              {/* this section is Attribute */}
              <h1 className="font-medium text-xl text-neutral50 w-full">
                Attributes
              </h1>
              <div className="grid grid-cols-3 gap-4">
                {Array.isArray(attribute) && attribute.length > 0 ? (
                  attribute.map((item: any) => (
                    <div
                      key={item.id}
                      className="grid gap-2 rounded-2xl bg-white4 pt-4 pb-5 pr-5 pl-5"
                    >
                      <p className="text-neutral200 font-medium text-md">
                        {item.name}
                      </p>
                      <p className="text-neutral50 font-medium text-lg">
                        {item.value}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-start text-neutral200">
                    No attributes available
                  </div>
                )}
              </div>
              <Accordion
                type="multiple"
                defaultValue={["item-1", "item-2"]}
                className="w-full mt-8"
              >
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
                      <Link
                        href={
                          collectible && collectible[0] && currentAsset.ownedBy
                            ? getAddressExplorerUrl(
                                collectible[0].layer,
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
                      {allActivities && allActivities.length > 0 ? (
                        allActivities.map((item: any) => (
                          <ActivityCard
                            key={`${item.transactionHash}-${item.activityType}-${item.timestamp}`}
                            data={item}
                            imageUrl={
                              currentAsset.highResolutionImageUrl
                                ? currentAsset.highResolutionImageUrl
                                : s3ImageUrlBuilder(currentAsset.fileKey)
                            }
                            currentLayer={currentLayer?.layer}
                            currenAsset={currentAsset?.name}
                          />
                        ))
                      ) : (
                        <div className="flex justify-center items-center mt-8 rounded-3xl w-full bg-neutral500 bg-opacity-[50%] h-[430px]">
                          <p className="text-neutral200 font-medium text-lg">
                            No activity recorded
                          </p>
                        </div>
                      )}

                      {/* Activity loading indicator */}
                      {isFetchingNextActivity && (
                        <div className="w-full flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral50"></div>
                        </div>
                      )}

                      {/* Activity infinite scroll trigger */}
                      {hasMoreActivity && (
                        <div className="h-8 w-full" ref={loadMoreActivityRef} />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="more">
                {collection &&
                collection.collectibles &&
                collection.collectibles.length > 0 ? (
                  <MoreCollection
                    collection={collection}
                    currentAssetId={currentAsset.id}
                  />
                ) : (
                  <div className="flex justify-center items-center mt-8 rounded-3xl w-full bg-neutral500 bg-opacity-[50%] h-[430px]">
                    <p className="text-neutral200 font-medium text-lg">
                      No items in this collection
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
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
        isOwnListing={currentAsset.isOwnListing}
      />
    </Layout>
  );
}
