"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import ProfileBanner from "@/components/section/profileBanner";
import ProfileDetail from "@/components/section/profile/profileDetail";

const Assets = () => {
  return (
    <Layout>
      <Header />
      <ProfileBanner/>
      <ProfileDetail />
    </Layout>
  );
};

export default Assets;
