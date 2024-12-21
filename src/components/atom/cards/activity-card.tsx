import React from "react";
import Image from "next/image";
import { TickCircle, ArrowRight } from "iconsax-react";
import { ActivityType } from "@/lib/types";
import { s3ImageUrlBuilder } from "@/lib/utils";
import moment from "moment";

interface cardProps {
  fileKey: string;
  data: ActivityType;
  collectionName: string;
}

const ActivityCard: React.FC<cardProps> = ({
  fileKey,
  data,
  collectionName,
}) => {
  console.log("🚀 ~ fileKey:", fileKey);
  const truncateAddress = (address: string) => {
    if (address?.length <= 10) return address;
    return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
  };

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
      return `${diffDays}d`;
    }
  };

  const formatPrice = (price: number) => {
    const btcAmount = price;
    return btcAmount?.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  //todo tur fileKey gd yvsan imageUrl bolgoj oorchloh
  return (
    <div className="flex flex-row items-center p-3 bg-gray50 rounded-2xl whitespace-nowrap">
      <div className="flex flex-row items-center gap-3 max-w-[360px] w-full">
        <Image
          src={fileKey}
          sizes="100%"
          alt="image"
          width={48}
          height={48}
          className="rounded-lg"
        />
        <p className="text-md text-neutral50 font-medium">{collectionName}</p>
      </div>
      <div className="max-w-[220px] w-full">
        <div className="flex flex-row items-center gap-2 bg-white4 w-fit h-[34px] px-3 rounded-lg">
          <TickCircle size={16} color="#D7D8D8" />
          <p className="text-md text-neutral50 font-medium">
            {data?.activityType}
          </p>
        </div>
      </div>
      <div className="max-w-[200px] w-full flex flex-col gap-1">
        <p className="text-md text-neutral50 font-medium">
          {data?.activityType === "MINTED" || data?.activityType === "TRANSFER"
            ? "-"
            : data?.price / 10 ** 18}{" "}
          {data?.activityType === "MINTED" || data?.activityType === "TRANSFER"
            ? ""
            : "cBTC"}
        </p>
        <p className="text-sm text-neutral200 font-medium">
          {data?.activityType === "MINTED" || data?.activityType === "TRANSFER"
            ? ""
            : "$"}{" "}
          {data?.activityType === "MINTED" || data?.activityType === "TRANSFER"
            ? ""
            : formatPrice((data?.price * 65000) / 10 ** 18)}
        </p>
      </div>
      <div className="max-w-[260px] w-full gap-2 flex flex-row items-center">
        <p className="text-md text-neutral50 font-medium">
          {truncateAddress(data?.fromAddress)}
        </p>
        {data?.activityType === "LISTED" ? (
          ""
        ) : (
          <div className="gap-2 flex flex-row items-center">
            <ArrowRight size={16} color="#88898A" />
            <p className="text-md text-neutral50 font-medium">
              {truncateAddress(data?.toAddress)}
            </p>
          </div>
        )}
      </div>
      <div className="max-w-[152px] w-full">
        <p className="text-md text-neutral50 font-medium">
          {getFormattedTime(data?.timestamp)} ago
        </p>
      </div>
    </div>
  );
};

export default ActivityCard;
