import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AssetDetailSkeleton = () => {
  return (
    <div className="flex flex-col w-full gap-8 p-4 md:p-8 lg:p-10">
      {/* Main content section */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image skeleton */}
        <div className="w-full aspect-square relative">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Details section */}
        <div className="flex flex-col gap-6">
          {/* Collection and Asset Name */}
          <div className="flex flex-col gap-3">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-48 h-8" />
          </div>

          <div className="w-full h-[1px] bg-neutral500 my-2" />

          {/* Price Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <Skeleton className="w-20 h-6" />
              <Skeleton className="w-28 h-6" />
            </div>
            <Skeleton className="w-40 h-12 rounded-lg" />
          </div>

          {/* Accordion sections */}
          <div className="flex flex-col gap-6 mt-4">
            {/* Details section */}
            <div className="space-y-4">
              <Skeleton className="w-24 h-7" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between py-2">
                  <Skeleton className="w-24 h-5" />
                  <Skeleton className="w-32 h-5" />
                </div>
              ))}
            </div>

            {/* About section */}
            <div className="space-y-4">
              <Skeleton className="w-32 h-7" />
              <Skeleton className="w-full h-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-neutral500" />

      {/* Activity Section */}
      <Tabs defaultValue="activity" className="w-full">
        <div className="flex flex-col gap-6">
          <TabsList className="border border-neutral400 p-1 rounded-xl h-12 w-fit">
            <TabsTrigger value="activity" className="px-5 rounded-lg border-0">
              Activity
            </TabsTrigger>
            <TabsTrigger value="more" className="px-5 rounded-lg border-0">
              More
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[768px] lg:min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 pb-4 border-b border-neutral500 px-3">
                  {["Item", "Event", "Price", "Address", "Date"].map(
                    (header) => (
                      <div
                        key={header}
                        className="text-neutral200 text-sm font-medium"
                      >
                        {header}
                      </div>
                    )
                  )}
                </div>

                {/* Activity Items */}
                <div className="space-y-3 pt-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 gap-4 p-3 bg-neutral900 rounded-xl items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                        <Skeleton className="w-24 h-5" />
                      </div>
                      <Skeleton className="w-20 h-8 rounded-lg" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="w-16 h-5" />
                        <Skeleton className="w-12 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-20 h-5" />
                      </div>
                      <Skeleton className="w-16 h-5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="more" />
        </div>
      </Tabs>
    </div>
  );
};

export default AssetDetailSkeleton;
