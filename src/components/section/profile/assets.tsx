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
import { SearchNormal } from "iconsax-react";

export default function Assets({ detail = false }: { detail: boolean }) {
  const [active, setActive] = useState(false);
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");

  const { authState } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["getListableById", authState.userId, orderBy, orderDirection],
    queryFn: () =>
      getListableById(
        authState?.userId as string,
        orderDirection,
        orderBy,
        authState.userLayerId as string
      ),
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
        className="mt-8 mb-6 md:mb-10 border-hidden px-4 md:px-0"
      >
        <section className="flex flex-col md:flex-row gap-4 mb-4 md:mb-7">
          {detail ? (
            <section className="flex flex-row justify-between w-full gap-4">
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
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchNormal size={20} color="#D7D8D8" />
                </div>
                <input
                  type="text"
                  placeholder="Search ID"
                  className="w-full h-12 rounded-xl pl-10 pr-4 bg-transparent border border-neutral400 text-neutral200"
                />
              </div>
            </section>
          ) : null}

          <div className="flex flex-row justify-between text-center items-start w-full md:w-[330px] h-auto sm:h-[48px] gap-4">
            <Select defaultValue="recent" onValueChange={handleOrderChange}>
              <SelectTrigger className="w-full md:w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50 pt-2 pr-4 pb-2 pl-5">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                className="w-full md:w-[225px] h-40 rounded-xl text-center bg-neutral600 bg-opacity-[70%] text-neutral50 border-neutral400"
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
                className={`grid w-full gap-4 sm:gap-6 ${
                  active
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6"
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
              <div className="overflow-x-auto w-full">
                <div className="w-full border-b border-neutral400 min-w-[1216px] ">
                  <div className="w-full border-b border-neutral400 flex h-[34px] pr-8 pb-4 pl-4 justify-between">
                    <div className="w-[392px] h-[18px]">
                      <p className="font-medium text-md text-neutral200">
                        Item
                      </p>
                    </div>
                    <div className="flex flex-row w-full text-start gap-0 justify-end">
                      <div className="w-[200px] h-[18px]">
                        <p className="font-medium text-md text-neutral200 pr-7">
                          Price
                        </p>
                      </div>
                      <div className="w-[200px] h-[18px]">
                        <p className="font-medium text-md text-neutral200">
                          Floor difference
                        </p>
                      </div>
                      <div className="w-[200px] h-[18px]">
                        <p className="font-medium text-md text-neutral200">
                          Owner
                        </p>
                      </div>
                      <div className="w-[200px] h-[18px]">
                        <p className="font-medium text-md text-neutral200 ">
                          Listed time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full pt-4 gap-4">
                  {data?.data.collectibles.map((item: CollectibleSchema) => (
                    <div key={item.id}>
                      <ColAssetsCards data={item} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </section>
        )}
      </Tabs>
    </>
  );
}
