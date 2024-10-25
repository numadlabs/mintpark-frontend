import HoverCard from "@/components/section/collections/hoverCard";
import Image from "next/image";
import { CollectionDataType } from "@/lib/types";
import { s3ImageUrlBuilder, ordinalsImageCDN } from "@/lib/utils";
import Link from "next/link";
import { collection } from "@/lib/constants";

type DetailCard = {
  data: CollectionDataType;
  handleNav: () => void;
};

export default function ColDetailCard({ data }: { data: CollectionDataType }) {
  const isListed = data.price > 0;
  return (
    <>
      {" "}
      <Link
        href={`/assetDetail/${data.id}`}
        className="w-[280px] h-[394px] collection backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl px-4 pt-4 pb-5 flex flex-col justify-between"
      >
        <Image
          width={248}
          height={248}
          src={
            data.fileKey
              ? s3ImageUrlBuilder(data.fileKey)
              : ordinalsImageCDN(data.uniqueIdx)
          }
          className="aspect-square rounded-xl"
          alt="png"
        />

        <div className="pt-1">
          <p className="text-neutral200 font-medium text-md pt-2">
            {data.collectionName}
          </p>
          <p className="py-1 text-lg2 text-neutral50 font-bold pb-4">
            {data.name}
          </p>
          <div
            className={`relative ${isListed ? "group" : ""} h-10 w-[248px] ${isListed ? "hover:border-hidden" : ""} border-t border-neutral400 hover:border-transparent`}
          >
            <div
              className={`flex justify-between py-4 ${isListed ? "group-hover:hidden" : "hover:border-hidden"}`}
            >
              {isListed ? (
                <>
                  <p className="text-neutral200 font-medium text-md">Price</p>
                  <p className="text-neutral50">
                    {(data.price)?.toFixed(5)}
                    <span className="ml-1">cBTC</span>
                  </p>
                </>
              ) : (
                <div className="relative group w-full">
                  <p className="text-neutral200 hover:hidden font-medium text-md group-hover:opacity-0 transition-opacity">
                    Unlisted
                  </p>
                  <div className="group-hover:block hidden  text-center  cursor-pointer  w-[248px] h-10 absolute inset-0 opacity-0 hover:opacity-100 transition-all duration-300 ease-in-out -top-4 left-0 text-white bg-white4 pt-2 pr-5 pb-2 pl-5 rounded-lg">
                    View
                  </div>
                </div>
              )}
            </div>

            {isListed && (
              <div className="group-hover:block hidden text-center cursor-pointer absolute inset-0 opacity-0 hover:opacity-100 transition-all duration-300 ease-in-out w-[248px] h-10 top-0 left-0 text-white bg-white4 pt-2 pr-5 pb-2 pl-5 rounded-lg">
                View
              </div>
            )}
          </div>
        </div>
        {/* <HoverCard /> */}
      </Link>
    </>
  );
}
