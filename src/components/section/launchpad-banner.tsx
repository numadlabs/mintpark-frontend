import React, { useEffect, useState } from "react";
import Image from "next/image";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import Link from "next/link";
import { Launchschema } from "@/lib/validations/launchpad-validation";
import { useLaunchState, LAUNCH_STATE } from "@/lib/hooks/useLaunchState";

interface BannerProps {
  data?: Launchschema;
}

const formatTimeDisplay = (targetTimestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, targetTimestamp - now);

  if (diff === 0) return "";

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = Math.floor(diff % 60);

  // If minutes are 0, show seconds instead
  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${days}d ${hours}h ${minutes}m`;
};

const LaunchpadBanner: React.FC<BannerProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");
  const [isClickable, setIsClickable] = useState(false);

  // Only call useLaunchState if data exists
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const launchState = data ? useLaunchState(data as any) : LAUNCH_STATE.UNKNOWN;

  // Use these values safely by checking if data exists first
  const startsAt = data?.poStartsAt ?? 0;
  const endsAt = data?.poEndsAt ?? null;

  useEffect(() => {
    const updateTimeDisplay = () => {
      const now = Math.floor(Date.now() / 1000);

      switch (launchState) {
        case LAUNCH_STATE.UPCOMING:
          setStatus("Starts in");
          setTimeDisplay(formatTimeDisplay(startsAt));
          setIsClickable(false);
          break;
        case LAUNCH_STATE.LIVE:
          if (data?.poEndsAt === 0) {
            setStatus("Live");
            setTimeDisplay("");
          } else {
            setStatus("Ends in:");
            setTimeDisplay(formatTimeDisplay(endsAt as number));
          }
          setIsClickable(true);
          break;
        case LAUNCH_STATE.INDEFINITE:
          setStatus("Ends in:");
          setTimeDisplay("Indefinite");
          setIsClickable(true);
          break;
        case LAUNCH_STATE.ENDED:
          setStatus("Ended:");
          setTimeDisplay("");
          setIsClickable(false);
          break;
        default:
          setStatus("Unknown");
          setTimeDisplay("");
          setIsClickable(false);
      }
    };

    updateTimeDisplay();

    // Determine the appropriate interval based on if we're showing seconds
    const isShowingSeconds = () => {
      const now = Math.floor(Date.now() / 1000);
      let targetTimestamp = 0;

      if (launchState === LAUNCH_STATE.UPCOMING) {
        targetTimestamp = startsAt;
      } else if (launchState === LAUNCH_STATE.LIVE && endsAt !== null) {
        targetTimestamp = endsAt;
      }

      if (targetTimestamp > 0) {
        const diff = Math.max(0, targetTimestamp - now);
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        return minutes === 0 && diff > 0;
      }

      return false;
    };

    // Update every second if showing seconds, otherwise every minute
    const intervalTime = isShowingSeconds() ? 1000 : 60000;
    const interval = setInterval(updateTimeDisplay, intervalTime);

    return () => clearInterval(interval);
  }, [launchState, startsAt, endsAt, data]);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="relative w-full">
      <Carousel
        autoplay={true}
        delayMs={5000}
        className="w-full mt-4 sm:mt-8 lg:mt-12"
        setApi={setApi}
      >
        <CarouselContent>
          {/* Static banner slide */}
          <CarouselItem>
            <div className="relative h-[320px] w-full">
              <div className="w-full h-full relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src="/banners/hemi.png"
                  alt="mintparkBanner"
                  fill
                  draggable="false"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/20">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                    <p className="text-xl sm:text-2xl lg:text-3xl text-neutral00 font-bold">
                      We are live on
                    </p>
                    <Image
                      src="/wallets/hemi.png"
                      alt="hemi"
                      width={32}
                      draggable="false"
                      height={32}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
                    />
                    <p className="text-xl sm:text-2xl lg:text-3xl text-neutral00 font-bold">
                      Hemi Mainnet!
                    </p>
                  </div>
                  <p className="text-sm lg:text-lg text-neutral50 px-4 text-center">
                    Mint Park is live on Hemi Mainnet! Start minting and trading
                    NFTs.
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Dynamic data slide */}
          {data && data.logoKey && (
            <CarouselItem>
              <div className="relative h-[320px] w-full">
                <div className="w-full h-[320px] relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
                  <div
                    className="absolute z-0 inset-0"
                    style={{
                      backgroundImage: data?.logoKey
                        ? `url(${s3ImageUrlBuilder(data.logoKey)})`
                        : "url(/path/to/fallback/image.png)",
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                    }}
                  />

                  <div className="absolute inset-0 flex items-end bg-gray600op60">
                    <div className="w-full p-4 sm:p-6 lg:p-8">
                      <div className="flex flex-col gap-2 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-lg sm:text-2xl lg:text-3xl text-neutral00 font-bold line-clamp-1">
                            {data?.name}
                          </p>
                          <p className="text-md sm:text-md lg:text-md text-neutral50 line-clamp-2">
                            {data?.description}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                          <div className="bg-white4 flex gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm lg:text-base font-medium text-neutral100 items-center w-fit">
                            {(status === "Indefinite" ||
                              status === "Ends in:") && (
                              <div className="bg-success20 h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 rounded-full flex justify-center items-center">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-success rounded-full" />
                              </div>
                            )}
                            <p className="text-lg font-normal text-neutral100">
                              {status}
                            </p>
                            <p className="text-lg font-medium text-neutral00">
                              {timeDisplay}
                            </p>
                          </div>
                          {(status === "Indefinite" ||
                            status === "Ends in:") && (
                            <Link
                              href={`/launchpad/${data.id}`}
                              className="sm:ml-auto text-neutral600"
                            >
                              <Button className="w-full text-neutral600 sm:w-auto text-md2">
                                Go to minter
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>

        {/* Custom navigation buttons */}
        <div className="absolute -bottom-6 left-1/2 flex gap-2 transform -translate-x-1/2">
          <button
            onClick={() => api?.scrollTo(0)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
              activeIndex === 0
                ? "w-3 sm:w-4 bg-brand"
                : "w-1.5 sm:w-2 bg-neutral400"
            }`}
            aria-label="Go to slide 1"
          />
          {data && data.logoKey && (
            <button
              onClick={() => api?.scrollTo(1)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                activeIndex === 1
                  ? "w-3 sm:w-4 bg-brand"
                  : "w-1.5 sm:w-2 bg-neutral400"
              }`}
              aria-label="Go to slide 2"
            />
          )}
        </div>
      </Carousel>
    </div>
  );
};

export default LaunchpadBanner;
