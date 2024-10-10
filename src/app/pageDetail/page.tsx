"use client";
import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import ButtonLg from "@/components/ui/buttonLg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useState } from "react";

const background = [
  {
    id: 1,
    image: "/launchpads/launch_1.png",
  },
  {
    id: 2,
    image: "/launchpads/launch_2.png",
  },
  {
    id: 3,
    image: "/launchpads/launch_3.png",
  },
];

// type Bg = {
//   image: string;
// };

export default function Page() {
  const [current, setCurrent] = useState(1);
  const [active, setActive] = useState(false);
  // console.log(current);
  return (
    <>
      <div
        // className="backdrop-blur-[1px]"
        style={{
          backgroundImage: `url('/launchpads/bg_${current}.jpg')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          // backdropFilter: "backdropBlur",
        }}
      >
        <DetailLayout>
          <Header />
          <section className="grid grid-cols-3 gap-8 h-[464px] mt-24 relative z-50">
            <div className="">
              <h1 className="text-4xl font-bold pb-7 pt-10 text-neutral00">
                Void
              </h1>
              <span className="">
                <p className="h-1 w-[120px] rounded bg-brand"></p>
              </span>
              <p className="font-normal text-lg2 pt-7 text-neutral50">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                ac ornare nisi. Aliquam eget semper risus, sed commodo elit.
                Curabitur sed congue magna. Donec ultrices dui nec ullamcorper
                aliquet. Nunc efficitur mauris id mi venenatis imperdiet.
                Integer mauris lectus, pretium eu nibh molestie, rutrum lobortis
                tortor. Duis sit amet sem fermentum, consequat est nec,
                ultricies justo.
              </p>
              <div className="flex gap-6 pt-8">
                <span>
                  <Image
                    width={32}
                    height={32}
                    src="/detail_icon/icon_1.png"
                    className="aspect-square rounded-3xl"
                    alt="png"
                  />
                </span>
                <span>
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
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <Carousel
              // plugins={[
              //   Autoplay({
              //     delay: 2000,
              //   }),
              // ]}
              >
                {/* <CarouselPrevious onClick={() => setCurrent(current - 1)} />
                <CarouselNext onClick={() => setCurrent(current + 1)} /> */}
                <CarouselContent>
                  {background.map((item, index) => {
                    console.log(current);
                    return (
                      <CarouselItem
                        key={item.id}
                        onMouseEnter={() => setCurrent(item.id)}
                      >
                        <Image
                          width={384}
                          height={384}
                          // src={item.image}
                          src={`/launchpads/launch_${item.id}.png`}
                          className="aspect-square rounded-3xl"
                          alt="png"
                        />
                      </CarouselItem>
                    );
                  })}

                  {/* <CarouselItem>
                    <Image
                      width={384}
                      height={384}
                      src="/launchpads/launch_1.png"
                      className="aspect-square rounded-3xl"
                      alt="png"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <Image
                      width={384}
                      height={384}
                      src="/launchpads/launch_3.png"
                      className="aspect-square rounded-3xl"
                      alt="png"
                    />
                  </CarouselItem> */}
                </CarouselContent>
              </Carousel>

              <div className="h-3 rounded-lg border border-1 border-gray-400 flex">
                <Progress
                  value={3}
                  className="bg-brandshadow-shadowBrands h-full w-[20%]"
                />
              </div>
              <div className="flex justify-between py-1 text-neutral00">
                <span>Total minted</span>
                <h2>
                  21<span className="text-brand">/</span> 420
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between h-[464px] gap-8">
              <ScrollArea className="flex flex-col">
                <div className="flex flex-col justify-between">
                  <div
                    onClick={() => setActive(true)}
                    className={`flex flex-col justify-between border  rounded-3xl p-5  gap-4 ${
                      active ? "border-brand" : "border-neutral400"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-brand border bg-neutral400 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3">
                        Guaranteed
                      </span>
                      <p className="border bg-neutral400 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3 text-neutral100">
                        Ends in:7d 06h 12m
                      </p>
                    </div>
                    <div className="flex">
                      <Image
                        width={20}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      <p className="pl-2">
                        <span>0.0003</span>
                        <span className="ml-1">BTC</span>
                      </p>
                    </div>
                    <div className="text-md">
                      <div className="flex justify-between text-neutral100">
                        <h1>Max:</h1>
                        <h2>
                          <span>1</span> per wallet
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between mt-4 mb-4">
                  <div
                    onClick={() => setActive(true)}
                    className={`flex flex-col justify-between border  rounded-3xl p-5  gap-4 ${
                      active ? "border-brand" : "border-neutral400"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-brand border bg-neutral400 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3">
                        Guaranteed
                      </span>
                      <p className="border bg-neutral400 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3 text-neutral100">
                        Ends in:7d 06h 12m
                      </p>
                    </div>
                    <div className="flex">
                      <Image
                        width={20}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      <p className="pl-2">
                        <span>0.0003</span>
                        <span className="ml-1">BTC</span>
                      </p>
                    </div>
                    <div className="text-md">
                      <div className="flex justify-between text-neutral100">
                        <h1>Max:</h1>
                        <h2>
                          <span>1</span> per wallet
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div
                    onClick={() => setActive(true)}
                    className={`flex flex-col justify-between border  rounded-3xl p-5  gap-4 ${
                      active ? "border-brand" : "border-neutral400"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-brand border bg-neutral400 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3">
                        Guaranteed
                      </span>
                      <p className="border bg-neutral400 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3 text-neutral100">
                        Ends in:7d 06h 12m
                      </p>
                    </div>
                    <div className="flex">
                      <Image
                        width={20}
                        height={20}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      <p className="pl-2">
                        <span>0.0003</span>
                        <span className="ml-1">BTC</span>
                      </p>
                    </div>
                    <div className="text-md">
                      <div className="flex justify-between text-neutral100">
                        <h1>Max:</h1>
                        <h2>
                          <span>1</span> per wallet
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <ButtonLg
                type="submit"
                isSelected={true}
                className="bg-brand py-3 w-full rounded-xl text-lg font-semibold text-neutral600"
              >
                Mint
              </ButtonLg>
            </div>
          </section>
        </DetailLayout>
      </div>
    </>
  );
}
