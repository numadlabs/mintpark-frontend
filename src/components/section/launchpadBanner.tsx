import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";

const LaunchpadBanner = () => {
  return (
    <div className="w-full relative h-[320px] z-50 pt-11">
      <Image
        src={"/Slide.png"}
        alt=""
        width={1216}
        height={320}
        sizes="100%"
        className="w-full h-full rounded-3xl"
      />
      <div className="w-full px-12 bottom-0 items-end flex absolute bg-gradient-to-b from-transparent to-neutral600 h-full">
        <div className="flex flex-row mb-12 items-end h-auto w-full">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-3xl text-neutral00 font-bold">Void</p>
              <p className="text-md text-neutral50 font-normal">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                ac ornare nisi. Aliquam eget semper risus, sed commodo elit.
                Curabitur sed congue magna. Donec ultrices...
              </p>
            </div>
            <div className=" broder border-transparent bg-neutral500 w-[190px] pt-3 pb-3 pr-4 pl-4 rounded-xl">
              <span className="text-neutral100">ends in:</span>{" "}
              <span className="text-neutral00">19d 06h 12m</span>
            </div>
          </div>
          <Button className="w-[200px]">Go to minter</Button>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadBanner;
