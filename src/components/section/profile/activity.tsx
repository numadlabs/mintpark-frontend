"use client";
import React from "react";
import ActivityCard from "@/components/atom/cards/activity-card";
import { s3ImageUrlBuilder } from "@/lib/utils";
import {
  getAssetById,
  getCollectibleActivity,
  getLayerById,
} from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/provider/auth-context-provider";

const Activity = () => {
  const params = useParams();
  const id = params.detailId as string;

  const { currentUserLayer, currentLayer } = useAuth();
  const layerId = currentUserLayer?.layerId ?? currentLayer?.id;

  // 🔹 Fetch activity list
  const { data: activity = [] } = useQuery({
    queryKey: ["activityData", id],
    queryFn: () => getCollectibleActivity(id),
    enabled: !!id,
  });

  // 🔹 Fetch collectible
  const {
    data: collectible,
    isLoading: isCollectibleLoading,
    error,
  } = useQuery({
    queryKey: ["collectionData", id],
    queryFn: async () => {
      const result = await getAssetById(id);
      return result;
    },
    enabled: !!id,
  });

  // 🔹 Fetch current layer (if available)
  const { data: currentLayerData } = useQuery({
    queryKey: ["currentLayerData", layerId],
    queryFn: () => getLayerById(layerId as string),
    enabled: !!layerId,
  });

  // const collectible = collectible?.[0];

  return (
    <div className="mt-8 flex flex-col w-full">
      <div className="flex flex-row items-center justify-between px-3 pb-4 border-b border-neutral500">
        <p className="max-w-[360px] w-full text-md text-neutral200 font-medium">
          Item
        </p>
        <p className="max-w-[220px] w-full text-md text-neutral200 font-medium">
          Event
        </p>
        <p className="max-w-[200px] w-full text-md text-neutral200 font-medium">
          Price
        </p>
        <p className="max-w-[260px] w-full text-md text-neutral200 font-medium">
          Address
        </p>
        <p className="max-w-[152px] w-full text-md text-neutral200 font-medium">
          Date
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex flex-col gap-3 pt-3">
          {activity.length > 0 && collectible ? (
            activity.map((item: any) => (
              <ActivityCard
                key={`${item.id}-${item.event}-${item.date}`}
                data={item}
                imageUrl={
                  collectible.highResolutionImageUrl ||
                  s3ImageUrlBuilder(collectible.fileKey)
                }
                currenAsset={collectible.name}
                currentLayer={currentLayerData?.name ?? "Unknown Layer"}
              />
            ))
          ) : (
            <div className="flex justify-center items-center mt-3 rounded-3xl w-full bg-neutral500 bg-opacity-[50%] h-[430px]">
              <p className="text-neutral200 font-medium text-lg">
                {isCollectibleLoading ? "Loading..." : "No activity recorded"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
