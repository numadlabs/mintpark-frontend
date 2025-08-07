"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import CreaterLayout from "@/components/layout/createrLayout";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useRouter } from "next/navigation";
import { ContractDeploymentStep } from "@/components/createn-flow/ContractDeploymentStep";
import { TraitsUploadStep } from "@/components/createn-flow/TraitsUploadStep";
import { InscriptionStep } from "@/components/createn-flow/InscriptionStep";
import { ChainSelectionModal } from "@/components/createn-flow/ChainSelectionModal";
import {
  CreationFlowProvider,
  useCreationFlow,
} from "@/components/createn-flow/CreationFlowProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function CreateFlowContent() {
  const { currentStep, resetFlow } = useCreationFlow();
  const [showChainModal, setShowChainModal] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    resetFlow();
    router.push("/creater-tool");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ContractDeploymentStep />;
      case 2:
        return <TraitsUploadStep />;
      case 3:
        return (
          <InscriptionStep onComplete={() => router.push("/creater-tool")} />
        );
      default:
        return null;
    }
  };

  return (
    <CreaterLayout>
      <div className="min-h-screen w-full bg-darkPrimary">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-darkPrimary border-b border-transLight4">
          <div className="mx-auto py-4">
            <div className="flex h-[72px] justify-between items-center">
              <div>
                <Image
                  src="/textLogo.png"
                  alt="Mintpark logo"
                  width={146}
                  height={24}
                />
              </div>
              <div className="flex items-center justify-center gap-8">
                {currentStep > 0 && <ProgressSteps currentStep={currentStep} />}
              </div>
              <div className="">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="p-[10px] text-white bg-transLight4 hover:bg-transparent cursor-pointer"
                >
                  <X size={24} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center items-center min-h-[calc(100vh-72px)]">
          <div className="w-full mx-auto px-6">{renderCurrentStep()}</div>
        </div>

        {/* Chain Selection Modal */}
        <ChainSelectionModal
          isOpen={showChainModal && currentStep === 0}
          onClose={() => setShowChainModal(false)}
        />
      </div>
    </CreaterLayout>
  );
}

export default function CreatePage() {
  return (
    <CreationFlowProvider>
      <CreateFlowContent />
    </CreationFlowProvider>
  );
}
