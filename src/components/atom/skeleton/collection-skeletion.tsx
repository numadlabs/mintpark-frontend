import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CollectionSkeleton = () => {
  return (
    <div className="backdrop-blur-sm bg-gradient-to-br collection from-gradientStart to-transparent border border-neutral400 rounded-xl pl-4 pr-4 pt-4 pb-5 flex flex-col justify-between">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="pt-4 grid gap-4 w-full">
        <Skeleton className="h-7 w-3/4" />
        
        <div className="flex justify-around w-full relative pl-2 right-6 gap-2">
          <div className="text-start">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="text-start">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        
        <div className="border border-neutral400 w-full" />
        
        <div className="flex flex-row gap-2 items-center justify-around relative right-[12px]">
          <div className="flex mt-2 items-center">
            <Skeleton className="w-4 h-4 rounded-full mr-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex mt-2 items-center">
            <Skeleton className="w-4 h-4 rounded-full mr-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionSkeleton;