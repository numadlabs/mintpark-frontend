import React, { useState } from "react";
import Image from "next/image";
import { collection } from "@/lib/constants";

interface PhaseCardItemProps {
  type: "Guaranteed" | "Public";
  endTime: string;
  price?: number;
  maxPerWallet: number;
  onClick: () => void;
  isActive: boolean;
}

const PhaseCardItem: React.FC<PhaseCardItemProps> = ({ 
  type, 
  endTime, 
  price, 
  maxPerWallet, 
  onClick, 
  isActive 
}) => {
  const isGuaranteed = type === "Guaranteed";
  const statusText = isGuaranteed ? "Ends in:" : "Starts in:";

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between border rounded-3xl p-5 gap-4 ${
        isActive ? "border-brand" : "border-neutral400"
      }`}
    >
      <div className="flex justify-between">
        <span className={`text-md rounded-lg pt-2 pr-3 pb-2 pl-3 flex items-center gap-2 ${
          isGuaranteed ? "text-brand" : "text-neutral50"
        } border bg-neutral400 bg-opacity-[30%] border-transparent`}>
          {type}
          {!isGuaranteed && (
            <Image
              width={16}
              height={16}
              src="/launchpads/lock.png"
              alt="Lock icon"
              className="aspect-square"
            />
          )}
        </span>
        <p className="border bg-neutral400 bg-opacity-[30%] border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3 text-neutral50">
          <span className="text-neutral-100">{statusText}</span> {endTime}
        </p>
      </div>
      <div className="flex">
        <Image
          width={24}
          height={24}
          src="/detail_icon/Bitcoin.png"
          alt="Bitcoin icon"
          className="aspect-square"
        />
        {price !== undefined && (
          <p className="pl-2 text-neutral50">
            <span className="mr-1">{price / 10 ** 8}</span>
            BTC
          </p>
        )}
      </div>
      <div className="text-md">
        <div className="flex justify-between">
          <h1 className="text-neutral100">Max:</h1>
          <h2 className="text-neutral50">
            <span>{maxPerWallet}</span> per wallet
          </h2>
        </div>
      </div>
    </div>
  );
};

interface Phase {
  type: "Guaranteed" | "Public";
  endTime: string;
  maxPerWallet: number;
}

const PhaseCard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const phases: Phase[] = [
    { type: "Guaranteed", endTime: "7d 11h 31m", maxPerWallet: 3 },
    { type: "Public", endTime: "7d 11h 31m", maxPerWallet: 3 }
  ];

  return (
    <>
      {phases.map((phase, index) => (
        <PhaseCardItem
          key={index}
          {...phase}
          price={collection?.price}
          onClick={() => setActiveIndex(index)}
          isActive={activeIndex === index}
        />
      ))}
    </>
  );
}

export default PhaseCard;