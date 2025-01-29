import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Lock1 } from "iconsax-react";
import moment from "moment";
import { BITCOIN_IMAGE } from "@/lib/constants";

interface PhaseCardProps {
  maxMintPerWallet: number | string;
  mintPrice: number;
  mintedAmount: number;
  endsAt: number;
  startsAt: number;
  supply: number;
  isActive: boolean;
  onClick: () => void;
  phaseType: "guaranteed" | "public";
}

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
}) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = moment();
      const convertToSeconds = (timestamp: number) => {
        return timestamp.toString().length === 13
          ? Math.floor(timestamp / 1000)
          : timestamp;
      };

      if (supply > 0 && mintedAmount >= supply) {
        setStatus("Ended");
        setTimeDisplay("");
        setIsClickable(false);
        return;
      }

      const formatTimeDisplay = (duration: moment.Duration) => {
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();

        // If all larger units are 0, return empty string
        if (days === 0 && hours === 0 && minutes === 0) {
          return "";
        }

        if (days > 0) {
          return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes
            .toString()
            .padStart(2, "0")}m`;
        } else if (hours > 0) {
          return `${hours.toString().padStart(2, "0")}h ${minutes
            .toString()
            .padStart(2, "0")}m`;
        } else {
          return `${minutes.toString().padStart(2, "0")}m`;
        }
      };

      // Check if endsAt is 0 or null
      const isIndefiniteEnd = !endsAt || endsAt === 0;

      // If startsAt exists but endsAt is indefinite
      if (startsAt && isIndefiniteEnd) {
        const startMoment = moment.unix(convertToSeconds(startsAt));

        if (now.isBefore(startMoment)) {
          const timeLeft = formatTimeDisplay(
            moment.duration(startMoment.diff(now))
          );
          setStatus("Starts in:");
          setTimeDisplay(timeLeft);
          setIsClickable(timeLeft === ""); // Becomes clickable when time display disappears
          return;
        } else {
          setStatus("Indefinite");
          setTimeDisplay("");
          setIsClickable(true);
          return;
        }
      }

      // Handle case when both startsAt and endsAt exist
      if (startsAt && endsAt) {
        const startMoment = moment.unix(convertToSeconds(startsAt));
        const endMoment = moment.unix(convertToSeconds(endsAt));

        if (now.isAfter(endMoment)) {
          setStatus("Ended");
          setTimeDisplay("");
          setIsClickable(false);
          return;
        }

        if (now.isBetween(startMoment, endMoment)) {
          const timeLeft = formatTimeDisplay(
            moment.duration(endMoment.diff(now))
          );
          setStatus("Ends in:");
          setTimeDisplay(timeLeft);
          setIsClickable(true);
          return;
        }

        if (now.isBefore(startMoment)) {
          const timeLeft = formatTimeDisplay(
            moment.duration(startMoment.diff(now))
          );
          setStatus("Starts in:");
          setTimeDisplay(timeLeft);
          setIsClickable(timeLeft === ""); // Becomes clickable when time display disappears
        }
      }

      // Handle case when neither exists
      if (!startsAt && !endsAt) {
        setStatus("Indefinite");
        setTimeDisplay("");
        setIsClickable(true);
      }
    };

    updateTime();
    // Update every second to check for time transitions
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startsAt, endsAt, supply, mintedAmount]);

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
