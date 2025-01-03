import React from "react";
import Image from "next/image";
import { TickCircle, ArrowRight } from "iconsax-react";
import { ActivityType } from "@/lib/types";
import { truncateAddress,formatPrice } from "@/lib/utils";
import moment from "moment";

interface cardProps {
  imageUrl:string;
  data: ActivityType;
  collectionName: string;
}
const ActivityCard: React.FC<cardProps> = ({
  imageUrl,
  data,
  collectionName,
}) => {
  console.log("🚀 ~ imageUrl:", imageUrl);

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



  return (
    <div className="flex items-center p-3 bg-gray50 rounded-2xl whitespace-nowrap">
      <div className="flex items-center gap-3 shrink-0 w-[360px]">
        <Image
          src={imageUrl}
          sizes="100%"
          alt="image"
          width={48}
          height={48}
          className="rounded-lg"
        />
        <p className="text-md text-neutral50 font-medium">{collectionName}</p>
      </div>
      <div className="w-[220px] text-start shrink-0">
        <div className="flex flex-row items-center gap-2 bg-white4 w-fit h-[34px] px-3 rounded-lg">
          <TickCircle size={16} color="#D7D8D8" />
          <p className="text-md text-neutral50 font-medium">
            {data?.activityType}
          </p>
        </div>
      </div>
      <div className="w-[195px] text-start shrink-0 flex flex-col gap-1">
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
      <div className="w-[260px] shrink-0 gap-2 flex items-center">
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
      <div className="w-[152px] shrink-0 3xl:w-[130px] text-start">
        <p className="text-md text-neutral50 font-medium">
          {getFormattedTime(data?.timestamp)} ago
        </p>
      </div>
    </div>
  );
};

export default ActivityCard;
