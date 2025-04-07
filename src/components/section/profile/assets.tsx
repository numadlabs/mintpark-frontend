"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useState, useEffect } from "react";
import AssetsCard from "@/components/atom/cards/assets-card";
import AssetsCardList from "@/components/atom/cards/assets-card-list";
import AssetsSkeleton from "@/components/atom/skeleton/my-asset-skeleton";
import { CollectibleSchema } from "@/lib/validations/asset-validation";
import { SearchNormal } from "iconsax-react";
import AssetsSideBar from "../collections/my-assets-sidebar";
import { useAssetsContext } from "@/lib/hooks/useAssetContext";
import { useParams } from "next/navigation";

export default function Assets({ detail = false }: { detail: boolean }) {
  const params = useParams();
  const userId = params?.id as string;
  const [active, setActive] = useState(true);

  // Get shared state and data from context
  const {
    assetsData,
    isLoading,
    refetch,
    filters: {
      orderBy,
      setOrderBy,
      orderDirection,
      setOrderDirection,
      selectedCollectionIds,
      setSelectedCollectionIds,
      availability,
      setAvailability,
      searchQuery,
      setSearchQuery,
    },
  } = useAssetsContext();

  // Search filtering only (API handles all other filters)
  const getCollectibles = () => {
    if (!assetsData?.data?.collectibles) return [];

    const collectibles = assetsData.data.collectibles;

    // Only apply search filter on the client side
    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().trim();
      return collectibles.filter((item: CollectibleSchema) => {
        const searchableFields = [
          item.name,
          item.collectionName,
          item.uniqueIdx,
        ].filter(Boolean);

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchTerms)
        );
      });
    }

    return collectibles;
  };

  const handleOrderChange = (value: string) => {
    switch (value) {
      case "recent":
        setOrderBy("recent");
        setOrderDirection("desc");
        break;
      case "price_high_to_low":
        setOrderBy("price");
        setOrderDirection("desc");
        break;
      case "price_low_to_high":
        setOrderBy("price");
        setOrderDirection("asc");
        break;
      default:
        setOrderBy("price_low_to_high");
        // setOrderBy("price");
        setOrderDirection("desc");
    }
    // Refetch after sorting changes
    refetch();
  };

  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
    // Trigger refetch when availability changes
    refetch();
  };

  const handleCollectionsChange = (collections: string[]) => {
    setSelectedCollectionIds(collections);
    // Trigger refetch after collection IDs change
    refetch();
  };

  const toggleSideBar = () => {
    setActive(!active);
  };

  // Show loading state
  if (isLoading) {
    return <AssetsSkeleton detail={detail} />;
  }

  // // Show empty state
  // if (
  //   !assetsData?.data?.collectibles ||
  //   assetsData.data.collectibles.length === 0
  // ) {
  //   return (
  //     <div className="flex justify-center items-center mt-8 rounded-3xl w-full bg-neutral500 bg-opacity-[50%] h-[430px]">
  //       <p className="text-neutral200 font-medium text-lg">
  //         No activity recorded
  //       </p>
  //     </div>
  //   );
  // }

  

  // Get filtered collectibles using the simplified function
  const collectibles = getCollectibles();

  return (
    <>
      <Tabs
        defaultValue="All"
        className="mt-8 mb-6 md:mb-10 border-hidden px-4 md:px-0"
      >
        <section className="flex flex-col md:flex-row gap-4 mb-4 md:mb-7">
          {detail ? (
            <section className="flex flex-row justify-between w-full gap-4">
              <Image
                src={"/collections/sort.png"}
                alt="burger"
                draggable="false"
                width={20}
                height={20}
                onClick={toggleSideBar}
                className={`w-12 h-12 rounded-xl hidden lg:block sm:hidden p-3 ${
                  active
                    ? "bg-neutral500 hover:bg-neutral400 border-transparent"
                    : "bg-neutral600 border border-neutral500 hover:border-neutral400"
                }`}
              />
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchNormal size={20} color="#D7D8D8" />
                </div>
                <input
                  type="text"
                  placeholder="Search Items"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 rounded-xl pl-10 pr-4 bg-transparent border border-neutral400 text-neutral200"
                />
              </div>
            </section>
          ) : null}

          <div className="flex flex-row justify-between text-center items-start w-full md:w-[330px] h-auto sm:h-[48px] gap-4">
            <Select defaultValue={orderBy} onValueChange={handleOrderChange}>
              <SelectTrigger className="w-full md:w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50 pt-2 pr-4 pb-2 pl-5">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                className="w-full md:w-[225px] h-40 rounded-xl text-center bg-neutral600 bg-opacity-[70%] text-neutral50 border-neutral400"
                style={{
                  backdropFilter: "blur(30px)",
                }}
              >
                <SelectItem value="price_low_to_high" className="pl-10">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price_high_to_low" className="pl-10">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="recent" className="pl-10">
                  Recently listed
                </SelectItem>
              </SelectContent>
            </Select>
            <TabsList className="text-neutral50 border border-neutral400 rounded-xl w-[92px] sm:w-[92px] h-12">
              <TabsTrigger
                value="All"
                className="w-10 h-10 font-semibold text-[15px] border-hidden rounded-lg p-[10px]"
              >
                <Image
                  src="/collections/hashtag.png"
                  alt="hashtag"
                  draggable="false"
                  width={20}
                  height={20}
                />
              </TabsTrigger>
              <TabsTrigger
                value="ColCard"
                className="w-10 h-10 font-semibold text-[15px] border-hidden rounded-lg p-[10px]"
              >
                <Image
                  src="/collections/burger.png"
                  alt="burger"
                  draggable="false"
                  width={20}
                  height={20}
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </section>

        {detail && (
          <section
            className={`flex w-full ${
              active ? "gap-4 md:gap-10" : "gap-0"
            } pt-4 md:pt-7`}
          >
            <div
              className={`flex ${
                active
                  ? "opacity-100 w-full md:w-[280px] hidden lg:block sm:hidden"
                  : "opacity-0 w-0"
              } transition-all`}
            >
              {active && (
                <AssetsSideBar
                  onAvailabilityChange={handleAvailabilityChange}
                  onCollectionsChange={handleCollectionsChange}
                  selectedCollections={selectedCollectionIds}
                />
              )}
            </div>

            <TabsContent value="All">
              <div
                className={`grid w-full gap-4 sm:gap-6 ${
                  active
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6"
                }`}
              >
                {collectibles.map((item: CollectibleSchema) => (
                  <div key={item.id}>
                    <AssetsCard data={item} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ColCard" className="w-full">
              <div className="overflow-x-auto w-full">
                <div className="w-full border-b border-neutral400 min-w-[1216px]">
                  <div className="w-full border-b border-neutral400 flex h-[34px] pr-4 pb-4 pl-4 justify-between">
                    <div className="min-w-[392px] w-full max-w-[640px] h-[18px]">
                      <p className="font-medium text-md text-neutral200">
                        Item
                      </p>
                    </div>
                    <div className="flex flex-row w-full text-start gap-0 justify-end">
                      <div className="min-w-[200px] w-full max-w-[392px] h-[18px]">
                        <p className="font-medium text-md text-neutral200 pr-7 w-full">
                          Price
                        </p>
                      </div>
                      <div className="min-w-[200px] w-full max-w-[392px] h-[18px]">
                        <p className="font-medium text-md text-neutral200 w-full">
                          Floor difference
                        </p>
                      </div>
                      <div className="min-w-[200px] w-full max-w-[392px] h-[18px]">
                        <p className="font-medium text-md text-neutral200 w-full">
                          Owner
                        </p>
                      </div>
                      <div className="min-w-[200px] w-full max-w-[392px] h-[18px]">
                        <p className="font-medium text-md text-neutral200 w-full">
                          Listed time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full pt-4 gap-4">
                  {collectibles.map((item: CollectibleSchema) => (
                    <div key={item.id}>
                      <AssetsCardList data={item} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </section>
        )}
      </Tabs>
    </>
  );
}
