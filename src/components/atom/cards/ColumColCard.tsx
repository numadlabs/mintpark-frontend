import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CollectionDataType } from "@/lib/types";
import { s3ImageUrlBuilder } from "@/lib/utils";

interface CardProps {
  data: CollectionDataType;
  handleNav: () => void;
}
const ColumColCard: React.FC<CardProps> = ({ data, handleNav }) => {
  return (
    <>
      <button
        onClick={handleNav}
        className="flex justify-around items-center collection bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%]  rounded-2xl pt-4 pr-8 pb-4 pl-4"
      >
        <div className="flex w-[376px] h-16 gap-5">
          <Image
            width={64}
            height={64}
            src={s3ImageUrlBuilder(data.logoKey)}
            className="aspect-square rounded-lg"
            alt="png"
          />
          <p className="text-neutral50 font-medium text-xl flex items-center">
            {data.name}
          </p>
        </div>
        <div className="w-[468px] h-[42px] flex justify-around items-center">
          <div className="text-right items-center grid gap-1">
            <p className="font-medium text-lg2 text-neutral50">
              ${(data.floor).toFixed(4)}
              <span className="ml-1">BTC</span>
            </p>

            <span className="font-medium text-md text-start text-neutral200">
              ${((data.floor) * 65000).toFixed(1)}
            </span>
          </div>
          <div className="text-right grid gap-1">
            <p className="font-medium text-lg2 text-neutral50">
              ${(data.volume).toFixed(4)}
              <span className="ml-1">BTC</span>
            </p>
            <span className="font-medium text-start text-md text-neutral200">
              ${((data.volume) * 65000).toFixed(1)}k
            </span>
          </div>
          <div className="text-right grid gap-1">
            <p className="font-medium text-lg2 text-neutral50">
            ${((data.marketCap)).toFixed(4)}

              <span className="ml-1">BTC</span>
            </p>
            <span className="font-medium text-md text-start text-neutral200">
              ${((data.marketCap) * 65000).toFixed(1)}k
            </span>
          </div>
        </div>
        <div className="w-[324px] h-5 flex justify-around">
          <span className="font-medium text-lg2 text-neutral50">
            {data.soldCount}
          </span>
          <span className="font-medium text-lg2 text-neutral50">
            {data.listedCount}
          </span>
          <span className="font-medium text-lg2 text-neutral50">
            <span>{0}</span>
          </span>
        </div>
      </button>
    </>
  );
};
export default ColumColCard;
