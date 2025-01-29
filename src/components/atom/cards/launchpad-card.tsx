import React from "react";
import moment from "moment";
import { Progress } from "@/components/ui/progress";
import { LaunchDataType } from "@/lib/types";
import { s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface LaunchProps {
  data: LaunchDataType;
  id: string;
}

// Helper function to convert timestamps to seconds
const convertToSeconds = (timestamp: number | null | undefined): number => {
  if (!timestamp) return 0;
  const timestampStr = timestamp.toString();
  return timestampStr.length === 13 ? Math.floor(timestamp / 1000) : timestamp;
};

const useLaunchStatus = (data: LaunchDataType) => {
  const now = moment();

  if (data.supply > 0 && data.mintedAmount >= data.supply) {
    return "Ended";
  }

  // Convert all timestamps
  const wlStartsAt = convertToSeconds(data.wlStartsAt);
  const wlEndsAt = convertToSeconds(data.wlEndsAt);
  const poStartsAt = convertToSeconds(data.poStartsAt);
  const poEndsAt = convertToSeconds(data.poEndsAt);

  // Check for invalid timestamps first
  if (!wlStartsAt && !wlEndsAt && !poStartsAt && !poEndsAt) {
    return "Invalid";
  }

  const wlStartMoment = wlStartsAt ? moment.unix(wlStartsAt) : null;
  const wlEndMoment = wlEndsAt ? moment.unix(wlEndsAt) : null;
  const poStartMoment = poStartsAt ? moment.unix(poStartsAt) : null;
  const poEndMoment = poEndsAt ? moment.unix(poEndsAt) : null;

  // Handle Indefinite status
  if (
    (wlEndsAt === 0 || poEndsAt === 0) &&
    (wlStartsAt > 0 || poStartsAt > 0)
  ) {
    const activeStartMoment =
      data.isWhitelisted && wlStartMoment ? wlStartMoment : poStartMoment;

    if (activeStartMoment && now.isAfter(activeStartMoment)) {
      return "Indefinite";
    }
    return "Upcoming";
  }

  // Handle cases where startAt is not set
  if (!wlStartsAt && !poStartsAt) {
    return "Upcoming";
  }

  // Determine if whitelist period should be shown
  const shouldShowWhitelistTimer = () => {
    if (!data.isWhitelisted) return false;
    if (!wlStartsAt) return false;
    if (poStartMoment && poStartMoment.isBefore(wlStartMoment)) return false;
    return true;
  };

  const shouldUseWl = shouldShowWhitelistTimer();

  // Check transition between WL and PO periods
  if (shouldUseWl && wlEndMoment && now.isAfter(wlEndMoment)) {
    // If PO period exists
    if (poStartMoment) {
      // Gap between WL end and PO start
      if (now.isBefore(poStartMoment)) {
        return "Upcoming";
      }
      // PO period is active
      if (!poEndMoment || now.isBefore(poEndMoment)) {
        return "Live";
      }
      // PO period has ended
      if (now.isAfter(poEndMoment)) {
        return "Ended";
      }
    }
    // No PO period after WL
    return "Ended";
  }

  // Handle regular status checks
  const activeStartMoment = shouldUseWl ? wlStartMoment : poStartMoment;
  const activeEndMoment = shouldUseWl ? wlEndMoment : poEndMoment;

  if (!activeStartMoment) {
    return "Upcoming";
  }

  if (now.isBefore(activeStartMoment)) {
    return "Upcoming";
  }

  if (!activeEndMoment || now.isBetween(activeStartMoment, activeEndMoment)) {
    return "Live";
  }

  if (now.isAfter(activeEndMoment)) {
    // Check if there's a following period
    if (shouldUseWl && poStartMoment) {
      if (now.isBefore(poStartMoment)) {
        return "Upcoming";
      }
      if (!poEndMoment || now.isBefore(poEndMoment)) {
        return "Live";
      }
    }
    return "Ended";
  }

  return "Upcoming";
};

const LaunchpadCard: React.FC<LaunchProps> = ({ data, id }) => {
  const status = useLaunchStatus(data);
  const isActive = status === "Live" || status === "Indefinite";

  return (
    <Link
      href={`/launchpad/${id}`}
      className="relative h-auto w-full sm:h-auto sm:w-full md:h-[364px] md:w-full md2:h-auto md2:w-full 3xl:w-[280px] 3xl:h-[412px] flex flex-col backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] p-4 text-neutral00 transition-transform hover:scale-[1.02] duration-300"
    >
      <div className="relative w-full flex justify-center items-center">
        <Image
          width={248}
          height={248}
          src={data?.logoKey ? s3ImageUrlBuilder(data.logoKey) : ""}
          className="object-cover rounded-xl aspect-square"
          alt={`${data.name || "Launchpad"} logo`}
        />
      </div>

      <div className="flex-1 w-full text-neutral00">
        <p className="pt-3 pb-3 text-lg sm:text-lg md:text-lg font-bold text-neutral50 line-clamp-2">
          {data?.name}
        </p>
        <div className="flex justify-between py-2 sm:py-3">
          <p className="font-medium text-sm sm:text-md text-neutral100">
            Price
          </p>
          <p className="font-bold text-sm sm:text-md text-neutral50">
            {formatPrice(
              status.includes("WL") ? data.wlMintPrice : data.poMintPrice
            )}
            <span className="ml-1">cBTC</span>
          </p>
        </div>
        <div className="flex h-2 mt-1 border border-white8 rounded-lg border-1">
          <Progress
            value={
              data?.supply > 0 ? (data?.mintedAmount / data?.supply) * 100 : 0
            }
            className="w-full h-full"
          />
        </div>
        <p className="pt-2 sm:pt-3 font-bold text-sm sm:text-md text-end">
          {data?.mintedAmount ?? 0}
          <span className="text-brand"> / </span>
          {data?.supply ?? 0}
        </p>
      </div>

      <div className="absolute top-6 left-6 flex flex-row gap-2 items-center justify-around w-fit h-[30px] sm:h-[34px] border border-transparent rounded-lg px-3 py-2 bg-neutral500 bg-opacity-[50%] text-sm sm:text-md text-neutral50 font-medium">
        {isActive && (
          <div className="bg-success20 h-3 w-3 sm:h-4 sm:w-4 rounded-full flex justify-center items-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full" />
          </div>
        )}
        <p>{status}</p>
      </div>
    </Link>
  );
};

export default LaunchpadCard;
