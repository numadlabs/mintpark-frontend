import { Lock1 } from "iconsax-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment";

interface PhaseCardItemProps {
  maxMintPerWallet: number;
  mintPrice: number;
  endsAt: number;
  startsAt: number;
  isActive: boolean;
  onClick: () => void;
  createdAt: string;
}

const PhaseCard: React.FC<PhaseCardItemProps> = ({
  maxMintPerWallet,
  mintPrice,
  endsAt,
  startsAt,
  isActive,
  onClick,
  createdAt,
}) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const updateTime = () => {
      // If endsAt is undefined, set status to Indefinite
      if (!endsAt) {
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

      const startMoment = moment.unix(convertToSeconds(startsAt));
      const endMoment = moment.unix(convertToSeconds(endsAt));
      const createMoment = moment(createdAt);

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

      // If not started yet
      if (now.isBefore(startMoment)) {
        setStatus("Starts in:");
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
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startsAt, endsAt, createdAt]);

  return (
    <button
      className={`flex flex-col justify-between border ${
        isActive ? "border-brand500" : "border-brand500"
      } rounded-3xl p-5 gap-4 ${
        status === "Ended" ? "cursor-not-allowed" : "cursor-auto"
      } `}
      disabled={status === "Ended" || status === "Starts in:"}
      onClick={onClick}
    >
      <div className="flex justify-between w-full">
        <div className="flex flex-row gap-2 items-center bg-white8 px-3 py-2 text-md font-medium  rounded-lg">
          <p className={`${isActive ? "text-brand500" : "text-brand500"}`}>
            Public
          </p>
          {status === "Ended" || status === "Starts in:" ? (
            <Lock1 size={16} color="#D7D8D8" />
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-row items-center gap-2 border bg-white8 border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3 text-neutral50">
          <span className="text-neutral100 font-medium text-md">{status}</span>
          <span className="text-neutral50 font-medium text-md">{timeDisplay}</span>
        </div>
      </div>
      {status === "Ended" ? (
        ""
      ) : (
        <>
          <div className="flex gap-2">
            <Image
              width={20}
              height={20}
              src="/detail_icon/Bitcoin.png"
              alt="Bitcoin icon"
              className="aspect-square h-5 w-5"
            />
            {mintPrice !== undefined && (
              <p className="text-neutral50">
                <span className="mr-1">{mintPrice}</span>
                cBTC
              </p>
            )}
          </div>
          <div className="flex justify-between w-full text-md font-medium">
            <h1 className="text-neutral100">Max:</h1>
            <h2 className="text-neutral50">
              <span>{maxMintPerWallet}</span> per wallet
            </h2>
          </div>
        </>
      )}
    </button>
  );
};

export default PhaseCard;
