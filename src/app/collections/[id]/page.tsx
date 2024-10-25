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
import ColDetailCard from "@/components/atom/cards/collectionDetailCard";
import ColDetailCards from "@/components/atom/cards/columnDetailCard";
import { getListedCollectionById } from "@/lib/service/queryHelper";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { CollectionDataType } from "@/lib/types";
import CollectionSideBar from "@/components/section/collections/sideBar";

const CollectionDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const [active, setActive] = useState(false);
  const searchParams = useSearchParams();
  const [collectionData, setCollectionData] =
    useState<CollectionDataType | null>(null);

  const { data: collection = [] } = useQuery({
    queryKey: ["collectionData"],
    queryFn: () => getListedCollectionById(id as string),
    enabled: !!id,
  });

  console.log(collection)

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const parsedData = JSON.parse(data) as CollectionDataType;
      setCollectionData(parsedData);
    }
  }, [searchParams]);
  useEffect(() => {
    console.log("Sidebar active state:", active);
  }, [active]);

  const handleSortClick = () => {
    setActive(!active);
  };


  const links = [
    {
      url: "/collections",
      isIcon: true,
      icon: <Global size={34} className={`hover:text-brand text-neutral00`} />,
    },
    {
      url: "/collections",
      isIcon: true,
      icon: <DiscordIcon size={34} className={`iconHover`} />,
    },
    {
      url: "/collections",
      isIcon: false,
      icon: <ThreadIcon size={34} className={`iconHover`} />,
    },
  ];

  return (
    <>
      <Tabs defaultValue="AllCard" className="mt-[43.5px] mb-10">
        <section>
          {/* Banner Section */}
          <div className="w-full relative h-[320px] mt-10 ">
            <div className="relative h-[200px] w-full rounded-3xl overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: collectionData?.logoKey
                    ? `url(${s3ImageUrlBuilder(collectionData.logoKey)})`
                    : "url(/path/to/fallback/image.png)",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div
                className="absolute inset-0 bg-neutral600 bg-opacity-[70%] z-50"
                style={{
                  backdropFilter: "blur(50px)",
                }}
              />
              <div className="h-[190px]" />
            </div>

            {/* Collection Info */}
            <div className="flex absolute top-24 pl-12 pr-12 w-full z-50">
              <div>
                <Image
                  width={208}
                  height={208}
                  src={
                    collectionData?.logoKey
                      ? s3ImageUrlBuilder(collectionData.logoKey)
                      : "/path/to/fallback/image.png"
                  }
                  className="aspect-square rounded-xl"
                  alt="png"
                />
              </div>
              <div className="w-full pl-6 pr-6 pt-4 pb-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-neutral50">
                      {collectionData?.name}
                    </h3>
                    <h2 className="text-lg2 font-medium text-neutral100">
                      by {collectionData?.creator}
                    </h2>
                  </div>
                  <div className="flex gap-6 pt-8">
                    {links.map((link, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Button clicked");
                        }}
                        className="h-10 w-10 border border-transparent bg-transparent"
                      >
                        {link.icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-around relative right-14 top-9">
                  <div className="pl-1">
                    <h2 className="font-medium text-lg2 text-neutral100">
                      Floor price
                    </h2>
                    <div className="flex mt-2">
                      <Image
                        width={24}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        {/* <span>{(collectionData?.floor / 10 ** 8).toFixed(5)}</span> BTC */}
                        <span>
                          {collectionData?.floor
                            ? (collectionData.floor)?.toFixed(4)
                            : "0.00000"}
                        </span>{" "}
                        BTC
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-l-neutral300 pl-7">
                    <h2 className="font-medium text-lg2 text-neutral100">
                      Total volume  
                     </h2>
                    <div className="flex mt-2">
                      <Image
                        width={24}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        <span>{collectionData?.volume   ? (collectionData.volume)?.toFixed(4)
                            : "0.00000"}</span> BTC
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-l-neutral300 pl-7">
                    <h2 className="font-medium text-lg2 text-neutral100">
                      Owners
                    </h2>
                    <div className="flex mt-2">
                      <Profile2User color="#d3f85a" />
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        <span>0</span>
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-l-neutral300 pl-7">
                    <h2 className="font-medium text-lg2 text-neutral100">
                      Items
                    </h2>
                    <div className="flex mt-2">
                      <Notepad color="#d3f85a" />
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        <span>{collectionData?.supply}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="pl-12 pr-12 text-lg2 font-normal text-neutral100">
            {collectionData?.description}
          </p>
        </section>

        {/* Search and Filter Section */}
        <section className="flex justify-between mb-7 pt-10">
          <Image
            src={"/collections/sort.png"}
            alt="burger"
            width={20}
            height={20}
            className={`w-12 h-12 rounded-xl p-3 ${
              active
                ? "bg-neutral500 hover:bg-neutral400 border-transparent"
                : "bg-neutral600 border border-neutral500 hover:border-neutral400"
            }`}
            onClick={handleSortClick}
          />
          <div className="flex">
            <Image
              src={"/collections/search.png"}
              alt="burger"
              width={20}
              height={20}
              className="w-[17.08px] h-[17.08px] relative left-8 top-4"
            />
            <input
              type="email"
              name="Search"
              placeholder="Search ID"
              className="w-[813px] h-[48px] rounded-xl pt-[14px] pr-[14px] pb-[14px] pl-10 bg-transparent border border-neutral400 text-neutral200"
            />
            <div />
            <div className="pl-4 pr-4">
              <Select>
                <SelectTrigger className="w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50 pt-2 pr-4 pb-2 pl-5">
                  <SelectValue placeholder="Volume" />
                </SelectTrigger>
                <SelectContent
                  className="w-60 h-40 rounded-xl bg-neutral600 bg-opacity-[70%] border-neutral400"
                  style={{
                    backdropFilter: "blur(30px)",
                  }}
                >
                  <div className="text-center">
                    <SelectItem value="highest">Highest volume</SelectItem>
                    <SelectItem value="lowest">Lowest volume</SelectItem>
                    <SelectItem value="highestFloor">
                      Highest floor price
                    </SelectItem>
                    <SelectItem value="lowestFloor">
                      Lowest floor price
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>

            <TabsList className="text-neutral50 border border-neutral400 rounded-lg w-[92px] h-12">
              <TabsTrigger
                value="AllCard"
                className="w-10 h-10 font-semibold text-[15px] border-hidden rounded-lg p-[10px]"
              >
                <Image
                  src="/collections/hashtag.png"
                  alt="hashtag"
                  width={20}
                  height={20}
                />
              </TabsTrigger>
              <TabsTrigger
                value="ColCard"
                className="w-10 h-10 font-semibold text-[15px] border-hidden rounded-lg p-[10px]"
              >
                <Image
                  src="/collections/burger.png"
                  alt="burger"
                  width={20}
                  height={20}
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </section>

        {/* Main Content Section */}
        <section
          className={`flex w-full  pt-7  ${active ? "gap-10" : "gap-0"}`}
        >
          {/* Sidebar */}
          <div
            className={`flex ${
              active ? "opacity-100 w-[280px]" : "opacity-0 w-0"
            } transition-all`}
          >
            <CollectionSideBar />
          </div>
          <div
            className={`flex-grow ${active ? "w-[calc(100%-280px)]" : "w-full"}`}
          >
            <TabsContent value="AllCard">
              <div
                className={`grid w-full gap-10 ${
                  active ? "grid-cols-3" : "grid-cols-4"
                }`}
              >
                {collection.map((item: any) => (
                  <div key={item.id}>
                    <ColDetailCard data={item} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ColCard" className="w-full">
              <div className="flex h-[34px] pr-8 pb-4 pl-4">
                <div className="w-[392px] h-[18px]">
                  <p className="font-medium text-md text-neutral200">Item</p>
                </div>
                <div className="grid grid-cols-4 pl-5 w-full text-center">
                  <div className="max-w-[200px] h-[18px]">
                    <p className="font-medium text-md text-neutral200 pr-7">
                      Price
                    </p>
                  </div>
                  <div className="max-w-[200px] h-[18px]">
                    <p className="font-medium text-md text-neutral200">
                      Floor difference
                    </p>
                  </div>
                  <div className="max-w-[200px] h-[18px]">
                    <p className="font-medium text-md text-neutral200">Owner</p>
                  </div>
                  <div className="max-w-[200px] h-[18px]">
                    <p className="font-medium text-md text-neutral200 pl-10">
                      Listed time
                    </p>
                  </div>
                </div>
              </div>
              <ScrollArea className="h-[754px] w-full border-t-2 border-neutral500">
                <div className="flex flex-col w-full pt-4 gap-4">
                  {collection.map((item: any) => (
                    <div key={item.id}>
                      <ColDetailCards data={item} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </section>
      </Tabs>
    </>
  );
};

export default CollectionDetailPage;
