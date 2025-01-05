import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AssetsSkeleton = ({ detail = false }: { detail: boolean }) => {
  return (
    <Tabs defaultValue="All" className="mt-8 mb-6 md:mb-10 border-hidden px-4 md:px-0">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row gap-4 mb-4 md:mb-7">
        {detail && (
          <section className="flex flex-row justify-between w-full gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </section>
        )}

        {/* Sort and View Toggle */}
        <div className="flex flex-row justify-between text-center items-start w-full md:w-[330px] h-auto sm:h-[48px] gap-4">
          <Skeleton className="w-full md:w-60 h-12 rounded-lg" />
          <Skeleton className="w-[92px] h-12 rounded-xl" />
        </div>
      </section>

      {/* Grid View */}
      <TabsContent value="All">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
          {Array(12).fill(null).map((_, i) => (
            <div key={i} className="w-full rounded-xl p-4 flex flex-col justify-between bg-neutral600 border border-neutral400">
              <div className="relative w-full aspect-square">
                <Skeleton className="absolute inset-0 rounded-xl" />
              </div>
              <div className="pt-1">
                <Skeleton className="w-2/3 h-5 mt-2" />
                <Skeleton className="w-3/4 h-6 mt-1 mb-4" />
                <div className="border-t border-neutral400 pt-4">
                  <div className="flex justify-between">
                    <Skeleton className="w-1/3 h-5" />
                    <Skeleton className="w-1/2 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* List View */}
      <TabsContent value="ColCard" className="w-full">
        <div className="overflow-x-auto w-full">
          {/* Table Header */}
          <div className="w-full border-b border-neutral400 min-w-[1216px]">
            <div className="w-full flex h-[34px] pr-8 pb-4 pl-4 justify-between">
              <div className="w-[392px]">
                <Skeleton className="w-16 h-4" />
              </div>
              <div className="flex flex-row w-full justify-end gap-8">
                {['Price', 'Floor difference', 'Owner', 'Listed time'].map((_, i) => (
                  <div key={i} className="w-[200px]">
                    <Skeleton className="w-24 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex flex-col w-full pt-4 gap-4">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="flex items-center px-4 py-3 hover:bg-neutral500 rounded-xl min-w-[1216px]">
                <div className="flex items-center gap-4 w-[392px]">
                  <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="w-32 h-5" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
                <div className="flex flex-row w-full justify-end gap-8">
                  <div className="w-[200px] flex flex-col gap-1">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <div className="w-[200px] flex items-center">
                    <Skeleton className="w-20 h-5" />
                  </div>
                  <div className="w-[200px] flex items-center">
                    <Skeleton className="w-28 h-5" />
                  </div>
                  <div className="w-[200px] flex items-center">
                    <Skeleton className="w-16 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AssetsSkeleton;