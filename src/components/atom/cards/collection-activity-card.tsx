import React from "react";
import Image from "next/image";
import { TickCircle, ArrowRight } from "iconsax-react";
import { CollectibleActivityType } from "@/lib/types";
import {
  truncateAddress,
  formatPrice,
  s3ImageUrlBuilder,
  getFormattedTime,
} from "@/lib/utils";
import {
  getAddressExplorerUrl,
  getCurrencySymbol,
} from "@/lib/service/currencyHelper";
import Link from "next/link";

interface cardProps {
  data: CollectibleActivityType;
  currentLayer: { layer: string } | null;
}

const CollectionActivityCard: React.FC<cardProps> = ({
  data,
  currentLayer,
}) => {
  const isTransferType =
    data?.activityType === "TRANSFER" || data?.activityType === "MINTED";
  const showToAddress = data?.activityType === "SOLD" && data?.toAddress;
  const priceInEth = data?.price ? Number(data.price) / 10 ** 18 : 0;
  const priceInUsd = priceInEth * 2489.56;

  return (
    <>
      <div className="flex items-center p-3 bg-gray50 rounded-2xl whitespace-nowrap hover:bg-neutral400 hover:bg-opacity-30">
        <Link
          className="flex items-center min-w-[355px] w-full max-w-[510px] gap-3"
          href={`/assets/${data.collectibleId}`}
        >
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
        </Link>
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
            {isTransferType ? "" : getCurrencySymbol(currentLayer?.layer || "unknown")}
          </p>
          <p className="text-sm text-neutral200 font-medium">
            {isTransferType ? "" : "$"}{" "}
            {isTransferType ? "" : formatPrice(priceInUsd)}
          </p>
        </div>
        <div className="min-w-[90px] w-full max-w-[260px] gap-2 flex items-center">
          <a
            href={getAddressExplorerUrl(currentLayer?.layer || "unknown", data?.fromAddress || "")}
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
                  currentLayer?.layer || "unknown",
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
        <div className="w-[152px] shrink-0 3xl:w-[200px] text-start 3xl:text-end">
          <p className="text-md text-neutral50 font-medium">
            {getFormattedTime(data?.timestamp)} ago
          </p>
        </div>
      </div>
    </>
  );
};

export default CollectionActivityCard;
