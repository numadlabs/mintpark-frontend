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
import { useAuth } from "@/components/provider/auth-context-provider";

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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-white">MintPark</h1>
              </div>
              <div className="flex items-center justify-center gap-8">
                {currentStep > 0 && <ProgressSteps currentStep={currentStep} />}
              </div>
              <div className="">
                <button
                  onClick={handleClose}
                  className="p-2 text-lightSecondary hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-6">{renderCurrentStep()}</div>
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
