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
};

const CollectionCard: React.FC<CardType> = ({ data }) => {
  return (
    <Link
      href={`/collections/${data.id}`}
      className="backdrop-blur-sm bg-gradient-to-br collection mt-4 from-gradientStart to-transparent border border-neutral400 rounded-xl pl-4 pr-4 pt-4 pb-5 flex flex-col justify-between"
    >
      <Image
        width={248}
        height={248}
        src={s3ImageUrlBuilder(data.logoKey)}
        className="aspect-square rounded-xl"
        alt="png"
      />
      <div className="pt-1 pl-1 ">
        <p className="py-3 text-xl font-bold text-neutral00">{data.name}</p>
        <div className="flex justify-around relative right-6 gap-2 py-2">
          <div>
            {" "}
            <p className="text-sm font-medium text-neutral200 gap-2">
              Floor price
            </p>
            <p className="pt-2 font-bold text-md text-neutral-50">
              {data.floor}
              <span className="ml-1">BTC</span>
            </p>
          </div>
          <div>
            {" "}
            <p className="text-sm font-medium text-neutral200 gap-2">Volume</p>
            <p className="pt-2 font-bold text-md text-neutral-50">
              {data.volume}
              <span className="ml-1">BTC</span>
            </p>
          </div>
        </div>
        <div className="border border-neutral400 mb-4 mt-4"></div>
        <div className="flex justify-around relative right-[12px]">
          <div className="flex mt-2">
            <Profile2User color="#d3f85a" className="w-4 h-4" />
            <p className="ml-2 font-medium text-md text-neutral50">
              <span>{data.floor}</span> owners
            </p>
          </div>
          <div className="flex mt-2">
            <Notepad color="#d3f85a" className="w-4 h-4" />
            <p className="ml-2 font-medium text-md text-neutral50">
              <span>{data.floor}k</span> items
            </p>
          </div>
        </div>
      </div>
      <HoverCard />
    </Link>
  );
};

export default CollectionCard;
