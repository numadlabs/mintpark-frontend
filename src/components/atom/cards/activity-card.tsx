import React from "react";
import Image from "next/image";
import { TickCircle, ArrowRight } from "iconsax-react";
import { ActivityType } from "@/lib/types";
import { truncateAddress, formatPrice, getFormattedTime } from "@/lib/utils";
import {
  getAddressExplorerUrl,
  getCurrencySymbol,
} from "@/lib/service/currencyHelper";
import Link from "next/link";

interface cardProps {
  imageUrl: string;
  data: ActivityType;
  currentLayer: string;
  currenAsset: string;
}

const ActivityCard: React.FC<cardProps> = ({
  imageUrl,
  data,
  currentLayer,
  currenAsset,
}) => {
  // Handle different activity types
  const isMintedOrTransfer =
    data?.activityType === "TRANSFER" || data?.activityType === "MINTED";
  const showToAddress = data?.activityType === "SOLD" && data?.toAddress;

  // Safely convert price from string to number
  const priceInEth = data?.price ? Number(data.price) / 10 ** 18 : 0;
  const priceInUsd = priceInEth * 2404.37; // Assuming ETH price is 2489.56

  return (
    <>
      <div className="flex items-center p-3 bg-gray50 rounded-2xl whitespace-nowrap hover:bg-neutral400 hover:bg-opacity-30">
        <Link href={`/assets/${data.collectionId}`}>
          <div className="flex items-center gap-3 shrink-0 w-[360px]">
            <Image
              src={imageUrl}
              sizes="100%"
              alt={currenAsset}
              width={48}
              height={48}
              draggable="false"
              className="rounded-lg"
            />

            <p className="text-md text-neutral50 font-medium">{currenAsset}</p>
          </div>
        </Link>

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
            {isMintedOrTransfer ? "-" : priceInEth}{" "}
            {isMintedOrTransfer ? "" : getCurrencySymbol(currentLayer)}
          </p>
          <p className="text-sm text-neutral200 font-medium">
            {isMintedOrTransfer ? "" : "$"}{" "}
            {isMintedOrTransfer ? "" : formatPrice(priceInUsd)}
          </p>
        </div>
        <div className="w-[260px] shrink-0 gap-2 flex items-center">
          <a
            href={getAddressExplorerUrl(currentLayer, data?.fromAddress || "")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-md text-neutral50 font-medium hover:text-brand transition-colors cursor-pointer"
          >
            {truncateAddress(data?.fromAddress)}
          </a>
          {showToAddress && (
            <div className="gap-2 flex flex-row items-center">
              <ArrowRight size={16} color="#88898A" />
              <a
                href={getAddressExplorerUrl(
                  currentLayer,
                  data?.toAddress || ""
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-neutral50 font-medium hover:text-brand transition-colors cursor-pointer"
              >
                {truncateAddress(data?.toAddress || "")}
              </a>
            </div>
          )}
        </div>
        <div className="w-[152px] shrink-0 3xl:w-[130px] text-start 3xl:text-end">
          <p className="text-md text-neutral50 font-medium">
            {getFormattedTime(data?.timestamp)} ago
          </p>
        </div>
      </div>
    </>
  );
};

export default ActivityCard;
