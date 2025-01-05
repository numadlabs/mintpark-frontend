import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const LaunchDetailSkeleton = () => {
  return (
    <div className="min-h-screen w-full">
      <div className="3xl:px-[312px] pt-[56px] md:pt-0">
        <section className="flex flex-col justify-center h-full sm:h-full lg:h-[80vh] items-center lg:grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8 mb-8 px-4 sm:px-6 md:px-8">
          {/* Left Column - Collection Info */}
          <div className="flex w-full flex-col gap-8 sm:gap-6 order-2 lg:order-1">
            {/* Mobile Social Links */}
            <div className="block lg:hidden">
              <div className="flex gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
              <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4" /> {/* Title */}
              <Skeleton className="h-1 w-[120px]" /> {/* Brand line */}
              <div className="space-y-3"> {/* Description */}
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-5/6" />
                <Skeleton className="h-4 sm:h-5 w-4/6" />
              </div>
            </div>

            {/* Mobile Progress Section */}
            <div className="space-y-2 sm:space-y-3 block md2:hidden">
              <Skeleton className="h-2 sm:h-3 w-full rounded-lg" />
              <div className="flex justify-between items-center py-1">
                <Skeleton className="h-4 sm:h-5 w-24" />
                <Skeleton className="h-4 sm:h-5 w-32" />
              </div>
            </div>

            {/* Desktop Social Links */}
            <div className="hidden lg:block">
              <div className="flex gap-4 sm:gap-6 mt-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Image and Progress */}
          <div className="flex flex-col gap-4 sm:gap-6 w-full order-1 lg:order-2">
            <Skeleton className="w-full aspect-square rounded-2xl sm:rounded-3xl max-h-[384px]" />

            {/* Desktop Progress Section */}
            <div className="space-y-2 sm:space-y-3 hidden lg:block">
              <Skeleton className="h-2 sm:h-3 w-full rounded-lg" />
              <div className="flex justify-between items-center py-1">
                <Skeleton className="h-4 sm:h-5 w-24" />
                <Skeleton className="h-4 sm:h-5 w-32" />
              </div>
            </div>
          </div>

          {/* Right Column - Phases and Button */}
          <div className="flex flex-col gap-4 sm:gap-6 w-full lg:gap-8 order-3">
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <Skeleton 
                  key={i} 
                  className="h-32 w-full rounded-2xl sm:rounded-3xl" 
                />
              ))}
            </div>
            <Skeleton className="h-10 sm:h-12 w-full rounded-lg mt-4" /> {/* Button */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LaunchDetailSkeleton;