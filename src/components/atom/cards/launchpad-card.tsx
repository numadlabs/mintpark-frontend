import React from "react";
import moment from "moment";
import { Progress } from "@/components/ui/progress";
import { LaunchDataType } from "@/lib/types";
import { s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Unlimited } from "iconsax-react";
import { useLaunchState } from "@/lib/hooks/useLaunchState";
import { LAUNCH_STATE } from "@/lib/hooks/useLaunchState";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import { useQuery } from "@tanstack/react-query";
import { getLayerById } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";

interface LaunchProps {
  data: LaunchDataType;
  id: string;
}

const LaunchpadCard: React.FC<LaunchProps> = ({ data, id }) => {
  const { authState } = useAuth();
  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });
  const status = useLaunchState(data);
  const isActive =
    status === LAUNCH_STATE.LIVE || status === LAUNCH_STATE.INDEFINITE;

  const calculateProgress = () => {
    if (data.isBadge && data.badgeSupply === null) {
      return 0;
    }
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
            {formatPrice(
              status === LAUNCH_STATE.LIVE && data.isWhitelisted
                ? data.wlMintPrice
                : data.poMintPrice
            )}
            <span className="ml-1">
              {getCurrencySymbol(currentLayer.layer)}
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
