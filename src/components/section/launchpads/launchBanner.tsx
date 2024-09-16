import LaunchpadCard from "@/components/atom/cards/launchpadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { launchpad } from "@/lib/constants";
import { CollectionType } from "@/lib/service/fetcher";
// import { Toggle } from "@/components/ui/toggle";

// import launchpadCard from '@/components/atom/cards/launchpadCard'
export default function LaunchBanner({
  collections,
}: {
  collections: CollectionType[];
}) {
  return (
    <>
      {/* <launchpadCard/> */}
      <Tabs defaultValue="all" className="text-neutral50 mt-20">
        <TabsList className="mb-8 font-semibold text-[15px] border border-neutral400 rounded-xl">
          <TabsTrigger
            value="all"
            className="w-[59px] font-semibold text-[15px] rounded-lg"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="w-[159px] font-semibold text-[15px] rounded-lg"
          >
            Live & Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="w-[73px] font-semibold text-[15px] rounded-lg"
          >
            Past
          </TabsTrigger>
        </TabsList>

        {/* <LaunchpadCard data={launchpad} /> */}
        <TabsContent value="all" className="grid grid-cols-4 gap-10">
          {/* {launchpad.map((item) => {
            return (
              <div key={item.id}>
                <LaunchpadCard key={item.id} data={item} />
              </div>
            );
          })} */}
          {collections?.map((collection) => (
            <div key={collection.id}>
              <LaunchpadCard key={collection.id} collection={collection} />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="live" className="grid grid-cols-4 gap-10">
          {launchpad.map((item) => {
            return (
              <>
                {item.type === "live" && (
                  <div key={item.id}>
                    <LaunchpadCard key={item.id} data={item} />
                  </div>
                )}
              </>
            );
          })}
        </TabsContent>
        <TabsContent value="past" className="grid grid-cols-4 gap-10">
          {launchpad.map((item) => {
            return (
              <>
                {item.type === "ended" && (
                  <div key={item.id}>
                    <LaunchpadCard key={item.id} data={item} />{" "}
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
