import React from "react";
import Image from "next/image";
import { CollectibleList } from "@/lib/types";
interface cardProps {
  data: CollectibleList;
}
const ProfileBanner: React.FC<cardProps> = ({ data }) => {
  return (
    <>
      <section className="mt-[43.5px]">
        <div className="relative h-[216px] w-full rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${"/profile/banner.webp"})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div
            className="absolute inset-0 bg-neutral500 bg-opacity-[70%] z-50"
            style={{
              backdropFilter: "blur(50px)",
            }}
          />
          <div className="flex relative top-11 pl-12 pr-12 w-full z-50">
            <div className="pt-4">
              {" "}
              <Image
                width={120}
                height={120}
                src={"/profile/proImg.png"}
                className="aspect-square rounded-[200px]"
                alt="png"
              />
            </div>
            <div className="w-full flex flex-col justify-between gap-5 pl-6 pr-6 pt-4 pb-4">
              <div className="flex gap-4 items-center">
                <h3 className="text-profileTitle font-bold text-neutral50">
                  bc1p...79t2
                </h3>
                <Image
                  src={"/profile/copy.png"}
                  alt="copy"
                  width={24}
                  height={24}
                  className="w-6 h-6 cursor-pointer"
                />
              </div>{" "}
              <div className="flex justify-between w-full">
                <div className="flex flex-col justify-end">
                  <h2 className="rounded-2xl bg-white4 p-4 flex gap-4 items-center">
                    <Image
                      src={"/wallets/Bitcoin.png"}
                      alt="bitcoin"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                    <p className="flex items-center font-bold text-xl text-white">
                      0.00 BTC
                    </p>
                    <p className="border-l border-l-white16 pl-4 h-5 text-neutral100 text-md flex items-center">
                      $0.00
                    </p>
                  </h2>
                </div>
                <div className="flex gap-4 items-end">
                  <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-md font-medium">
                      Total items:
                    </p>
                    {}
                    {data?.totalCount}
                  </span>
                  <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-md font-medium">
                      Listed items:
                    </p>
                    {data?.listCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileBanner;
