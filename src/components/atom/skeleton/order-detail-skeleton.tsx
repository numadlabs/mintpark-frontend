import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

const OrderDetailSkeleton = () => {
  return (
    <ScrollArea className="h-[700px] w-full pb-8 border-t-2 border-neutral500">
      <div className="flex flex-col w-full pt-4 gap-4">
        {/* Generate 8 skeleton rows */}
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-gray50 rounded-2xl p-5 relative flex items-center"
          >
            <div className="grid grid-cols-4 w-full h-[18px]">
              <div className="pr-4">
                <Skeleton className="w-[140px] h-5" /> {/* Order ID */}
              </div>
              <div className="pl-1">
                <Skeleton className="w-16 h-5" /> {/* Quantity */}
              </div>
              <div className="pl-2">
                <Skeleton className="w-24 h-5" /> {/* Status */}
              </div>
              <div className="pl-3">
                <Skeleton className="w-32 h-5" /> {/* Date */}
              </div>
            </div>
            {/* Arrow Icon */}
            <div className="absolute right-5">
              <Skeleton className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default OrderDetailSkeleton;
