import React from "react";
import Image from "next/image";
import { CollectionDataType } from "@/lib/types";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { useAuth } from "@/components/provider/auth-context-provider";

interface CardProps {
  data: CollectionDataType;
  handleNav: () => void;
}

const ColumColCard: React.FC<CardProps> = ({ data, handleNav }) => {
  const { citreaPrice } = useAuth();

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <button
      onClick={handleNav}
      className="w-full transition-colors collection bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:pr-8"
    >
      <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 w-full sm:items-center">
        {/* Collection Info */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 sm:w-[220px] lg:w-[376px]">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-shrink-0">
            <Image
            width={248}
            height={248}
              src={s3ImageUrlBuilder(data.logoKey)}
              className="rounded-lg object-cover"
              alt={`${data.name || 'Collection'} logo`}
            />
          </div>
          <p className="text-neutral50 font-medium text-base sm:text-lg lg:text-xl truncate">
            {data.name}
          </p>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 sm:w-[340px] lg:w-[468px]">
          {/* Floor Price */}
          <div className="text-right">
            <p className="font-medium text-sm sm:text-lg lg:text-lg2 text-neutral50">
              {formatPrice(data.floor)}
              <span className="ml-1 text-xs sm:text-sm">cBTC</span>
            </p>
            <span className="font-medium text-xs sm:text-sm lg:text-md text-neutral200">
              ${formatPrice(data.floor * citreaPrice)}k
            </span>
          </div>

          {/* Volume */}
          <div className="text-right">
            <p className="font-medium text-sm sm:text-lg lg:text-lg2 text-neutral50">
              {formatPrice(data.volume)}
              <span className="ml-1 text-xs sm:text-sm">cBTC</span>
            </p>
            <span className="font-medium text-xs sm:text-sm lg:text-md text-neutral200">
              ${formatPrice(data.volume * citreaPrice)}k
            </span>
          </div>

          {/* Market Cap */}
          <div className="text-right">
            <p className="font-medium text-sm sm:text-lg lg:text-lg2 text-neutral50">
              {formatPrice(data.marketCap)}
              <span className="ml-1 text-xs sm:text-sm">cBTC</span>
            </p>
            <span className="font-medium text-xs sm:text-sm lg:text-md text-neutral200">
              ${formatPrice(data.marketCap * citreaPrice)}k
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center sm:w-[200px] lg:w-[324px]">
          <span className="font-medium text-sm sm:text-lg lg:text-lg2 text-neutral50">
            {data.soldCount}
          </span>
          <span className="font-medium text-sm sm:text-lg lg:text-lg2 text-neutral50">
            {data.listedCount}
          </span>
          <span className="font-medium text-sm sm:text-lg lg:text-lg2 text-neutral50">
            {data.totalOwnerCount}
          </span>
        </div>
      </div>
    </button>
  );
};

export default ColumColCard;

// import React from "react";
// import Image from "next/image";
// import { CollectionDataType } from "@/lib/types";
// import { s3ImageUrlBuilder } from "@/lib/utils";
// import { useAuth } from "@/components/provider/auth-context-provider";

// interface CardProps {
//   data: CollectionDataType;
//   handleNav: () => void;
// }
// const ColumColCard: React.FC<CardProps> = ({ data, handleNav }) => {
//   const { citreaPrice } = useAuth();
//   const formatPrice = (price: number) => {
//     const btcAmount = price;
//     return btcAmount.toLocaleString("en-US", {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 6,
//     });
//   };
//   return (
//     <>
//       <button
//         onClick={handleNav}
//         className="flex justify-around items-center collection bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%]  rounded-2xl pt-4 pr-8 pb-4 pl-4"
//       >
//         <div className="flex w-[376px] h-16 gap-5">
//           <Image
//             width={64}
//             height={64}
//             src={s3ImageUrlBuilder(data.logoKey)}
//             className="aspect-square rounded-lg"
//             alt="png"
//           />
//           <p className="text-neutral50 font-medium text-xl flex items-center">
//             {data.name}
//           </p>
//         </div>
//         <div className="w-[468px] h-[42px] flex justify-around items-center">
//           <div className="text-right items-center grid gap-1">
//             <p className="font-medium text-lg2 text-neutral50">
//               ${formatPrice(data.floor)}
//               <span className="ml-1">cBTC</span>
//             </p>

//             <span className="font-medium text-md text-start text-neutral200">
//               ${formatPrice(data.floor * citreaPrice)}k
//             </span>
//           </div>
//           <div className="text-right grid gap-1">
//             <p className="font-medium text-lg2 text-neutral50">
//               ${formatPrice(data.volume)}
//               <span className="ml-1">cBTC</span>
//             </p>
//             <span className="font-medium text-start text-md text-neutral200">
//               ${formatPrice(data.volume * citreaPrice)}k
//             </span>
//           </div>
//           <div className="text-right grid gap-1">
//             <p className="font-medium text-lg2 text-neutral50">
//               ${formatPrice(data.marketCap)}
//               <span className="ml-1">cBTC</span>
//             </p>
//             <span className="font-medium text-md text-start text-neutral200">
//               ${formatPrice(data.marketCap * citreaPrice)}k
//             </span>
//           </div>
//         </div>
//         <div className="w-[324px] h-5 flex justify-around">
//           <span className="font-medium text-lg2 text-neutral50">
//             {data.soldCount}
//           </span>
//           <span className="font-medium text-lg2 text-neutral50">
//             {data.listedCount}
//           </span>
//           <span className="font-medium text-lg2 text-neutral50">
//             <span>{data.totalOwnerCount}</span>
//           </span>
//         </div>
//       </button>
//     </>
//   );
// };
// export default ColumColCard;
