import Image from "next/image";
// import { Progress } from "@/components/ui/progress";
import HoverCard from "@/components/section/collections/hoverCard";
import { Notepad, Profile2User } from "iconsax-react";
import Link from "next/link";
import { CollectionDataType } from "@/lib/types";
import React from "react";
import { s3ImageUrlBuilder } from "@/lib/utils";

export type CardType = {
  data: CollectionDataType;
  handleNav: () => void;
};

const CollectionCard: React.FC<CardType> = ({ data, handleNav }) => {
  return (
    <button
      onClick={handleNav}
      className="backdrop-blur-sm bg-gradient-to-br collection mt-4 from-gradientStart to-transparent border border-neutral400 rounded-xl pl-4 pr-4 pt-4 pb-5 flex flex-col justify-between"
    >
      <Image
        width={248}
        height={248}
        src={s3ImageUrlBuilder(data.logoKey)}
        className="aspect-square rounded-xl"
        alt="png"
      />
      <div className="pt-4 pl-1 grid gap-4 w-full">
        <p className="text-xl font-bold text-start text-neutral00">
          {data.name}
        </p>
        <div className="flex justify-around relative right-6 gap-2">
          <div className="text-start">
            {" "}
            <p className="text-sm font-medium text-neutral200 gap-2">
              Floor price
            </p>
            <p className="pt-2 font-bold text-md text-neutral-50">
              {data.floor === 0
                ? data.floor
                : (data.floor / 10 ** 8).toFixed(4)}
              <span className="ml-1">BTC</span>
            </p>
          </div>
          <div className="text-start">
            {" "}
            <p className="text-sm font-medium text-neutral200 gap-2">Volume</p>
            <p className="pt-2 font-bold text-md text-neutral-50">
              {(data.volume / 10 ** 8).toFixed(4)}
              <span className="ml-1">BTC</span>
            </p>
          </div>
        </div>
        <div className="border border-neutral400 w-full"></div>
        <div className="flex flex-row gap-2 items-center justify-around relative right-[12px]">
          <div className="flex mt-2 items-center">
            <Profile2User color="#d3f85a" className="w-4 h-4" />
            <p className="ml-2 font-medium text-md text-neutral50">
              <span>0</span> owners
            </p>
          </div>
          <div className="flex mt-2 items-center">
            <Notepad color="#d3f85a" className="w-4 h-4" />
            <p className="ml-2 font-medium text-md text-neutral50">
              <span>{data.supply}</span> items
            </p>
          </div>
        </div>
      </div>
      <HoverCard />
    </button>
  );
};

export default CollectionCard;
