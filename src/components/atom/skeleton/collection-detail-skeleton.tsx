import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const CollectionDetailSkeleton = () => {
  return (
    <Tabs defaultValue="AllCard" className="mt-[43.5px] mb-10">
      <section>
        {/* Banner Section Skeleton */}
        <div className="w-full relative h-[320px] mt-10">
          <Skeleton className="relative h-[200px] w-full rounded-3xl overflow-hidden" />
          
          {/* Collection Info Skeleton */}
          <div className="flex absolute top-24 pl-12 pr-12 w-full z-50">
            <Skeleton className="w-[208px] h-[208px] rounded-xl" />
            
            <div className="w-full pl-6 pr-6 pt-4 pb-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-9 w-[200px]" />
                  <Skeleton className="h-7 w-[150px]" />
                </div>
                <div className="flex gap-6 pt-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-around relative right-14 top-9">
                {['Floor price', 'Total volume', 'Owners', 'Items'].map((_, i) => (
                  <div key={i} className={`${i !== 0 ? 'border-l border-l-neutral300 pl-7' : 'pl-1'}`}>
                    <Skeleton className="h-7 w-[100px] mb-2" />
                    <Skeleton className="h-8 w-[120px]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Description Skeleton */}
        <div className="pl-12 pr-12">
          <Skeleton className="h-6 w-3/4" />
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="flex justify-between mb-7 pt-10">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex gap-4 ml-4">
          <Skeleton className="w-[800px] h-12 rounded-xl" />
          <Skeleton className="w-60 h-12 rounded-lg" />
          <Skeleton className="w-[92px] h-12 rounded-lg" />
        </div>
      </section>

      {/* Grid Content Skeleton */}
      <TabsContent value="AllCard">
        <div className="grid grid-cols-4 gap-10">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="w-[280px] h-[394px] rounded-xl overflow-hidden">
              <Skeleton className="w-full h-[248px] rounded-xl" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="pt-8">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* List View Skeleton */}
      <TabsContent value="ColCard">
        <div className="space-y-4">
          <div className="flex h-[34px] pr-8 pb-4 pl-4">
            <Skeleton className="w-[392px] h-[18px]" />
            <div className="grid grid-cols-4 pl-5 w-full">
              {Array(4).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-[18px] w-[150px]" />
              ))}
            </div>
          </div>
          
          <div className="border-t-2 border-neutral500 pt-4">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="flex items-center p-4 gap-4">
                <Skeleton className="w-[80px] h-[80px] rounded-lg" />
                <Skeleton className="flex-1 h-16" />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CollectionDetailSkeleton;