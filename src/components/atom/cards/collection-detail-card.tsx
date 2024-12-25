import Image from "next/image";
import Link from "next/link";
import { CollectionDataType } from "@/lib/types";
import { s3ImageUrlBuilder, ordinalsImageCDN } from "@/lib/utils";

export default function ColDetailCard({ data }: { data: CollectionDataType }) {
  const isListed = data.price > 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <Link
      href={`/assetDetail/${data.id}`}
      className="block w-full h-[394px] transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl px-4 pt-4 pb-5"
    >
      <div className="flex flex-col h-full gap-4 justify-center items-center">
        <Image
          width={248}
          height={248}
          src={
            data.highResolutionImageUrl
              ? data.highResolutionImageUrl
              : s3ImageUrlBuilder(data.fileKey)
          }
          className="aspect-square rounded-xl h-[248px] w-[248px]"
          alt={data.name || "Collection image"}
        />

        <div className="flex flex-col flex-1 w-full">
          <p className="text-neutral200 font-medium text-md pt-2">
            {data.collectionName}
          </p>
          <p className="py-1 text-lg text-neutral50 font-bold">{data.name}</p>

          <div className="mt-4">
            <div className="relative group">
              <div className="h-10 border-t border-neutral400 group-hover:border-transparent">
                <div className="flex justify-between py-4 group-hover:opacity-0 transition-opacity">
                  {isListed ? (
                    <>
                      <p className="text-neutral200 font-medium text-md">
                        Price
                      </p>
                      <p className="text-neutral50">
                        {formatPrice(data.price)}
                        <span className="ml-1">cBTC</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-neutral200 font-medium text-md">
                      Unlisted
                    </p>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 w-full h-10 flex items-center justify-center bg-white4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white">View</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
