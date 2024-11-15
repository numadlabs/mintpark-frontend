import Image from "next/image";
import { Global, Notepad, Profile2User } from "iconsax-react";
import { CollectionDataType } from "@/lib/types";
import React from "react";
import { s3ImageUrlBuilder } from "@/lib/utils";
import HoverCard from "@/components/section/collections/hoverCard";

export type CardType = {
  data: CollectionDataType;
  handleNav: () => void;
};

const formatPrice = (price: number) => {
  return price?.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
};

const CollectionCard: React.FC<CardType> = ({ data, handleNav }) => {
  return (
    <button
      onClick={handleNav}
      className="w-full transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-gradient-to-br collection from-gradientStart to-transparent border border-neutral400 rounded-xl p-3 sm:p-4 flex flex-col justify-between items-center"
    >
        <Image
          width={248}
          height={248}
          src={s3ImageUrlBuilder(data?.logoKey)}
          className="object-cover aspect-square rounded-xl"
          alt={`${data.name || "Collection"} image`}
        />

      <div className="pt-3 sm:pt-4 grid gap-3 sm:gap-4 w-full">
        <p className="text-xl font-bold text-start text-neutral00 line-clamp-1 px-1">
          {data.name}
        </p>

        <div className="grid grid-cols-2 w-full gap-2 sm:gap-4">
          <div className="text-start">
            <p className="text-xs sm:text-sm font-medium text-neutral200">
              Floor price
            </p>
            <p className="pt-1 sm:pt-2 font-bold text-sm sm:text-md text-neutral-50">
              {formatPrice(data.floor)}
              <span className="ml-1">cBTC</span>
            </p>
          </div>
          <div className="text-start">
            <p className="text-xs sm:text-sm font-medium text-neutral200">
              Volume
            </p>
            <p className="pt-1 sm:pt-2 font-bold text-sm sm:text-md text-neutral-50">
              {formatPrice(data?.volume)}
              <span className="ml-1">cBTC</span>
            </p>
          </div>
        </div>

        <div className="border-t border-neutral400 w-full my-1 sm:my-2"></div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
          <div className="flex items-center">
            <Profile2User size={16} className="text-brand" />
            <p className="ml-2 font-medium text-sm sm:text-md text-neutral50">
              <span>{data?.totalOwnerCount}</span> owners
            </p>
          </div>
          <div className="flex items-center">
            <Notepad size={16} className="text-brand" />
            <p className="ml-2 font-medium text-sm sm:text-md text-neutral50">
              <span>{data?.supply}</span> items
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 delay-500">
        <HoverCard data={data} />
      </div>
    </button>
  );
};

export default CollectionCard;

// import Image from "next/image";
// // import { Progress } from "@/components/ui/progress";
// import { Global, Notepad, Profile2User } from "iconsax-react";
// import { CollectionDataType } from "@/lib/types";
// import React from "react";
// import { s3ImageUrlBuilder } from "@/lib/utils";
// import HoverCard from "@/components/section/collections/hoverCard";

// export type CardType = {
//   data: CollectionDataType;
//   handleNav: () => void;
// };
// const formatPrice = (price: number) => {
//   const btcAmount = price;
//   return btcAmount?.toLocaleString('en-US', {
//     minimumFractionDigits:0,
//     maximumFractionDigits: 6
//   });
// };

// const CollectionCard: React.FC<CardType> = ({ data, handleNav }) => {
//   return (
//     <button
//       onClick={handleNav}
//       className="backdrop-blur-sm bg-gradient-to-br collection mt-4 from-gradientStart to-transparent border border-neutral400 rounded-xl pl-4 pr-4 pt-4 pb-5 flex flex-col justify-between"
//     >
//       <Image
//         width={248}
//         height={248}
//         src={s3ImageUrlBuilder(data?.logoKey)}
//         className="aspect-square rounded-xl"
//         alt="png"
//       />
//       <div className="pt-4 grid gap-4 w-full">
//         <p className="text-xl font-bold pl-1 text-start text-neutral00">
//           {data.name}
//         </p>
//         <div className="flex justify-around w-full relative pl-5 right-6 gap-2">
//           <div className="text-start">
//             {" "}
//             <p className="text-sm font-medium text-neutral200 gap-2">
//               Floor price
//             </p>
//             <p className="pt-2 font-bold text-md text-neutral-50">
//               {(data.floor )=== 0 ? formatPrice(data.floor) : formatPrice(data.floor)}
//               <span className="ml-1">cBTC</span>
//             </p>
//           </div>
//           <div className="text-start">
//             {" "}
//             <p className="text-sm font-medium text-neutral200 gap-2">Volume</p>
//             <p className="pt-2 font-bold text-md text-neutral-50">
//               {(data?.volume) === 0 ? formatPrice(data?.volume) : formatPrice(data?.volume)}
//               <span className="ml-1">cBTC</span>
//               {/* {data.volume === 0
//                 ? data.volume
//                 : (data.volume)?.toFixed(4)}
//               <span className="ml-1">cBTC</span> */}
//             </p>
//           </div>
//         </div>
//         <div className="border border-neutral400 w-full"></div>
//         <div className="flex flex-row gap-2 items-center justify-around relative right-[12px]">
//           <div className="flex mt-2 items-center">
//             <Profile2User color="#d3f85a" className="w-4 h-4" />
//             <p className="ml-2 font-medium text-md text-neutral50">
//               <span>{data?.totalOwnerCount}</span> owners
//             </p>
//           </div>
//           <div className="flex mt-2 items-center">
//             <Notepad color="#d3f85a" className="w-4 h-4" />
//             <p className="ml-2 font-medium text-md text-neutral50">
//               <span>{data?.supply}</span> items
//             </p>
//           </div>
//         </div>
//       </div>
//       <HoverCard data={data}/>
//     </button>
//   );
// };

// export default CollectionCard;
