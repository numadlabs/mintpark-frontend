import React from "react";
import Image from "next/image";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { LaunchDataType } from "@/lib/types";
import { Button } from "../ui/button";

interface bannerProps {
  data: LaunchDataType;
}

const LaunchpadBanner: React.FC<bannerProps> = ({ data }) => {
  return (
    <div className="w-full relative h-[320px] z-50 pt-11 flex justify-center">
      <Image
        src={s3ImageUrlBuilder(data?.logoKey)}
        alt=""
        width={1216}
        height={320}
        sizes="100%"
        className="w-full h-full rounded-3xl"
      />
      <div className="absolute bottom-12 flex flex-row items-end w-full">
        <div className="max-w-[800px] w-full flex flex-col gap-6">
          <div className="flex flex-col gap-3 w-full">
            <p className="text-3xl text-neutral00 font-bold">{data?.name}</p>
            <p className="text-md text-neutral50">{data?.description}</p>
          </div>
          <div className="bg-white4 px-4 py-3 rounded-xl">
            <p className="text-lg font-medium text-neutral100">ends in:</p>
          </div>
        </div>
        <Button>Go to minter</Button>
      </div>
    </div>
  );
};

export default LaunchpadBanner;
