"use client"

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
import Countdown, { CountdownRenderProps } from "react-countdown";
import moment from "moment";
import { Unlimited } from "iconsax-react";

interface BannerProps {
  data?: Launchschema;
}

// Custom renderer for the countdown
const countdownRenderer = (props: CountdownRenderProps) => {
  const { days, hours, minutes, seconds, completed } = props;
  
  if (completed) {
    return "";
  }

  // If less than an hour remaining, show minutes and seconds
  if (days === 0 && hours === 0) {
    return `${minutes}m ${seconds}s`;
  }
  
  // If less than a day remaining, show hours and minutes
  if (days === 0) {
    return `${hours}h ${minutes}m`;
  }
  
  // Otherwise show days, hours and minutes
  return `${days}d ${hours}h ${minutes}m`;
};

const LaunchpadBanner: React.FC<BannerProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [status, setStatus] = useState("");
  const [isClickable, setIsClickable] = useState(false);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [key, setKey] = useState(0); // Key to force re-render of Countdown component
  const [activePhase, setActivePhase] = useState<
    "guaranteed" | "public" | "FCFS" | null
  >(null);

  // Only call useLaunchState if data exists
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const launchState = data ? useLaunchState(data as any) : LAUNCH_STATE.UNKNOWN;

  // Helper function to check if all phases have completed
  const areAllPhasesCompleted = () => {
    if (!data) return false;
    
    const now = moment().unix();

    // Make sure we're only checking phases that are actually configured
    const wlExists = data.isWhitelisted && data.wlStartsAt !== null && data.wlStartsAt > 0;
    const fcfsExists = data.hasFCFS && data.fcfsStartsAt !== null && data.fcfsStartsAt > 0;
    const poExists = data.poStartsAt !== null && data.poStartsAt > 0;

    // Check if all configured end times are in the past
    const wlEnded = !wlExists || (data.wlEndsAt !== null && data.wlEndsAt > 0 && data.wlEndsAt < now);
    const fcfsEnded = !fcfsExists || (data.fcfsEndsAt !== null && data.fcfsEndsAt > 0 && data.fcfsEndsAt < now);
    const poEnded = !poExists || (data.poEndsAt !== null && data.poEndsAt > 0 && data.poEndsAt < now);

    // Only return true if at least one phase was configured and all configured phases have ended
    const hasAnyPhase = wlExists || fcfsExists || poExists;
    return hasAnyPhase && wlEnded && fcfsEnded && poEnded;
  };

  // Helper function to check if any phase has started yet
  const hasAnyPhaseStarted = () => {
    if (!data) return false;
    
    const now = moment().unix();

    // Check if any start time is in the past
    const wlStarted =
      data.isWhitelisted && 
      data.wlStartsAt !== null &&
      data.wlStartsAt > 0 &&  // Ensure valid start time
      data.wlStartsAt <= now;
    
    const fcfsStarted =
      data.hasFCFS && 
      data.fcfsStartsAt !== null &&
      data.fcfsStartsAt > 0 &&  // Ensure valid start time
      data.fcfsStartsAt <= now;
    
    const poStarted = 
      data.poStartsAt !== null &&
      data.poStartsAt > 0 &&  // Ensure valid start time
      data.poStartsAt <= now;

    return wlStarted || fcfsStarted || poStarted;
  };

  // Helper function to check if all supplies are exhausted
  const isSupplyExhausted = () => {
    if (!data) return false;
    
    // For badges with infinite supply, supply is never exhausted
    if (data.isBadge && data.badgeSupply === null) {
      return false;
    }

    return data.supply === data.mintedAmount;
  };

  // Determine if mint is currently active
  const isMintActive = () => {
    if (!data) return false;
    
    const now = moment().unix();

    // For badges with infinite supply, only check if it's started
    if (data.isBadge && data.badgeSupply === null) {
      // Check whitelist period - only if it exists
      const isInWhitelistPeriod =
        data.isWhitelisted &&
        data.wlStartsAt !== null &&
        data.wlStartsAt > 0 &&
        data.wlStartsAt <= now &&
        (data.wlEndsAt === null || data.wlEndsAt === 0 || data.wlEndsAt > now);

      // Check fcfs period - only if it exists
      const isInFcfslistPeriod =
        data.hasFCFS &&
        data.fcfsStartsAt !== null &&
        data.fcfsStartsAt > 0 &&
        data.fcfsStartsAt <= now &&
        (data.fcfsEndsAt === null || data.fcfsEndsAt === 0 || data.fcfsEndsAt > now);

      // Check public period - only if it exists
      const isInPublicPeriod =
        data.poStartsAt !== null &&
        data.poStartsAt > 0 &&
        data.poStartsAt <= now &&
        (data.poEndsAt === null || data.poEndsAt === 0 || data.poEndsAt > now);

      return isInWhitelistPeriod || isInPublicPeriod || isInFcfslistPeriod;
    }

    // If supply is reached for non-infinite supply, minting is not active
    if (!data.isBadge && data.supply === data.mintedAmount) {
      return false;
    }

    // Check whitelist period - only if it exists
    const isInWhitelistPeriod =
      data.isWhitelisted &&
      data.wlStartsAt !== null &&
      data.wlStartsAt > 0 &&
      data.wlStartsAt <= now &&
      (data.wlEndsAt === null || data.wlEndsAt === 0 || data.wlEndsAt > now);

    // Check fcfs period - only if it exists
    const isInFcfslistPeriod =
      data.hasFCFS &&
      data.fcfsStartsAt !== null &&
      data.fcfsStartsAt > 0 &&
      data.fcfsStartsAt <= now &&
      (data.fcfsEndsAt === null || data.fcfsEndsAt === 0 || data.fcfsEndsAt > now);

    // Check public period - only if it exists
    const isInPublicPeriod =
      data.poStartsAt !== null &&
      data.poStartsAt > 0 &&
      data.poStartsAt <= now &&
      (data.poEndsAt === null || data.poEndsAt === 0 || data.poEndsAt > now);

    return isInWhitelistPeriod || isInPublicPeriod || isInFcfslistPeriod;
  };

  // Determine the active phase
  const determineActivePhase = () => {
    if (!data) return null;
    
    const now = moment();

    // Check Guaranteed (Whitelist) phase
    if (data.isWhitelisted && data.wlStartsAt !== null && data.wlStartsAt > 0) {
      const wlStart = moment.unix(data.wlStartsAt);
      const wlEnd = data.wlEndsAt !== null ? moment.unix(data.wlEndsAt) : null;

      if ((wlEnd && now.isBetween(wlStart, wlEnd)) || 
          (data.wlStartsAt <= now.unix() && (data.wlEndsAt === null || data.wlEndsAt === 0))) {
        return "guaranteed";
      }
    }

    // Check FCFS list phase
    if (data.hasFCFS && data.fcfsStartsAt !== null && data.fcfsStartsAt > 0) {
      const fcfsStart = moment.unix(data.fcfsStartsAt);
      const fcfsEnd = data.fcfsEndsAt !== null ? moment.unix(data.fcfsEndsAt) : null;

      if ((fcfsEnd && now.isBetween(fcfsStart, fcfsEnd)) || 
          (data.fcfsStartsAt <= now.unix() && (data.fcfsEndsAt === null || data.fcfsEndsAt === 0))) {
        return "FCFS";
      }
    }

    // Check Public phase
    if (data.poStartsAt !== null && data.poStartsAt > 0) {
      const poStart = moment.unix(data.poStartsAt);
      const poEnd = data.poEndsAt !== null ? moment.unix(data.poEndsAt) : null;

      if ((poEnd && now.isBetween(poStart, poEnd)) || 
          (data.poStartsAt <= now.unix() && (data.poEndsAt === null || data.poEndsAt === 0))) {
        return "public";
      }
    }

    return null;
  };

  // Comprehensive function to determine which button to show
  const determineButtonState = () => {
    if (!data) return "unavailable";
    
    // 1. If supply is exhausted, show "Go to Collection"
    if (isSupplyExhausted()) {
      return "goToCollection";
    }

    // 2. If mint is currently active, show "Mint"
    if (isMintActive()) {
      return "mint";
    }

    // 3. If all phases have completed (but supply remains), show "Go to Collection"
    if (areAllPhasesCompleted()) {
      return "goToCollection";
    }

    // 4. If no phase has started yet, show "Minting Soon"
    if (!hasAnyPhaseStarted()) {
      return "mintingSoon";
    }

    // 5. Default: if phases exist in the future, show "Minting Soon"
    return "mintingSoon";
  };

  useEffect(() => {
    if (!data) return;
    
    const updateStatus = () => {
      // Get the current active phase
      const currentPhase = determineActivePhase();
      setActivePhase(currentPhase);
      
      // Check the overall button state to determine proper display
      const buttonState = determineButtonState();
      
      // Set the status and clickability based on the current state
      switch (buttonState) {
        case "mint":
          setStatus("Live");
          setIsClickable(true);
          
          // Set target time based on when the current phase ends
          if (currentPhase === "guaranteed" && data.wlEndsAt !== null && data.wlEndsAt > 0) {
            setStatus("Ends in:");
            setTargetTime(data.wlEndsAt * 1000);
          } else if (currentPhase === "FCFS" && data.fcfsEndsAt !== null && data.fcfsEndsAt > 0) {
            setStatus("Ends in:");
            setTargetTime(data.fcfsEndsAt * 1000);
          } else if (currentPhase === "public" && data.poEndsAt !== null && data.poEndsAt > 0) {
            setStatus("Ends in:");
            setTargetTime(data.poEndsAt * 1000);
          } else {
            // No defined end time, show as "Live" without countdown
            setTargetTime(null);
          }
          break;
          
        case "goToCollection":
          if (isSupplyExhausted()) {
            setStatus("Sold Out");
          } else {
            setStatus("Ended");
          }
          setTargetTime(null);
          setIsClickable(true);
          break;
          
        case "mintingSoon":
          setStatus("Upcoming");
          setIsClickable(false);
          
          // Set target time to the earliest upcoming phase
          let earliestStart = Number.MAX_SAFE_INTEGER;
          
          if (data.isWhitelisted && data.wlStartsAt !== null && data.wlStartsAt > 0 && data.wlStartsAt > moment().unix()) {
            earliestStart = Math.min(earliestStart, data.wlStartsAt);
          }
          
          if (data.hasFCFS && data.fcfsStartsAt !== null && data.fcfsStartsAt > 0 && data.fcfsStartsAt > moment().unix()) {
            earliestStart = Math.min(earliestStart, data.fcfsStartsAt);
          }
          
          if (data.poStartsAt !== null && data.poStartsAt > 0 && data.poStartsAt > moment().unix()) {
            earliestStart = Math.min(earliestStart, data.poStartsAt);
          }
          
          if (earliestStart !== Number.MAX_SAFE_INTEGER) {
            setTargetTime(earliestStart * 1000);
          } else {
            setTargetTime(null);
          }
          break;
          
        default:
          setStatus("Unknown");
          setTargetTime(null);
          setIsClickable(false);
      }
      
      // Update the key to force re-render of the Countdown component
      setKey(prevKey => prevKey + 1);
    };
    
    updateStatus();
    
    // Set up an interval to update the status every minute
    const intervalId = setInterval(updateStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, [data]);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Helper function to format current phase name for display
  const getPhaseDisplayName = () => {
    switch (activePhase) {
      case "guaranteed":
        return "Guaranteed";
      case "FCFS":
        return "FCFS";
      case "public":
        return "Public";
      default:
        return "";
    }
  };

  // Helper function to render supply display
  // const renderSupplyDisplay = () => {
  //   if (!data) return null;
    
  //   if (data.isBadge && data.badgeSupply === null) {
  //     return (
  //       <div className="flex gap-1 items-center">
  //         <span className="text-neutral50 font-medium text-lg">
  //           {data?.mintedAmount}
  //         </span>
  //         <span className="text-brand font-medium text-lg"> / </span>
  //         <span className="text-neutral200 font-medium text-lg">
  //           <Unlimited size="18" color="#88898A" />
  //         </span>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="flex gap-1 items-center">
  //       <span className="text-neutral50 font-medium text-lg">
  //         {data?.mintedAmount}
  //       </span>
  //       <span className="text-brand font-medium text-lg"> / </span>
  //       <span className="text-neutral200 font-medium text-lg">
  //         {data?.supply}
  //       </span>
  //     </div>
  //   );
  // };

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
                        
                        {/* Display minted amount */}
                        {/* <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral50">Total minted:</span>
                          {renderSupplyDisplay()}
                        </div> */}
                        
                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                          <div className="bg-white4 flex gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm lg:text-base font-medium text-neutral100 items-center w-fit">
                            {isMintActive() && (
                              <div className="bg-success20 h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 rounded-full flex justify-center items-center">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-success rounded-full" />
                              </div>
                            )}
                            <p className="text-lg font-normal text-neutral100">
                              {status} {activePhase ? `(${getPhaseDisplayName()})` : ""}
                            </p>
                            <p className="text-lg font-medium text-neutral00">
                              {targetTime ? (
                                <Countdown 
                                  key={key}
                                  date={targetTime} 
                                  renderer={countdownRenderer}
                                  precision={1} // Update every second
                                />
                              ) : ""}
                            </p>
                          </div>
                          
                          {isClickable && (
                            <Link
                              href={`/launchpad/${data.id}`}
                              className="sm:ml-auto text-neutral600"
                            >
                              <Button className="w-full text-neutral600 sm:w-auto text-md2">
                                {determineButtonState() === "mint" ? "Go to minter" : "View details"}
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