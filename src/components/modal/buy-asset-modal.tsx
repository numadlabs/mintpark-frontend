import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice, getSigner } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateBuyHex,
  buyListedCollectible,
} from "@/lib/service/postRequest";
import { toast } from "sonner";
import { useAuth } from "../provider/auth-context-provider";
import { getCurrencySymbol } from "@/lib/service/currencyHelper";
import { getLayerById } from "@/lib/service/queryHelper";
import { Progress } from "../ui/progress";


interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  collectionName: string;
  name: string;
  uniqueIdx: string;
  price: number;
  listId: string | null;
  isOwnListing: boolean;
}

const BuyAssetModal: React.FC<ModalProps> = ({
  open,
  onClose,
  fileKey,
  collectionName,
  name,
  uniqueIdx,
  price,
  listId,
  isOwnListing,
}) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const { authState } = useAuth();

  const id = params.detailId as string;
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Define the steps for the purchase process
  // const steps = [
  //   { id: 0, title: "Preparing Purchase", description: "Creating transaction for your purchase" },
  //   { id: 1, title: "Processing On-chain", description: "Waiting for blockchain confirmation" },
  //   { id: 2, title: "Finalizing Purchase", description: "Completing the purchase process" }
  // ];

  const steps = [
    { 
      id: 0, 
      title: "Securing Your Asset", 
      description: "Initializing a secure transaction pathway for your digital purchase" 
    },
    { 
      id: 1, 
      title: "Network Validation", 
      description: "Your transaction is being verified by the decentralized blockchain network" 
    },
    { 
      id: 2, 
      title: "Transfer Completion", 
      description: "Finalizing ownership rights and delivering the asset to your wallet" 
    }
  ];

  // Calculate progress percentage
  const progressValue = (currentStep / 3) * 100;

  const { data: currentLayer = [] } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const { mutateAsync: generateBuyHexMutation } = useMutation({
    mutationFn: generateBuyHex,
  });
  const { mutateAsync: buyListedCollectibleMutation } = useMutation({
    mutationFn: buyListedCollectible,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["activityData", id] });
    },
  });

  const handlePendingList = async () => {
    setIsLoading(true);
    setShowPendingModal(true);
    setCurrentStep(0);
    
    try {
      // Step 1: Initialize purchase
      const pendingRes = await generateBuyHexMutation({
        id: listId,
        feeRate: 1,
        userLayerId: authState.userLayerId as string,
      });
      
      if (pendingRes && pendingRes.success) {
        // Step 2: Process transaction
        setCurrentStep(1);
        
        let txid;
        const { signer } = await getSigner();
        const signedTx = await signer?.sendTransaction(pendingRes.data.txHex);
        await signedTx?.wait();

        if (signedTx?.hash) {
          // Step 3: Finalize purchase
          setCurrentStep(2);
          
          const response = await buyListedCollectible({
            id: listId,
            txid: signedTx?.hash,
            userLayerId: authState.userLayerId as string,
          });
          
          if (response && response.success) {
            // Give a moment for the user to see the completed progress
            setTimeout(() => {
              setIsSuccess(true);
              setShowPendingModal(false);
              toast.success("Purchase successfully.",);
              queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
              queryClient.invalidateQueries({ queryKey: ["activityData", id] });
            }, 1000);
          } else {
            setShowPendingModal(false);
            toast.error("This listing has been cancelled.",);
          }
        } 
        else {
          setShowPendingModal(false);
          toast.error("This listing has been cancelled.");
        }
      } else {
        setShowPendingModal(false);
        toast.error("This listing has been cancelled.");
      }
    } catch (error: any) {
      setShowPendingModal(false);
      toast.error("This item has already been sold.", );
    } finally {
      if (!isSuccess) {
        setIsLoading(false);
      }
    }
  };

  // Initial buy form
  const renderInitialForm = () => (
    <div className="w-full items-center flex flex-col gap-6">
      <DialogHeader className="flex w-full">
        <div className="text-xl text-neutral00 font-bold text-center">
          Buy Asset
        </div>
      </DialogHeader>
      <div className="bg-white8 w-full h-[1px]" />
      <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
        <Image
          width={160}
          height={160}
          draggable="false"
          src={fileKey}
          className="aspect-square rounded-xl"
          alt={`logo`}
        />
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-brand text-lg font-medium">
            {collectionName}
          </p>
          <p className="text-xl text-neutral00 font-bold">{name}</p>
        </div>
      </div>
      <div className="bg-white8 w-full h-[1px]" />
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-5 bg-white4 p-4 rounded-2xl">
          <div className="w-full flex flex-row items-center justify-between">
            <p className="text-lg text-neutral100 font-medium">
              List Price
            </p>
            <p className="text-lg text-neutral50 font-bold">
              {formatPrice(price)}{" "}
              {getCurrencySymbol(currentLayer.layer)}
            </p>
          </div>
        </div>
      </div>
      <DialogFooter className="grid grid-cols-2 gap-2 w-full">
        <Button
          variant="secondary"
          className="bg-white8 w-full"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button onClick={handlePendingList} disabled={isLoading}>
          {isLoading && !showPendingModal ? (
            <Loader2
              className="animate-spin w-full"
              color="#111315"
              size={24}
            />
          ) : (
            "Buy"
          )}
        </Button>
      </DialogFooter>
      <button
        className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
        onClick={onClose}
      >
        <X size={20} color="#D7D8D8" />
      </button>
    </div>
  );

  // Pending state with progress indicator
  const renderPendingState = () => (
    <div className="w-full flex flex-col gap-6 pt-8 pb-8 bg-white4 justify-center items-center rounded-2xl">
      <div className="p-4 flex justify-center items-center bg-white8 rounded-full">
        <Loader2 className="animate-spin" color="#FFEE32" size={36} />
      </div>
      
      <div className="flex flex-col gap-3 justify-center items-center w-full px-8">
        <p className="text-brand text-2xl font-bold">Transaction in Progress</p>
        <p className="text-neutral100 text-start mb-2">
          Please wait while we process your purchase. This may take a few moments.
        </p>
        
        {/* Progress bar */}
        <div className="w-full mb-4 mt-2">
          <Progress value={progressValue} className="h-2" />
        </div>
        
        {/* Steps */}
        <div className="w-full space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start w-full gap-3">
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
  );

  // Success state
  const renderSuccessState = () => (
    <div className="w-full flex flex-col gap-6 items-center justify-center">
      <div className="flex flex-col gap-6 p-4 w-full justify-center items-center">
        <div className="p-3 flex justify-center items-center rounded-2xl bg-white8 w-16 h-16">
          <Check size={40} color="#FFEE32" />
        </div>
        <div className="flex flex-col gap-3 justify-center items-center">
          <p className="text-2xl text-brand font-bold">
            Purchase Successful!
          </p>
          <p className="text-lg text-neutral50 font-medium">
            Your purchase was completed successfully.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6 justify-center items-center w-full bg-white4 rounded-2xl p-8">
        <Image
          width={160}
          draggable="false"
          height={160}
          src={fileKey}
          className="aspect-square rounded-xl"
          alt={`logo`}
        />
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-lg text-brand font-medium">
            {collectionName}
          </p>
          <p className="text-xl text-neutral50 font-bold">{name}</p>
        </div>
      </div>
      <div className="h-[1px] w-full bg-white8" />
      <Button
        variant={"secondary"}
        className="w-full"
        onClick={onClose}
      >
        Done
      </Button>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          {showPendingModal ? (
            renderPendingState()
          ) : isSuccess ? (
            renderSuccessState()
          ) : (
            renderInitialForm()
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuyAssetModal;