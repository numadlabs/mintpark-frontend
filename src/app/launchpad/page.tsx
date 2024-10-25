"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import LaunchpadBanner from "@/components/section/launchpadBanner";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchpadCard from "@/components/atom/cards/launchpadCard";
import { LaunchDataType } from "@/lib/types";

const Launchpad = () => {
  const { authState } = useAuth();
  const [interval, setInterval] = useState<string>("all");

  const { data: launch = [] } = useQuery({
    queryKey: ["launchData", interval],
    queryFn: () => fetchLaunchs(authState?.layerId as string, interval),
    enabled: !!authState?.layerId,
  });

  const handleIntervalChange = (value: string) => {
    setInterval(value);
    console.log("first", value);
  };

  return (
    <Layout>
      <Header />
      <LaunchpadBanner />
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
          {launch.map((item: LaunchDataType) => (
            <LaunchpadCard id={item.id} key={item.id} data={item} />
          ))}
        </TabsContent>
        <TabsContent value="live" className="grid grid-cols-4 gap-10">
          {launch.map((item: LaunchDataType) => (
            <LaunchpadCard id={item.id} key={item.id} data={item} />
          ))}
        </TabsContent>
        <TabsContent value="past" className="grid grid-cols-4 gap-10">
          {launch.map((item: LaunchDataType) => (
            <LaunchpadCard id={item.id} key={item.id} data={item} />
          ))}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Launchpad;
