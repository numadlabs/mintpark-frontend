import Image from "next/image";
import React from "react";

const CollectionsBanner = () => {
  return (
    <div className="relative h-[320px] w-full mt-4 sm:mt-8 lg:mt-12">
      <div className="w-full h-full relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
        <Image
          src="/banner.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/20">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <p className="text-xl sm:text-2xl lg:text-3xl text-neutral00 font-bold">
              We are live on
            </p>
            <Image
              src="/wallets/Citrea.png"
              alt="citrea"
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
            />
            <p className="text-xl sm:text-2xl lg:text-3xl text-neutral00 font-bold">
              Citrea testnet!
            </p>
          </div>
          <p className="mt-2 sm:mt-0 text-sm lg:text-lg text-neutral50 px-4 text-center">
            Mint Park is live on Citrea testnet! Start minting and trading NFTs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollectionsBanner;
