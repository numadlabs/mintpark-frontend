import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Notepad, Profile2User } from "iconsax-react";

const CollectionsBanner = () => {
  return (
    <div className="w-full relative h-[320px] pt-11 z-50">
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
          <div className="flex flex-col just gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-3xl text-neutral00 font-bold">Void</p>
              <p className="text-md text-neutral50 font-normal">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                ac ornare nisi. Aliquam eget semper risus, sed commodo elit...
              </p>
            </div>
            <div className="flex justify-around relative right-11">
              <div className="">
                <h2 className="text-neutral100 font-medium text-md">
                  Floor price
                </h2>
                <div className="flex mt-2">
                  <Image
                    width={22}
                    height={20}
                    src="/detail_icon/btc.png"
                    alt="png"
                    className="aspect-square"
                  />
                  <p className="pl-2 font-bold text-lg2 text-neutral50">
                    <span>0.0003</span>
                    <span className="ml-1">BTC</span>
                  </p>
                </div>
              </div>
              <div className="border-l border-l-neutral300 pl-7">
                <h2 className="text-neutral100 font-medium text-md">
                  Total volume
                </h2>
                <div className="flex mt-2">
                  <Image
                    width={22}
                    height={20}
                    src="/detail_icon/btc.png"
                    alt="png"
                    className="aspect-square"
                  />
                  <p className="pl-2 font-bold text-lg2 text-neutral50">
                    <span>1.56</span>
                    <span className="ml-1">BTC</span>
                  </p>
                </div>
              </div>
              <div className="border-l border-l-neutral300 pl-7">
                <h2 className="text-neutral100 font-medium text-md">Owners</h2>
                <div className="flex mt-2">
                  {/* <Image
                    width={20}
                    height={20}
                    src="/collections/user.png"
                    alt="png"
                    className="aspect-square"
                  /> */}
                  <Profile2User color="#d3f85a" />

                  <p className="pl-2 font-bold text-lg2 text-neutral50">
                    <span>1258</span>
                  </p>
                </div>
              </div>
              <div className="border-l border-l-neutral300 pl-7">
                <h2 className="text-neutral100 font-medium text-md">Items</h2>
                <div className="flex mt-2">
                  {/* <Image
                    width={20}
                    height={20}
                    src="/collections/note.png"
                    alt="png"
                    className="aspect-square"
                  /> */}
                  <Notepad color="#d3f85a" />
                  <p className="pl-2 font-bold text-lg2 text-neutral50">
                    <span>3333</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button className="w-[200px] relative left-36">
            Go to launchpad
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollectionsBanner;
