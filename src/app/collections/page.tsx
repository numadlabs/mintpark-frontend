"use client";

import CollecBanner from "@/components/section/collections/collecBanner";
import CollectionsBanner from "@/components/section/collectionsBanner";
import { collection } from "@/lib/constants";

const Collections = () => {
  return (
    <>
      <CollectionsBanner />
      <CollecBanner detail={false} data={collection} />
    </>
  );
};

export default Collections;
