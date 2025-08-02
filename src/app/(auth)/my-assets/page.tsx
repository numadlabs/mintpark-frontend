// auth changes
"use client";
import Header from "@/components/layout/header";
import ProfileBanner from "@/components/section/profile-banner";
import ProfileDetail from "@/components/section/profile/profileDetail";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getListableById } from "@/lib/service/queryHelper";
import ProfileBannerSkeleton from "@/components/atom/skeleton/my-asset-banner-skeleton";
import { useState } from "react";

// Import the context from the separate file
import { AssetsContext } from "@/lib/hooks/useAssetContext";

const Assets = () => {
  const { user, currentUserLayer } = useAuth();
  // State for filtering and pagination
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");
  const [limit, setLimit] = useState(30);
  const [offset, setOffset] = useState(0);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );
  const [availability, setAvailability] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userId = user?.id;
  const userLayerId = currentUserLayer?.id;

  // Single query to fetch data
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "getListableById",
      userId,
      orderDirection,
      orderBy,
      userLayerId,
      limit,
      offset,
      selectedCollectionIds,
      availability,
    ],
    queryFn: () =>
      getListableById(
        userId as string,
        orderDirection,
        orderBy,
        userLayerId as string,
        limit,
        offset,
        selectedCollectionIds,
        availability,
      ),
    enabled: !!userId && !!userLayerId,
  });

  // Context values to share with child components
  const contextValue = {
    assetsData: data,
    isLoading,
    refetch,
    filters: {
      orderBy,
      setOrderBy,
      orderDirection,
      setOrderDirection,
      limit,
      setLimit,
      offset,
      setOffset,
      selectedCollectionIds,
      setSelectedCollectionIds,
      availability,
      setAvailability,
      searchQuery,
      setSearchQuery,
    },
  };

  return (
    <AssetsContext.Provider value={contextValue}>
      <Header />
      {isLoading ? (
        <ProfileBannerSkeleton />
      ) : data?.success ? (
        <ProfileBanner />
      ) : null}
      <ProfileDetail />
    </AssetsContext.Provider>
  );
};

export default Assets;
