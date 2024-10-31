import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const CollectionDetailSkeleton = () => {
  return (
    <Tabs defaultValue="AllCard" className="mt-[43.5px] mb-10">
      <section>
        {/* Banner Section Skeleton */}
        <div className="w-full relative h-[320px] mt-10">
          <div className="relative h-[200px] w-full rounded-3xl overflow-hidden">
            <Skeleton className="absolute inset-0" />
            <div className="h-[190px]" />
          </div>

          {/* Collection Info Skeleton */}
          <div className="flex absolute top-24 pl-12 pr-12 w-full z-50">
            <Skeleton className="w-[208px] h-[208px] rounded-xl" />
            
            <div className="w-full pl-6 pr-6 pt-4 pb-4">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="w-[300px] h-9 mb-2" />
                  <Skeleton className="w-[200px] h-6" />
                </div>
                <div className="flex gap-6 pt-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-10 h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-around relative right-14 top-9">
                {['Floor price', 'Total volume', 'Owners', 'Items'].map((_, i) => (
                  <div key={i} className={`${i !== 0 ? 'border-l border-l-neutral300 pl-7' : 'pl-1'}`}>
                    <Skeleton className="w-32 h-6 mb-2" />
                    <div className="flex mt-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="w-24 h-6 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pl-12 pr-12 mt-8">
          <Skeleton className="w-full h-24" />
        </div>
      </section>

      {/* List View Skeleton */}
      <TabsContent value="ColCard" className="w-full mt-16">
        <div className="flex h-[34px] pr-8 pb-4 pl-4">
          <div className="w-[392px] h-[18px]">
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="grid grid-cols-4 pl-5 w-full text-center">
            {['Price', 'Floor difference', 'Owner', 'Listed time'].map((_, i) => (
              <div key={i} className="max-w-[200px] h-[18px]">
                <Skeleton className="w-24 h-4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-[754px] w-full border-t-2 border-neutral500 mt-12">
          <div className="flex flex-col w-full pt-4 gap-4">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="flex w-full justify-between items-center gap-24 bg-neutral500 bg-opacity-50 rounded-2xl p-4">
                <div className="flex w-[392px] h-16 gap-5">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <Skeleton className="w-48 h-6 my-auto" />
                </div>
                <div className="flex justify-end items-center w-full text-start gap-8">
                  <Skeleton className="w-32 h-8" />
                  <Skeleton className="w-32 h-8" />
                  <Skeleton className="w-32 h-8" />
                  <Skeleton className="w-32 h-8" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Grid View Skeleton */}
      <TabsContent value="AllCard">
        <div className="grid grid-cols-4 gap-10 mt-12">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl p-4">
              <Skeleton className="w-full aspect-square rounded-xl mb-4" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CollectionDetailSkeleton;