import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import CollectibleCard from "../atom/cards/collectible-card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import CollectibleCardList from "../atom/cards/collectible-card-list";
import CollectionSideBar from "./collections/sideBar";
import { CollectionDetail } from "@/lib/validations/collection-validation";
import { useAuth } from "../provider/auth-context-provider";
import { Layer } from "@/lib/types/wallet";
// import { Layer } from "@/lib/types";

interface MoreCollectionProps {
  collection: CollectionDetail | null;
  currentAssetId?: string;
  assetLayer: Layer | null;
}

const MoreCollection: React.FC<MoreCollectionProps> = ({
  collection,
  currentAssetId,
  assetLayer,
}) => {
  console.log("collection more", collection);
  const [active, setActive] = useState(false);
  const { currentLayer, isConnected } = useAuth();
  const [searchFilter, setSearchFilter] = useState(""); // Add this state
  const [filteredCollection, setFilteredCollection] = useState(
    collection?.collectibles || [],
  );

  // Update the useEffect to include search filtering
  useEffect(() => {
    if (collection?.collectibles) {
      const filtered = collection.collectibles
        .filter((item) => item.id !== currentAssetId)
        .filter((item) => {
          if (!searchFilter) return true;
          return item.name?.toLowerCase().includes(searchFilter.toLowerCase());
        });
      setFilteredCollection(filtered);
    }
  }, [collection, currentAssetId, searchFilter]); // Add searchFilter to dependencies

  // Add search handler
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  return (
    <Tabs defaultValue="AllCard" className="">
      <section className="flex flex-col md:flex-row justify-between gap-4 mb-7">
        <div className="flex md:flex-row gap-4 w-full">
          <div className="relative w-full">
            <Image
              src="/collections/search.png"
              alt="search"
              draggable="false"
              width={20}
              height={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[17.08px] h-[17.08px]"
            />
            <input
              type="text"
              placeholder="Search Items"
              value={searchFilter} // Add value
              onChange={handleSearchChange}
              className="w-full h-12 rounded-xl pl-10 pr-4 bg-transparent border border-neutral400 text-neutral200"
            />
          </div>

          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="w-full hidden md:w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50">
                <SelectValue placeholder="Volume" />
              </SelectTrigger>
              <SelectContent className="w-full -top-[53px] lg:left-0 md:w-60 rounded-xl bg-neutral600 bg-opacity-70 border-neutral400 backdrop-blur-lg pb-2 px-2">
                <SelectItem value="highest">Highest volume</SelectItem>
                <SelectItem value="lowest">Lowest volume</SelectItem>
                <SelectItem value="highestFloor">
                  Highest floor price
                </SelectItem>
                <SelectItem value="lowestFloor">Lowest floor price</SelectItem>
              </SelectContent>
            </Select>

            <TabsList className="text-neutral50 border border-neutral400 rounded-lg w-[92px] h-12 px-1">
              <TabsTrigger
                value="AllCard"
                className="w-10 h-10 rounded-lg p-[10px] border border-transparent"
              >
                <Image
                  src="/collections/hashtag.png"
                  alt="grid"
                  width={20}
                  draggable="false"
                  height={20}
                />
              </TabsTrigger>
              <TabsTrigger
                value="ColCard"
                className="w-10 h-10 rounded-lg p-[10px] border border-transparent"
              >
                <Image
                  src="/collections/burger.png"
                  alt="list"
                  width={20}
                  draggable="false"
                  height={20}
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </section>

      <section className={`flex w-full pt-7 ${active ? "gap-10" : "gap-0"}`}>
        <div
          className={`${active ? "block w-[280px]" : "hidden"} transition-all`}
        >
          {/* <CollectionSideBar /> */}
        </div>

        <div
          className={`flex w-full overflow-x-auto 3xl:overflow-x-hidden ${
            active ? "w-[calc(100%-380px)]" : "sm:w-full"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="AllCard">
                <div
                  className={`grid gap-4 md:gap-6 lg:gap-8 ${
                    active
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"
                  }`}
                >
                  {filteredCollection.map((item) => (
                    <div key={item.id}>
                      <CollectibleCard
                        data={item}
                        collectibleLayer={assetLayer}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ColCard" className="w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[1216px] w-full flex border-b justify-between border-neutral400 font-medium text-md text-neutral200 px-3 pb-4">
                    <div className="min-w-[392px] w-full max-w-[520px] text-start">
                      Item
                    </div>
                    <div className="flex items-center w-full">
                      <div className="min-w-[200px] w-full max-w-[324px] text-start">
                        Price
                      </div>
                      <div className="min-w-[200px] w-full max-w-[324px] text-start">
                        Floor difference
                      </div>
                      <div className="min-w-[200px] w-full max-w-[324px] text-start">
                        Owner
                      </div>
                      <div className="min-w-[200px] w-full max-w-[324px] text-start">
                        Listed time
                      </div>
                    </div>
                  </div>

                  <ScrollArea>
                    <div className="h-[754px] w-full min-w-[1216px] border-t-2 border-neutral500">
                      <div className="flex flex-col pt-4 gap-4">
                        {filteredCollection.map((item) => (
                          <div key={item.id}>
                            <CollectibleCardList
                              data={item}
                              isConnected={isConnected}
                              currentLayer={currentLayer}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </Tabs>
  );
};

export default MoreCollection;
