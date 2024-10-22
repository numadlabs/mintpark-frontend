import HoverCard from "@/components/section/collections/hoverCard";
import Image from "next/image";
import { s3ImageUrlBuilder, ordinalsImageCDN } from "@/lib/utils";
import { Collectible } from "@/lib/types";

interface cardProps {
    data: Collectible;
}

const AssetsCard:React.FC<cardProps> = ({ data }) => {
  const isListed =data?.floor > 0;
  return (
    <>
      {" "}
      <div
        // href={`/assetDetail/${collection.id}`}
        className="w-[280px] h-[394px] collection backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-gray-700 rounded-xl px-4 pt-4 pb-5 flex flex-col justify-between"
      >
        <Image
          width={248}
          height={248}
          src={
              s3ImageUrlBuilder(data?.logoKey)
          }
          className="aspect-square rounded-xl"
          alt="png"
        />

        <div className="pt-1">
          <p className="text-neutral200 font-medium text-md pt-2">
            {data?.collectionName}
          </p>
          <p className="py-1 text-lg2 text-neutral50 font-bold pb-4">
            {data?.name}
          </p>
          <div className={`relative ${isListed ? 'group' : ''} h-10 w-[248px] ${isListed ? '' : ''} border-t border-neutral400`}>
          <div className={`flex justify-between py-4 ${isListed ? '' : ''}`}>
            {isListed ? (
              <>
                <p className="text-neutral200 font-medium text-md">Price</p>
                <p className="text-neutral50">
                  {(data?.floor / 10 ** 8).toFixed(5)}
                  <span className="ml-1">BTC</span>
                </p>
              </>
            ) : (
              <p className="text-neutral200 font-medium text-md">Unlisted</p>
            )}
          </div>
        </div>
        </div>
        {/* <HoverCard /> */}
      </div>
    </>
  );
}

export default AssetsCard