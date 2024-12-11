"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useState } from "react";
import CollectionSideBar from "../collections/sideBar";
import AssetsCard from "@/components/atom/cards/assets-card";
import ColAssetsCards from "@/components/atom/cards/col-assets-card";
import { getListableById } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import AssetsSkeleton from "@/components/atom/skeleton/my-asset-skeleton";
import { CollectibleSchema } from "@/lib/validations/asset-validation";

export default function Assets({ detail = false }: { detail: boolean }) {
  const [active, setActive] = useState(false);
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");

  const { authState } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["getListableById", authState.userId, orderBy, orderDirection],
    queryFn: () =>
      getListableById(authState?.userId as string, orderDirection, orderBy),
    enabled: !!authState?.userId,
  });

  const handleOrderChange = (value: string) => {
    switch (value) {
      case "recent":
        setOrderBy("recent");
        setOrderDirection("desc");
        break;
      case "price_high_to_low":
        setOrderBy("price");
        setOrderDirection("asc");
        break;
      case "price_low_to_high":
        setOrderBy("price");
        setOrderDirection("desc");
        break;
      default:
        setOrderBy("recent");
        setOrderDirection("desc");
    }
  };

  if (isLoading) {
    return <AssetsSkeleton detail={detail} />;
  }

  return (
    <>
      <Tabs
        defaultValue="All"
        className="mt-10 md:mt-20 mb-6 md:mb-10 border-hidden px-4 md:px-0"
      >
        <section className="flex flex-col md:flex-row justify-between mb-4 md:mb-7 gap-4">
          {detail ? (
            <section className="flex flex-col md:flex-row justify-between w-full md:w-auto gap-4">
              <Image
                src={"/collections/sort.png"}
                alt="burger"
                width={20}
                height={20}
                className={`w-12 h-12 rounded-xl cursor-not-allowed p-3 ${
                  active
                    ? "bg-neutral500 hover:bg-neutral400 border-transparent"
                    : "bg-neutral600 border border-neutral500 hover:border-neutral400"
                }`}
              />
              <div className="flex w-full md:w-auto">
                <Image
                  src={"/collections/search.png"}
                  alt="search"
                  width={20}
                  height={20}
                  className="w-[17.08px] h-[17.08px] relative left-8 top-4"
                />
                <input
                  type="email"
                  name="Search"
                  placeholder="Search ID"
                  className="w-full md:w-[813px] h-[48px] rounded-xl pt-[14px] pr-[14px] pb-[14px] pl-10 bg-transparent border border-neutral400 text-neutral200"
                />
              </div>
            </section>
          ) : null}

          <div className="flex flex-col sm:flex-row justify-between text-center items-start w-full sm:w-[330px] h-auto sm:h-[48px] gap-4">
            <Select defaultValue="recent" onValueChange={handleOrderChange}>
              <SelectTrigger className="w-full sm:w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50 pt-2 pr-4 pb-2 pl-5">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                className="w-full sm:w-[225px] h-40 rounded-xl text-center bg-neutral600 bg-opacity-[70%] text-neutral50 border-neutral400"
                style={{
                  backdropFilter: "blur(30px)",
                }}
              >
                <SelectItem value="recent" className="pl-10">
                  Recently listed
                </SelectItem>
                <SelectItem value="price_low_to_high" className="pl-10">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price_high_to_low" className="pl-10">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
            <TabsList className="text-neutral50 border border-neutral400 rounded-xl w-[92px] sm:w-[92px] h-12">
              <TabsTrigger
                value="All"
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

        {detail && (
          <section
            className={`flex w-full ${
              active ? "gap-4 md:gap-10" : "gap-0"
            } pt-4 md:pt-7`}
          >
            <div
              className={`flex ${
                active ? "opacity-100 w-full md:w-[280px]" : "opacity-0 w-0"
              } transition-all`}
            >
              <CollectionSideBar />
            </div>

            <TabsContent value="All">
              <div
                className={`grid w-full gap-4 md:gap-10 ${
                  active
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {data?.data?.collectibles?.map((item: CollectibleSchema) => (
                  <div key={item.id}>
                    <AssetsCard data={item} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ColCard" className="w-full">
              <div className="hidden md:flex h-[34px] pr-8 pb-4 pl-4">
                <div className="w-[392px] h-[18px]">
                  <p className="font-medium text-md text-neutral200">Item</p>
                </div>
                <div className="grid grid-cols-4 w-full text-center">
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
              <ScrollArea className="h-[500px] md:h-[754px] w-full border-t-2 border-neutral500">
                <div className="flex flex-col w-full pt-4 gap-4">
                  {data?.data?.collectibles?.map((item: CollectibleSchema) => (
                    <div key={item.id}>
                      <ColAssetsCards data={item} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </section>
        )}
      </Tabs>
    </>
  );
}
