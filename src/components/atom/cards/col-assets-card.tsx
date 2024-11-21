import React from "react";
import Image from "next/image";
import { ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import Link from "next/link";
import { Collectible } from "@/lib/types";
import { useAuth } from "@/components/provider/auth-context-provider";

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
interface cardProps {
  data: Collectible;
}

const ColAssetsCards: React.FC<cardProps> = ({ data }) => {
  const { citreaPrice } = useAuth();
  const daysAgo = getDaysAgo(data.createdAt);
  const formatPrice = (price: number) => {
    const btcAmount = price;
    return btcAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };
  return (
    <>
      <Link
        className="flex w-full justify-between items-center gap-24 bg-neutral500 bg-opacity-50 hover:bg-neutral400 hover:bg-opacity-30 rounded-2xl p-4"
        href={`/assets/${data.id}`}
      >
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
          <div className="w-full max-w-[300px] grid gap-1 h-[18px]">
            <p className="font-medium text-lg2 text-neutral50">
              {formatPrice(data.floor)}
              <span className="ml-1">cBTC</span>
            </p>
            <p>
              {" "}
              <p className="font-medium text-sm text-neutral200">
                <span className="mr-1">$</span>
                {formatPrice(data.floor * citreaPrice)}
                <span className="">k</span>
              </p>
            </p>
          </div>
          <div className="w-full max-w-[220px] h-[18px]">
            <p
              className={`font-medium text-lg2 ${(data.floor ?? 0) >= 0 ? "text-success" : "text-errorMsg"}`}
            >
              {(data.floor ?? 0) >= 0 ? "+" : ""}
              {formatPrice(data.floor) ?? 0}%
            </p>
          </div>
          <div className="w-full max-w-[160px] h-[18px]">
            <p className="font-medium text-lg2 text-neutral50">
              <TruncatedAddress address={data.id} />
              {/* this is OwnedBy */}
            </p>
          </div>
          <div
            className={`w-full max-w-[210px] h-[18px] ${data.price > 0 ? "group" : ""} relative`}
          >
            <span className="font-medium text-lg2 flex justify-center text-neutral50">
              <span className={data.price > 0 ? "group-hover:hidden" : ""}>
                {daysAgo} days ago
              </span>
              {data.price > 0 && (
                <span className="hidden group-hover:block lg:absolute lg:-top-2 Lg:left-12 text-white bg-white bg-opacity-25 py-2 px-5 rounded-lg cursor-pointer transition-all duration-300 ease-in-out">
                  List
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </>
  );
};

export default ColAssetsCards;
