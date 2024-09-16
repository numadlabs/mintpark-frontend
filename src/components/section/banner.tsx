import React, { useState } from "react";
import Image from "next/image";
import Stepper from "../ui/stepper";
import { useStateStep } from "@/lib/store/stepStore";

interface bannerProps {
  title: string;
  image: any;
  setStep: number;
  stepperData: string[];
}

const Banner: React.FC<bannerProps> = ({
  title,
  image,
  setStep,
  stepperData,
}) => {
  const { currentStep } = useStateStep();
  setStep === currentStep;

  return (
    <div className="flex flex-col gap-12 w-full mt-[72px] items-center">
      <div className="relative w-full h-[188px] flex justify-center max-w-[1216px]">
        <Image
          src={image}
          alt="background"
          width={0}
          height={160}
          sizes="100%"
          className="w-full h-full object-cover rounded-3xl"
        />
        <div className="bg-bannerBlack absolute w-full top-0 h-full rounded-3xl flex flex-col items-center justify-center backdrop-blur-3xl gap-8">
          <p className="text-4xl text-neutral50 font-bold">{title}</p>
          <div className="flex flex-row gap-4 items-center">
            {stepperData.map((item, index) => (
              <React.Fragment key={index}>
                <Stepper
                  key={index}
                  step={index}
                  title={item}
                  currentStep={setStep}
                />
                {index !== stepperData.length -1 && <div className="w-8 h-0.5 bg-neutral50"/>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
