import LaunchpadCard from "@/components/atom/cards/launchpadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { launchpad } from "@/lib/constants";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { CollectionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
// import { CollectionType } from "@/lib/service/fetcher";
// import { Toggle } from "@/components/ui/toggle";

// import launchpadCard from '@/components/atom/cards/launchpadCard'

export default function LaunchBanner({
  collections,
}: {
  collections: any;
}) {
  const { data: launchs = [] } = useQuery({
    queryKey: ["launchData"],
    queryFn: () => fetchLaunchs(),
  });
  return (
    <>
      {/* <launchpadCard/> */}
      <Tabs defaultValue="all" className="text-neutral50 mt-20">
        <TabsList className="mb-8 font-semibold text-[15px] border border-neutral400 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="w-[59px] font-semibold text-[15px] border-hidden rounded-lg"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="w-[159px] font-semibold text-[15px] border-hidden rounded-lg"
          >
            Live & Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="w-[73px] font-semibold text-[15px] border-hidden rounded-lg"
          >
            Past
          </TabsTrigger>
        </TabsList>

        {/* <LaunchpadCard collection={launchs} /> */}
        <TabsContent value="all" className="grid grid-cols-4 gap-10">
          {collections.map((item:any) => {
            return (
              <div key={item.id}>
                <LaunchpadCard key={item.id} collection={item} />
              </div>
            );
          })}
          {collections?.map((collection:any) => (
            <div key={collection.id}>
              <LaunchpadCard key={collection.id} collection={collection} />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="live" className="grid grid-cols-4 gap-10">
          {collections.map((item:any) => {
            return (
              <>
                {item.type === "live" && (
                  <div key={item.id}>
                    <LaunchpadCard collection={item} />
                  </div>
                )}
              </>
            );
          })}
        </TabsContent>
        <TabsContent value="past" className="grid grid-cols-4 gap-10">
          {collections.map((item:any) => {
            return (
              <>
                {item.type === "ended" && (
                  <div key={item.id}>
                    <LaunchpadCard collection={item} />{" "}
                  </div>
                )}
              </>
            );
          })}
        </TabsContent>
      </Tabs>
    </>
  );
}

