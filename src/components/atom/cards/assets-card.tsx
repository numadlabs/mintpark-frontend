import Image from "next/image";
import { s3ImageUrlBuilder, ordinalsImageCDN } from "@/lib/utils";
import { Collectible } from "@/lib/types";
import Link from "next/link";

interface CardProps {
  data: Collectible;
}

const AssetsCard: React.FC<CardProps> = ({ data }) => {
  const isListed = data?.price > 0;

  const formatPrice = (price: number) => {
    return price?.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };

  return (
    <Link
      href={`/assets/${data.id}`}
      className="block w-[280px] h-[394px] transition-transform hover:scale-[1.02] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl px-4 pt-4 pb-5"
    >
      <div className="flex flex-col h-full">
        <Image
          width={248}
          height={248}
          src={
            data.fileKey
              ? s3ImageUrlBuilder(data.fileKey)
              : ordinalsImageCDN(data.uniqueIdx)
          }
          className="aspect-square rounded-xl"
          alt={data.name || "Asset image"}
        />

        <div className="flex flex-col flex-grow">
          <p className="text-neutral200 font-medium text-md pt-2">
            {data?.collectionName}
          </p>
          <p className="py-1 text-lg2 text-neutral50 font-bold">
            {data?.name}
          </p>
          
          <div className="mt-auto pt-4">
            <div className="relative group">
              <div className="h-10 border-t border-neutral400 group-hover:border-transparent">
                <div className="flex justify-between py-2">
                  {isListed ? (
                    <>
                      <p className="text-neutral200 font-medium text-md group-hover:hidden">Price</p>
                      <p className="text-neutral50 group-hover:hidden">
                        {formatPrice(data.price)}
                        <span className="ml-1">cBTC</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-neutral200 font-medium text-md group-hover:hidden">
                      Unlisted
                    </p>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                <div className="h-10 bg-white4 rounded-lg flex items-center justify-center text-white">
                  View
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetsCard;