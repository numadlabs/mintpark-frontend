"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import LaunchpadBanner from "@/components/section/launchpadBanner";
import LaunchBanner from "@/components/section/launchpads/launchBanner";
import { fetchLaunchs } from "@/lib/service/fetcher";
import { useQuery } from "@tanstack/react-query";

const Launchpad = () => {
  const {
    isLoading,
    isError,
    isFetching,
    data: collections,
    error,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: () => {
      // if (typeof slug === "string") {
      return fetchLaunchs();
      // }
    },
    // enabled: !!slug,
  });
  console.log("🚀 ~ Collections ~ raffleDetail:", collections);
  return (
    <Layout>
      <Header />
      <LaunchpadBanner />
      {collections && <LaunchBanner collections={collections} />}
    </Layout>
  );
};

export default Launchpad;
