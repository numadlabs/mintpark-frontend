import React from "react";
import Image from "next/image";
import { ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";

// Define the type for the component props
interface ColDetailCardsProps {
  data: {
    fileKey?: string;
    uniqueIdx: string;
    name: string;
    price: number;
    floorDifference?: number;
    ownedBy: string | null;
    createdAt: number;
  };
}

const TruncatedAddress = ({ address }: { address: string | null }) => {
  if (!address) return <span>-</span>;
  return (
    <span
      title={address}
    >{`${address.slice(0, 4)}...${address.slice(-4)}`}</span>
  );
};

const ColDetailCards: React.FC<ColDetailCardsProps> = ({ data }) => {
  return (
    <section className="flex w-full justify-between items-center gap-24 bg-neutral500 bg-opacity-50 hover:bg-neutral400 hover:bg-opacity-30 rounded-2xl p-4">
      <div className="flex w-[392px] h-16 gap-5">
        <Image
          width={64}
          height={64}
          src={
            data.fileKey
              ? s3ImageUrlBuilder(data.fileKey)
              : ordinalsImageCDN(data.uniqueIdx)
          }
          className="aspect-square rounded-lg"
          alt={`${data.name} image`}
        />
        <p className="text-neutral50 font-medium text-xl flex items-center">
          {data.name}
        </p>
      </div>
      <div className="grid grid-cols-4 w-full text-start">
        <div className="w-full max-w-[200px] grid gap-1 h-[18px]">
          <p className="font-medium text-lg2 text-neutral50">
            {(data.price / 10 ** 8).toFixed(2)}
            <span className="ml-1">BTC</span>
          </p>
          <p>
            {" "}
            <p className="font-medium text-sm text-neutral200">
              {(data.price / 10 ** 8).toFixed(2)}
              <span className="ml-1">BTC</span>
            </p>
          </p>
        </div>
        <div className="w-full max-w-[200px] pr-3 h-[18px]">
          <p
            className={`font-medium text-lg2 ${(data.floorDifference ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {(data.floorDifference ?? 0) >= 0 ? "+" : ""}
            {data.floorDifference ?? 0}%
          </p>
        </div>
        <div className="w-full max-w-[200px] h-[18px]">
          <p className="font-medium text-lg2 text-neutral50">
            <TruncatedAddress address={data.ownedBy} />
          </p>
        </div>
        <div className="w-full max-w-[200px] h-[18px] group relative">
          <span className="font-medium text-lg2 text-neutral50">
            <span className="group-hover:hidden">
              {data.createdAt} days ago
            </span>
            <span className="hidden group-hover:block absolute -top-2 -left-[60px] text-white bg-white bg-opacity-25 py-2 px-5 rounded-lg cursor-pointer transition-opacity duration-300 ease-in-out">
              Buy now
            </span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default ColDetailCards;
