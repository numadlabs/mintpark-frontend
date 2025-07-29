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
  const { authState } = useAuth();

  // State for filtering and pagination
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );
  const [availability, setAvailability] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Single query to fetch data
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "getListableById",
      authState.userId,
      orderDirection,
      orderBy,
      authState.userLayerId,
      limit,
      offset,
      selectedCollectionIds,
      availability,
    ],
    queryFn: () =>
      getListableById(
        authState?.userId as string,
        orderDirection,
        orderBy,
        authState.userLayerId as string,
        limit,
        offset,
        selectedCollectionIds,
        availability,
      ),
    enabled: !!authState?.userId,
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



// "use client";

// import Header from "@/components/layout/header";
// import ProfileBanner from "@/components/section/profile-banner";
// import ProfileDetail from "@/components/section/profile/profileDetail";
// import { useQuery } from "@tanstack/react-query";
// import { useAuth } from "@/components/provider/auth-context-provider";
// import { getListableById } from "@/lib/service/queryHelper";
// import ProfileBannerSkeleton from "@/components/atom/skeleton/my-asset-banner-skeleton";
// import { useState, useEffect } from "react";
// import { toast } from "sonner";

// // Import the context from the separate file
// import { AssetsContext } from "@/lib/hooks/useAssetContext";

// const Assets = () => {
//   const {
//     authState,
//     // Wagmi-specific properties
//     wagmiAddress,
//     wagmiIsConnected,
//     linkAccountToCurrentLayer,
//   } = useAuth();

//   // State for filtering and pagination
//   const [orderBy, setOrderBy] = useState("recent");
//   const [orderDirection, setOrderDirection] = useState("desc");
//   const [limit, setLimit] = useState(10);
//   const [offset, setOffset] = useState(0);
//   const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
//     []
//   );
//   const [availability, setAvailability] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLinking, setIsLinking] = useState(false);

//   // Handle account linking when page loads
//   useEffect(() => {
//     const handleAccountLinking = async () => {
//       console.log("Checking account linking conditions:", {
//         authenticated: authState.authenticated,
//         wagmiConnected: wagmiIsConnected,
//         wagmiAddress,
//         layerId: authState.layerId,
//         isLinking,
//         hasLinkFunction: !!linkAccountToCurrentLayer,
//       });

//       // Only attempt linking if:
//       // 1. User is authenticated
//       // 2. Wagmi wallet is connected
//       // 3. Not already linking
//       // 4. We have a selected layer
//       // 5. linkAccountToCurrentLayer function exists
//       if (
//         authState.authenticated &&
//         wagmiIsConnected &&
//         wagmiAddress &&
//         !isLinking &&
//         authState.layerId &&
//         linkAccountToCurrentLayer
//       ) {
//         try {
//           console.log("Starting account linking...");
//           setIsLinking(true);
//           await linkAccountToCurrentLayer();
//           console.log("Account linking completed successfully");
//         } catch (error: any) {
//           console.error("Failed to link account on my-assets page:", error);
//           // Don't show error toast here as linkAccountToCurrentLayer already handles it
//         } finally {
//           setIsLinking(false);
//         }
//       } else {
//         console.log("Skipping account linking - conditions not met");
//       }
//     };

//     handleAccountLinking();
//   }, [
//     authState.authenticated,
//     authState.layerId,
//     wagmiIsConnected,
//     wagmiAddress,
//     linkAccountToCurrentLayer,
//   ]); // Remove isLinking from dependencies to avoid infinite loop

//   // Single query to fetch data - only run when we have userId and not linking
//   const { data, isLoading, refetch } = useQuery({
//     queryKey: [
//       "getListableById",
//       authState.userId,
//       orderDirection,
//       orderBy,
//       authState.userLayerId,
//       limit,
//       offset,
//       selectedCollectionIds,
//       availability,
//     ],
//     queryFn: () =>
//       getListableById(
//         authState?.userId as string,
//         orderDirection,
//         orderBy,
//         authState.userLayerId as string,
//         limit,
//         offset,
//         selectedCollectionIds,
//         availability
//       ),
//     enabled: !!authState?.userId && !!authState?.userLayerId && !isLinking,
//   });

//   // Context values to share with child components
//   const contextValue = {
//     assetsData: data,
//     isLoading: isLoading || isLinking,
//     refetch,
//     filters: {
//       orderBy,
//       setOrderBy,
//       orderDirection,
//       setOrderDirection,
//       limit,
//       setLimit,
//       offset,
//       setOffset,
//       selectedCollectionIds,
//       setSelectedCollectionIds,
//       availability,
//       setAvailability,
//       searchQuery,
//       setSearchQuery,
//     },
//   };

//   // console.log("My Assets render state:", {
//   //   isLoading,
//   //   isLinking,
//   //   finalLoading: isLoading || isLinking,
//   //   dataSuccess: data?.success,
//   //   authUserId: authState?.userId,
//   //   authUserLayerId: authState?.userLayerId,
//   // });

//   return (
//     <AssetsContext.Provider value={contextValue}>
//       <Header />
//       {isLoading || isLinking ? (
//         <ProfileBannerSkeleton />
//       ) : data?.success ? (
//         <ProfileBanner />
//       ) : null}
//       <ProfileDetail />
//     </AssetsContext.Provider>
//   );
// };

// export default Assets;

