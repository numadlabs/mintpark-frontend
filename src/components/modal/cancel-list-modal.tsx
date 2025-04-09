import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Loader2, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelList, confirmCancelList } from "@/lib/service/postRequest";
import { getSigner } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "../ui/progress";
import Image from "next/image";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  id: string;
  listId: string | null;
}

const CancelListModal: React.FC<ModalProps> = ({
  open,
  onClose,
  id,
  listId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [success, setSuccess] = useState(false);
  // Define the steps for the cancellation process
  // const steps = [
  //   { id: 0, title: "Preparing Cancellation", description: "Creating transaction to delist your asset" },
  //   { id: 1, title: "Processing On-chain", description: "Waiting for blockchain confirmation" },
  //   { id: 2, title: "Finalizing Cancellation", description: "Completing the delisting process" }
  // ];

  const steps = [
    {
      id: 0,
      title: "Initiating Withdrawal",
      description:
        "Preparing the blockchain request to remove your asset from the marketplace",
    },
    {
      id: 1,
      title: "Verification in Progress",
      description:
        "Your cancellation request is being confirmed by the blockchain network",
    },
    {
      id: 2,
      title: "Retrieval Complete",
      description:
        "Your asset has been successfully returned to your full control",
    },
  ];

  // Calculate progress percentage
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  const { mutateAsync: cancelListMutation } = useMutation({
    mutationFn: cancelList,
  });

  const { mutateAsync: confirmCancelListMutation } = useMutation({
    mutationFn: confirmCancelList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["activityData", id] });
    },
  });

  const handleCancelList = async () => {
    setIsLoading(true);

    try {
      if (listId) {
        // Show the pending modal with progress
        setShowPendingModal(true);
        setCurrentStep(0);

        // Step 1: Initialize cancellation
        const txResponse = await cancelListMutation({ id: listId });

        if (txResponse && txResponse.data.result) {
          // Step 2: Confirm on blockchain
          setCurrentStep(1);

          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(
            txResponse.data.result
          );
          await signedTx?.wait();

          if (!signedTx?.hash) throw new Error("TX id not found");

          // Here you might want to fetch asset data
          // This is placeholder code - you would typically fetch this data from an API
          try {
            // Example API call to get asset data
            // const assetData = await fetchAssetData(id);
            // setImageUrl(assetData.imageUrl);
            // setCollectionName(assetData.collectionName);
            // setName(assetData.name);
            // setPrice(assetData.price);
          } catch (error) {
            console.error("Error fetching asset data:", error);
          }

          // Step 3: Finalize cancellation
          setCurrentStep(2);

          const response = await confirmCancelListMutation({
            id: listId,
            txid: signedTx.hash,
          });

          if (response && response.success) {
            // Give a moment for the user to see the completed progress
            setTimeout(() => {
              setSuccess(true);
              setShowPendingModal(false);
              // toast.success("Successfully cancelled.");
            }, 1000);
          } else {
            // Handle unsuccessful confirmation
            setIsLoading(false);
            setShowPendingModal(false);
            toast.error("Failed to confirm cancellation.");
          }
        } else {
          // Handle unsuccessful transaction response
          setIsLoading(false);
          setShowPendingModal(false);
          toast.error("Failed to prepare cancellation transaction.");
        }
      }
    } catch (error: any) {
      setShowPendingModal(false);
      setIsLoading(false);
      console.error("Error cancelling listing:", error);
      toast.error(
        "Error cancel listing: " + (error.message || "Unknown error")
      );
    }
  };

  const renderContent = () => {
    if (success) {
      // Success state
      return (
        <div className="flex flex-col gap-6 w-full items-center justify-center">
          <div className="flex flex-col gap-6 justify-center items-center w-full">
            <div className="flex justify-center p-3 items-center rounded-2xl bg-white8">
              <Check size={40} color="#FFEE32" />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-center text-2xl text-brand font-bold">
                Cancellation Successful!
              </p>
              <p className="text-lg font-medium text-neutral50">
                Your listing has been successfully cancelled.
              </p>
            </div>
          </div>
          {/* <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
            <Image
              width={160}
              height={160}
              draggable="false"
              src={imageUrl}
              className="aspect-square rounded-xl"
              alt={`Asset image`}
            />
            <div className="flex flex-col gap-2 justify-center items-center">
              <p className="text-brand text-lg font-medium">
                {collectionName}
              </p>
              <p className="text-xl text-neutral00 font-bold">{name}</p>
            </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <div className="flex flex-row items-center w-full justify-between rounded-2xl p-4 bg-white8">
            <p className="text-neutral100 text-lg font-medium">
              Cancelled price
            </p>
            <p className="text-brand text-lg font-bold">{price}</p>
          </div> */}
          <div className="bg-white8 w-full h-[1px]" />
          <Button variant={"secondary"} onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      );
    } else if (showPendingModal) {
      // Pending state with progress
      return (
        <div className="w-full flex flex-col gap-6 pt-8 pb-8 bg-white4 justify-center items-center rounded-2xl">
          <div className="p-4 flex justify-center items-center bg-white8 rounded-full">
            <Loader2 className="animate-spin" color="#FFEE32" size={36} />
          </div>

          <div className="flex flex-col gap-3 justify-center items-center w-full px-8">
            <p className="text-brand text-2xl font-bold">
              Transaction in Progress
            </p>
            <p className="text-neutral100 text-start mb-2">
              Please wait while we process your cancellation. This may take a
              few moments.
            </p>

            {/* Progress bar */}
            <div className="w-full mb-4 mt-2">
              <Progress value={progressValue} className="h-2" />
            </div>

            {/* Steps */}
            <div className="w-full space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start w-full gap-3">
                  <div
                    className={`flex-shrink-0 h-6 w-6 rounded-full mt-0.5 flex items-center justify-center ${
                      step.id < currentStep
                        ? "bg-brand"
                        : step.id === currentStep
                        ? "bg-brand/20"
                        : "bg-neutral400"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#111315"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : step.id === currentStep ? (
                      <div className="h-2 w-2 bg-brand rounded-full"></div>
                    ) : null}
                  </div>
                  <div>
                    <p
                      className={`text-md2 font-medium ${
                        step.id <= currentStep
                          ? "text-neutral50"
                          : "text-neutral200"
                      }`}
                    >
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
      );
    } else {
      // Initial confirmation state
      return (
        <>
          <div className="w-full flex flex-col gap-8 pt-12 pb-8 bg-white4 justify-center items-center rounded-2xl">
            <div className="w-20 h-20 flex justify-center items-center bg-white8 rounded-2xl">
              <X size={32} color="#FF5C69" />
            </div>
            <div className="flex flex-col gap-3 justify-center items-center">
              <p className="text-neutral00 text-2xl font-bold">
                Cancel Listing
              </p>
              <p className="text-lg text-neutral50 font-medium">
                Are you sure you want to cancel listing?
              </p>
            </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <DialogFooter className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              className="bg-white8 w-full"
              onClick={onClose}
            >
              No
            </Button>
            <Button onClick={handleCancelList} disabled={isLoading}>
              {isLoading && !showPendingModal ? (
                <Loader2 className="animate-spin" color="#111315" size={24} />
              ) : (
                "Yes, Cancel Listing"
              )}
            </Button>
          </DialogFooter>
        </>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset state when dialog is closed
          setSuccess(false);
          setShowPendingModal(false);
          setIsLoading(false);
          setCurrentStep(0);
          onClose();
        }
      }}
    >
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default CancelListModal;
