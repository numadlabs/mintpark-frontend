"use client";

import Header from "@/components/layout/header";
import ProfileBanner from "@/components/section/profile-banner";
import ProfileDetail from "@/components/section/profile/profileDetail";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getListableById } from "@/lib/service/queryHelper";
import ProfileBannerSkeleton from "@/components/atom/skeleton/my-asset-banner-skeleton";

const Assets = () => {
  const { authState } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["getListableById", authState.userId, "asc", "recent"],
    queryFn: () =>
      getListableById(
        authState?.userId as string,
        "asc",
        "recent",
        authState.userLayerId as string
      ),
    enabled: !!authState?.userId,
  });

  return (
    <>
      <Header />
      {isLoading ? (
        <ProfileBannerSkeleton />
      ) : data?.success ? (
        <ProfileBanner params={data} />
      ) : null}
      <ProfileDetail />
    </>
  );
};

export default Assets;
