"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import LaunchpadBanner from "@/components/section/launchpadBanner";
import LaunchBanner from "@/components/section/launchpads/launchBanner";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";

const Launchpad = () => {
  const {authState} = useAuth()
  const { data: launchData = [] } = useQuery({
    queryKey: ["collectionData"],
    queryFn: () => fetchLaunchs(authState?.layerId as string),
    enabled: !!authState?.layerId,
  });
  return (
    <Layout>
      <Header />
      <LaunchpadBanner />
      {launchData && <LaunchBanner collections={launchData} />}
    </Layout>
  );
};

export default Launchpad;
