import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Lock1 } from "iconsax-react";
import { BITCOIN_IMAGE } from "@/lib/constants";
import { useLaunchState, LAUNCH_STATE } from "@/lib/hooks/useLaunchState";
import { useAuth } from "@/components/provider/auth-context-provider";
import { useQuery } from "@tanstack/react-query";
import { getLayerById } from "@/lib/service/queryHelper";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";

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
}

const formatTimeDisplay = (targetTimestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, targetTimestamp - now);

  if (diff === 0) return "";

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = Math.floor(diff % 60);

  // If minutes are 0, show seconds instead
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
}) => {
  const { authState } = useAuth();
  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");
  const [isClickable, setIsClickable] = useState(false);

  function determinePhaseState(
    phase: string,
    startsAt: number,
    endsAt: number | null
  ) {
    const now = Math.floor(Date.now() / 1000);

    // For public phase with no end date
    if (phase === "public" && now >= startsAt && !endsAt) return "INDEFINITE";

    // For guaranteed phase whitelist conditions
    if (
      phase === "guaranteed" &&
      isWhitelisted &&
      now >= startsAt &&
      endsAt &&
      now <= endsAt
    ) {
      return "LIVE";
    }

    // For FCFS phase conditions - only accessible if user has FCFS access
    if (
      phase === "FCFS" &&
      hasFCFS &&
      now >= startsAt &&
      endsAt &&
      now <= endsAt
    ) {
      return "LIVE";
    }

    // // General cases for any phase type
    if (now >= startsAt && endsAt && now <= endsAt) return "LIVE";
    if (endsAt && now > endsAt) return "ENDED";

    return "UPCOMING";
  }

  useEffect(() => {
    const updateTimeDisplay = () => {
      const now = Math.floor(Date.now() / 1000);
      const launchState = determinePhaseState(phaseType, startsAt, endsAt);

      switch (launchState) {
        case "UPCOMING":
          setStatus("Starts in");
          setTimeDisplay(formatTimeDisplay(startsAt));
          setIsClickable(false);
          break;
        case "LIVE":
          if (endsAt === null) {
            setStatus("Live");
            setTimeDisplay("");
          } else {
            setStatus("Ends in:");
            setTimeDisplay(formatTimeDisplay(endsAt));
          }
          setIsClickable(true);
          break;
        case "INDEFINITE":
          setStatus("Live");
          setTimeDisplay("Indefinite");
          setIsClickable(true);
          break;
        case "ENDED":
          setStatus("Ended");
          setTimeDisplay("");
          setIsClickable(false);
          break;
        default:
          setStatus("Unknown");
          setTimeDisplay("");
          setIsClickable(false);
      }
    };

    updateTimeDisplay();

    // Determine the appropriate interval based on if we're showing seconds
    const isShowingSeconds = () => {
      const now = Math.floor(Date.now() / 1000);
      let targetTimestamp = 0;

      if (determinePhaseState(phaseType, startsAt, endsAt) === "UPCOMING") {
        targetTimestamp = startsAt;
      } else if (
        determinePhaseState(phaseType, startsAt, endsAt) === "LIVE" &&
        endsAt !== null
      ) {
        targetTimestamp = endsAt;
      }

      if (targetTimestamp > 0) {
        const diff = Math.max(0, targetTimestamp - now);
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        return minutes === 0 && diff > 0;
      }

      return false;
    };

    // Update every second if showing seconds, otherwise every minute
    const intervalTime = isShowingSeconds() ? 1000 : 60000;
    const interval = setInterval(updateTimeDisplay, intervalTime);

    return () => clearInterval(interval);
  }, [phaseType, startsAt, endsAt, isWhitelisted, hasFCFS]);

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
              ? "FCFS"
              : "Public"}
          </p>
          {!isClickable && <Lock1 size={16} color="#D7D8D8" />}
        </div>
        <div className="flex flex-row items-center gap-2 border bg-white8 border-transparent text-md rounded-lg px-3 py-2">
          <span className="text-neutral100 font-medium text-md">{status}</span>
          <span className="text-neutral50 font-medium text-md">
            {timeDisplay}
          </span>
        </div>
      </div>

      {status !== "Ended" && (
        <>
          <div className="flex gap-2">
            <Image
              width={20}
              height={20}
              draggable="false"
              src={BITCOIN_IMAGE}
              alt="Bitcoin icon"
              className="aspect-square h-5 w-5"
            />
            {mintPrice !== undefined && (
              <p className="text-neutral50">
                <span className="mr-1">{mintPrice}</span>
                {getCurrencySymbol(currentLayer.layer)}
              </p>
            )}
          </div>
          <div className="flex justify-between w-full text-md font-medium">
            <h1 className="text-neutral200">Max:</h1>
            <h2 className="text-neutral50">
              <span>{maxMintPerWallet}</span> per wallet
            </h2>
          </div>
        </>
      )}
    </button>
  );
};

export default PhaseCard;
