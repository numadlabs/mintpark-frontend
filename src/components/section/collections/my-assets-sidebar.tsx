import React, { useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getListableById,
  getListedCollectionById,
} from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { s3ImageUrlBuilder } from "@/lib/utils";

const AssetsSideBar = () => {
  const { authState } = useAuth();
  const [availability, setAvailability] = useState<string>("option-one");
  const [orderBy, setOrderBy] = useState("recent");
  const [orderDirection, setOrderDirection] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const { data: listableData, isLoading: isListableLoading } = useQuery({
    queryKey: [
      "getListableById",
      authState?.userId,
      orderBy,
      orderDirection,
      limit,
      offset,
      selectedCollections.join(","),
    ],
    queryFn: () =>
      getListableById(
        authState?.userId as string,
        orderDirection,
        orderBy,
        authState?.userLayerId as string,
        limit,
        offset,
        selectedCollections.join(",")
      ),
    enabled: !!authState?.userId && !!authState?.userLayerId,
  });

  // Fetch collection data to get listedCollectibleCount
  const { data: collectionData, isLoading: isCollectionLoading } = useQuery({
    queryKey: ["collectionData", authState?.userId, "recent", "desc"],
    queryFn: () =>
      getListedCollectionById(
        authState?.userId as string,
        "recent",
        "desc",
        10,
        0,
        ""
      ),
    enabled: !!authState?.userId,
    retry: 1,
  });

  if (isListableLoading || isCollectionLoading) {
    return <div className="w-full p-4">Loading...</div>;
  }

  const collections = listableData?.data?.collections || [];
  const listCount = listableData?.data?.listCount || 0;

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        return prev.filter((id) => id !== collectionId);
      } else {
        return [...prev, collectionId];
      }
    });
  };

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg text-neutral00 pb-4 border-b border-neutral500">
        Availability
      </h2>
      <RadioGroup
        defaultValue="option-one"
        className="pt-4"
        onValueChange={setAvailability}
      >
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "option-one" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="option-one" id="option-one" />
          <Label
            htmlFor="option-one"
            className="w-full font-bold text-lg2 pt-3 pb-3"
          >
            All
          </Label>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "option-two" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="option-two" id="option-two" />
          <Label
            htmlFor="option-two"
            className="w-full font-bold text-lg2 pt-3 pb-3"
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
