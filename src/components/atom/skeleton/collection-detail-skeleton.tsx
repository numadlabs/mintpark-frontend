import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CollectionDetailSkeleton = () => {
  return (
    <Tabs defaultValue="AllCard" className="mt-[43.5px] mb-10 px-4 md:px-6 lg:px-12">
      <section>
        {/* Banner Section Skeleton */}
        <div className="w-full relative h-[320px] mt-10">
          <Skeleton className="relative h-[200px] w-full rounded-3xl overflow-hidden" />
          
          {/* Collection Info Skeleton */}
          <div className="flex flex-col lg:flex-row absolute top-24 w-full z-10 px-4 md:px-12 gap-6">
            <div className="flex justify-center lg:block">
              <Skeleton className="aspect-square rounded-xl w-40 lg:w-52" />
            </div>
            
            <div className="flex-1 lg:relative top-0 lg:top-7 space-y-4 lg:space-y-7">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 lg:h-9 w-48 lg:w-64 mx-auto lg:mx-0" />
                  <Skeleton className="h-6 lg:h-7 w-36 lg:w-48 mx-auto lg:mx-0" />
                </div>
                <div className="flex justify-center lg:justify-end gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Stats Grid - Desktop */}
              <div className="hidden lg:grid grid-cols-2 md:flex md:justify-around xl:grid-cols-4 gap-8 mt-4">
                {['Floor price', 'Total volume', 'Owners', 'Items'].map((_, i) => (
                  <div key={i} className="text-center md:text-left">
                    <Skeleton className="h-6 w-28 mb-2 mx-auto md:mx-0" />
                    <Skeleton className="h-8 w-32 mx-auto md:mx-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile */}
        <div className="lg:hidden grid grid-cols-2 md:flex md:justify-around gap-8 mt-32 px-4">
          {['Floor price', 'Total volume', 'Owners', 'Items'].map((_, i) => (
            <div key={i} className="text-center md:text-left">
              <Skeleton className="h-6 w-28 mb-2 mx-auto md:mx-0" />
              <Skeleton className="h-8 w-32 mx-auto md:mx-0" />
            </div>
          ))}
        </div>
        
        {/* Description Skeleton */}
        <div className="px-4 lg:px-12 mt-10">
          <Skeleton className="h-24 w-full max-w-3xl" />
        </div>

        {/* Search and Filter Section */}
        <section className="flex flex-col md:flex-row justify-between gap-4 mb-7 pt-12">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <Skeleton className="w-full h-12 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="w-60 h-12 rounded-lg" />
              <Skeleton className="w-24 h-12 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Grid Content Skeleton */}
        <TabsContent value="AllCard">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-6 sm:gap-6 lg:gap-8">
            {Array(12).fill(null).map((_, i) => (
              <div key={i} className="w-full rounded-xl overflow-hidden bg-neutral600 border border-neutral400">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <div className="pt-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* List View Skeleton */}
        <TabsContent value="ColCard">
          <div className="overflow-x-auto">
            <div className="min-w-[1216px]">
              <div className="flex border-b border-neutral400 px-3 pb-4">
                <Skeleton className="w-[520px] h-6" />
                <Skeleton className="w-[324px] h-6 ml-4" />
                <Skeleton className="w-[324px] h-6 ml-4" />
                <Skeleton className="w-[324px] h-6 ml-4" />
                <Skeleton className="w-[214px] h-6 ml-4" />
              </div>
              
              <div className="pt-4 space-y-4">
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-3">
                    <Skeleton className="w-[520px] h-20" />
                    <Skeleton className="w-[324px] h-20" />
                    <Skeleton className="w-[324px] h-20" />
                    <Skeleton className="w-[324px] h-20" />
                    <Skeleton className="w-[214px] h-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </section>
    </Tabs>
  );
};

export default CollectionDetailSkeleton;