import Image from "next/image";
import { formatPrice, s3ImageUrlBuilder } from "@/lib/utils";
import { CollectibleSchema } from "@/lib/validations/asset-validation";
import Link from "next/link";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/provider/auth-context-provider";
import { getLayerById } from "@/lib/service/queryHelper";

interface CardProps {
  data: CollectibleSchema;
}

const AssetsCard: React.FC<CardProps> = ({ data }) => {
  const { authState } = useAuth();

  const isListed = (data?.price ?? 0) > 0;
  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  return (
    <Link href={`/my-assets/${data.id}`} className="block w-full ">
      <div className="flex flex-col w-full transition-transform hover:scale-[1.02] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl px-4 pt-4 pb-5">
        <div className="w-full flex justify-center items-center">
          <Image
            width={248}
            draggable="false"
            height={248}
            src={
              data.highResolutionImageUrl
                ? data.highResolutionImageUrl
                : s3ImageUrlBuilder(data.fileKey)
            }
            className="aspect-square rounded-xl object-cover"
            alt={data.name || "Asset image"}
          />
        </div>
        <div className="flex flex-col flex-grow w-full">
          <p className="text-neutral200 font-medium text-md pt-2">
            {data?.collectionName}
          </p>
          <p className="py-1 text-lg text-neutral50 font-bold">{data?.name}</p>

          <div className="w-full pt-4">
            <div className="relative group">
              <div className="h-10 border-t border-neutral400 group-hover:border-transparent">
                <div className="flex justify-between py-2">
                  {isListed ? (
                    <>
                      <p className="text-neutral200 font-medium text-md group-hover:hidden">
                        Price
                      </p>
                      <p className="text-neutral50 group-hover:hidden">
                        {formatPrice(data.price ?? 0)}
                        <span className="ml-1">
                          {getCurrencySymbol(currentLayer.layer)}
                        </span>
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
                  {isListed ? "Cancel" : "List"}
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
