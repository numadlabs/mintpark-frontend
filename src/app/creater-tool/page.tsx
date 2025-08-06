"use client";
import React, { useState, useEffect } from "react";
import { Grid, ArrowRight, X } from "lucide-react";
import CreaterLayout from "@/components/layout/createrLayout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import NewCollectionCard from "@/components/atom/cards/new-collection-card";
import { CreatorCollection } from "@/lib/validations/collection-validation";
import { createrCollection } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import CreateInfoCard from "@/components/atom/cards/create-info-card";

const CreatorTool = () => {
  const router = useRouter();
  const { currentUserLayer } = useAuth();
  const [collections, setCollections] = useState<CreatorCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userLayerId = currentUserLayer?.id || "";

  useEffect(() => {
    fetchCreatorCollections();
  }, []);

  const fetchCreatorCollections = async () => {
    try {
      setLoading(true);
      const data = await createrCollection(userLayerId, 1, 10);
      setCollections(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch creator collections:", error);
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = (collectionId: string) => {
    console.log("Launching collection:", collectionId);
    router.push(`/creater-tool/launch/${collectionId}`);
  };

  const handleClaim = async (collectionId: string, amount: number) => {
    console.log(
      "Claiming leftover amount:",
      amount,
      "for collection:",
      collectionId
    );
    // Handle claiming leftover BTC
    // After successful claim, refresh collections
    // await claimLeftoverBTC(collectionId);
    // fetchCreatorCollections();
  };

  const handleUploadTraits = (collectionId: string) => {
    console.log("Upload traits for collection:", collectionId);
    router.push(`/creater-tool/upload-traits/${collectionId}`);
  };

  const handleInscriptionProgress = (collectionId: string) => {
    console.log("View inscription progress for collection:", collectionId);
    router.push(`/creater-tool/inscription-progress/${collectionId}`);
  };

  const renderCollections = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center bg-darkSecondary justify-center min-h-[400px] text-center border border-transLight4 rounded-xl">
          <div className="text-lightSecondary">Loading collections...</div>
        </div>
      );
    }

    // if (error) {
    //   return (
    //     <div className="flex flex-col items-center bg-darkSecondary justify-center min-h-[400px] text-center border border-transLight4 rounded-xl">
    //       <div className="text-red-500 mb-4">{error}</div>
    //       <Button
    //         onClick={fetchCreatorCollections}
    //         className="bg-white text-black hover:bg-gray-100"
    //       >
    //         Try Again
    //       </Button>
    //     </div>
    //   );
    // }

    if (collections.length === 0) {
      return (
        <div className="flex flex-col items-center bg-darkSecondary justify-center min-h-[400px] text-center border border-transLight4 rounded-xl">
          {/* Grid Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <Grid size={32} color="#FFFFFF" strokeWidth={1.5} />
          </div>

          {/* Empty State Text */}
          <p className="text-xl mb-12 max-w-md text-lightPrimary">
            Looks like you don&lsquo;t have any collections yet.
          </p>

          {/* Start Creating Button */}
          <Button
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-xl"
            onClick={() => router.push("/creater-tool/inscribe")}
          >
            <span>Start Creating</span>
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {collections.map((collection) => (
          <NewCollectionCard
            key={collection.collectionId}
            collection={collection}
            onLaunch={() => handleLaunch(collection.collectionId)}
            onClaim={() =>
              handleClaim(collection.collectionId, collection.leftoverAmount)
            }
            onUploadTraits={() => handleUploadTraits(collection.collectionId)}
            onInscriptionProgress={() =>
              handleInscriptionProgress(collection.collectionId)
            }
          />
        ))}
      </div>
    );
  };

  return (
    <CreaterLayout>
      <div className="min-h-screen w-full flex flex-col items-center bg-darkPrimary py-12">
        {/* Main Content Container */}
        <div className="w-[800px]">
          {/* Page Title */}
          <div className="text-start mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              My Collections
            </h1>
          </div>

          {/* Collections Grid */}
          <div className="grid gap-4">{renderCollections()}</div>

          <div className="w-full h-[1px] my-8 bg-transLight4" />

          {/* Info Card */}
          <CreateInfoCard />
        </div>
      </div>
    </CreaterLayout>
  );
};

export default CreatorTool;
