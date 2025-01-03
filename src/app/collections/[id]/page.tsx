"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Global, Notepad, Profile2User } from "iconsax-react";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import ColDetailCard from "@/components/atom/cards/collection-detail-card";
import ColDetailCards from "@/components/atom/cards/collection-detail-column-card";
import { getListedCollectionById } from "@/lib/service/queryHelper";
import { s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import { CollectionDataType } from "@/lib/types";
import CollectionSideBar from "@/components/section/collections/sideBar";
import CollectionDetailSkeleton from "@/components/atom/skeleton/collection-detail-skeleton";
import { motion, AnimatePresence } from "framer-motion";
const CollectionDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const [active, setActive] = useState(false);
  const searchParams = useSearchParams();
  const [collectionData, setCollectionData] =
    useState<CollectionDataType | null>(null);
  const [isParamsLoading, setIsParamsLoading] = useState(true);

  useEffect(() => {
    setIsParamsLoading(true);
    if (params) {
      setIsParamsLoading(false);
    }
  }, [params]);

  const { data: collection, isLoading: isQueryLoading } = useQuery({
    queryKey: ["collectionData", id],
    queryFn: () => getListedCollectionById(id as string),
    enabled: !!id,
    retry: 1,
    initialData: {
      collectibles: [],
      listedCollectibleCount: "0",
      totalOwnerCount: 0,
    },
  });

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        //todo collection data g id ashiglan tanstack query eer api duudaj avna. Params aar damjuulahgui
        const parsedData = JSON.parse(data) as CollectionDataType;
        setCollectionData(parsedData);
      } catch (error) {
        console.error("Failed to parse collection data:", error);
      }
    }
  }, [searchParams]);

  const links = [
    {
      url: collectionData?.websiteUrl,
      isIcon: true,
      icon: <Global size={34} className={`hover:text-brand text-neutral00`} />,
    },
    {
      url: collectionData?.discordUrl,
      isIcon: false,
      icon: (
        <DiscordIcon size={34} className={`hover:text-brand text-neutral00`} />
      ),
    },
    {
      url: collectionData?.twitterUrl,
      isIcon: false,
      icon: (
        <ThreadIcon size={34} className={`hover:text-brand text-neutral00`} />
      ),
    },
  ].filter(
    (link) => link.url !== null && link.url !== undefined && link.url !== ""
  );

  const handleSocialClick = (url: string | undefined) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(validUrl, "_blank", "noopener,noreferrer");
    // window.location.href = validUrl;
  };
  const isLoading = isParamsLoading || (!!id && isQueryLoading);

  if (isLoading) {
    return <CollectionDetailSkeleton />;
  }

  return (
    <>
      <Tabs
        defaultValue="AllCard"
        className="mt-[43.5px] mb-10 px-4 md:px-6 lg:px-12"
      >
        <section>
          {/* Banner Section */}
          <div className="w-full relative h-[320px] mt-10">
            <div className="relative h-[200px] w-full rounded-3xl overflow-hidden">
              <div
                className="absolute z-0 inset-0"
                style={{
                  backgroundImage: collectionData?.logoKey
                    ? `url(${s3ImageUrlBuilder(collectionData.logoKey)})`
                    : "url(/path/to/fallback/image.png)",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="absolute inset-0 bg-neutral600 bg-opacity-[70%] z-0 backdrop-blur-3xl" />
            </div>

            {/* Collection Info */}
            <div className="flex flex-col lg:flex-row absolute top-24 w-full z-10 px-4 md:px-12 gap-6">
              <div className="flex justify-center lg:block">
                <Image
                  width={208}
                  height={208}
                  src={
                    collectionData?.logoKey
                      ? s3ImageUrlBuilder(collectionData.logoKey)
                      : "/path/to/fallback/image.png"
                  }
                  className="aspect-square rounded-xl w-40 lg:w-52"
                  alt="collection logo"
                />
              </div>
              <div className="flex-1 lg:relative top-0 lg:top-7 space-y-4 lg:space-y-7">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-neutral50 text-center md:text-left">
                      {collectionData?.name}
                    </h3>
                    <h2 className="text-lg lg:text-lg font-medium text-neutral100 text-center md:text-left">
                      by {collectionData?.creatorName}
                    </h2>
                  </div>
                  {links.length > 0 && (
                    <div className="flex justify-center lg:justify-end gap-6">
                      {links.map((link, i) => (
                        <button
                          key={i}
                          onClick={() => handleSocialClick(link.url)}
                          className="h-10 w-10 border border-transparent bg-transparent"
                        >
                          {link.icon}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:pt-0 pt-10">
                  <div className="grid grid-cols-2 md:flex md:justify-around md:grid-cols-4 xl:grid w-full gap-8 md:gap-8 lg:gap-8 mt-4">
                    <div className="text-center md:text-left">
                      <h2 className="font-medium text-lg text-neutral100">
                        Floor price
                      </h2>
                      <div className="flex items-center justify-center md:justify-start mt-2">
                        <Image
                          width={24}
                          height={20}
                          src="/detail_icon/Bitcoin.png"
                          alt="bitcoin"
                          className="aspect-square"
                        />
                        <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                          <span>
                            {collectionData?.floor
                              ? formatPrice(collectionData.floor)
                              : "0"}
                          </span>{" "}
                          cBTC
                        </p>
                      </div>
                    </div>

                    <div className="text-center md:text-left">
                      <h2 className="font-medium text-lg text-neutral100">
                        Total volume
                      </h2>
                      <div className="flex items-center justify-center md:justify-start mt-2">
                        <Image
                          width={24}
                          height={20}
                          src="/detail_icon/Bitcoin.png"
                          alt="bitcoin"
                          className="aspect-square"
                        />
                        <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                          <span>
                            {collectionData?.volume
                              ? formatPrice(collectionData?.volume)
                              : "0"}
                          </span>{" "}
                          cBTC
                        </p>
                      </div>
                    </div>

                    <div className="text-center md:text-left">
                      <h2 className="font-medium text-lg text-neutral100">
                        Owners
                      </h2>
                      <div className="flex items-center justify-center md:justify-start mt-2">
                        <Profile2User color="#d3f85a" />
                        <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                          <span>
                            {collectionData?.ownerCount
                              ? collectionData?.ownerCount
                              : 0}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-center md:text-left">
                      <h2 className="font-medium text-lg text-neutral100">
                        Items
                      </h2>
                      <div className="flex items-center justify-center md:justify-start mt-2">
                        <Notepad color="#d3f85a" />
                        <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                          <span>{collectionData?.supply}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="px-4 md:px-12 text-lg font-normal text-neutral100 mt-6">
            {collectionData?.description}
          </p>
        </section>

        {/* Search and Filter Section */}
        <section className="flex flex-col md:flex-row justify-between gap-4 mb-7 pt-60 md:pt-36 md2:pt-36 lg:pt-10">
          {/* <Image
            src="/collections/sort.png"
            alt="sort"
            width={20}
            height={20}
            className={`w-12 h-12 cursor-not-allowed rounded-xl p-3 ${
              active
                ? "bg-neutral500 hover:bg-neutral400 border-transparent"
                : "bg-neutral600 border border-neutral500 hover:border-neutral400"
            }`}
          /> */}

          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full">
              <Image
                src="/collections/search.png"
                alt="search"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[17.08px] h-[17.08px]"
              />
              <input
                type="text"
                placeholder="Search ID"
                className="w-full h-12 rounded-xl pl-10 pr-4 bg-transparent border border-neutral400 text-neutral200"
              />
            </div>

            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="w-full md:w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50">
                  <SelectValue placeholder="Volume" />
                </SelectTrigger>
                <SelectContent className="w-full -top-[53px] lg:left-0 md:w-60 rounded-xl bg-neutral600 bg-opacity-70 border-neutral400 backdrop-blur-lg pb-2 px-2">
                  <SelectItem value="highest">Highest volume</SelectItem>
                  <SelectItem value="lowest">Lowest volume</SelectItem>
                  <SelectItem value="highestFloor">
                    Highest floor price
                  </SelectItem>
                  <SelectItem value="lowestFloor">
                    Lowest floor price
                  </SelectItem>
                </SelectContent>
              </Select>

              <TabsList className="text-neutral50 border border-neutral400 rounded-lg w-[92px] h-12 px-1">
                <TabsTrigger
                  value="AllCard"
                  className="w-10 h-10 rounded-lg p-[10px] border border-transparent"
                >
                  <Image
                    src="/collections/hashtag.png"
                    alt="grid"
                    width={20}
                    height={20}
                  />
                </TabsTrigger>
                <TabsTrigger
                  value="ColCard"
                  className="w-10 h-10 rounded-lg p-[10px] border border-transparent"
                >
                  <Image
                    src="/collections/burger.png"
                    alt="list"
                    width={20}
                    height={20}
                  />
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className={`flex w-full pt-7 ${active ? "gap-10" : "gap-0"}`}>
          {/* Sidebar */}
          <div
            className={`${
              active ? "block w-[280px]" : "hidden"
            } transition-all`}
          >
            <CollectionSideBar />
          </div>

          {/* Content */}

          <div
            className={`flex-grow ${
              active ? "w-[calc(100%-380px)]" : "sm:w-full"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="AllCard">
                  <div
                    className={`grid gap-4 md:gap-6 lg:gap-8 ${
                      active
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-6 sm:gap-6 lg:gap-8 xl:gap-8"
                        : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3  2xl:grid-cols-4 3xl:grid-cols-6 gap-6 sm:gap-6 lg:gap-8 xl:gap-8"
                    }`}
                  >
                    {collection?.collectibles?.map((item: any) => (
                      <div key={item.id}>
                        <ColDetailCard data={item} />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ColCard" className="w-full">
                  <div className="w-full overflow-x-auto border-b border-neutral400">
                    <div className="w-full min-w-[1216px] h-[34px] pr-8 pb-4 pl-4">
                      <div className="w-[324px]">
                        <p className="font-medium text-md text-neutral200">
                          Item
                        </p>
                      </div>
                      <div className="grid grid-cols-4 pl-5 w-full text-center">
                        <p className="font-medium text-md text-neutral200">
                          Price
                        </p>
                        <p className="font-medium text-md text-neutral200">
                          Floor difference
                        </p>
                        <p className="font-medium text-md text-neutral200">
                          Owner
                        </p>
                        <p className="font-medium text-md text-neutral200">
                          Listed time
                        </p>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-[754px] w-full border-t-2 overflow-x-auto border-neutral500">
                    <div className="flex flex-col w-full pt-4 gap-4">
                      {collection?.collectibles?.map((item: any) => (
                        <div key={item.id}>
                          <ColDetailCards data={item} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </Tabs>
    </>
  );
};

export default CollectionDetailPage;
