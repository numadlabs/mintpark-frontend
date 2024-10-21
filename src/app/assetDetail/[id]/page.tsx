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
  getCollectibleById,
  getCollectionById,
} from "@/lib/service/queryHelper";
import { CollectibleDataType, CollectionDataType } from "@/lib/types";
import { ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const {
    data: collectionData,
    isLoading: isCollectionLoading,
    error: collectionError,
  } = useQuery<CollectionDataType[]>({
    queryKey: ["collectionData", params.id],
    queryFn: () => getCollectionById(params.id),
    enabled: !!params.id,
  });

  const {
    data: collectibleData,
    isLoading: isCollectibleLoading,
    error: collectibleError,
  } = useQuery<CollectibleDataType[]>({
    queryKey: ["collectibleData", params.id],
    queryFn: () => getCollectibleById(params.id),
    enabled: !!params.id,
  });

  if (isCollectionLoading || isCollectibleLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        Loading...
      </div>
    );
  }

  if (collectionError || collectibleError) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        Error: {((collectionError || collectibleError) as Error).message}
      </div>
    );
  }

  if (
    !collectionData ||
    collectionData.length === 0 ||
    !collectibleData ||
    collectibleData.length === 0
  ) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        No data available
      </div>
    );
  }

  const collection = collectionData[0];
  const collectible = collectibleData[0];
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

  return (
    <Layout>
      <Header />
      <div className="flex justify-between pt-16 relative z-50">
        <div>
          <Image
            width={560}
            height={560}
            src={
              collection.fileKey
                ? s3ImageUrlBuilder(collection.logoKey)
                : ordinalsImageCDN(collection.uniqueIdx)
            }
            className="aspect-square rounded-xl"
            alt={`${collection.name} logo`}
          />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-xl text-brand">
              {collection.collectionName}
            </p>
            <span className="flex text-3xl font-bold text-neutral50">
              {collection.name}
            </span>
          </div>
          <div className="w-[592px] h-[1px] bg-neutral500" />
          <div className="flex flex-col justify-center gap-6">
            <div className="flex justify-between w-full">
              <span className="font-medium pt-3 text-end text-lg text-neutral200">
                <p>List price</p>
              </span>
              <span className="font-bold text-neutral50 text-lg">
                <h1>{(collection.price / 10 ** 8).toFixed(4)} BTC</h1>
              </span>
            </div>
            {/* <div className="flex justify-between w-full">
              <span className="font-medium pt-3 text-end text-lg text-neutral200">
                <p>Network fee</p>
              </span>
              <span className="font-bold text-neutral50 text-lg">
                <h1>{(collection.price / 10 ** 8).toFixed(4)} BTC</h1>
              </span>
            </div>
            <div className="flex justify-between w-full">
              <span className="font-medium pt-3 text-end text-lg text-neutral200">
                <p>Service fee</p>
              </span>
              <span className="font-bold text-neutral50 text-lg">
                <h1>{(collection.price / 10 ** 8).toFixed(4)} BTC</h1>
              </span>
            </div> */}
            <div className="flex justify-between w-full">
              <span className="font-medium pt-3 text-end text-lg2 text-neutral200">
                <p>Total price</p>
              </span>
              <span className="font-bold text-brand500 text-xl">
                <h1>{(collection.price / 10 ** 8).toFixed(4)} BTC</h1>
              </span>
            </div>
            {collection.price > 0 && (
            <div className="">
              <Button variant={"default"} className="w-60 h-12 bg-brand500">
                Buy now
              </Button>
            </div>
          )}
          </div>
          <div className="w-[592px] h-[1px] bg-neutral500" />
          <div className="flex flex-col gap-6">
            <h1 className="font-medium text-lg2 text-neutral50">Attribute</h1>
            <div className="grid grid-cols-3 gap-2">
              <div className="w-[192px] rounded-xl grid gap-2 border border-neutral500 pt-3 pb-4 pl-4 pr-4">
                <p className="font-medium text-sm text-neutral200">
                  {collectible.name}
                </p>
                <h1 className="font font-medium text-md text-neutral50">
                  {collectible.value}
                </h1>
              </div>
            </div>
          </div>
          <div className="w-[592px] h-[1px] bg-neutral500" />
          <div>
            <Accordion type="single" collapsible className="w-[592px]">
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
                      {collection.ownedBy}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <h1 className="font-medium text-md text-neutral200">
                      Floor difference
                    </h1>
                    <p className="font-medium text-md text-success">
                      {collection.floorDifference}%
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <h1 className="font-medium text-md text-neutral200">
                      Listed time
                    </h1>
                    <p className="font-medium text-md text-neutral50">
                    {formatDaysAgo(collection.createdAt)}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-medium text-xl text-neutral50">
                  About {collection.collectionName}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral200 font-medium text-md">
                    {collection.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </Layout>
  );
}
