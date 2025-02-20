import React from "react";
import Image from "next/image";
import { formatPrice, getPriceData, s3ImageUrlBuilder } from "@/lib/utils";
import Link from "next/link";
import { CollectionSchema } from "@/lib/validations/collection-validation";

// Define the type for the component props
interface ColDetailCardsProps {
  data: CollectionSchema;
  isOwnListing?: boolean;
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

const getDaysAgo = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const CollectibleCardList: React.FC<ColDetailCardsProps> = ({ data, isOwnListing = false }) => {
  const citreaPrice = getPriceData();
  const daysAgo = getDaysAgo(data.createdAt);

  return (
    <>
      <Link
        className="flex w-full items-center justify-between bg-neutral500 bg-opacity-50 hover:bg-neutral400 hover:bg-opacity-30 rounded-2xl p-3"
        href={`/assets/${data.id}`}
      >
        <div className="flex min-w-[392px] w-full max-w-[520px] gap-3">
          <Image
            width={48}
            height={48}
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
        </div>
        <div className="flex items-center text-start w-full">
          <div className="min-w-[200px] w-full max-w-[324px]  text-start">
            <p className="font-medium text-md text-neutral50 w-full">
              {formatPrice(data.price)}
              <span className="ml-1">cBTC</span>
            </p>
            <p>
              {" "}
              <p className="font-medium text-md text-neutral200 w-full">
                <span className="mr-1">$</span>
                {formatPrice(data.price * citreaPrice)}
                <span className="">k</span>
              </p>
            </p>
          </div>
          <div className="min-w-[200px] w-full max-w-[324px] text-start">
            <p
              className={`font-medium text-md w-full ${
                (data.floorDifference ?? 0) >= 0
                  ? "text-success"
                  : "text-errorMsg"
              }`}
            >
              {(data.floorDifference ?? 0) >= 0 ? "+" : "-"}
              {formatPrice(data.floorDifference ?? 0)}%
            </p>
          </div>
          <div className="min-w-[200px] w-full max-w-[324px]  text-start">
            <p className="font-medium text-md text-neutral50 w-full">
              <TruncatedAddress address={data.ownedBy} />
            </p>
          </div>
          <div
            className={`min-w-[200px] w-full max-w-[324px] h-[18px] ${
              data.price > 0 ? "group" : ""
            } relative`}
          >
            <span className="font-medium text-md text-neutral50 w-full">
              <span
                className={
                  data.price > 0
                    ? "group-hover:hidden flex items-center w-full"
                    : "flex items-center"
                }
              >
                {daysAgo} days ago
              </span>
              {data.price > 0 && (
                <span className="hidden group-hover:block lg:absolute lg:-top-2 text-neutral50 bg-white8 bg-opacity-[40%] pt-2 pb-2 pr-5 pl-5 rounded-lg cursor-pointer transition-all duration-300 ease-in-out">
                  {isOwnListing ? "Cancel listing" : "Buy now"}
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </>
  );
};

export default CollectibleCardList;

// import React from "react";
// import Image from "next/image";
// import { formatPrice, getPriceData, s3ImageUrlBuilder } from "@/lib/utils";
// import Link from "next/link";
// import { CollectionSchema } from "@/lib/validations/collection-validation";

// // Define the type for the component props
// interface ColDetailCardsProps {
//   data: CollectionSchema;
// }

// const TruncatedAddress: React.FC<{ address: string | null }> = ({
//   address,
// }) => {
//   if (!address) return <span>-</span>;
//   return (
//     <span title={address}>{`${address.slice(0, 4)}...${address.slice(
//       -4
//     )}`}</span>
//   );
// };

// const getDaysAgo = (createdAt: string) => {
//   const createdDate = new Date(createdAt);
//   const now = new Date();
//   const diffTime = Math.abs(now.getTime() - createdDate.getTime());
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// };

// const CollectibleCardList: React.FC<ColDetailCardsProps> = ({ data }) => {
//   const citreaPrice = getPriceData();
//   const daysAgo = getDaysAgo(data.createdAt);

//   return (
//     <>
//       <Link
//         className="flex w-full items-center justify-between bg-neutral500 bg-opacity-50 hover:bg-neutral400 hover:bg-opacity-30 rounded-2xl p-3"
//         href={`/assets/${data.id}`}
//       >
//         <div className="flex min-w-[392px] w-full max-w-[520px] gap-3">
//           <Image
//             width={48}
//             height={48}
//             src={
//               data.highResolutionImageUrl
//                 ? data.highResolutionImageUrl
//                 : s3ImageUrlBuilder(data.fileKey)
//             }
//             className="aspect-square rounded-lg"
//             alt={`${data.name} image`}
//           />
//           <p className="text-neutral50 font-medium text-md flex items-center">
//             {data.name}
//           </p>
//         </div>
//         <div className="flex items-center text-start w-full">
//           <div className="min-w-[200px] w-full max-w-[324px]  text-start">
//             <p className="font-medium text-md text-neutral50 w-full">
//               {formatPrice(data.price)}
//               <span className="ml-1">cBTC</span>
//             </p>
//             <p>
//               {" "}
//               <p className="font-medium text-md text-neutral200 w-full">
//                 <span className="mr-1">$</span>
//                 {formatPrice(data.price * citreaPrice)}
//                 <span className="">k</span>
//               </p>
//             </p>
//           </div>
//           <div className="min-w-[200px] w-full max-w-[324px] text-start">
//             <p
//               className={`font-medium text-md w-full ${
//                 (data.floorDifference ?? 0) >= 0
//                   ? "text-success"
//                   : "text-errorMsg"
//               }`}
//             >
//               {(data.floorDifference ?? 0) >= 0 ? "+" : "-"}
//               {formatPrice(data.floorDifference ?? 0)}%
//             </p>
//           </div>
//           <div className="min-w-[200px] w-full max-w-[324px]  text-start">
//             <p className="font-medium text-md text-neutral50 w-full">
//               <TruncatedAddress address={data.ownedBy} />
//             </p>
//           </div>
//           <div
//             className={`min-w-[200px] w-full max-w-[324px] h-[18px] ${
//               data.price > 0 ? "group" : ""
//             } relative`}
//           >
//             <span className="font-medium text-md text-neutral50 w-full">
//               <span
//                 className={
//                   data.price > 0
//                     ? "group-hover:hidden flex items-center w-full"
//                     : "flex items-center"
//                 }
//               >
//                 {daysAgo} days ago
//               </span>
//               {data.price > 0 && (
//                 <span className="hidden group-hover:block lg:absolute lg:-top-2 text-neutral50 bg-white8 bg-opacity-[40%] pt-2 pb-2 pr-5 pl-5 rounded-lg cursor-pointer transition-all duration-300 ease-in-out">
//                   Buy now
//                 </span>
//               )}
//             </span>
//           </div>
//         </div>
//       </Link>
//     </>
//   );
// };

// export default CollectibleCardList;
