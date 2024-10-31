import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const LaunchpadCardSkeleton = () => {
  return (
    <div className="relative h-[412px] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] px-4 pt-4 flex flex-col">
      <Skeleton className="w-[248px] h-[248px] rounded-xl bg-neutral500" />
      <Skeleton className="h-6 w-3/4 mt-3" />
      <div className="flex justify-between py-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-2 w-full mt-1 rounded-lg" />
      <Skeleton className="h-4 w-32 mt-3 ml-auto" />
      <Skeleton className="h-[34px] w-24 rounded-lg absolute top-7 left-8" />
    </div>
  );
};

export default LaunchpadCardSkeleton;
