import React from "react";
import Image from "next/image";
import { TickCircle, ArrowRight } from "iconsax-react";
import { ActivityType } from "@/lib/types";
import { truncateAddress, formatPrice, s3ImageUrlBuilder } from "@/lib/utils";
import moment from "moment";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import { useQuery } from "@tanstack/react-query";
import { getLayerById } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";

interface cardProps {
  data: ActivityType;
  currentLayer: string;
}

const CollectionActivityCard: React.FC<cardProps> = ({
  data,
  currentLayer,
}) => {
  // const { authState } = useAuth();
  const getFormattedTime = (timestamp?: number) => {
    if (!timestamp) return "-";

    const now = moment();
    const date = moment.unix(timestamp);
    const diffMinutes = now.diff(date, "minutes");
    const diffHours = now.diff(date, "hours");
    const diffDays = now.diff(date, "days");

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return `${diffDays}days`;
    }
  };

  const isTransferType =
    data?.activityType === "TRANSFER" || data?.activityType === "MINTED";
  const showToAddress = data?.activityType === "SOLD" && data?.toAddress;
  const priceInEth = data?.price ? Number(data.price) / 10 ** 18 : 0;
  const priceInUsd = priceInEth * 2489.56; 

  return (
    <div className="flex items-center p-3 bg-gray50 rounded-2xl whitespace-nowrap hover:bg-neutral400 hover:bg-opacity-30 cursor-pointer">
      <div className="flex min-w-[355px] w-full max-w-[510px] gap-3">
        <Image
          src={s3ImageUrlBuilder(data.fileKey)}
          sizes="100%"
          alt={data?.name}
          width={48}
          height={48}
          draggable="false"
          className="rounded-lg"
        />
        <p className="text-md text-neutral50 font-medium">{data?.name}</p>
      </div>
      <div className="min-w-[190px] w-full max-w-[375px] text-end">
        <div className="flex flex-row items-center gap-2 bg-white4 w-fit h-[34px] px-3 rounded-lg">
          <TickCircle size={16} color="#D7D8D8" />
          <p className="text-md text-neutral50 font-medium">
            {data?.activityType}
          </p>
        </div>
      </div>
      <div className="min-w-[90px] w-full max-w-[350px] text-start flex flex-col gap-1">
        <p className="text-md text-neutral50 font-medium">
          {isTransferType ? "-" : priceInEth}{" "}
          {isTransferType ? "" : getCurrencySymbol(currentLayer)}
        </p>
        <p className="text-sm text-neutral200 font-medium">
          {isTransferType ? "" : "$"}{" "}
          {isTransferType ? "" : formatPrice(priceInUsd)}
        </p>
      </div>
      <div className="min-w-[90px] w-full max-w-[260px]  gap-2 flex items-center">
        <p className="text-md text-neutral50 font-medium">
          {truncateAddress(data?.fromAddress)}
        </p>
        {showToAddress && (
          <div className="gap-2 flex flex-row items-center">
            <ArrowRight size={16} color="#88898A" />
            <p className="text-md text-neutral50 font-medium">
              {truncateAddress(data?.toAddress || "")}
            </p>
          </div>
        )}
      </div>
      <div className="w-[152px] shrink-0 3xl:w-[200px] text-end">
        <p className="text-md text-neutral50 font-medium">
          {getFormattedTime(data?.timestamp)} ago
        </p>
      </div>
    </div>
  );
};

export default CollectionActivityCard;
