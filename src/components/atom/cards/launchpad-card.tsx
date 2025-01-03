import React, { useEffect, useState } from "react";
import moment from "moment";
import { Progress } from "@/components/ui/progress";
import { LaunchDataType } from "@/lib/types";
import { s3ImageUrlBuilder,formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface LaunchProps {
  data: LaunchDataType;
  id: string;
}

const LaunchpadCard: React.FC<LaunchProps> = ({ data, id }) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (!data.poEndsAt) {
        setStatus("Indefinite");
        setTimeDisplay("");
        return;
      }

      const now = moment();

      const convertToSeconds = (timestamp: number) => {
        return timestamp.toString().length === 13
          ? Math.floor(timestamp / 1000)
          : timestamp;
      };

      const startMoment = moment.unix(convertToSeconds(data.poStartsAt));
      const endMoment = moment.unix(convertToSeconds(data.poEndsAt));

      if (now.isAfter(endMoment)) {
        setStatus("Ended");
        setTimeDisplay("");
        return;
      }

      if (now.isBetween(startMoment, endMoment)) {
        setStatus("Live");
        const duration = moment.duration(endMoment.diff(now));
        setTimeDisplay(
          `${Math.floor(duration.asDays())}d ${duration
            .hours()
            .toString()
            .padStart(2, "0")}h ${duration
            .minutes()
            .toString()
            .padStart(2, "0")}m`
        );
        return;
      }

      if (now.isBefore(startMoment)) {
        setStatus("Upcoming");
        const duration = moment.duration(startMoment.diff(now));
        setTimeDisplay(
          `${Math.floor(duration.asDays())}d ${duration
            .hours()
            .toString()
            .padStart(2, "0")}h ${duration
            .minutes()
            .toString()
            .padStart(2, "0")}m`
        );
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [data.poStartsAt, data.poEndsAt]);

 

  return (
    <Link href={`/launchpad/${id}`} className="relative h-auto w-full sm:h-auto sm:w-full md:h-[364px] md:w-full md2:h-auto md2:w-full 3xl:w-[280px] 3xl:h-[412px] flex flex-col backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] p-4 text-neutral00 transition-transform hover:scale-[1.02] duration-300">
        <div className="relative w-full flex justify-center items-center">
          <Image
            width={248}
            height={248}
            src={
              data?.logoKey
                ? s3ImageUrlBuilder(data.logoKey)
                : "/launchpads/launch_1.png"
            }
            className="object-cover rounded-xl aspect-square"
            alt={`${data.name || "Launchpad"} logo`}
          />
        </div>

        <div className="flex-1 w-full text-neutral00">
          <p className="pt-3 pb-3 text-lg sm:text-lg md:text-lg font-bold text-neutral50 line-clamp-2">
            {data?.name}
          </p>
          <div className="flex justify-between py-2 sm:py-3">
            <p className="font-medium text-sm sm:text-md text-neutral100">
              Price
            </p>
            <p className="font-bold text-sm sm:text-md text-neutral50">
              {formatPrice(data.poMintPrice)}
              <span className="ml-1">cBTC</span>
            </p>
          </div>
          <div className="flex h-2 mt-1 border border-white8 rounded-lg border-1">
            <Progress
              value={
                data?.supply > 0 ? (data?.mintedAmount / data?.supply) * 100 : 0
              }
              className={`w-full h-full ${
                data?.mintedAmount > 0 ? "" : ""
              }`}
            />
          </div>
          <p className="pt-2 sm:pt-3 font-bold text-sm sm:text-md text-end">
            {data?.mintedAmount}
            <span className="text-brand"> / </span>
            {data?.supply}
          </p>
        </div>

        <div className="absolute top-6 left-6 flex flex-row gap-2 items-center justify-around w-fit h-[30px] sm:h-[34px] border border-transparent rounded-lg px-3 py-2 bg-neutral500 bg-opacity-[50%] text-sm sm:text-md text-neutral50 font-medium">
          {(status === "Indefinite" || status === "Live") && (
            <div className="bg-success20 h-3 w-3 sm:h-4 sm:w-4 rounded-full flex justify-center items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full" />
            </div>
          )}
          <p>{status}</p>
        </div>
    </Link>
  );
};

export default LaunchpadCard;
