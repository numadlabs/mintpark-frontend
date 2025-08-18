// auth changes

import React from "react";
import { Progress } from "@/components/ui/progress";
import { LaunchDataType } from "@/lib/types";
import { s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Unlimited } from "iconsax-react";
import { useLaunchState } from "@/lib/hooks/useLaunchState";
import { LAUNCH_STATE } from "@/lib/hooks/useLaunchState";
import {
  findLayerByLayerId,
  getCurrencyIcon,
  getCurrencyImage,
  getCurrencySymbol,
} from "@/lib/service/currencyHelper";
import { useAuth } from "@/components/provider/auth-context-provider";

interface LaunchProps {
  data: LaunchDataType;
  id: string;
  currentLayer: { layer: string } | null;
}

const LaunchpadCard: React.FC<LaunchProps> = ({ data, id, currentLayer }) => {
  const status = useLaunchState(data);
  const isActive =
    status === LAUNCH_STATE.LIVE || status === LAUNCH_STATE.INDEFINITE;

  const { availableLayers } = useAuth();

  const calculateProgress = () => {
    // If the phase is ended or indefinite, return 100% progress
    if (status === LAUNCH_STATE.INDEFINITE || status === LAUNCH_STATE.ENDED) {
      return 100;
    }

    // Handle badge with null supply
    if (data.isBadge && data.badgeSupply === null) {
      return 0;
    }

    // Calculate normal progress based on minted amount and supply
    return data?.supply > 0 ? (data?.mintedAmount / data?.supply) * 100 : 0;
  };

  const renderSupplyDisplay = () => {
    const mintedAmount = data?.mintedAmount ?? 0;
    if (data.isBadge && data.badgeSupply === null) {
      return (
        <span className="flex justify-end items-center gap-1">
          <span className="text-neutral50">{mintedAmount}</span>{" "}
          <span className="text-brand"> / </span>
          {/* ∞ */}
          <span className="text-neutral200">
            <Unlimited size="18" color="#88898A" />
          </span>{" "}
        </span>
      );
    }

    return (
      <span className="flex justify-end items-center gap-1">
        <span className="text-neutral50">{mintedAmount}</span>{" "}
        <span className="text-brand"> / </span>
        <span className="text-neutral200">{data?.supply ?? 0}</span>{" "}
      </span>
    );
  };

  const LaunchLayer = findLayerByLayerId({
    layerId: data?.layerId,
    layers: availableLayers,
  });

  const getMintPrice = (data: LaunchDataType): number => {
    const now = Math.floor(Date.now() / 1000);

    // Define phases with their validation conditions, start/end times, and prices
    const phases = [];

    // Add whitelist phase if configured
    if (data.isWhitelisted && data.wlStartsAt && data.wlEndsAt) {
      phases.push({
        name: "whitelist",
        startsAt: Number(data.wlStartsAt),
        endsAt: Number(data.wlEndsAt),
        price: data.wlMintPrice,
        isActive: now >= Number(data.wlStartsAt) && now < Number(data.wlEndsAt),
      });
    }

    // Add FCFS phase if configured
    if (data.hasFCFS && data.fcfsStartsAt && data.fcfsEndsAt) {
      phases.push({
        name: "fcfs",
        startsAt: Number(data.fcfsStartsAt),
        endsAt: Number(data.fcfsEndsAt),
        price: data.fcfsMintPrice,
        isActive:
          now >= Number(data.fcfsStartsAt) && now < Number(data.fcfsEndsAt),
      });
    }

    // Add public offering phase if price exists
    if (data.poMintPrice !== undefined && data.poMintPrice !== null) {
      const poStartsAt = data.poStartsAt ? Number(data.poStartsAt) : Infinity;
      phases.push({
        name: "po",
        startsAt: poStartsAt,
        endsAt: null, // Assuming PO doesn't necessarily have an end time
        price: data.poMintPrice,
        isActive: data.poStartsAt ? now >= poStartsAt : false,
      });
    }

    // Sort phases by start time (earliest first)
    phases.sort((a, b) => a.startsAt - b.startsAt);

    // Check for active phases first
    const activePhase = phases.find((phase) => phase.isActive);
    if (activePhase) return activePhase.price;

    // If no active phase, find the next upcoming phase
    const upcomingPhase = phases.find((phase) => now < phase.startsAt);
    if (upcomingPhase) return upcomingPhase.price;

    // If all phases have ended, return the price of the last ended phase
    const endedPhases = phases.filter(
      (phase) => phase.endsAt && now >= phase.endsAt
    );
    if (endedPhases.length > 0) {
      // Sort by end time (latest first)
      endedPhases.sort((a, b) => (b.endsAt || 0) - (a.endsAt || 0));
      return endedPhases[0].price;
    }

    // Fallback to PO price or 0
    return data.poMintPrice || 0;
  };

  return (
    <Link
      href={`/launchpad/${id}`}
      className="relative h-auto w-full sm:h-auto sm:w-full md:h-[364px] md:w-full md2:h-auto md2:w-full 3xl:w-[280px] 3xl:h-[412px] flex flex-col backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] p-4 text-neutral00 transition-transform hover:scale-[1.02] duration-300"
    >
      <div className="relative w-full flex justify-center items-center">
        <Image
          width={248}
          height={248}
          draggable="false"
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
            {formatPrice(getMintPrice(data))}
            <span className="ml-1">
              {/* {getCurrencySymbol(currentLayer?.layer || "")} */}
              {getCurrencySymbol(LaunchLayer?.layer || "")}
            </span>
          </p>
        </div>
        <div className="flex h-2 mt-1 border border-white8 rounded-lg border-1">
          <Progress value={calculateProgress()} className="w-full h-full" />
        </div>
        <p className="pt-2 sm:pt-3 font-bold text-sm sm:text-md text-end">
          {renderSupplyDisplay()}
        </p>
      </div>

      <div className="flex justify-between">
        <div className="absolute top-6 left-6 flex flex-row gap-2 items-center justify-around w-fit h-[30px] sm:h-[34px] border border-transparent rounded-lg px-3 py-2 bg-neutral500 bg-opacity-[50%] text-sm sm:text-md text-neutral50 font-medium">
          {isActive && (
            <div className="bg-success20 h-3 w-3 sm:h-4 sm:w-4 rounded-full flex justify-center items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full" />
            </div>
          )}
          <p>{status}</p>
        </div>
        <div className="absolute top-6 right-6 flex flex-row gap-2 items-center justify-around rounded-xl w-fit h-[30px] sm:h-[40px] border border-transparent px-3 py-2  text-sm sm:text-md text-neutral50 font-medium">
          <Image
            width={28}
            height={28}
            draggable="false"
            src={
              LaunchLayer?.layer
                ? getCurrencyImage(LaunchLayer.layer)
                : ""
            }
            alt="Icon"
            className="aspect-square h-7 w-7 rounded-full"
          />
        </div>
      </div>
    </Link>
  );
};

export default LaunchpadCard;
