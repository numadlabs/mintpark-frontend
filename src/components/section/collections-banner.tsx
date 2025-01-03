import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";

const CollectionsBanner = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const slides = [1, 2]; // Number of slides

  return (
    <div className="relative w-full">
      <Carousel setApi={setApi} className="w-full mt-4 sm:mt-8 lg:mt-0">
        <CarouselContent>
          {/* Static banner slide */}
          <CarouselItem>
            <div className="relative h-[320px] px-4 lg:px-0 w-full mt-4 sm:mt-8 lg:mt-12">
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
                    Mint Park is live on Citrea testnet! Start minting and
                    trading NFTs.
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="relative h-[320px] px-4 lg:px-0 w-full mt-4 sm:mt-8 lg:mt-12">
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
                    Mint Park is live on Citrea testnet! Start minting and
                    trading NFTs.
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>

        {/* Navigation dots */}
        <div className="absolute -bottom-6 left-1/2 flex gap-2 transform -translate-x-1/2">
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-4 h-2 rounded-full transition-colors ${
                  current === index
                    ? "w-3 sm:w-4 bg-brand"
                    : "w-1.5 sm:w-2 bg-neutral400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default CollectionsBanner;
