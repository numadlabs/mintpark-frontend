import React, { useEffect, useState } from "react";
import moment from "moment";
import { Progress } from "@/components/ui/progress";
import { LaunchDataType } from "@/lib/types";
import { s3ImageUrlBuilder } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface launchProps {
  data: LaunchDataType;
  id: string;
}

const LaunchpadCard: React.FC<launchProps> = ({ data, id }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = moment();
      const startTime = moment(data.poStartsAt);
      const endTime = moment(data.poEndsAt);

      if (now.isBefore(startTime)) {
        setStatus("Upcoming");
        return moment.duration(startTime.diff(now));
      } else if (now.isBefore(endTime)) {
        setStatus("Live");
        return moment.duration(endTime.diff(now));
      } else {
        setStatus("Ended");
        return moment.duration(0);
      }
    };

    const updateCountdown = () => {
      const difference = calculateTimeLeft();

      setTimeLeft({
        days: difference.days(),
        hours: difference.hours(),
        minutes: difference.minutes(),
      });

      // Update status based on conditions
      if (moment().isSameOrAfter(data.poStartsAt)) {
        setStatus("Live");
      }
      if (moment().isSameOrAfter(data.poEndsAt)) {
        setStatus("Ended");
      }
      if (moment().isBefore(data.poStartsAt)) {
        setStatus("Upcoming");
      }
      if (!data.poEndsAt) {
        setStatus("Indefinite");
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [data.poStartsAt, data.poEndsAt]);

  return (
    <Link href={`/launchpad/${id}`}>
      <div className="h-[412px] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-gray-700 rounded-[20px] px-4 pt-4 flex flex-col text-neutral00">
        <Image
          width={248}
          height={248}
          src={
            data?.logoKey
              ? s3ImageUrlBuilder(data.logoKey)
              : "/launchpads/launch_1.png"
          }
          className="aspect-square rounded-xl"
          alt="png"
        />

        <div className="text-neutral00">
          <p className="pt-3 pb-3 text-xl font-bold text-neutral50">
            {data?.name}
          </p>
          <div className="flex justify-between py-3">
            <p className="font-medium text-neutral100 text-md">Price</p>
            <p className="font-bold text-md text-neutral50">
              {data.poMintPrice / 10 ** 8}
              <span className="ml-1">BTC</span>
            </p>
          </div>
          <div className="flex h-2 mt-1 border border-gray-400 rounded-lg border-1">
          <Progress
            value={(data?.mintedAmount / data?.supply) * 100}
            className={`w-full h-full ${data?.mintedAmount === 0 ? "" : "shadow-shadowBrands"}`}
          />
          </div>
          <p className="pt-3 font-bold text-end text-md">
            {data?.mintedAmount}
            <span className="text-brand"> / </span>
            {data?.supply}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center justify-around w-fit h-[34px] border border-transparent rounded-lg pt-2 pr-3 pb-2 pl-3 absolute top-7 left-8 bg-neutral500 bg-opacity-[50%] text-md text-neutral50 font-medium">
          {(status === "Indefinite" || status === "Live") && (
            <div className="bg-success20 h-4 w-4 rounded-full flex justify-center items-center">
              <div className="w-2 h-2 bg-success rounded-full" />
            </div>
          )}
          <p>
            <span>{status}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default LaunchpadCard;
