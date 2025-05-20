"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Global, Notepad, Profile2User } from "iconsax-react";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import CollectibleCard from "@/components/atom/cards/collectible-card";
import CollectibleCardList from "@/components/atom/cards/collectible-card-list";
import {
  getById,
  getCollectionActivity,
  getCollectionById,
  getLayerById,
  getListedCollectionById,
} from "@/lib/service/queryHelper";
import { s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CollectionSideBar from "@/components/section/collections/sideBar";
import {
  getCollectibleExplorerUrl,
  getCurrencyIcon,
  getCurrencySymbol,
} from "@/lib/service/currencyHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import Link from "next/link";
import CollectionActivityCard from "@/components/atom/cards/collection-activity-card";
import { Collectible } from "@/lib/validations/collection-validation";

const ITEMS_PER_PAGE = 10;
const ACTIVITY_PER_PAGE = 20;

const queryClient = new QueryClient();

const CollectionDetailPageWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CollectionDetailPage />
    </QueryClientProvider>
  );
};

const CollectionDetailPage = () => {
  const { authState } = useAuth();
  const params = useParams();
  const id = params?.id as string;
  const [active, setActive] = useState(true);
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [traitValuesByType, setTraitValuesByType] = useState<
    Record<string, string[]> | string
  >({});
  const [selectedTraits, setSelectedTraits] = useState<
    Record<string, string[]>
  >({});
  // const [showOnlyListed, setShowOnlyListed] = useState(false);

  const [isListed, setIsListed] = useState(false);

  // Activity pagination state
  const [activityPageSize] = useState(ACTIVITY_PER_PAGE);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "collectionData",
      id,
      orderBy,
      orderDirection,
      isListed,
      traitValuesByType,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!id) {
        throw new Error("Collection ID is required");
      }
      const limit = ITEMS_PER_PAGE;
      const offset = (pageParam - 1) * ITEMS_PER_PAGE;
      const query = (pageParam - 1) * ITEMS_PER_PAGE;

      const response = await getListedCollectionById(
        id,
        orderBy,
        orderDirection,
        limit,
        offset,
        searchFilter,
        isListed,
        JSON.stringify(traitValuesByType) // Stringify only here if required
      );
      return {
        collectibles: response?.collectibles ?? [],
        hasMore: response?.hasMore ?? false,
        totalCount: response?.listedCollectibleCount ?? 0,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: Boolean(id),
  });

  // Activity infinite query
  const {
    data: activityData,
    fetchNextPage: fetchNextActivity,
    isFetchingNextPage: isFetchingNextActivity,
    hasNextPage: hasNextActivityPage,
  } = useInfiniteQuery({
    queryKey: ["activityData", id, activityPageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!id) {
        throw new Error("Collection ID is required");
      }
      const response = await getCollectionActivity(
        id,
        activityPageSize,
        pageParam * activityPageSize
      );

      // Determine if we have more activities to load
      const hasMore = response.length === activityPageSize;
      setHasMoreActivity(hasMore);

      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return hasMoreActivity ? allPages.length : undefined;
    },
    enabled: Boolean(id),
  });

  const { data: collectible, isLoading: isCollectionLoading } = useQuery<
    Collectible[] | null
  >({
    queryKey: ["collectionData", id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collectionData"],
    queryFn: () => getById(id as string),
    enabled: !!id,
  });

  // Memoize the collectibles array
  const collectibles = React.useMemo(() => {
    return data?.pages?.flatMap((page) => page?.collectibles ?? []) ?? [];
  }, [data?.pages]);

  // Memoize all activities from all pages
  const allActivities = React.useMemo(() => {
    return activityData?.pages?.flat() ?? [];
  }, [activityData?.pages]);

  // Memoize the filtered collectibles using the memoized collectibles array
  const filteredCollectibles = React.useMemo(() => {
    let filtered = collectibles;

    // Filter by availability - check listId instead of isListed
    if (isListed) {
      filtered = filtered.filter((item) => item.listId !== null);
    }

    // Filter by search
    if (searchFilter) {
      filtered = filtered.filter((item) => {
        const itemId = item.name.toString();
        const searchValue = searchFilter.toLowerCase();

        return itemId.includes(searchValue);
      });
    }

    return filtered;
  }, [collectibles, isListed, searchFilter]);

  const loadMoreRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "200px",
          threshold: 0.1,
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Activity infinite scroll observer
  const loadMoreActivityRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMoreActivity &&
            !isFetchingNextActivity
          ) {
            fetchNextActivity();
          }
        },
        {
          rootMargin: "200px",
          threshold: 0.1,
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMoreActivity, isFetchingNextActivity, fetchNextActivity]
  );

  const links = [
    {
      url: collection?.websiteUrl,
      isIcon: true,
      icon: <Global size={34} className="hover:text-brand text-neutral00" />,
    },
    {
      url: collection?.discordUrl,
      isIcon: false,
      icon: (
        <DiscordIcon size={34} className="hover:text-brand  text-neutral00" />
      ),
    },
    {
      url: collection?.twitterUrl,
      isIcon: false,
      icon: (
        <ThreadIcon size={34} className="hover:text-brand  text-neutral00" />
      ),
    },
  ].filter((link) => link.url);

  const handleSocialClick = (url: string | undefined) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(validUrl, "_blank", "noopener,noreferrer");
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
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const handleTraitsChange = (traits: Record<string, string[]>) => {
    setTraitValuesByType(traits);
  };

  const toggleSideBar = () => {
    setActive(!active);
  };

  const handleAvailabilityChange = (onlyListed: boolean) => {
    setIsListed(onlyListed);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          Error loading collection:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <>
      <section>
        {/* Banner Section */}
        <div className="w-full relative h-[320px] mt-10">
          <div className="relative h-[200px] w-full rounded-3xl overflow-hidden">
            <div
              className="absolute z-0 inset-0"
              style={{
                backgroundImage: collection?.logoKey
                  ? `url(${s3ImageUrlBuilder(collection.logoKey)})`
                  : "url(/path/to/fallback/image.png)",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-0 bg-neutral600 bg-opacity-[70%] z-0 backdrop-blur-3xl" />
          </div>

          {/* Collection Info */}
          <div className="flex flex-col lg:flex-row absolute top-24 w-full z-10 px-4 md:px-12 gap-6">
            <div className="flex justify-center lg:block">
              <Image
                width={208}
                height={208}
                draggable="false"
                src={
                  collection?.logoKey
                    ? s3ImageUrlBuilder(collection.logoKey)
                    : "/path/to/fallback/image.png"
                }
                className="aspect-square rounded-xl w-40 lg:w-52"
                alt="collection logo"
                priority
                quality={100}
                sizes="100%"
              />
            </div>
            <div className="flex-1 lg:relative top-0 lg:top-7 space-y-4 lg:space-y-7">
              <div className="flex flex-col items-center lg:flex-row justify-between gap-4">
                <div className="">
                  <h3 className="text-2xl lg:text-3xl font-bold text-neutral50 text-center md:text-left">
                    {collection?.name}
                  </h3>
                  <h2 className="text-lg lg:text-lg font-medium text-neutral100 text-center md:text-left">
                    by {collection?.creatorName}
                  </h2>
                </div>
                <div className="flex gap-6">
                  <div className="">
                    {links.length > 0 && (
                      <div className="flex justify-center items-center gap-6">
                        {links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => handleSocialClick(link.url)}
                            className="border border-transparent bg-transparent"
                          >
                            {link.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="">
                    <Link
                      href={getCollectibleExplorerUrl(
                        currentLayer?.layer,
                        collection?.contractAddress
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/collections/etherScan.png"
                        alt="etherScan"
                        width={34}
                        height={34}
                      />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stats Section - Desktop */}
              <div className="lg:pt-0 hidden  lg:block">
                <div className="grid grid-cols-2  md:flex md:justify-around xl:grid-cols-4 lg:grid w-full gap-8 md:gap-8 lg:gap-8 mt-4">
                  <div className="text-center md:text-left">
                    <h2 className="font-medium text-lg text-neutral100">
                      Floor price
                    </h2>
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      <Image
                        width={24}
                        height={20}
                        draggable="false"
                        src={getCurrencyIcon(currentLayer.layer)}
                        alt="bitcoin"
                        className="aspect-square"
                      />
                      <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                        <span>
                          {collection?.floor
                            ? formatPrice(collection.floor)
                            : "-"}
                        </span>{" "}
                        {getCurrencySymbol(currentLayer.layer)}
                      </p>
                    </div>
                  </div>

                  <div className="text-center md:text-left 2xl:border-l 2xl:border-neutral400 2xl:px-8 px-0 border-0">
                    <h2 className="font-medium text-lg text-neutral100">
                      Total volume
                    </h2>
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      <Image
                        width={24}
                        draggable="false"
                        height={20}
                        src={getCurrencyIcon(currentLayer.layer)}
                        alt="bitcoin"
                        className="aspect-square"
                      />
                      <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                        <span>
                          {collection?.volume
                            ? formatPrice(collection?.volume)
                            : "-"}
                        </span>{" "}
                        {getCurrencySymbol(currentLayer.layer)}
                      </p>
                    </div>
                  </div>

                  <div className="text-center md:text-left 2xl:border-l 2xl:border-neutral400 2xl:px-8 px-0 border-0">
                    <h2 className="font-medium text-lg text-neutral100">
                      Owners
                    </h2>
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      <Profile2User color="#d3f85a" />
                      <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                        <span>{collection?.ownerCount ?? 0}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-center md:text-left 2xl:border-l 2xl:border-neutral400 2xl:px-8 px-0 border-0">
                    <h2 className="font-medium text-lg text-neutral100">
                      Items
                    </h2>
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      <Notepad color="#d3f85a" />
                      <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                        <span>{collection?.supply}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Mobile */}
        <div className="px-0 lg:px-12 text-lg font-normal text-neutral100 mt-10 lg:mt-14 xl:mt-6">
          <div className="lg:pt-0 block lg:hidden">
            <div className="grid grid-cols-2 pt-[56px] md:flex md:justify-around xl:grid-cols-4 lg:grid w-full gap-8 md:gap-8 lg:gap-8">
              <div className="text-center md:text-left">
                <h2 className="font-medium text-lg text-neutral100">
                  Floor price
                </h2>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <Image
                    width={24}
                    draggable="false"
                    height={20}
                    src={getCurrencyIcon(currentLayer.layer)}
                    alt="bitcoin"
                    className="aspect-square"
                  />
                  <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                    <span>
                      {collection?.floor ? formatPrice(collection.floor) : "-"}
                    </span>{" "}
                    {getCurrencySymbol(currentLayer.layer)}
                  </p>
                </div>
              </div>

              <div className="text-center md:text-left 2xl:border-l 2xl:border-neutral400 2xl:px-8 px-0 border-0">
                <h2 className="font-medium text-lg text-neutral100">
                  Total volume
                </h2>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <Image
                    width={24}
                    height={20}
                    draggable="false"
                    src={getCurrencyIcon(currentLayer.layer)}
                    alt="bitcoin"
                    className="aspect-square"
                  />
                  <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                    <span>
                      {collection?.volume
                        ? formatPrice(collection?.volume)
                        : "-"}
                    </span>{" "}
                    {getCurrencySymbol(currentLayer.layer)}
                  </p>
                </div>
              </div>

              <div className="text-center md:text-left 2xl:border-l 2xl:border-neutral400 2xl:px-8 px-0 border-0">
                <h2 className="font-medium text-lg text-neutral100">Owners</h2>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <Profile2User color="#d3f85a" />
                  <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                    <span>{collection?.ownerCount ?? 0}</span>
                  </p>
                </div>
              </div>

              <div className="text-center md:text-left 2xl:border-l 2xl:border-neutral400 2xl:px-8 px-0 border-0">
                <h2 className="font-medium text-lg text-neutral100">Items</h2>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <Notepad color="#d3f85a" />
                  <p className="ml-2 font-bold text-lg md:text-xl text-neutral50">
                    <span>{collection?.supply}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">{collection?.description}</div>
        </div>
      </section>
      <Tabs defaultValue="AllCard" className="mt-[43.5px] mb-10">
        <TabsList className="border border-neutral400 p-1 rounded-xl h-12 w-fit">
          <TabsTrigger
            value="AllCard"
            className="px-5 rounded-lg border-0 font-semibold"
          >
            Tokens
          </TabsTrigger>
          <TabsTrigger value="Activity" className="px-5 rounded-lg border-0">
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="AllCard">
          <Tabs defaultValue="Grid">
            <section className="flex flex-col md:flex-row justify-between gap-4 mb-7 pt-12 md:pt-12 md2:pt-12 lg:pt-10">
              <button onClick={toggleSideBar}>
                <Image
                  src="/collections/sort.png"
                  draggable="false"
                  alt="sort"
                  width={20}
                  height={20}
                  className={`w-12 h-12 rounded-xl hidden lg:block sm:hidden p-3 ${
                    active
                      ? "bg-neutral500 hover:bg-neutral400 border-transparent"
                      : "bg-neutral600 border border-neutral500 hover:border-neutral400"
                  }`}
                />
              </button>
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="relative w-full">
                  <Image
                    src="/collections/search.png"
                    draggable="false"
                    alt="search"
                    width={20}
                    height={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[17.08px] h-[17.08px]"
                  />
                  <input
                    type="text"
                    placeholder="Search ID"
                    value={searchFilter}
                    onChange={handleSearchChange}
                    className="w-full h-12 rounded-xl pl-10 pr-4 bg-transparent border border-neutral400 text-neutral200"
                  />
                </div>

                <div className="flex gap-4">
                  <Select
                    defaultValue="price_low_to_high"
                    onValueChange={handleOrderChange}
                  >
                    <SelectTrigger className="w-full md:w-60 h-12 rounded-lg bg-transparent border border-neutral400 text-md2 text-neutral50">
                      <SelectValue placeholder="Volume" />
                    </SelectTrigger>
                    <SelectContent className="w-full -top-[53px] lg:left-0 md:w-60 rounded-xl bg-neutral600 bg-opacity-70 border-neutral400 backdrop-blur-lg pb-2 px-2">
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

                  <TabsList className="text-neutral50 border border-neutral400 rounded-lg w-[92px] h-12 px-1">
                    <TabsTrigger
                      value="Grid"
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
                      value="List"
                      className="w-10 h-10 rounded-lg p-[10px] border border-transparent"
                    >
                      <Image
                        src="/collections/burger.png"
                        alt="list"
                        width={20}
                        height={20}
                        draggable="false"
                      />
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </section>
            {/* Content Tabs */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="Grid">
                    <div
                      className={`flex w-full ${
                        active ? "gap-6 lg:gap-10" : "gap-0"
                      } `}
                    >
                      <div
                        className={`${
                          active
                            ? "w-full sm:w-[280px] hidden lg:block sm:hidden opacity-100"
                            : "w-0 opacity-0"
                        } transition-all duration-300`}
                      >
                        {active && (
                          <CollectionSideBar
                            id={id as string}
                            onAvailabilityChange={handleAvailabilityChange}
                            onTraitsChange={handleTraitsChange}
                            collectionData={collection}
                          />
                        )}
                      </div>
                      <div
                        className={`grid gap-4 md:gap-6 h-fit lg:gap-8 ${
                          active
                            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6"
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6"
                        }`}
                      >
                        {filteredCollectibles.map((item) => (
                          <div key={item.id}>
                            <CollectibleCard data={item} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {isFetchingNextPage && (
                      <div className="w-full flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral50"></div>
                      </div>
                    )}

                    <div ref={loadMoreRef} className="h-4 w-full" />
                  </TabsContent>

                  <TabsContent
                    value="List"
                    className={`flex w-full ${
                      active ? "gap-6 lg:gap-10" : "gap-0"
                    } `}
                  >
                    <div
                      className={`${
                        active
                          ? "w-full sm:w-[280px] opacity-100 hidden lg:block sm:hidden"
                          : "w-0 opacity-0"
                      } transition-all duration-300`}
                    >
                      {active && (
                        <CollectionSideBar
                          id={id as string}
                          onAvailabilityChange={handleAvailabilityChange}
                          onTraitsChange={handleTraitsChange}
                          collectionData={collection}
                        />
                      )}
                    </div>
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

                      <div className="h-[754px]  w-full min-w-[1216px] border-t-2 border-neutral500">
                        <div className="flex flex-col pt-4 gap-4">
                          {filteredCollectibles.map((item) => (
                            <div key={item.id}>
                              <CollectibleCardList data={item} />
                            </div>
                          ))}

                          {isFetchingNextPage && (
                            <div className="w-full flex justify-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral50"></div>
                            </div>
                          )}

                          <div ref={loadMoreRef} className="h-4 w-full" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </TabsContent>
        <TabsContent value="Activity">
          <div className="overflow-x-auto 3xl:overflow-x-hidden">
            <div className="min-w-[1216px] pt-6">
              <div className="flex flex-row items-center px-3 pb-4 justify-between border-b border-neutral500">
                <div className="w-[360px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                  Item
                </div>
                <div className="w-[220px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                  Event
                </div>
                <div className="w-[200px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                  Price
                </div>
                <div className="w-[260px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                  Address
                </div>
                <div className="w-[152px] shrink-0 text-neutral200 text-md font-medium whitespace-nowrap">
                  Date
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-3 w-full">
                {allActivities && allActivities.length > 0 ? (
                  allActivities.map((item: any) => (
                    <CollectionActivityCard
                      key={`${item.transactionHash}-${item.activityType}-${item.timestamp}`}
                      data={item}
                      currentLayer={currentLayer?.layer}
                    />
                  ))
                ) : (
                  <div className="flex justify-center items-center mt-8 rounded-3xl w-full bg-neutral500 bg-opacity-[50%] h-[430px]">
                    <p className="text-neutral200 font-medium text-lg">
                      No activity recorded
                    </p>
                  </div>
                )}

                {/* Activity loading indicator */}
                {isFetchingNextActivity && (
                  <div className="w-full flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral50"></div>
                  </div>
                )}

                {/* Activity infinite scroll trigger */}
                {hasMoreActivity && (
                  <div className="h-8 w-full" ref={loadMoreActivityRef} />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        {/* Search and Filter Section */}
      </Tabs>
    </>
  );
};

export default CollectionDetailPageWrapper;
