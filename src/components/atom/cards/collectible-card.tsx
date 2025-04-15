import Image from "next/image";
import Link from "next/link";
import { s3ImageUrlBuilder, formatPrice } from "@/lib/utils";
import { CollectionSchema } from "@/lib/validations/collection-validation";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import { useQuery } from "@tanstack/react-query";
import { getLayerById } from "@/lib/service/queryHelper";
import { useState } from "react";
import BuyAssetModal from "@/components/modal/buy-asset-modal";
import { toast } from "sonner";

interface CollectibleCardProps {
  data: CollectionSchema;
}

export default function CollectibleCard({ data }: CollectibleCardProps) {
  const { authState } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });
  
  const isListed = data.price > 0;

  const toggleModal = (e?: React.MouseEvent) => {
    if (!authState.authenticated) {
      return toast.error("Please connect wallet first");
    }
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsVisible(!isVisible);
  };

  return (
    <>
      <Link
        href={`/assets/${data.id}`}
        className="block sm:h-auto overflow-hidden sm:w-full md:h-auto md:w-full md2:h-auto md2:w-full lg:h-auto lg:w-full xl:h-auto xl:w-full 2xl:w-full 2xl:h-auto  3xl:w-auto 3xl:h-auto transition-transform  duration-300 backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-xl pt-3 pb-4 px-3 md:px-4 md:pt-4 md:pb-5"
      >
        <div className="flex flex-col h-auto gap-4 justify-center items-center">
          <Image
            width={248}
            draggable="false"
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
                          <span className="ml-1">
                            {getCurrencySymbol(currentLayer.layer)}
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-neutral200 font-medium text-md">
                        Unlisted
                      </p>
                    )}
                  </div>
                </div>
                
                <div 
                  className="absolute inset-0 w-full h-10 flex items-center justify-center bg-white4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={isListed ? toggleModal : undefined}
                >
                  <span className="text-white">
                    {isListed ? "Buy now" : "View"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {isListed && (
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
          isOwnListing={data.isOwnListing || false}
        />
      )}
    </>
  );
}