import Image from "next/image";
import Link from "next/link";
import { CollectionDataType } from "@/lib/types";
import { s3ImageUrlBuilder,formatPrice} from "@/lib/utils";

export default function ColDetailCard({ data }: { data: CollectionDataType }) {
  const isListed = data.price > 0;

  return (
    <Link
      href={`/assets/${data.id}`}
      className="block h-auto w-full sm:h-auto sm:w-full md:h-[330px] md:w-full md2:h-auto md2:w-full lg:h-auto lg:w-full xl:h-auto xl:w-full  3xl:w-[280px] 3xl:h-[392px] transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl pt-3 pb-4 px-3 md:px-4 md:pt-4 md:pb-5"
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
          className="rounded-xl object-cover aspect-square"
          alt={data.name || "Collection image"}
        />

        <div className="flex flex-col flex-1 w-full">
          <p className="text-neutral200 font-medium text-sm md:text-md pt-0 md:pt-2">
            {data.collectionName}
          </p>
          <p className="py-1 text-lg text-neutral50 font-bold">{data.name}</p>

          <div className="sm:mt-4 mt-3">
            <div className="relative group">
              <div className="h-8 sm:h-8 md2:h-9 md:h-8 border-t border-neutral400 group-hover:border-transparent">
                <div className="flex justify-between py-2 sm:py-4 group-hover:opacity-0 transition-opacity">
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
