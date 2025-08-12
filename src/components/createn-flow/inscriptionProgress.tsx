"use client";
import React, { useState, useEffect } from "react";
import { Copy, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  formatDaysAgo,
  formatTimeRemaining,
  truncateAddress,
} from "@/lib/utils";
import { getInscriptionProgress } from "@/lib/service/queryHelper";
import CreaterLayout from "@/components/layout/createrLayout";
import { useAuth } from "../provider/auth-context-provider";

export function InscriptionProgressPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.collectionId as string;
  const { currentUserLayer } = useAuth();

  const [discordUsername, setDiscordUsername] = useState("");
  const [progressData, setProgressData] = useState<{
    totalTraitValueCount: number;
    doneTraitValueCount: number;
    totalCollectibleCount: number;
    doneCollectibleCount: number;
    done: number;
    total: number;
    etaInMinutes: number;
    order?: {
      id: string;
      fundingAddress?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) {
      setError("Collection ID is required");
      setLoading(false);
      return;
    }

    fetchProgress();
    const interval = setInterval(fetchProgress, 8000); // Update every 8 seconds
    return () => clearInterval(interval);
  }, [collectionId]);

  const fetchProgress = async () => {
    try {
      setError(null);
      const res = await getInscriptionProgress({
        collectionId,
        userLayerId: currentUserLayer?.id || "",
      });
      setProgressData(res);
    } catch (err: any) {
      console.error("Failed to fetch inscription progress:", err);
      setError("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push("/creater-tool");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (loading) {
    return (
      <CreaterLayout>
        <div className="min-h-screen w-full flex flex-col items-center bg-darkPrimary py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-lightSecondary">
                Loading inscription progress...
              </p>
            </div>
          </div>
        </div>
      </CreaterLayout>
    );
  }

  if (error) {
    return (
      <CreaterLayout>
        <div className="min-h-screen w-full flex flex-col items-center bg-darkPrimary py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                onClick={fetchProgress}
                className="bg-white text-black hover:bg-gray-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </CreaterLayout>
    );
  }

  return (
    <CreaterLayout>
      <div className="min-h-screen w-full flex flex-col items-center bg-darkPrimary py-12">
        <div className="max-w-2xl mx-auto w-full">
          {progressData?.order?.id && (
            <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lightSecondary text-sm mb-1">Order ID</p>
                  <p className="text-white font-medium">
                    {progressData.order.id}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(progressData.order!.id)}
                  className="p-2 text-lightSecondary hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>

              {progressData.order.fundingAddress && (
                <div className="mt-4 pt-4 border-t border-transLight8">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lightSecondary text-sm mb-1">
                        Funding Address
                      </p>
                      <p className="text-white font-medium">
                        {truncateAddress(progressData.order.fundingAddress)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(progressData.order!.fundingAddress!)
                      }
                      className="p-2 text-lightSecondary hover:text-white transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Section */}
          {!progressData ? (
            <div className="bg-darkSecondary border border-transLight4 h-[350px] rounded-xl p-6 mb-8">
              <p className="text-lightSecondary text-center">
                Loading progress...
              </p>
            </div>
          ) : (
            <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Settings size={24} className="text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Inscription Progress
                </h3>
              </div>
              <p className="text-lightSecondary mb-6">
                Track the real-time status of your Ordinal inscriptions as we
                record your assets on Bitcoin.
              </p>

              {/* Progress Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-transLight4 rounded-lg p-4">
                  <p className="text-lightSecondary text-sm mb-1">
                    Overall Progress
                  </p>
                  <p className="text-white font-medium text-xl">
                    {progressData.done} / {progressData.total}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          progressData.total > 0
                            ? `${
                                (progressData.done / progressData.total) * 100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="bg-transLight4 rounded-lg p-4">
                  <p className="text-lightSecondary text-sm mb-1">
                    Estimated remaining time
                  </p>
                  <p className="text-white font-medium text-xl">
                    {formatTimeRemaining(progressData.etaInMinutes)}
                  </p>
                </div>
              </div>

              {/* Detailed Progress */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-lightSecondary text-sm mb-1">
                    Trait Values
                  </p>
                  <p className="text-white font-medium">
                    {progressData.doneTraitValueCount} /{" "}
                    {progressData.totalTraitValueCount}
                  </p>
                </div>
                <div>
                  <p className="text-lightSecondary text-sm mb-1">
                    Collectibles
                  </p>
                  <p className="text-white font-medium">
                    {progressData.doneCollectibleCount} /{" "}
                    {progressData.totalCollectibleCount}
                  </p>
                </div>
              </div> */}
            </div>
          )}

          {/* Discord Section */}
          {/* <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">
              Join Our Discord
            </h3>
            <p className="text-lightSecondary mb-4">
              To receive the fastest and hands-on support, enter your Discord
              Username and join our server. We will create a private channel for
              your project.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-lightSecondary">@</span>
                </div>
                <Input
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="username#1234"
                  className="pl-8 bg-darkTertiary border-transLight8 text-white placeholder:text-lightTertiary"
                />
              </div>
              <Button
                variant="outline"
                className="bg-transparent border-transLight16 text-white hover:bg-transLight8"
              >
                Invite me
              </Button>
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex justify-end gap-6">
            <Button
              onClick={handleGoBack}
              className="flex bg-white text-black hover:bg-gray-200"
            >
              Back to My Collections
            </Button>
            <Button
              onClick={fetchProgress}
              variant="outline"
              className="bg-transparent border-transLight16 text-white hover:bg-transLight8"
            >
              Refresh Progress
            </Button>
          </div>
        </div>
      </div>
    </CreaterLayout>
  );
}
