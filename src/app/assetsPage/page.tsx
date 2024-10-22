"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import ProfileBanner from "@/components/section/profileBanner";
import ProfileDetail from "@/components/section/profile/profileDetail";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getListableById } from "@/lib/service/queryHelper";

const Assets = () => {
  const { authState } = useAuth();
  const { data: collection = [] } = useQuery({
    queryKey: ["getListableById", authState.userId],
    queryFn: () => getListableById(authState?.userId as string),
    enabled: !!authState?.userId,
  });
  console.log("hello",collection)
  return (
    <Layout>
      <Header />

      <ProfileBanner data={collection} />

      <ProfileDetail />
    </Layout>
  );
};

export default Assets;
