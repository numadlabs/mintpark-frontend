import React from "react";
import Image from "next/image";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { LaunchDataType } from "@/lib/types";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface bannerProps {
  data: LaunchDataType;
}

const LaunchpadBanner: React.FC<bannerProps> = ({ data }) => {
  return (
    <>
      <Carousel
        autoplay={true} delayMs={3000}
        className="h-[320px] w-full mt-12 flex justify-center items-center"
      >
        <CarouselContent>
          <CarouselItem>
            {" "}
            <div className="w-full relative z-50 flex justify-center">
              <Image
                src={"/banner.png"}
                alt=""
                width={1216}
                height={320}
                sizes="100%"
                className="w-full h-full rounded-3xl"
              />
              <div className="absolute top-[152px] flex flex-col gap-6 items-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="text-3xl text-neutral00 font-bold">
                    We are live on
                  </p>
                  <Image
                    src={"/wallets/Citrea.png"}
                    alt="citrea"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <p className="text-3xl text-neutral00 font-bold">
                    Citrea testnet!
                  </p>
                </div>
                <p className="text-lg text-neutral50">
                  Mint Park is live on Citrea testnet! Start minting and trading
                  NFTs.
                </p>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem>
            {" "}
            <div className="w-full relative h-[320px] z-50 pt-11 flex justify-center">
              <Image
                src={s3ImageUrlBuilder(data?.logoKey)}
                alt="LaucnhPadBanner"
                width={1216}
                height={320}
                sizes="100%"
                className="w-full h-full rounded-3xl"
              />
              <div className="absolute bottom-12 flex flex-col justify-between p-12 w-full">
                <div className="w-full flex flex-col gap-6">
                  <div className="flex flex-col gap-3 w-full">
                    <p className="text-3xl text-neutral00 font-bold">
                      {data?.name}
                    </p>
                    <p className="text-md text-neutral50">
                      {data?.description}
                    </p>
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="bg-white4 flex gap-2 px-4 py-3 rounded-xl text-lg font-medium text-neutral100">
                      <p>ends in:</p>
                      <p>21d</p>
                      <p>16h</p>
                      <p>32m</p>
                    </div>
                    <Button>Go to minter</Button>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );
};

export default LaunchpadBanner;
