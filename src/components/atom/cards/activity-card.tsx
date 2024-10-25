import React from "react";
import Image from "next/image";
import { TickCircle, ArrowRight } from "iconsax-react";

const ActivityCard = () => {
  return (
    <div className="flex flex-row items-center justify-between p-3 bg-gray50 rounded-2xl">
      <div className="flex flex-row items-center gap-3 max-w-[360px] w-full">
        <Image
          src={"/launchpads/launch_1.png"}
          sizes="100%"
          alt="image"
          width={48}
          height={48}
          className="rounded-lg"
        />
        <p className="text-md text-neutral50 font-medium">Abstracto #4</p>
      </div>
      <div className="max-w-[220px] w-full">
        <div className="flex flex-row items-center gap-2 bg-white4 w-fit h-[34px] px-3 rounded-lg">
          <TickCircle size={16} color="#D7D8D8" />
          <p className="text-md text-neutral50 font-medium">Purchased</p>
        </div>
      </div>
      <div className="max-w-[200px] w-full flex flex-col gap-1">
        <p className="text-md text-neutral50 font-medium">0.004 cBTC</p>
        <p className="text-sm text-neutral200 font-medium">$78.4k</p>
      </div>
      <div className="max-w-[260px] w-full gap-2 flex flex-row">
        <p className="text-md text-neutral50 font-medium">bc1a...5sd6</p>
        <ArrowRight size={16} color="#88898A" />
        <p className="text-md text-neutral50 font-medium">bc1a...5sd6</p>
      </div>
      <div className="max-w-[152px] w-full">
        <p className="text-md text-neutral50 font-medium">4 days ago</p>
      </div>
    </div>
  );
};

export default ActivityCard;
