import React, { useEffect, useState, useCallback } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Image from "next/image";

const SLIDE_INTERVAL = 5000;

interface BannerSlide {
  id: number;
  image: string;
  walletImage: string;
  title: string;
  description: string;
  walletName: string;
}

const bannerData: BannerSlide[] = [
  {
    id: 1,
    image: "/banner.png",
    walletImage: "/wallets/Citrea.png",
    title: "We are live on Citrea testnet!",
    description: "Mint Park is live on Citrea testnet! Start minting and trading NFTs.",
    walletName: "citrea"
  },
  {
    id: 2,
    image: "/banners/Nubit.png",
    walletImage: "/wallets/nubit.png",
    title: "Going Live on Nubit Soon!",
    description: "We are excited to announce that we will be live on Nubit soon!",
    walletName: "nubit"
  },
  {
    id: 3,
    image: "/banners/hemi.png",
    walletImage: "/wallets/hemi.png",
    title: "Going Live on Hemi Soon!",
    description: "We're excited to be live on the Hemi Network soon, stay tuned!",
    walletName: "hemi"
  }
];

const CollectionsBanner = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSelect = useCallback(() => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    api.on("select", handleSelect);
    const interval = setInterval(() => api.scrollNext(), SLIDE_INTERVAL);

    return () => {
      api.off("select", handleSelect);
      clearInterval(interval);
    };
  }, [api, handleSelect]);

  const renderSlide = (slide: BannerSlide) => (
    <div className="relative h-80 w-full rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
      <Image
        src={slide.image}
        alt=""
        fill
        className="object-cover"
        priority={slide.id === 1}
      />
      <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 bg-black/20 p-6">
        <div className="flex-shrink-0 bg-white8 border border-white8 p-3 rounded-2xl">
          <Image
            src={slide.walletImage}
            alt={`${slide.walletName} wallet`}
            width={72}
            height={72}
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg"
          />
        </div>
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left max-w-lg">
          <h2 className="text-xl sm:text-2xl lg:text-3xl text-white font-bold">
            {slide.title}
          </h2>
          <p className="text-lg text-white/90 font-normal">
            {slide.description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <Carousel setApi={setApi} className="w-full mt-4 sm:mt-8 lg:mt-0">
        <CarouselContent>
          {bannerData.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="p-4 lg:p-0 mt-4 sm:mt-8 lg:mt-12">
                {renderSlide(slide)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -bottom-6 left-1/2 flex gap-2 transform -translate-x-1/2">
          {bannerData.map((slide) => (
            <button
              key={slide.id}
              onClick={() => api?.scrollTo(slide.id - 1)}
              className={`h-2 rounded-full transition-colors ${
                currentSlide === slide.id - 1
                  ? "w-3 sm:w-4 bg-brand"
                  : "w-1.5 sm:w-2 bg-neutral400"
              }`}
              aria-label={`Go to slide ${slide.id}`}
              aria-current={currentSlide === slide.id - 1}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default CollectionsBanner;