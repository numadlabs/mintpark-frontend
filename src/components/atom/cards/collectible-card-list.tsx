// auth changes

import React, { useState } from "react";
import Image from "next/image";
import {
  formatFloorPrice,
  formatPrice,
  getDaysAgo,
  s3ImageUrlBuilder,
  truncateAddress,
} from "@/lib/utils";
import Link from "next/link";
import { CollectionSchema } from "@/lib/validations/collection-validation";
import {
  getAddressExplorerUrl,
  getCurrencyPrice,
  getCurrencySymbol,
} from "@/lib/service/currencyHelper";
import BuyAssetModal from "@/components/modal/buy-asset-modal";
import { toast } from "sonner";

// Define the type for the component props
interface ColDetailCardsProps {
  data: CollectionSchema;
  isOwnListing?: boolean;
  isConnected?: boolean;
  currentLayer: { layer: string } | null;
}

const TruncatedAddress: React.FC<{ address: string | null }> = ({
  address,
}) => {
  if (!address) return <span>-</span>;
  return (
    <span title={address}>{`${address.slice(0, 4)}...${address.slice(
      -4
    )}`}</span>
  );
};

const CollectibleCardList: React.FC<ColDetailCardsProps> = ({
  data,
  isOwnListing = false,
  isConnected = false,
  currentLayer,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const daysAgo = getDaysAgo(data.createdAt);
  const isListed = data.price > 0;
  const isPriceEqualToFloor = data.price === data.floor;

  const toggleModal = (e?: React.MouseEvent) => {
    // Fix: Use isConnected instead of authState.authenticated
    if (!isConnected) {
      return toast.error("Please connect wallet first");
    }
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsVisible(!isVisible);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    if (isListed && !isOwnListing) {
      toggleModal(e);
    }
    // For "Cancel listing" or other actions, you would add the specific handlers here
  };

  return (
    <>
      <div className="flex w-full items-center justify-between bg-neutral500 bg-opacity-50 hover:bg-neutral400 hover:bg-opacity-30 rounded-2xl p-3">
        <Link
          className="flex min-w-[392px] w-full max-w-[520px] gap-3"
          href={`/assets/${data.id}`}
        >
          <Image
            width={48}
            height={48}
            draggable="false"
            src={
              data.highResolutionImageUrl
                ? data.highResolutionImageUrl
                : s3ImageUrlBuilder(data.fileKey)
            }
            className="aspect-square rounded-lg"
            alt={`${data.name} image`}
          />
          <p className="text-neutral50 font-medium text-md flex items-center">
            {data.name}
          </p>
        </Link>
        <div className="flex items-center text-start w-full">
          <div className="min-w-[200px] w-full max-w-[324px]  text-start">
            <p className="font-medium text-md text-neutral50 w-full">
              {formatPrice(data.price)}
              <span className="ml-1">
                {" "}
                {currentLayer && getCurrencySymbol(currentLayer.layer)}
              </span>
            </p>
            <p>
              {" "}
              <p className="font-medium text-md text-neutral200 w-full">
                <span className="mr-1">$</span>
                {currentLayer &&
                  formatPrice(
                    data.price * getCurrencyPrice(currentLayer.layer)
                  )}
              </p>
            </p>
          </div>
          <div className="min-w-[200px] w-full max-w-[324px] text-start">
            <p
              className={`font-medium text-md w-full ${
                isPriceEqualToFloor
                  ? "text-neutral50"
                  : (data.floorDifference ?? 0) >= 0
                  ? "text-success"
                  : "text-errorMsg"
              }`}
            >
              {isPriceEqualToFloor
                ? "-"
                : `${
                    (data.floorDifference ?? 0) >= 0 ? "+" : "-"
                  } ${formatFloorPrice(data.floorDifference ?? 0)}%`}
            </p>
          </div>
          <div className="min-w-[200px] w-full max-w-[324px]  text-start">
            <p className="font-medium text-md text-neutral50 w-full"></p>
            {/* <Link
              href={getAddressExplorerUrl(currentLayer, data?.ownedBy || "")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-md text-neutral50 font-medium hover:text-brand transition-colors cursor-pointer"
            > */}
            <TruncatedAddress address={data.ownedBy} />
            {/* </Link> */}
          </div>
          <div
            className={`min-w-[200px] w-full max-w-[324px] h-[18px] ${
              isListed ? "group" : ""
            } relative`}
          >
            <span className="font-medium text-md text-neutral50 w-full">
              <span
                className={
                  isListed
                    ? "group-hover:hidden flex items-center w-full"
                    : "flex items-center"
                }
              >
                {daysAgo} days ago
              </span>
              {isListed && (
                <span
                  className="hidden group-hover:block lg:absolute lg:-top-2 text-neutral50 bg-white8 bg-opacity-[40%] pt-2 pb-2 pr-5 pl-5 rounded-lg cursor-pointer transition-all duration-300 ease-in-out"
                  onClick={handleActionClick}
                >
                  {isOwnListing ? "Cancel listing" : "Buy now"}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {isListed && !isOwnListing && (
        <BuyAssetModal
          open={isVisible}
          onClose={toggleModal}
          fileKey={
            data.highResolutionImageUrl
              ? data.highResolutionImageUrl
              : s3ImageUrlBuilder(data.fileKey)
          }
          uniqueIdx={data.uniqueIdx || ""}
          name={data.name}
          collectionName={data.collectionName}
          price={data.price}
          listId={data.listId || ""}
          isOwnListing={isOwnListing}
        />
      )}
    </>
  );
};

export default CollectibleCardList;
