import React, { useEffect, useState, useRef } from "react";
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function determinePhaseState(
    phase: string,
    startsAt: number,
    endsAt: number | null
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

  // This function is no longer needed as the logic was moved directly into updateTimeDisplay
  // to avoid potential mismatches between the state determination in multiple places

  const updateTimeDisplay = () => {
    const now = Math.floor(Date.now() / 1000);
    const launchState = determinePhaseState(phaseType, startsAt, endsAt);

    // Debug info to help diagnose issues
    // console.log(`Phase: ${phaseType}, State: ${launchState}, Now: ${now}, StartAt: ${startsAt}, EndAt: ${endsAt}`);

    // Calculate timer update frequency
    // Always initialize as true - we'll set to false only for specific cases
    let showTimer = true;

    // Always clear existing interval first to prevent multiple intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Handle all possible states
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
          showTimer = false;
        } else {
          setStatus("Ends in:");
          setTimeDisplay(formatTimeDisplay(endsAt));
        }
        setIsClickable(true);
        break;

      case "INDEFINITE":
        setStatus("Live");
        setTimeDisplay(""); // Changed from "Indefinite" to empty string
        showTimer = false;
        setIsClickable(true);
        break;

      case "ENDED":
        setStatus("Ended");
        setTimeDisplay("");
        showTimer = false;
        setIsClickable(false);
        break;

      default:
        setStatus("Unknown");
        setTimeDisplay("");
        showTimer = false;
        setIsClickable(false);
    }

    // Set a new interval if we need to update a timer
    if (showTimer) {
      // Check if we're showing seconds
      const timeLeft =
        launchState === "UPCOMING"
          ? Math.max(0, startsAt - now)
          : endsAt
          ? Math.max(0, endsAt - now)
          : 0;

      // Show seconds when under 10 minutes remaining
      const showingSeconds = timeLeft > 0 && timeLeft < 600;

      // Set appropriate interval
      const newIntervalTime = showingSeconds ? 1000 : 60000;

      // console.log(`Setting interval to ${newIntervalTime}ms, time left: ${timeLeft} seconds`);

      intervalRef.current = setInterval(() => {
        updateTimeDisplay();
      }, newIntervalTime);
    } else {
      // console.log("No timer needed, not setting interval");
    }
  };

  // Main effect for phase state changes and timer updates
  useEffect(() => {
    // Initial update
    updateTimeDisplay();

    // Set up an immediate check to ensure we're responsive to state changes
    const immediateCheck = setTimeout(() => {
      updateTimeDisplay();
    }, 100);

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(immediateCheck);
    };
  }, [phaseType, startsAt, endsAt, isWhitelisted, hasFCFS]);

  // Force re-render on component visible or window focus change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateTimeDisplay();
      }
    };

    const handleFocus = () => {
      updateTimeDisplay();
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Check for phase transition times and force updates
  useEffect(() => {
    // Special effect to catch exact transition moments
    // For example, when a phase is about to start or end

    const now = Math.floor(Date.now() / 1000);
    let timeUntilNextTransition = Number.MAX_SAFE_INTEGER;

    // Time until start
    if (now < startsAt) {
      timeUntilNextTransition = startsAt - now;
    }

    // Time until end (if there's an end time)
    if (endsAt && now < endsAt && endsAt - now < timeUntilNextTransition) {
      timeUntilNextTransition = endsAt - now;
    }

    // If we have a transition coming soon (within 1 hour), set a specific timeout
    if (timeUntilNextTransition < 3600) {
      const transitionTimeout = setTimeout(() => {
        updateTimeDisplay();
      }, timeUntilNextTransition * 1000 + 100); // Add 100ms buffer

      return () => {
        clearTimeout(transitionTimeout);
      };
    }
  }, [startsAt, endsAt]);

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
