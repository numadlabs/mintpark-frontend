import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetsActivitySkeleton from "./assets-activity-skeleton";

const AssetDetailSkeleton = () => {
  return (
    <div className="flex flex-col w-full gap-32">
      <div className="flex justify-between pt-16 relative z-50">
        {/* Left side - Image */}
        <div>
          <Skeleton className="w-[560px] h-[560px] rounded-xl" />
        </div>

        {/* Right side - Details */}
        <div className="flex flex-col gap-8">
          {/* Collection and Asset Name */}
          <div className="flex flex-col gap-2">
            <Skeleton className="w-40 h-6" /> {/* Collection name */}
            <Skeleton className="w-64 h-8" /> {/* Asset name */}
          </div>

          <div className="w-[592px] h-[1px] bg-neutral500" />

          {/* Price Section */}
          <div className="flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between w-full">
                <Skeleton className="w-24 h-6" /> {/* "List price" text */}
                <Skeleton className="w-32 h-6" /> {/* Price value */}
              </div>
            </div>

            {/* Buy Button */}
            <div className="flex gap-4">
              <Skeleton className="w-60 h-12 rounded-lg" />
            </div>
          </div>

          {/* Details Section - Simplified */}
          <div className="w-[592px] flex flex-col gap-6">
            <Skeleton className="w-32 h-8" /> {/* Section Title */}
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="w-24 h-5" />
                  <Skeleton className="w-32 h-5" />
                </div>
              ))}
            </div>
            {/* About Section */}
            <Skeleton className="w-40 h-8 mt-4" /> {/* About Title */}
            <Skeleton className="w-full h-20" /> {/* About Content */}
          </div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-white8" />

      {/* Activity Section */}
      <Tabs defaultValue="activity">
        <div className="flex flex-col gap-8">
          <TabsList className="border border-neutral400 p-1 rounded-xl h-12 w-fit">
            <TabsTrigger value="activity" className="px-5 rounded-lg border-0">
              Activity
            </TabsTrigger>
            <TabsTrigger value="more" className="px-5 rounded-lg border-0">
              More from collection
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="flex flex-col">
            {/* Activity Headers */}
            <div className="flex flex-row items-center px-3 pb-4 justify-between border-b border-neutral500">
              <p className="max-w-[360px] w-full text-neutral200 text-md font-medium">
                Item
              </p>
              <p className="max-w-[220px] w-full text-neutral200 text-md font-medium">
                Event
              </p>
              <p className="max-w-[200px] w-full text-neutral200 text-md font-medium">
                Price
              </p>
              <p className="max-w-[260px] w-full text-neutral200 text-md font-medium">
                Address
              </p>
              <p className="max-w-[152px] w-full text-neutral200 text-md font-medium">
                Date
              </p>
            </div>

            {/* Activity Cards Skeleton */}
            {/* <div className="flex flex-col gap-3 pt-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-row items-center justify-between p-3 bg-gray50 rounded-2xl"
                >
                  <div className="flex flex-row items-center gap-3 max-w-[360px] w-full">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                  <div className="max-w-[220px] w-full">
                    <Skeleton className="w-24 h-[34px] rounded-lg" />
                  </div>
                  <div className="max-w-[200px] w-full flex flex-col gap-1">
                    <Skeleton className="w-20 h-5" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <div className="max-w-[260px] w-full gap-2 flex flex-row items-center">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-24 h-5" />
                  </div>
                  <div className="max-w-[152px] w-full">
                    <Skeleton className="w-16 h-5" />
                  </div>
                </div>
              ))}
            </div> */}
            <AssetsActivitySkeleton/>
          </TabsContent>
          <TabsContent value="more" />
        </div>
      </Tabs>
    </div>
  );
};

export default AssetDetailSkeleton;
