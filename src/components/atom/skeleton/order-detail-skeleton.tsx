import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const OrderDetailSkeleton = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto relative z-10 pt-8 flex flex-col gap-8">
      {/* Search and Refresh Section */}
      <div className="flex flex-row w-full gap-4">
        <div className="flex-1 relative">
          <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
        <Skeleton className="flex-shrink-0 h-12 w-12 rounded-xl" />
      </div>

      {/* Orders Table */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col min-w-[800px]">
          {/* Table Headers */}
          <div className="flex flex-row gap-14 items-center w-full border-b border-neutral500 pl-5 pb-4">
            <p className="w-[160px] font-medium text-md text-neutral200">Order ID</p>
            <div className="flex flex-row gap-4 items-center">
              <p className="w-[160px] font-medium text-md text-neutral200">Quantity</p>
              <p className="w-[160px] font-medium text-md text-neutral200">Status</p>
              <p className="w-[160px] font-medium text-md text-neutral200">Date</p>
            </div>
          </div>

          {/* Table Content */}
          <ScrollArea className="h-[700px] w-full pb-8 border-t-2 border-neutral500">
            <div className="flex flex-col w-full pt-4 gap-4">
              {Array(8).fill(null).map((_, index) => (
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