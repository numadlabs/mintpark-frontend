import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const PendingModal = ({
  isOpen,
  onClose,
  currentStep = 1,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentStep?: number;
}) => {
  const steps = [
    { id: 1, title: "Initiating Transaction", description: "Starting the payment process" },
    { id: 2, title: "Waiting for onchain confirmation.", description: "Your payment is being processed." },
    { id: 3, title: "Confirming Mint", description: "Finalizing your NFT mint" }
  ];

  // Calculate progress percentage
  const progressValue = (currentStep / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
        <div className="w-full flex flex-col gap-6 pt-8 pb-8 bg-white4 justify-center items-center rounded-2xl">
          <div className="p-4 flex justify-center items-center bg-white8 rounded-full">
            <Loader2 className="animate-spin" color="#FFEE32" size={36} />
          </div>
          
          <div className="flex flex-col gap-3 justify-center items-center w-full px-8">
            <p className="text-brand text-2xl font-bold">Transaction in Progress</p>
            <p className="text-neutral100 text-start mb-2">
              Please wait while we process your transaction. This may take a few moments.
            </p>
            
            {/* Progress bar */}
            <div className="w-full mb-4 mt-2">
              <Progress value={progressValue} className="h-2" />
            </div>
            
            {/* Steps */}
            <div className="w-full space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start  gap-3">
                  <div className={`flex-shrink-0 h-6 w-6 rounded-full mt-0.5 flex items-center justify-center ${
                    step.id < currentStep ? "bg-brand" : 
                    step.id === currentStep ? "bg-brand/20" : 
                    "bg-neutral400"
                  }`}>
                    {step.id < currentStep ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#111315" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : step.id === currentStep ? (
                      <div className="h-2 w-2 bg-brand rounded-full"></div>
                    ) : null}
                  </div>
                  <div>
                    <p className={`text-md2 font-medium ${
                      step.id <= currentStep ? "text-neutral50" : "text-neutral200"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-md text-neutral200">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-8 bg-neutral800/10 rounded-lg mt-2 w-[90%] text-center">
            <p className="text-md text-neutral100">
              Please keep this window open until the process completes
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendingModal;
