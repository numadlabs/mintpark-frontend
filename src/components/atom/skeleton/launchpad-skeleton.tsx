import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const LaunchpadCardSkeleton = () => {
  return (
    <div className="relative w-full max-w-[1920px] flex flex-col backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] p-3 sm:p-4">
      {/* Image skeleton - maintain aspect ratio */}
      <div className="relative w-full aspect-square">
        <Skeleton className="absolute inset-0 rounded-xl bg-neutral500" />
      </div>

      {/* Tag/Status badge skeleton */}
      <div className="absolute top-6 left-6">
        <Skeleton className="h-8 w-20 sm:w-24 rounded-lg" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-5 sm:h-6 w-3/4 mt-3" />

      {/* Stats row */}
      <div className="flex justify-between items-center py-2 sm:py-3">
        <Skeleton className="h-3 sm:h-4 w-14 sm:w-16" />
        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
      </div>

      {/* Progress bar skeleton */}
      <Skeleton className="h-2 w-full rounded-lg" />

      {/* Bottom text skeleton */}
      <div className="mt-3 flex justify-end">
        <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
      </div>
    </div>
  );
};

// Grid layout component for multiple skeletons
export const LaunchpadGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
      {Array(12)
        .fill(null)
        .map((_, index) => (
          <LaunchpadCardSkeleton key={`skeleton-${index}`} />
        ))}
    </div>
  );
};

export default LaunchpadCardSkeleton;
