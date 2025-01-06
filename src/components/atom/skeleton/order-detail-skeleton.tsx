import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const OrderDetailSkeleton = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto relative z-10 pt-8 flex flex-col gap-8">
      {/* Orders Table */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col min-w-[800px]">
          {/* Table Content */}
          <ScrollArea className="h-[700px] w-full">
            <div className="flex flex-col w-full gap-4">
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray50 rounded-2xl p-5 relative flex items-center hover:bg-white8 transition-all duration-200"
                  >
                    <div className="w-full flex flex-row items-center gap-14">
                      <div className="w-[160px]">
                        <Skeleton className="w-[140px] h-5" />
                      </div>
                      <div className="flex flex-row gap-4 items-center">
                        <div className="w-[160px]">
                          <Skeleton className="w-16 h-5" />
                        </div>
                        <div className="w-[160px]">
                          <Skeleton className="w-24 h-5" />
                        </div>
                        <div className="w-[160px]">
                          <Skeleton className="w-32 h-5" />
                        </div>
                      </div>
                      {/* Arrow Icon */}
                      <div className="absolute right-5">
                        <Skeleton className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailSkeleton;
