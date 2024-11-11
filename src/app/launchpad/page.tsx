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
import Banner from "@/components/section/banner";

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
      <div className="px-4 sm:px-6 lg:px-8">
        <LaunchpadBanner data={launch?.[0]} />
        <Tabs
          className="text-neutral50 mt-6 sm:mt-8 lg:mt-12"
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10"
          >
            {isLoading
              ? renderSkeletons()
              : launch.map((item: LaunchDataType) => (
                  <LaunchpadCard id={item.id} key={item.id} data={item} />
                ))}
          </TabsContent>
          <TabsContent
            value="live"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10"
          >
            {isLoading
              ? renderSkeletons()
              : launch.map((item: LaunchDataType) => (
                  <LaunchpadCard id={item.id} key={item.id} data={item} />
                ))}
          </TabsContent>
          <TabsContent
            value="past"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10"
          >
            {isLoading
              ? renderSkeletons()
              : launch.map((item: LaunchDataType) => (
                  <LaunchpadCard id={item.id} key={item.id} data={item} />
                ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Launchpad;

// "use client";

// import { useState, useRef } from "react";
// import Header from "@/components/layout/header";
// import Layout from "@/components/layout/layout";
// import LaunchpadBanner from "@/components/section/launchpadBanner";
// import { fetchLaunchs } from "@/lib/service/queryHelper";
// import { useQuery } from "@tanstack/react-query";
// import { useAuth } from "@/components/provider/auth-context-provider";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import LaunchpadCard from "@/components/atom/cards/launchpadCard";
// import { LaunchDataType } from "@/lib/types";
// import LaunchpadCardSkeleton from "@/components/atom/skeleton/launchpad-skeleton";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
// } from "@/components/ui/carousel";
// import Autoplay from "embla-carousel-autoplay";
// import Image from "next/image";
// import Banner from "@/components/section/banner";

// const Launchpad = () => {
//   const { authState } = useAuth();
//   const [interval, setInterval] = useState<string>("all");

//   const { data: launch = [], isLoading } = useQuery({
//     queryKey: ["launchData", interval],
//     queryFn: () => fetchLaunchs(authState?.layerId as string, interval),
//     enabled: !!authState?.layerId,
//   });

//   const handleIntervalChange = (value: string) => {
//     setInterval(value);
//   };

//   const renderSkeletons = () => {
//     return Array(8)
//       .fill(null)
//       .map((_, index) => <LaunchpadCardSkeleton key={`skeleton-${index}`} />);
//   };

//   const plugin = useRef(Autoplay({ delay: 10000, stopOnInteraction: true }));

//   return (
//     <Layout>
//       <Header />
//       <LaunchpadBanner data={launch?.[0]} />
//       <Tabs
//         className="text-neutral50 mt-12"
//         defaultValue="all"
//         onValueChange={handleIntervalChange}
//       >
//         <TabsList className="mb-8 font-semibold text-[15px] border border-neutral400 p-1 rounded-xl">
//           <TabsTrigger
//             value="all"
//             className="w-[59px] font-semibold text-[15px] border-hidden rounded-lg"
//           >
//             All
//           </TabsTrigger>
//           <TabsTrigger
//             value="live"
//             className="w-[159px] font-semibold text-[15px] border-hidden rounded-lg"
//           >
//             Live & Upcoming
//           </TabsTrigger>
//           <TabsTrigger
//             value="past"
//             className="w-[73px] font-semibold text-[15px] border-hidden rounded-lg"
//           >
//             Past
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="all" className="grid grid-cols-4 gap-10">
//           {isLoading
//             ? renderSkeletons()
//             : launch.map((item: LaunchDataType) => (
//                 <LaunchpadCard id={item.id} key={item.id} data={item} />
//               ))}
//         </TabsContent>
//         <TabsContent value="live" className="grid grid-cols-4 gap-10">
//           {isLoading
//             ? renderSkeletons()
//             : launch.map((item: LaunchDataType) => (
//                 <LaunchpadCard id={item.id} key={item.id} data={item} />
//               ))}
//         </TabsContent>
//         <TabsContent value="past" className="grid grid-cols-4 gap-10">
//           {isLoading
//             ? renderSkeletons()
//             : launch.map((item: LaunchDataType) => (
//                 <LaunchpadCard id={item.id} key={item.id} data={item} />
//               ))}
//         </TabsContent>
//       </Tabs>
//     </Layout>
//   );
// };

// export default Launchpad;
