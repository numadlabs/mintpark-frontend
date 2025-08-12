import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "iconsax-react";
import { CreatorCollection } from "@/lib/validations/collection-validation";
import { s3ImageUrlBuilder } from "@/lib/utils";
import {
  Info,
  Clock,
  Pause,
  CheckCircle,
  Copy,
  Check,
  Hourglass,
} from "lucide-react";
import { getInscriptionProgress } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getCurrencyImage } from "@/lib/service/currencyHelper";
import ClaimFeePopup from "@/components/popup/claim";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NewCollectionCardProps {
  collection: CreatorCollection;
  onLaunch?: () => void;
  onClaim?: () => void;
  onUploadTraits?: () => void;
  onInscriptionProgress?: () => void;
  onLaunchDetails?: () => void;
}

interface ProgressData {
  totalTraitValueCount: number;
  doneTraitValueCount: number;
  totalCollectibleCount: number;
  doneCollectibleCount: number;
  done: number;
  total: number;
  etaInMinutes: number;
  orderId?: string;
}

const NewCollectionCard: React.FC<NewCollectionCardProps> = ({
  collection,
  onLaunch,
  onClaim,
  onUploadTraits,
  onInscriptionProgress,
  onLaunchDetails,
}) => {
  const { currentUserLayer } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const router = useRouter();

  // Fetch progress data for collections that are inscribing
  useEffect(() => {
    const shouldFetchProgress =
      collection.progressState === "QUEUED" ||
      collection.progressState === "RAN_OUT_OF_FUNDS";
    if (shouldFetchProgress) {
      fetchProgressData();
      // Set up interval for real-time updates
      const interval = setInterval(fetchProgressData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [collection.progressState, collection.collectionId]);

  const fetchProgressData = async () => {
    try {
      setIsLoadingProgress(true);
      const data = await getInscriptionProgress({
        collectionId: collection.collectionId,
        userLayerId: currentUserLayer?.id,
      });
      setProgressData(data);
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
      // Don't show error to user, just use fallback data
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleCopyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (error) {
      console.error("Failed to copy order ID:", error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = orderId;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClaimSuccess = (walletAddress: string) => {
    // console.log(`Claim successful for address: ${walletAddress}`);
    if (onClaim) {
      onClaim();
    }
    setShowClaimPopup(false);
    // window.location.reload();
    collection.leftoverClaimed = true;
  };
  const getProgressText = () => {
    if (!progressData) {
      return `${collection.retopAmount || 0} / ${collection.retopAmount || 0}`;
    }
    return `${progressData.done} / ${progressData.total}`;
  };

  const getStatusConfig = () => {
    switch (collection.progressState) {
      case "CONTRACT_DEPLOYED":
        return {
          showBottomCard: true,
          bottomType: "warning",
          bottomTitle: "Contract Deployed",
          bottomMessage:
            "Your collection's contract is deployed. Please upload your trait assets, metadata and inscribe, or it will be removed in 72 hours.",
          BottomIconComponent: Info,
          bottomIconBg: "bg-transLight4",
          primaryButton: {
            text: "Upload traits & Inscribe",
            action: onUploadTraits,
          },
          showSecondaryButton: false,
        };

      case "QUEUED":
        return {
          showBottomCard: true,
          bottomType: "info",
          bottomTitle: "Progress",
          bottomMessage: getProgressText(),
          BottomIconComponent: Clock,
          bottomIconBg: "bg-transLight4",
          primaryButton: {
            text: "Inscription Progress",
            action: onInscriptionProgress,
          },
          showSecondaryButton: false,
          showStatus: true,
          statusText: "Inscribing",
          statusColor: "text-green-500",
          statusDot: "bg-green-500",
          progressPercentage: progressData
            ? (progressData.done / progressData.total) * 100
            : 0,
          etaText: progressData
            ? `${progressData.etaInMinutes} min remaining`
            : null,
          showOrderId: true,
        };

      case "RAN_OUT_OF_FUNDS":
        return {
          showBottomCard: true,
          bottomType: "info",
          bottomTitle: "Inscribing Paused",
          bottomMessage: getProgressText(),
          BottomIconComponent: Pause,
          bottomIconBg: "bg-transLight4",
          primaryButton: {
            text: "Inscription Progress",
            action: onInscriptionProgress,
          },
          showSecondaryButton: false,
          showStatus: true,
          statusText: "Inscribing Paused",
          statusColor: "text-red-500",
          statusDot: "bg-red-500",
          progressPercentage: progressData
            ? (progressData.done / progressData.total) * 100
            : 0,
          etaText: "Paused - Add funds to continue",
          showOrderId: true,
        };

      case "LAUNCH_IN_REVIEW":
        return {
          showBottomCard: true,
          bottomType: "info",
          bottomTitle: "Reviewing your launch details",
          bottomMessage:
            "Review in progress. Your minter will be visible when approved.",
          BottomIconComponent: Hourglass,
          bottomIconBg: "bg-transLight4",
          primaryButton: {
            text: "Launch Details",
            action: onLaunchDetails,
          },
          showSecondaryButton: false,
        };
      case "LAUNCH_CONFIRMED":
        return {
          showBottomCard: true,
          bottomType: "success",
          bottomTitle: "Launch Confirmed",
          bottomMessage: "Your collection is now live and ready for minting!",
          BottomIconComponent: CheckCircle,
          bottomIconBg: "bg-succesQuaternary",
          primaryButton: {
            text: "Go to Launchpad",
            action: () => (window.location.href = "/launchpad"),
          },
          showSecondaryButton: false,
        };

      case "COMPLETED":
        if (!collection.leftoverClaimed && collection.leftoverAmount > 0) {
          return {
            showBottomCard: true,
            bottomType: "success",
            bottomTitle: "Inscribed Successfully!",
            bottomMessage:
              "Inscription fee was lower than estimated. Claim your unused amount now.",
            BottomIconComponent: CheckCircle,
            bottomIconBg: "bg-succesQuaternary",
            primaryButton: { text: "Launch", action: onLaunch },
            showSecondaryButton: true,
            secondaryButton: {
              text: `Claim ${collection.leftoverAmount / 1e8} BTC`,
              action: () => setShowClaimPopup(true), // Зөвхөн popup нээх
            },
          };
        }
        return {
          showBottomCard: false,
          primaryButton: { text: "Launch", action: onLaunch },
          showSecondaryButton: false,
        };

      case "LEFTOVER_CLAIMED":
        return {
          showBottomCard: false,
          primaryButton: { text: "Launch", action: onLaunch },
          showSecondaryButton: false,
        };

      default:
        return {
          showBottomCard: false,
          primaryButton: { text: "Launch", action: onLaunch },
          showSecondaryButton: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="">
      {/* Main Card */}
      <div className="flex justify-between items-center gap-4 bg-darkSecondary p-4 relative z-10 rounded-xl border border-transLight4">
        <div className="flex items-center gap-4">
          <div>
            <Image
              src={
                collection?.logoKey
                  ? s3ImageUrlBuilder(collection.logoKey)
                  : "/path/to/fallback/image.png"
              }
              alt="newCollection"
              width={80}
              height={80}
              draggable="false"
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="font-medium text-2xl text-lightPrimary">
              {collection.name}
            </h1>
            <div className="flex gap-2 items-center">
              <div className="flex border border-transLight4 rounded-lg px-2 py-1 items-center gap-2">
                <Image
                  src={getCurrencyImage(collection.layer)}
                  alt="layer"
                  width={20}
                  height={20}
                  draggable="false"
                  className="w-[20px] h-[20px] object-cover"
                />
                <p className="text-md font-medium text-lightPrimary">
                  {collection.layer}
                </p>
              </div>
              <div className="flex border border-transLight4 rounded-lg px-2 py-1 items-center gap-2">
                <Image
                  src="/collections/eye-off.png"
                  alt="visibility"
                  width={13.33}
                  height={13.33}
                  draggable="false"
                  className="w-[13.33px] h-[13.33px] object-cover"
                />
                <p className="text-lightSecondary font-semibold text-md">
                  Not visible to users
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="group relative inline-flex items-center gap-3 pt-3 pr-[14px] pb-3 pl-4 bg-white text-black font-semibold text-md rounded-xl disabled:opacity-50"
            onClick={config.primaryButton.action}
            disabled={
              isLoadingProgress &&
              (collection.progressState === "QUEUED" ||
                collection.progressState === "RAN_OUT_OF_FUNDS")
            }
          >
            <span>{config.primaryButton.text}</span>
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </div>
      </div>

      {/* Bottom Card - Conditional based on state */}
      {config.showBottomCard && (
        <div className="flex h-auto min-h-[88px] justify-start items-start gap-16 bg-darkSecondary p-4 rounded-xl rounded-tl-none rounded-tr-none relative bottom-1 -z-0 border border-transLight4">
          {config.showStatus && (
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-lightSecondary text-sm font-medium">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${config.statusDot} ${
                      isLoadingProgress ? "animate-pulse" : ""
                    }`}
                  ></div>
                  <p className={`font-medium ${config.statusColor}`}>
                    {config.statusText}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-12 h-12 ${config.bottomIconBg} p-3 rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              {config.BottomIconComponent && (
                <config.BottomIconComponent
                  size={24}
                  className="w-6 h-6 text-white"
                />
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h1 className="text-lightPrimary font-medium text-lg">
                {config.bottomTitle}
              </h1>
              <p className="text-lightSecondary font-medium text-md">
                {config.bottomMessage}
              </p>

              {/* Order ID Section - Only show for inscribing states */}
              {config.showOrderId && progressData?.orderId && (
                <div className="mt-3 p-3 bg-darkPrimary border border-transLight4 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-lightSecondary text-xs mb-1">
                        Order ID
                      </p>
                      <p className="text-lightPrimary font-medium font-mono text-xs break-all">
                        {progressData.orderId}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleCopyOrderId(progressData.orderId!)}
                      className="ml-2 p-1.5 bg-transLight4 hover:bg-transLight3 text-white flex-shrink-0"
                      size="sm"
                    >
                      {copiedOrderId ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </Button>
                  </div>
                  {copiedOrderId && (
                    <p className="text-green-500 text-xs mt-1">
                      Order ID copied!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {config.showSecondaryButton && config.secondaryButton && (
            <Button
              className="group relative inline-flex items-center gap-3 pt-3 pr-[16px] pb-3 pl-4 bg-white text-black font-semibold text-md rounded-xl flex-shrink-0"
              onClick={config.secondaryButton.action}
            >
              <span>{config.secondaryButton.text}</span>
            </Button>
          )}
        </div>
      )}
      <ClaimFeePopup
        isOpen={showClaimPopup}
        onClose={() => setShowClaimPopup(false)}
        amountToClaim={collection.leftoverAmount}
        collectionId={collection.collectionId}
        onClaim={handleClaimSuccess}
      />
    </div>
  );
};

export default NewCollectionCard;
