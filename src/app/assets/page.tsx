"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import ProfileBanner from "@/components/section/profileBanner";
import ProfileDetail from "@/components/section/profile/profileDetail";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getListableById } from "@/lib/service/queryHelper";
import ProfileBannerSkeleton from "@/components/atom/skeleton/my-asset-banner-skeleton";

const Assets = () => {
  const { authState } = useAuth();
  const { data: collectiblelist = [], isLoading } = useQuery({
    queryKey: ["getListableById", authState.userId],
    queryFn: () => getListableById(authState?.userId as string),
    enabled: !!authState?.userId,
  });

  return (
    <Layout>
      <Header />
      {isLoading ? (
        <ProfileBannerSkeleton />
      ) : (
        <ProfileBanner params={collectiblelist} />
      )}
      <ProfileDetail />
    </Layout>
  );
};

export default Assets;
