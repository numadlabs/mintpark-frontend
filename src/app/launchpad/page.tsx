"use client";

import { useState, useRef } from "react";
import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import LaunchpadBanner from "@/components/section/launchpadBanner";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchpadCard from "@/components/atom/cards/launchpadCard";
import { LaunchDataType } from "@/lib/types";
import LaunchpadCardSkeleton from "@/components/atom/skeleton/launchpad-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

const Launchpad = () => {
  const { authState } = useAuth();
  const [interval, setInterval] = useState<string>("all");

  const { data: launch = [], isLoading } = useQuery({
    queryKey: ["launchData", interval],
    queryFn: () => fetchLaunchs(authState?.layerId as string, interval),
    enabled: !!authState?.layerId,
  });

  const handleIntervalChange = (value: string) => {
    setInterval(value);
  };

  const renderSkeletons = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => <LaunchpadCardSkeleton key={`skeleton-${index}`} />);
  };

  const plugin = useRef(Autoplay({ delay: 10000, stopOnInteraction: true }));

  return (
    <Layout>
      <Header />
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="w-full h-[320px]">
          {/* {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1 bg-neutral500 w-full h-full">
                <div>
                  <div className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))} */}
          <CarouselItem>
            <div className="w-full relative h-[320px] z-50 pt-11 flex justify-center">
              <Image
                src={"/banner.png"}
                alt=""
                width={1216}
                height={320}
                sizes="100%"
                className="w-full h-full rounded-3xl"
              />
              <div className="absolute top-[152px] flex flex-col gap-6 items-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="text-3xl text-neutral00 font-bold">
                    We are live on
                  </p>
                  <Image
                    src={"/wallets/Citrea.png"}
                    alt="citrea"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <p className="text-3xl text-neutral00 font-bold">
                    Citrea testnet!
                  </p>
                </div>
                <p className="text-lg text-neutral50">
                  Mint Park is live on Citrea testnet! Start minting and trading
                  NFTs.
                </p>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <Tabs
        className="text-neutral50 mt-20"
        defaultValue="all"
        onValueChange={handleIntervalChange}
      >
        <TabsList className="mb-8 font-semibold text-[15px] border border-neutral400 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="w-[59px] font-semibold text-[15px] border-hidden rounded-lg"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="w-[159px] font-semibold text-[15px] border-hidden rounded-lg"
          >
            Live & Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="w-[73px] font-semibold text-[15px] border-hidden rounded-lg"
          >
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid grid-cols-4 gap-10">
          {isLoading
            ? renderSkeletons()
            : launch.map((item: LaunchDataType) => (
                <LaunchpadCard id={item.id} key={item.id} data={item} />
              ))}
        </TabsContent>
        <TabsContent value="live" className="grid grid-cols-4 gap-10">
          {isLoading
            ? renderSkeletons()
            : launch.map((item: LaunchDataType) => (
                <LaunchpadCard id={item.id} key={item.id} data={item} />
              ))}
        </TabsContent>
        <TabsContent value="past" className="grid grid-cols-4 gap-10">
          {isLoading
            ? renderSkeletons()
            : launch.map((item: LaunchDataType) => (
                <LaunchpadCard id={item.id} key={item.id} data={item} />
              ))}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Launchpad;
