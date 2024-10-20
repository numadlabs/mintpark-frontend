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
    createdAt: string; // Change this to string as we'll pass an ISO date string
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

const getDaysAgo = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const ColDetailCards: React.FC<ColDetailCardsProps> = ({ data }) => {
  const daysAgo = getDaysAgo(data.createdAt);

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
      <div className="flex justify-end items-center w-full text-start">
        <div className="w-full max-w-[200px] grid gap-1 h-[18px]">
          <p className="font-medium text-lg2 text-neutral50">
            {(data.price / 10 ** 8).toFixed(2)}
            <span className="ml-1">BTC</span>
          </p>
          <p>
            {" "}
            <p className="font-medium text-sm text-neutral200">
            <span className="mr-1">$</span>
              {(data.price / 10 ** 8*165000).toFixed(2)}
              <span className="">k</span>
            </p>
          </p>
        </div>
        <div className="w-full max-w-[200px] h-[18px]">
          <p
            className={`font-medium text-lg2 ${(data.floorDifference ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {(data.floorDifference ?? 0) >= 0 ? "+" : "-"}
            {data.floorDifference ?? 0}%
          </p>
        </div>
        <div className="w-full max-w-[200px] h-[18px]">
          <p className="font-medium text-lg2 ml-10 text-neutral50">
            <TruncatedAddress address={data.ownedBy} />
          </p>
        </div>
        <div className="w-full max-w-[200px] h-[18px] group relative">
          <span className="font-medium text-lg2 flex justify-center text-neutral50">
            <span className="group-hover:hidden">
              {daysAgo} days ago
            </span>
            <span className="hidden group-hover:block absolute  -top-2 left-12 text-white bg-white bg-opacity-25 py-2 px-5 rounded-lg cursor-pointer transition-all duration-300 ease-in-out">
              Buy now
            </span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default ColDetailCards;