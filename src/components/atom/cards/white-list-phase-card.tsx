import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Lock1 } from "iconsax-react";
import moment from "moment";

interface PhaseCardItemProps {
  maxMintPerWallet: string;
  mintPrice: number;
  endsAt: number;
  startsAt: number;
  isActive: boolean;
  onClick: () => void;
}

const WhiteListPhaseCard: React.FC<PhaseCardItemProps> = ({
  maxMintPerWallet,
  mintPrice,
  endsAt,
  startsAt,
  isActive,
  onClick,
}) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = moment();
      const start = moment(startsAt);
      const end = moment(endsAt);

      if (now.isAfter(end)) {
        setStatus("Ended");
        setTimeDisplay("");
      } else if (now.isAfter(start)) {
        setStatus("Ends in:");
        const duration = moment.duration(end.diff(now));
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        setTimeDisplay(`${days}d ${hours}h ${minutes}m`);
      } else {
        setStatus("Starts in:");
        const duration = moment.duration(start.diff(now));
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        setTimeDisplay(`${days}d ${hours}h ${minutes}m`);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [startsAt, endsAt]);

  return (
    <button
      className={`flex flex-col justify-between border ${isActive ? "border-brand" : "border-brand"} rounded-3xl p-5 gap-4 ${status === "Ended" ? "cursor-not-allowed" : "cursor-auto"} `}
      disabled={status === "Ended"}
      onClick={onClick}
    >
      <div className="flex justify-between w-full">
        <div className="flex flex-row gap-2 items-center bg-white8 px-3 py-2 text-md font-medium rounded-lg">
          <p className={`${isActive ? "text-brand500" :  "text-neutral50"}`}>Guaranteed</p>
          {status === "Ended" || status === "Starts in:" ? (
            <Lock1 size={16} color="#D7D8D8" />
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-row items-center gap-2 border bg-white8 border-transparent text-md rounded-lg px-3 py-2 text-neutral50">
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
            <h1 className="text-neutral200">Max:</h1>
            <h2 className="text-neutral50">
              <span>{maxMintPerWallet}</span> per wallet
            </h2>
          </div>
        </>
      )}
    </button>
  );
};

export default WhiteListPhaseCard;
