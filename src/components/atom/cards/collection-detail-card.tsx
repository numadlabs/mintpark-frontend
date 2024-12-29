import Image from "next/image";
import Link from "next/link";
import { CollectionDataType } from "@/lib/types";
import { s3ImageUrlBuilder} from "@/lib/utils";

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
      href={`/assets/${data.id}`}
      className="block w-[163.5px] h-[254px] sm:w-[280px] sm:h-[392px] transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl pt-3 pb-4 px-3 md:px-4 md:pt-4 md:pb-5"
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
          className="aspect-square rounded-xl object-cover h-[128px] w-[139.5px] md:h-[248px] md:w-[248px]"
          alt={data.name || "Collection image"}
        />

        <div className="flex flex-col flex-1 w-full">
          <p className="text-neutral200 font-medium text-sm md:text-md pt-0 md:pt-2">
            {data.collectionName}
          </p>
          <p className="py-1 text-lg text-neutral50 font-bold">{data.name}</p>

          <div className="md:mt-4 m-0">
            <div className="relative group">
              <div className="h-12 md:h-10 border-t border-neutral400 group-hover:border-transparent">
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
