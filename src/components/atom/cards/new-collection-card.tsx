import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "iconsax-react";
import { CreatorCollection } from "@/lib/validations/collection-validation";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { Info, Clock, Pause, CheckCircle } from "lucide-react";

interface NewCollectionCardProps {
  collection: CreatorCollection;
  onLaunch?: () => void;
  onClaim?: () => void;
  onUploadTraits?: () => void;
  onInscriptionProgress?: () => void;
}

const NewCollectionCard: React.FC<NewCollectionCardProps> = ({
  collection,
  onLaunch,
  onClaim,
  onUploadTraits,
  onInscriptionProgress,
}) => {
  const getStatusConfig = () => {
    switch (collection.progressState) {
      case "CONTRACT_DEPLOYED":
        return {
          showBottomCard: true,
          bottomType: "warning",
          bottomTitle: "Contract Deployed",
          bottomMessage:
            "Your collection's contract is deployed. Please upload your trait assets, metadata and inscribe, or it will be removed in 72 hours.",
          // Use Lucide icon instead of image
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
          bottomTitle: "Inscribing",
          bottomMessage: `Progress: ${collection.retopAmount} / 2,000`,
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
        };

      case "RAN_OUT_OF_FUNDS":
        return {
          showBottomCard: true,
          bottomType: "info",
          bottomTitle: "Inscribing Paused",
          bottomMessage: `Progress: ${collection.retopAmount} / 2,000`,
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
              text: `Claim ${collection.leftoverAmount} BTC`,
              action: onClaim,
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
                  src="/wallets/core.png"
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

            {/* Status Section - Only show for inscribing states */}
            {config.showStatus && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <p className="text-lightSecondary text-sm font-medium">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${config.statusDot}`}
                    ></div>
                    <p className={`font-medium ${config.statusColor}`}>
                      {config.statusText}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-lightSecondary text-sm font-medium">
                    Progress
                  </p>
                  <p className="text-lightPrimary font-medium">
                    {config.bottomMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="group relative inline-flex items-center gap-3 pt-3 pr-[14px] pb-3 pl-4 bg-white text-black font-semibold text-md rounded-xl"
            onClick={config.primaryButton.action}
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
        <div className="flex h-[88px] justify-between items-center gap-4 bg-darkSecondary p-4 rounded-xl rounded-tl-none rounded-tr-none relative bottom-1 -z-0 border border-transLight4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 ${config.bottomIconBg} p-3 rounded-lg flex items-center justify-center`}
            >
              {/* Use Lucide icon component instead of Image */}
              {config.BottomIconComponent && (
                <config.BottomIconComponent
                  size={24}
                  className="w-6 h-6 text-white"
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-lightPrimary font-medium text-lg">
                {config.bottomTitle}
              </h1>
              <p className="text-lightSecondary font-medium text-md">
                {config.bottomMessage}
              </p>
            </div>
          </div>

          {config.showSecondaryButton && config.secondaryButton && (
            <Button
              className="group relative inline-flex items-center gap-3 pt-3 pr-[16px] pb-3 pl-4 bg-white text-black font-semibold text-md rounded-xl"
              onClick={config.secondaryButton.action}
            >
              <span>{config.secondaryButton.text}</span>
              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewCollectionCard;
