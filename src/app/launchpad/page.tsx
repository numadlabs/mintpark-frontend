"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import LaunchpadBanner from "@/components/section/launchpadBanner";
import LaunchBanner from "@/components/section/launchpads/launchBanner";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";

const Launchpad = () => {
  const {
    isLoading,
    isError,
    isFetching,
    data: launchData,
    error,
  } = useQuery({
    queryKey: ["launchData"],
    queryFn: () => {
      // if (typeof slug === "string") {
      return fetchLaunchs();
      // }
    },
    // enabled: !!slug,
  });
  console.log("🚀 ~ Collections ~ raffleDetail:", launchData);
  return (
    <Layout>
      <Header />
      <LaunchpadBanner />
      {launchData && <LaunchBanner collections={launchData} />}
    </Layout>
  );
};

export default Launchpad;
