"use client";
import React, { useState } from "react";
import ColumColCard from "@/components/atom/cards/ColumColCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import CollectionSideBar from "../../components/section/collections/sideBar";
import { useQuery } from "@tanstack/react-query";
import { getListedCollectionById, getListedCollections } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import CollectionCard from "@/components/atom/cards/collectionCard";
import { CollectionDataType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CollectionsProps {
  params: {};
  searchParams: {
    detail?: string;
  };
}

export default function Collections({ params, searchParams }: CollectionsProps) {
  const detail = searchParams.detail === "true";
  const router = useRouter();
  const { authState } = useAuth();
  const id = authState?.layerId;
  const tabs = ["1h", "24h", "7d", "30d", "All"];
  const [active, setActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");

  const { data: collection = [] } = useQuery({
    queryKey: ["collectionData"],
    queryFn: () => getListedCollections(id as string),
    enabled: !!id,
  });

  const handleNavigation = (collectionData: CollectionDataType) => {
    const queryParams = new URLSearchParams({
      id: collectionData.id,
      data: JSON.stringify(collectionData),
    }).toString();
    router.push(`/collections/${collectionData.id}?${queryParams}`);
  };

  const collectionArray = Array.isArray(collection) ? collection : [];

  return (
    <>
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mt-8 mb-10 border-hidden"
      >
        <section className="flex justify-between mb-7">
          {detail ? (
            <section className="flex justify-between ">
              <Image
                src={"/collections/sort.png"}
                alt="sort"
                width={20}
                height={20}
                className={`w-12 h-12 rounded-xl p-3 ${
                  !active
                    ? "bg-neutral500 hover:bg-neutral400 border-transparent"
                    : "bg-neutral600 border border-neutral500 hover:border-neutral400"
                }`}
                onClick={() => setActive(!active)}
              />
              <div className="flex">
                <Image
                  src={"/collections/search.png"}
                  alt="search"
                  width={20}
                  height={20}
                  className="w-[17.08px] h-[17.08px] relative left-8 top-4"
                />
                <input
                  type="email"
                  name="Search"
                  placeholder="Search ID"
                  className="w-[813px] h-[48px] rounded-xl pt-[14px] pr-[14px] pb-[14px] pl-10 bg-transparent border border-neutral400 text-neutral200"
                />
                <div />
              </div>
            </section>
          ) : (
            <div>
              <TabsList className="h-12 text-neutral50 p-1 border border-neutral400 rounded-xl gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="w-[59px] h-10 font-semibold text-[15px] rounded-lg border-hidden"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          )}
          <div className="flex justify-between text-center items-center w-[330px] h-[48px] gap-4">
            <Select>
              <SelectTrigger className="w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50 pt-2 pr-4 pb-2 pl-5">
                <SelectValue placeholder="Highest volume" />
              </SelectTrigger>
              <SelectContent
                className="w-[225px] h-40 rounded-xl text-center bg-neutral600 bg-opacity-[70%] text-neutral50 border-neutral400"
                style={{
                  backdropFilter: "blur(30px)",
                }}
              >
                <SelectItem value="highest" className="pl-10">
                  Highest volume
                </SelectItem>
                <SelectItem value="low" className="pl-10">
                  Lowest volume
                </SelectItem>
                <SelectItem value="highestFloor" className="pl-10">
                  Highest floor price
                </SelectItem>
                <SelectItem value="lowest" className="pl-10">
                  Lowest floor price
                </SelectItem>
              </SelectContent>
            </Select>
            <TabsList className="text-neutral50 border border-neutral400 rounded-xl w-[92px] h-12">
              <TabsTrigger
                value="All"
                className="w-10 h-10 font-semibold text-[15px] border-hidden rounded-lg p-[10px]"
              >
                <Image
                  src="/collections/hashtag.png"
                  alt="hashtag"
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
                  width={20}
                  height={20}
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </section>
        {detail && (
          <section
            className={`flex w-full ${active ? "gap-10" : "gap-0"} pt-7`}
          >
            <div
              className={`flex ${
                active ? " opacity-100 w-[280px]" : " opacity-0 w-0"
              } transition-all`}
            >
              <CollectionSideBar />
            </div>

            <TabsContent value="ColCard" className="w-full">
              <div className="flex h-[34px] pr-8 pb-4 pl-4">
                <div className="w-[392px] h-[18px]">
                  <p className="font-medium text-md text-neutral200">Item</p>
                </div>
                <div className="grid grid-cols-4 w-full text-center">
                  <div className="max-w-[200px] h-[18px]">
                    <p className="font-medium text-md text-neutral200 pr-7">
                      Price
                    </p>
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
            </TabsContent>
          </section>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {!detail && (
              <>
                <TabsContent value="All" className="grid grid-cols-4 gap-10">
                  {collectionArray?.map((item: any) => (
                    <div key={item.id}>
                      <CollectionCard
                        data={item}
                        handleNav={() => handleNavigation(item)}
                        totalOwnerCount={1}
                      />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="ColCard">
                  <div className="flex h-[34px] pr-8 pb-4 pl-4">
                    <div className="w-[376px] h-[18px]">
                      <p className="font-medium text-md text-neutral200">
                        Name
                      </p>
                    </div>
                    <div className="w-[468px] h-[18px] flex justify-around">
                      <p className="font-medium text-md text-neutral200">
                        Floor price
                      </p>
                      <p className="font-medium text-md text-neutral200">
                        Volume
                      </p>
                      <p className="font-medium text-md text-neutral200">
                        Market cap
                      </p>
                    </div>
                    <div className="w-[324px] h-[18px] flex justify-around">
                      <p className="font-medium text-md text-neutral200">
                        Sales
                      </p>
                      <p className="font-medium text-md text-neutral200">
                        Listed
                      </p>
                      <p className="font-medium text-md text-neutral200">
                        Owners
                      </p>
                    </div>
                  </div>
                  <ScrollArea className="h-[754px] border-t-2 border-neutral500">
                    <div className="grid grid-cols-1 pt-4 gap-4">
                      {collectionArray?.map((item: any) => (
                        <div key={item.id}>
                          <ColumColCard
                            data={item}
                            handleNav={() => handleNavigation(item)}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </>
  );
}