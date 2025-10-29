import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Lock1, Unlimited } from "iconsax-react";
import Countdown, { CountdownRenderProps } from "react-countdown";
import { useAuth } from "@/components/provider/auth-context-provider";
import {
  findLayerByLayerId,
  getCurrencyIcon,
  getCurrencySymbol,
} from "@/lib/service/currencyHelper";
import { Layer } from "@/lib/types/wallet";

interface PhaseCardProps {
  maxMintPerWallet: number | string;
  mintPrice: number;
  mintedAmount: number;
  endsAt: number;
  startsAt: number;
  supply: number;
  isActive: boolean;
  isBadge: boolean;
  badgeSupply: number;
  onClick: () => void;
  phaseType: "guaranteed" | "FCFS" | "public";
  isWhitelisted?: boolean;
  hasFCFS?: boolean;
  layerId: string;
}

// Renderer for the countdown component with proper TypeScript types
const countdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps): string => {
  if (completed) {
    return "";
  }

  if (days === 0 && hours === 0 && minutes === 0) {
    return `${seconds}s`;
  } else if (days === 0 && hours === 0) {
    return `${minutes}m ${seconds}s`;
  } else if (days === 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${days}d ${hours}h ${minutes}m`;
  }
};

const PhaseCard: React.FC<PhaseCardProps> = ({
  maxMintPerWallet,
  mintPrice,
  endsAt,
  startsAt,
  isActive,
  onClick,
  phaseType,
  supply,
  mintedAmount,
  isBadge,
  badgeSupply,
  isWhitelisted = false,
  hasFCFS = false,
  layerId,
}) => {
  const { availableLayers } = useAuth();
  const launchItemLayer = findLayerByLayerId({
    layerId: layerId,
    layers: availableLayers,
  });

  const [status, setStatus] = useState("");
  const [isClickable, setIsClickable] = useState(false);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [key, setKey] = useState<number>(0); // Key for forcing Countdown re-render

  function determinePhaseState(
    phase: string,
    startsAt: number,
    endsAt: number | null,
  ) {
    const now = Math.floor(Date.now() / 1000);
    const isInfiniteSupplyBadge = isBadge && badgeSupply === null;
    const isSoldOut = !isInfiniteSupplyBadge && mintedAmount >= supply;

    if (isSoldOut) return "ENDED";

    // First check if the phase hasn't started yet
    if (now < startsAt) return "UPCOMING";

    // Check if the phase has ended (if it has an end time)
    if (endsAt && now > endsAt) return "ENDED";

    // Handle public phase specifically
    if (startsAt && phase === "public") {
      if (now >= startsAt) {
        // If no end date for public phase, it's indefinite
        if (!endsAt) return "INDEFINITE";
        // If there's an end date and we're still within it
        if (now <= endsAt) return "LIVE";
      }
    }

    // Handle guaranteed phase
    if (phase === "guaranteed") {
      if (isWhitelisted && now >= startsAt && (!endsAt || now <= endsAt)) {
        return "LIVE";
      }
    }

    // Handle FCFS phase
    if (phase === "FCFS") {
      if (hasFCFS && now >= startsAt && (!endsAt || now <= endsAt)) {
        return "LIVE";
      }
    }

    // General case - if we're between start and end time
    if (now >= startsAt && (!endsAt || now <= endsAt)) {
      return "LIVE";
    }

    // Default fallback
    return "UPCOMING";
}

  const updateStatus = () => {
    const now = Math.floor(Date.now() / 1000);
    const launchState = determinePhaseState(phaseType, startsAt, endsAt);

    // Handle all possible states
    switch (launchState) {
      case "UPCOMING":
        setStatus("Starts in");
        setTargetTime(startsAt * 1000); // Convert to milliseconds for Countdown
        setIsClickable(false);
        break;

      case "LIVE":
        if (endsAt === null) {
          setStatus("Live");
          setTargetTime(null);
        } else {
          setStatus("Ends in:");
          setTargetTime(endsAt * 1000); // Convert to milliseconds for Countdown
        }
        setIsClickable(true);
        break;

      case "INDEFINITE":
        setStatus("Live");
        setTargetTime(null);
        setIsClickable(true);
        break;

      case "ENDED":
        setStatus("Ended");
        setTargetTime(null);
        setIsClickable(false);
        break;

      default:
        setStatus("Unknown");
        setTargetTime(null);
        setIsClickable(false);
    }

    // Update the key to force re-render of the Countdown component
    setKey((prevKey) => prevKey + 1);
  };

  // Handle countdown completion
  const handleCountdownComplete = () => {
    // Short delay to allow any pending state updates to complete
    setTimeout(() => {
      updateStatus();
    }, 100);
  };

  // Main effect for phase state changes
  useEffect(() => {
    // Initial update
    updateStatus();
  }, [phaseType, startsAt, endsAt, isWhitelisted, hasFCFS]);

  // Force update status on visibility and focus changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateStatus();
      }
    };

    const handleFocus = () => {
      updateStatus();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const borderClass =
    isActive && isClickable ? "border-brand" : "border-white8";
  const phaseTextClass = isClickable ? "text-brand" : "text-neutral50";

  return (
    <button
      className={`flex flex-col justify-between border ${borderClass} rounded-3xl p-5 gap-4
        ${
          !isClickable
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer hover:border-brand transition-colors"
        }`}
      disabled={!isClickable}
      onClick={onClick}
    >
      <div className="flex justify-between w-full">
        <div className="flex flex-row gap-2 items-center bg-white8 px-3 py-2 text-md font-medium rounded-lg">
          <p className={phaseTextClass}>
            {phaseType === "guaranteed"
              ? "Guaranteed"
              : phaseType === "FCFS"
                // ? "FCFS"
                ? "Special WL"
                : "Public"}
          </p>
          {!isClickable && <Lock1 size={16} color="#D7D8D8" />}
        </div>
        <div className="flex flex-row items-center gap-2 border bg-white8 border-transparent text-md rounded-lg px-3 py-2">
          <span className="text-neutral100 font-medium text-md">{status}</span>
          {targetTime && (
            <span className="text-neutral50 font-medium text-md">
              <Countdown
                key={key}
                date={targetTime}
                renderer={(props) => <span>{countdownRenderer(props)}</span>}
                onComplete={handleCountdownComplete}
                // Add auto-refresh when time gets very close to completion
                onTick={(props) => {
                  if (props.total <= 1000 && props.total > 0) {
                    // Pre-refresh when we're at the last second
                    setTimeout(handleCountdownComplete, props.total + 50);
                  }
                }}
              />
            </span>
          )}
        </div>
      </div>

      {status !== "Ended" && (
        <>
          <div className="flex gap-2">
            <Image
              width={20}
              height={20}
              draggable="false"
              src={
                launchItemLayer?.layer
                  ? getCurrencyIcon(launchItemLayer.layer)
                  : ""
              }
              alt="Icon"
              className="aspect-square h-5 w-5"
            />
            {mintPrice !== undefined && (
              <p className="text-neutral50">
                <span className="mr-1">{mintPrice}</span>
                {launchItemLayer?.layer
                  ? getCurrencySymbol(launchItemLayer.layer)
                  : ""}
              </p>
            )}
          </div>
          <div className="flex justify-between w-full text-md font-medium">
            <h1 className="text-neutral200">Max:</h1>
            {maxMintPerWallet == 0 ? (
              <Unlimited size="18" color="#88898A" />
            ) : (
              <h2 className="text-neutral50">
                <span>{maxMintPerWallet}</span> per wallet
              </h2>
            )}
          </div>
        </>
      )}
    </button>
  );
};

export default PhaseCard;
