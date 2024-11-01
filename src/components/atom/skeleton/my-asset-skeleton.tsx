import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const AssetsSkeleton = ({ detail = false }: { detail: boolean }) => {
  return (
    <Tabs defaultValue="All" className="mt-20 mb-10 border-hidden">
      <section className="flex justify-between mb-7">
        {detail ? (
          <section className="flex justify-between">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex ml-4">
              <Skeleton className="w-[800px] h-[48px] rounded-xl" />
            </div>
          </section>
        ) : (
          <div />
        )}
        <div className="flex justify-between text-center items-center w-[330px] h-[48px] gap-4">
          <Skeleton className="w-60 h-12 rounded-lg" />
          <Skeleton className="w-[92px] h-12 rounded-xl" />
        </div>
      </section>

      <TabsContent value="All">
        <div className="grid grid-cols-4 w-full gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="w-[280px] h-[394px] rounded-xl p-4 flex flex-col justify-between bg-neutral600 border border-neutral400"
            >
              <Skeleton className="w-[248px] h-[248px] rounded-xl" />
              <div className="pt-1">
                <Skeleton className="w-32 h-5 mt-2" /> {/* Collection name */}
                <Skeleton className="w-40 h-6 mt-1 mb-4" /> {/* Asset name */}
                <div className="border-t border-neutral400 pt-4">
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-5" /> {/* Price label */}
                    <Skeleton className="w-24 h-5" /> {/* Price value */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ColCard" className="w-full">
        <div className="flex h-[34px] pr-8 pb-4 pl-4">
          <div className="w-[392px] h-[18px]">
            <p className="font-medium text-md text-neutral200">Item</p>
          </div>
          <div className="grid grid-cols-4 w-full text-center">
            <div className="max-w-[200px] h-[18px]">
              <p className="font-medium text-md text-neutral200 pr-7">Price</p>
            </div>
            <div className="max-w-[200px] h-[18px]">
              <p className="font-medium text-md text-neutral200">
                Floor defference
              </p>
            </div>
            <div className="max-w-[200px] h-[18px]">
              <p className="font-medium text-md text-neutral200">Owner</p>
            </div>
            <div className="max-w-[200px] h-[18px]">
              <p className="font-medium text-md text-neutral200 pl-10">
                Listed time
              </p>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[754px] w-full border-t-2 border-neutral500">
          <div className="flex flex-col w-full pt-4 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center px-4 py-3 hover:bg-neutral500 rounded-xl"
              >
                <div className="flex items-center gap-4 w-[392px]">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="w-32 h-5" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
                <div className="grid grid-cols-4 w-full">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="w-20 h-5 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="w-28 h-5 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="w-16 h-5 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default AssetsSkeleton;
