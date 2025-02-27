import React from "react";
import Image from "next/image";
import { CollectionDataType } from "@/lib/types";
import { getPriceData, s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/provider/auth-context-provider";
import { useQuery } from "@tanstack/react-query";
import { getLayerById } from "@/lib/service/queryHelper";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";

interface CardProps {
  data: CollectionDataType;
  handleNav: () => void;
}

const CollectionCardList: React.FC<CardProps> = ({ data, handleNav }) => {
  const { authState } = useAuth();
  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });
  const citreaPrice = getPriceData();

  return (
    <button
      onClick={handleNav}
      className="w-full flex transition-colors h-[96px] collection bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%] rounded-2xl pt-4 pb-4 pl-4 pr-8 items-center"
    >
      <div className="flex w-full items-center">
        {/* Collection Info */}
        <div className="flex items-center gap-4 w-[436px]">
          <div className="relative flex-shrink-0">
            <Image
              width={64}
              draggable="false"
              height={64}
              src={s3ImageUrlBuilder(data?.logoKey)}
              className="rounded-lg object-cover"
              alt={`${data.name || "Collection"} logo`}
            />
          </div>
          <p className="text-neutral50 font-medium text-lg lg:text-xl truncate">
            {data.name}
          </p>
        </div>

        <div className="text-right w-[240px]">
          <p className="font-medium text-lg text-neutral50">
            {formatPrice(data.floor)}
            <span className="ml-1 text-lg">
              {getCurrencySymbol(currentLayer.layer)}
            </span>
          </p>
          <span className="font-medium text-md text-neutral200">
            ${formatPrice(data.floor * citreaPrice)}k
          </span>
        </div>

        <div className="text-right w-[240px]">
          <p className="font-medium text-lg text-neutral50">
            {formatPrice(data.volume)}
            <span className="ml-1 text-sm">
              {getCurrencySymbol(currentLayer.layer)}
            </span>
          </p>
          <span className="font-medium text-md  text-neutral200">
            ${formatPrice(data.volume * citreaPrice)}k
          </span>
        </div>

        <div className="text-right w-[240px]">
          <p className="font-medium text-lg text-neutral50">
            {formatPrice(data.marketCap)}
            <span className="ml-1 text-xs sm:text-sm">
              {getCurrencySymbol(currentLayer.layer)}
            </span>
          </p>
          <span className="font-medium text-md text-neutral200">
            ${formatPrice(data.marketCap * citreaPrice)}k
          </span>
        </div>

        <div className="font-medium w-[240px] text-right text-lg  text-neutral50">
          {data.soldCount}
        </div>
        <div className="font-medium w-[240px] text-right text-lg  text-neutral50">
          {data.listedCount}
        </div>
        <div className="font-medium w-[240px] text-right text-lg  text-neutral50">
          {data?.ownerCount ? data?.ownerCount : 0}
        </div>
      </div>
    </button>
  );
};

export default CollectionCardList;
