import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CollectionSkeleton = () => {
  return (
    <div className="h-auto w-full sm:h-auto sm:w-full md:h-96 md:w-full md2:h-auto md2:w-full 3xl:w-72 3xl:h-[432px] 
                    backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent 
                    border border-neutral400 rounded-xl p-3 sm:p-4 
                    flex flex-col justify-between">
      <Skeleton className="w-full aspect-square rounded-xl" />
      
      <div className="pt-3 sm:pt-4 grid gap-3 sm:gap-4 w-full">
        <Skeleton className="h-6 sm:h-7 w-3/4" />
        
        <div className="grid grid-cols-2 w-full gap-2 sm:gap-4">
          <div className="text-start">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 sm:h-6 w-24" />
          </div>
          <div className="text-start">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 sm:h-6 w-24" />
          </div>
        </div>
        
        <div className="border-t hidden md:block border-neutral400 w-full my-1 sm:my-0" />
        
        <div className="hidden md:block">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 rounded-full mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 rounded-full mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionSkeleton;