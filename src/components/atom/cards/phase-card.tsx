import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Lock1 } from "iconsax-react";
import moment from "moment";
import { BITCOIN_IMAGE } from "@/lib/constants";
import { useLaunchState, LAUNCH_STATE } from "@/lib/hooks/useLaunchState";

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
  phaseType: "guaranteed" | "public";
  isWhitelisted?: boolean;
}

const formatTimeDisplay = (targetTimestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, targetTimestamp - now);

  if (diff === 0) return "";

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);

  return `${days}d ${hours}h ${minutes}m`;
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
}) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");
  const [isClickable, setIsClickable] = useState(false);

  const launchState = useLaunchState({
    isWhitelisted,
    wlStartsAt: phaseType === "guaranteed" ? startsAt : 0,
    wlEndsAt: phaseType === "guaranteed" ? endsAt : 0,
    poStartsAt: phaseType === "public" ? startsAt : 0,
    poEndsAt: phaseType === "public" ? endsAt : 0,
    mintedAmount,
    supply,
    isBadge,
    badgeSupply,
    id: "",
    name: "",
    creator: "",
    description: "",
    type: "",
    logoKey: "",
    layerId: "",
    launchId: "",
    wlMintPrice: 0,
    wlMaxMintPerWallet: 0,
    poMintPrice: 0,
    poMaxMintPerWallet: 0,
    createdAt: "",
  });

  useEffect(() => {
    const updateTimeDisplay = () => {
      const now = Math.floor(Date.now() / 1000);

      switch (launchState) {
        case LAUNCH_STATE.UPCOMING:
          setStatus("Starts in");
          setTimeDisplay(formatTimeDisplay(startsAt));
          setIsClickable(false);
          break;
        case LAUNCH_STATE.LIVE:
          if (endsAt === null) {
            setStatus("Live");
            setTimeDisplay("");
          } else {
            setStatus("Ends in");
            setTimeDisplay(formatTimeDisplay(endsAt));
          }
          setIsClickable(true);
          break;
        case LAUNCH_STATE.INDEFINITE:
          setStatus("Live");
          setTimeDisplay("");
          setIsClickable(true);
          break;
        case LAUNCH_STATE.ENDED:
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
    const interval = setInterval(updateTimeDisplay, 60000);

    return () => clearInterval(interval);
  }, [launchState, startsAt, endsAt]);

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
            {phaseType === "guaranteed" ? "Guaranteed" : "Public"}
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
                cBTC
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
