"use client";

import Image from "next/image";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import { Tabs } from "@/components/ui/tabs";
import { Global, Notepad, Profile2User } from "iconsax-react";
// import CollecBanner from "./collecBanner";
import { CollectionDataType } from "@/lib/types";

const CollecDetailBanner = ({ data }: { data: CollectionDataType }) => {
  
  const links = [
    {
      url: "/collections",
      isIcon: true,
      icon: <Global size={34} className={`hover:text-brand text-neutral00`} />,
    },
    {
      url: "/collections",
      isIcon: true,
      icon: <DiscordIcon size={34} className={`iconHover`} />,
    },
    {
      url: "/collections",
      isIcon: false,
      icon: <ThreadIcon size={34} className={`iconHover`} />,
    },
  ];
  return (
    <>
      <Tabs defaultValue="All" className="mt-[43.5px] mb-10">
        <section>
          <div className="w-full relative h-[320px] mt-10 ">
            <div className="relative h-[200px] w-full rounded-3xl overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${data.logoKey})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div
                className="absolute inset-0 bg-neutral600 bg-opacity-[70%] z-50"
                style={{
                  backdropFilter: "blur(50px)",
                }}
              />
              <div className="h-[190px]" />
            </div>

            <div className="flex absolute top-24 pl-12 pr-12 w-full z-50">
              <div>
                {" "}
                <Image
                  width={208}
                  height={208}
                  src={data.logoKey}
                  className="aspect-square rounded-xl"
                  alt="png"
                />
              </div>
              <div className="w-full pl-6 pr-6 pt-4 pb-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-neutral50">
                      {data.name} 
                    </h3>
                    <h2 className="text-lg font-medium text-neutral100">
                      by NumadLabs
                    </h2>
                  </div>
                  <div className="flex gap-6 pt-8">
                    {links.map((link, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Button clicked");
                        }}
                        className="h-10 w-10 border border-transparent bg-transparent"
                      >
                        {link.icon}
                      </button>
                    ))}
                    {/* <span>
                      <Image
                        width={32}
                        height={32}
                        src="/detail_icon/icon_2.png"
                        className="aspect-square rounded-3xl"
                        alt="png"
                      />
                    </span>
                    <span>
                      <Image
                        width={32}
                        height={32}
                        src="/detail_icon/icon_3.png"
                        className="aspect-square rounded-3xl"
                        alt="png"
                      />
                    </span> */}
                  </div>
                </div>
                <div className="flex justify-around relative right-14 top-9">
                  <div className="pl-1">
                    <h2 className="font-medium text-lg text-neutral100">
                      Floor price
                    </h2>
                    <div className="flex mt-2">
                      <Image
                        width={24}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      {/* <Bitcoin color="#f7931a" variant="Bold" className="" /> */}
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        <span>{data.floor}</span> cBTC
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-l-neutral300 pl-7">
                    <h2 className="font-medium text-lg text-neutral100">
                      Total volume
                    </h2>
                    <div className="flex mt-2">
                      <Image
                        width={24}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      {/* <Bitcoin color="#f7931a" variant="Bold" className="" /> */}
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        <span>{data.volume}</span> cBTC
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-l-neutral300 pl-7">
                    <h2 className="font-medium text-lg text-neutral100">
                      Owners
                    </h2>
                    <div className="flex mt-2">
                      <Profile2User color="#d3f85a" />
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        <span>1</span>
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-l-neutral300 pl-7">
                    <h2 className="font-medium text-lg text-neutral100">
                      Items
                    </h2>
                    <div className="flex mt-2">
                      <Notepad color="#d3f85a" />
                      <p className="ml-2 font-bold text-xl text-neutral50">
                        {/* hover button buy now & view*/}
                        <span>{data.floor}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="pl-12 pr-12 text-lg font-normal text-neutral100">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac
            ornare nisi. Aliquam eget semper risus, sed commodo elit. Curabitur
            sed congue magna. Donec ultrices dui nec ullamcorper aliquet. Nunc
            efficitur mauris id mi venenatis imperdiet. Integer mauris lectus,
            pretium eu nibh molestie, rutrum lobortis tortor. Duis sit amet sem
            fermentum, consequat est nec, ultricies justo.
          </p>
        </section>
      </Tabs>
    </>
  );
};

export default CollecDetailBanner;
