// AssetsSideBar.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { useAssetsContext } from "@/lib/hooks/useAssetContext";

interface AssetsSideBarProps {
  onAvailabilityChange: (value: string) => void;
  onCollectionsChange: (collections: string[]) => void;
  selectedCollections: string[];
}

const AssetsSideBar = ({
  onAvailabilityChange,
  onCollectionsChange,
  selectedCollections,
}: AssetsSideBarProps) => {
  // Get data from shared context
  const {
    assetsData,
    isLoading,
    filters: { availability },
  } = useAssetsContext();

  // Extract collections and list count from shared data
  const collections = assetsData?.data?.collections || [];
  const listCount = assetsData?.data?.listCount || 0;

  useEffect(() => {
    // Sync the selected collections with parent component
    onCollectionsChange(selectedCollections);
  }, [selectedCollections, onCollectionsChange]);

  if (isLoading) {
    return (
      <div className="w-full p-4 flex justify-center items-center">
        Loading...
      </div>
    );
  }

  const handleAvailabilityChange = (value: string) => {
    onAvailabilityChange(value);
  };

  const handleCollectionToggle = (collectionId: string) => {
    const newCollections = selectedCollections.includes(collectionId)
      ? selectedCollections.filter((id) => id !== collectionId)
      : [...selectedCollections, collectionId];

    onCollectionsChange(newCollections);
  };

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg text-neutral00 pb-4 border-b border-neutral500">
        Availability
      </h2>
      <RadioGroup
        value={availability}
        className="pt-4"
        onValueChange={handleAvailabilityChange}
      >
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "all" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="all" id="all" />
          <Label
            htmlFor="all"
            className="w-full cursor-pointer font-bold text-lg2 pt-3 pb-3"
          >
            All
          </Label>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "isListed" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="isListed" id="isListed" />
          <Label
            htmlFor="isListed"
            className="w-full cursor-pointer font-bold text-lg2 pt-3 pb-3"
          >
            Listed <span>({listCount})</span>
          </Label>
        </div>
      </RadioGroup>
      <h2 className="font-bold text-lg text-neutral00 pt-7 pb-4 border-b border-neutral500">
        Collections
      </h2>
      <div className="space-y-2 pt-4 grid gap-3">
        {Array.isArray(collections) &&
          collections.map((collection) => (
            <div key={collection.id} className="flex px-3 text-neutral00">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex gap-4 items-center">
                  <Image
                    width={40}
                    draggable="false"
                    height={40}
                    src={
                      collection?.logoKey
                        ? s3ImageUrlBuilder(collection.logoKey)
                        : ""
                    }
                    className="aspect-square rounded-lg"
                    alt={`${collection.name || "Collection"} logo`}
                  />
                  <div className="flex gap-1">
                    <h1>{collection.name || "Unnamed Collection"}</h1>
                    <p>({collection.collectibleCount || 0})</p>
                  </div>
                </div>
                <Checkbox
                  checked={selectedCollections.includes(collection.id)}
                  onCheckedChange={() => handleCollectionToggle(collection.id)}
                  className="border border-neutral400 w-5 h-5 rounded"
                />
              </div>
            </div>
          ))}
        {Array.isArray(collections) && collections.length === 0 && (
          <div className="px-3 text-neutral00">No collections found</div>
        )}
      </div>
    </div>
  );
};

export default AssetsSideBar;
