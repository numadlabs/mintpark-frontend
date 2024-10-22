import LaunchpadCard from "@/components/atom/cards/launchpadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";


export default function LaunchBanner({
  collections,
}: {
  collections: any;
}) {
  const router = useRouter();
  const handleNavigation = (collectionData: any) => {
    const queryParams = new URLSearchParams({
      id: collectionData.id,
    }).toString();
    router.push(`/launchpad/${collectionData.id}?${queryParams}`);
  };

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
                <LaunchpadCard key={item.id} collection={item} handleNavigation={() => handleNavigation(item)}/>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </>
  );
}



