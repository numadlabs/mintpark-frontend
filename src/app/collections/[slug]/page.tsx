"use client";
import CollecDetailBanner from "@/components/section/collections/collecDetailBanner";
import { collection } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function CollectionDyminacPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  let id = parseInt(params.slug);
  if (isNaN(id)) {
    router.push("/collections");
    return null;
  }
  const data = collection.filter((c) => c.id == id)[0];
  return <>{data != undefined && <CollecDetailBanner data={data} />}</>;
}
