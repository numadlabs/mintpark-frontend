"use client";

import { useState, useRef } from "react";
import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import LaunchpadBanner from "@/components/section/launchpad-banner";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchpadCard from "@/components/atom/cards/launchpad-card";
import LaunchpadCardSkeleton from "@/components/atom/skeleton/launchpad-skeleton";
import Autoplay from "embla-carousel-autoplay";

const Launchpad = () => {
  const { authState, selectedLayerId } = useAuth();
  const [interval, setInterval] = useState<string>("all");

  const { data: launch = [], isLoading } = useQuery({
    queryKey: ["launchData", interval],
    queryFn: () => fetchLaunchs(selectedLayerId as string, interval),
    enabled: !!selectedLayerId,
  });

  const handleIntervalChange = (value: string) => {
    setInterval(value);
  };

  const renderSkeletons = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => <LaunchpadCardSkeleton key={`skeleton-${index}`} />);
  };
  return (
    <Layout>
      <Header />
      <div className="">
        <LaunchpadBanner data={launch?.[0]} />
        <Tabs
          className="text-neutral50 mt-14 sm:mt-14 lg:mt-12"
          defaultValue="all"
          onValueChange={handleIntervalChange}
        >
          <div className="overflow-x-auto">
            <TabsList className="mb-4 mt-3 sm:mt-0 sm:mb-6 lg:mb-8 font-semibold text-sm sm:text-[15px] border border-neutral400 p-1 rounded-xl whitespace-nowrap min-w-min">
              <TabsTrigger
                value="all"
                className="w-[50px] sm:w-[59px] font-semibold text-sm sm:text-[15px] border-hidden rounded-lg"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="w-[130px] sm:w-[159px] font-semibold text-sm sm:text-[15px] border-hidden rounded-lg"
              >
                Live & Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="w-[60px] sm:w-[73px] font-semibold text-sm sm:text-[15px] border-hidden rounded-lg"
              >
                Past
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="all"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 3xl:grid-cols-6 gap-6 sm:gap-6 lg:gap-8 xl:gap-8"
          >
            {isLoading
              ? renderSkeletons()
              : launch.map((item: any) => (
                  <LaunchpadCard id={item.id} key={item.id} data={item} />
                ))}
          </TabsContent>
          <TabsContent
            value="live"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 3xl:grid-cols-6  gap-6 sm:gap-6 lg:gap-8 xl:gap-8"
          >
            {isLoading
              ? renderSkeletons()
              : launch.map((item: any) => (
                  <LaunchpadCard id={item.id} key={item.id} data={item} />
                ))}
          </TabsContent>
          <TabsContent
            value="past"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 3xl:grid-cols-6  gap-6 sm:gap-6 lg:gap-8 xl:gap-8"
          >
            {isLoading
              ? renderSkeletons()
              : launch.map((item: any) => (
                  <LaunchpadCard id={item.id} key={item.id} data={item} />
                ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Launchpad;
