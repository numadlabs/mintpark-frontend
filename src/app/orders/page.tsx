"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import OrderDetail from "@/components/section/orderDetail";

const Orders = () => {
//   const {
//     isLoading,
//     isError,
//     isFetching,
//     data: collections,
//     error,
//   } = useQuery({
//     queryKey: ["collections"],
//     queryFn: () => {
//       // if (typeof slug === "string") {
//       return fetchLaunchs();
//       // }
//     },
//     // enabled: !!slug,
//   });
//   console.log("🚀 ~ Collections ~ raffleDetail:", collections);
  return (
    <Layout>
      <Header />
      < OrderDetail />
      {/* {collections && <LaunchBanner collections={collections} />} */}
    </Layout>
  );
};

export default Orders;
