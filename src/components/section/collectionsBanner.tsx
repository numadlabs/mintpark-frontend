// import React from "react";
// import Image from "next/image";
// import { Button } from "../ui/button";
// import { Notepad, Profile2User } from "iconsax-react";

// const CollectionsBanner = () => {
//   return (
//     <>
//       <div className="w-full relative h-[320px] z-50 pt-11 flex justify-center">
//         <Image
//           src={"/banner.png"}
//           alt="bannerDafault"
//           width={1216}
//           height={320}
//           sizes="100%"
//           className="w-full h-full rounded-3xl"
//         />
//         <div className="absolute top-[152px] flex flex-col gap-6 items-center">
//           <div className="flex flex-row items-center gap-4">
//             <p className="text-3xl text-neutral00 font-bold">We are live on</p>
//             <Image
//               src={"/wallets/Citrea.png"}
//               alt="citrea"
//               width={40}
//               height={40}
//               className="rounded-xl"
//             />
//             <p className="text-3xl text-neutral00 font-bold">Citrea testnet!</p>
//           </div>
//           <p className="text-lg text-neutral50">
//             Mint Park is live on Citrea testnet! Start minting and trading NFTs.
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CollectionsBanner;

import Image from "next/image";
import React from "react";

const CollectionsBanner = () => {
  return (
    <div className="w-full relative min-h-[200px] md:h-[320px] z-50 pt-6 md:pt-11 flex justify-center px-4 md:px-6">
      <Image
        src="/banner.png"
        alt="bannerDefault"
        width={1216}
        height={320}
        sizes="100%"
        className="w-full h-full object-cover rounded-xl md:rounded-3xl"
      />

      <div className="absolute top-1/2 -translate-y-1/2 w-full px-4 md:px-0">
        <div className="flex flex-col gap-4 md:gap-6 items-center text-center">
          <div className="flex flex-row items-center gap-2 md:gap-4 flex-wrap justify-center">
            <p className="text-xl md:text-3xl text-neutral00 font-bold">
              We are live on
            </p>
            <Image
              src="/wallets/Citrea.png"
              alt="citrea"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl"
            />
            <p className="text-xl md:text-3xl text-neutral00 font-bold">
              Citrea testnet!
            </p>
          </div>

          <p className="text-base md:text-lg text-neutral50 max-w-md mx-auto">
            Mint Park is live on Citrea testnet! Start minting and trading NFTs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollectionsBanner;
