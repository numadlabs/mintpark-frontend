import React from "react";
import Image from "next/image";
import { getPriceData, ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/components/provider/auth-context-provider";
import { CollectibleSchema } from "@/lib/validations/asset-validation";

interface cardProps {
  data: CollectibleSchema;
}

const AssetsCardList: React.FC<cardProps> = ({ data }) => {
  const citreaPrice = getPriceData();

  //todo end function uud uldsen bn
  const TruncatedAddress = ({ address }: { address: string | null }) => {
    if (!address) return <span>-</span>;
    return (
      <span title={address}>{`${address.slice(0, 4)}...${address.slice(
        -4
      )}`}</span>
    );
  };

  const getDaysAgo = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysAgo = getDaysAgo(data.createdAt);
  const formatPrice = (price: number | null) => {
    const btcAmount = price;
    return btcAmount?.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };
  return (
    <>
      <Link
        className="flex min-w-[1216px] w-full justify-between items-center bg-neutral500 bg-opacity-50 hover:bg-neutral400 hover:bg-opacity-30 rounded-2xl p-4"
        href={`/my-assets/${data.id}`}
      >
        <div className="flex min-w-[392px] w-full max-w-[640px] h-16 gap-5">
          <Image
            width={64}
            height={64}
            src={
              data.highResolutionImageUrl
                ? data.highResolutionImageUrl
                : s3ImageUrlBuilder(data.fileKey)
            }
            className="aspect-square rounded-lg"
            alt={`${data.name} image`}
          />
          <p className="text-neutral50 font-medium text-xl flex items-center">
            {data.name}
          </p>
        </div>
        <div className="flex justify-end items-center w-full text-start">
          <div className="min-w-[200px] w-full max-w-[392px] grid gap-1">
            <p className="font-medium text-lg text-neutral50 w-full">
              {formatPrice(data.floor)}
              <span className="ml-1">cBTC</span>
            </p>
            <p className="font-medium text-sm text-neutral200 w-full">
              <span className="mr-1">$</span>
              {formatPrice(data.floor * citreaPrice)}
              <span className="">k</span>
            </p>
          </div>
          <div className="min-w-[200px] w-full max-w-[392px]">
            <p
              className={`font-medium w-full text-lg ${
                (data.floor ?? 0) >= 0 ? "text-success" : "text-errorMsg"
              }`}
            >
              {(data.floor ?? 0) >= 0 ? "+" : ""}
              {formatPrice(data.floor) ?? 0}%
            </p>
          </div>
          <div className="min-w-[200px] w-full max-w-[392px]">
            <p className="font-medium text-lg text-neutral50 w-full">
              <TruncatedAddress address={data.id} />
              {/* this is OwnedBy */}
            </p>
          </div>
          <div
            className={`min-w-[200px] w-full max-w-[392px] ${
              (data?.price ?? 0) > 0 ? "group" : ""
            } relative`}
          >
            <span className="font-medium text-lg w-full flex justify-start text-neutral50">
              <span
                className={
                  (data.price ?? 0) > 0 ? "group-hover:hidden w-full" : ""
                }
              >
                {daysAgo} days ago
              </span>
              {(data.price ?? 0) > 0 && (
                <span className="hidden w-full group-hover:block lg:absolute lg:-top-2 Lg:left-12 text-white bg-white bg-opacity-25 py-2 px-5 rounded-lg cursor-pointer transition-all duration-300 ease-in-out">
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

export default AssetsCardList;
