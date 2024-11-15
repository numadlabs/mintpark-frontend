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
import { Collectible } from "@/lib/types";
import { getListableById } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import AssetsSkeleton from "@/components/atom/skeleton/my-asset-skeleton";
import { toast } from "sonner";

export default function Assets({ detail = false }: { detail: boolean }) {
  const [active, setActive] = useState(false);
  // Add states for ordering
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");

  const { authState } = useAuth();

  const { data: collectiblelist = [], isLoading } = useQuery({
    queryKey: ["getListableById", authState.userId, orderBy, orderDirection],
    queryFn: () =>
      getListableById(authState?.userId as string, orderDirection, orderBy),
    enabled: !!authState?.userId,
  });

  // const handleComingSoon = () => {
  //   toast({
  //     title: "Coming Soon!",
  //     description: "This feature is under development and will be available soon.",
  //     variant: "default",
  //     duration: 3000,
  //   });
  // };

  // Handle filter change
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
      <Tabs defaultValue="All" className="mt-20 mb-10 border-hidden">
        <section className="flex justify-between mb-7">
          {detail ? (
            <section className="flex justify-between ">
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
                // onClick={() => setActive(!active)}
                // onClick={handleComingSoon}
                // gime ve onClick to comint soon toast message
              />
              <div className="flex">
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
                  className="w-[813px] h-[48px] rounded-xl pt-[14px] pr-[14px] pb-[14px] pl-10 bg-transparent border border-neutral400 text-neutral200"
                />
                <div />
              </div>
            </section>
          ) : (
            <div>{/* Tabs code removed for brevity */}</div>
          )}
          <div className="flex justify-between text-center items-center w-[330px] h-[48px] gap-4">
            <Select defaultValue="recent" onValueChange={handleOrderChange}>
              <SelectTrigger className="w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50 pt-2 pr-4 pb-2 pl-5">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                className="w-[225px] h-40 rounded-xl text-center bg-neutral600 bg-opacity-[70%] text-neutral50 border-neutral400"
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
            <TabsList className="text-neutral50 border border-neutral400 rounded-xl w-[92px] h-12">
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
            className={`flex w-full ${active ? "gap-10" : "gap-0"} pt-7`}
          >
            <div
              className={`flex ${
                active ? " opacity-100 w-[280px]" : " opacity-0 w-0"
              } transition-all`}
            >
              <CollectionSideBar />
            </div>

            <TabsContent value="All">
              <div
                className={`grid w-full gap-10 ${
                  active ? "grid-cols-3" : "grid-cols-4"
                }`}
              >
                {collectiblelist.data?.collectibles?.map(
                  (item: Collectible) => (
                    <div key={item.id}>
                      <AssetsCard data={item} />
                    </div>
                  ),
                )}
              </div>
            </TabsContent>

            <TabsContent value="ColCard" className="w-full">
              <div className="flex h-[34px] pr-8 pb-4 pl-4">
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
                      Floor defference
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
                  {collectiblelist.data?.collectibles?.map(
                    (item: Collectible) => (
                      <div key={item.id}>
                        <ColAssetsCards data={item} />
                      </div>
                    ),
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </section>
        )}
      </Tabs>
    </>
  );
}
