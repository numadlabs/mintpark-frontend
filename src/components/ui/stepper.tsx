import React from "react";

interface StepperProps {
  step: number;
  title: string;
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ step, title, currentStep }) => {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="w-[120px] flex flex-row gap-3 items-center justify-center">
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold 
                      ${
                        currentStep === step
                          ? "bg-brand text-neutral600"
                          : "text-neutral50 border-neutral50 border"
                      }`}
        >
          {step + 1}
        </div>
        <p
          className={`text-lg2 font-bold ${
            currentStep === step ? "text-brand" : "text-neutral50"
          } `}
        >
          {title}
        </p>
      </div>
    </div>
  );
};

export default Stepper;
