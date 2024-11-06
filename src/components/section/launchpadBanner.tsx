import React, { useEffect, useState } from "react";
import Image from "next/image";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { LaunchDataType } from "@/lib/types";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import moment from "moment";
import Link from "next/link";

interface BannerProps {
  data?: LaunchDataType;
}

const LaunchpadBanner: React.FC<BannerProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();

  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const updateTime = () => {
      // If endsAt is undefined, set status to Indefinite
      if (!data?.poEndsAt) {
        setStatus("Indefinite");
        setTimeDisplay("");
        return;
      }

      const now = moment();
      // Convert millisecond timestamps to seconds if needed
      const convertToSeconds = (timestamp: number) => {
        // If timestamp is in milliseconds (13 digits), convert to seconds
        return timestamp.toString().length === 13
          ? Math.floor(timestamp / 1000)
          : timestamp;
      };

      const startMoment = moment.unix(convertToSeconds(data?.poStartsAt));
      const endMoment = moment.unix(convertToSeconds(data?.poEndsAt));
      const createMoment = moment(data?.createdAt);

      // Check if ended
      if (now.isAfter(endMoment)) {
        setStatus("Ended");
        setTimeDisplay("");
        return;
      }

      // Check if currently active
      if (now.isBetween(startMoment, endMoment)) {
        setStatus("Ends in:");
        const duration = moment.duration(endMoment.diff(now));
        setTimeDisplay(
          `${Math.floor(duration.asDays())}d ${duration.hours().toString().padStart(2, "0")}h ${duration.minutes().toString().padStart(2, "0")}m`,
        );
        return;
      }

      // If not started yet
      if (now.isBefore(startMoment)) {
        setStatus("Starts in:");
        const duration = moment.duration(startMoment.diff(now));
        setTimeDisplay(
          `${Math.floor(duration.asDays())}d ${duration.hours().toString().padStart(2, "0")}h ${duration.minutes().toString().padStart(2, "0")}m`,
        );
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [data?.poStartsAt, data?.poEndsAt, data?.createdAt]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="relative">
      <Carousel
        autoplay={true}
        delayMs={5000}
        className="h-[320px] w-full mt-12 flex justify-center items-center"
        setApi={setApi}
      >
        <CarouselContent>
          {/* Static banner slide */}
          <CarouselItem>
            <div className="w-full relative z-50 flex justify-center">
              <Image
                src={"/banner.png"}
                alt=""
                width={1216}
                height={320}
                sizes="100%"
                className="w-full h-full rounded-3xl"
              />
              <div className="absolute top-[152px] flex flex-col gap-6 items-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="text-3xl text-neutral00 font-bold">
                    We are live on
                  </p>
                  <Image
                    src={"/wallets/Citrea.png"}
                    alt="citrea"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <p className="text-3xl text-neutral00 font-bold">
                    Citrea testnet!
                  </p>
                </div>
                <p className="text-lg text-neutral50">
                  Mint Park is live on Citrea testnet! Start minting and trading
                  NFTs.
                </p>
              </div>
            </div>
          </CarouselItem>

          {/* Dynamic data slide */}
          {data && data.logoKey && (
            <CarouselItem>
              <div className="w-full relative h-[320px] z-50 flex justify-center rounded-3xl overflow-hidden">
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    backgroundImage: data?.logoKey
                      ? `url(${s3ImageUrlBuilder(data.logoKey)})`
                      : "url(/path/to/fallback/image.png)",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                <div className="absolute flex bottom-0 w-full px-12 pt-24 bg-gradient-to-b from-transparent to-[#111315] h-full">
                  <div className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-3 w-[800px]">
                      <p className="text-3xl text-neutral00 font-bold">
                        {data?.name}
                      </p>
                      <p className="text-md text-neutral50">
                        {data?.description}
                      </p>
                    </div>
                    <div className="flex justify-between w-full items-center">
                      <div className="bg-white4 flex gap-2 px-4 py-3 rounded-xl text-lg font-medium text-neutral100 items-center">
                        {(status === "Indefinite" || status === "Ends in:") && (
                          <div className="bg-success20 h-4 w-4 rounded-full flex justify-center items-center">
                            <div className="w-2 h-2 bg-success rounded-full" />
                          </div>
                        )}
                        <p>{status}</p>
                        <p>{timeDisplay}</p>
                      </div>
                      {(status === "Indefinite" || status === "Ends in:") && (
                        <Link href={`/launchpad/${data.id}`}>
                          <Button>Go to minter</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>

        {/* Custom navigation buttons */}
        <div className="absolute -bottom-9 left-1/2 flex gap-4 transform -translate-x-1/2">
          <button
            onClick={() => api?.scrollTo(0)}
            className={`h-2 rounded-full transition-all duration-200 ${
              activeIndex === 0 ? "w-4 bg-brand" : "w-2 bg-neutral400"
            }`}
            aria-label="Go to slide 1"
          />
          <button
            onClick={() => api?.scrollTo(1)}
            className={`h-2 rounded-full transition-all duration-200 ${
              activeIndex === 1 ? "w-4 bg-brand" : "w-2 bg-neutral400"
            }`}
            aria-label="Go to slide 2"
          />
        </div>
      </Carousel>
    </div>
  );
};

export default LaunchpadBanner;
