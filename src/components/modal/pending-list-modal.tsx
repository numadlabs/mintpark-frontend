import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSigner } from "@/lib/utils";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmPendingList,
  listCollectiblesForConfirm,
} from "@/lib/service/postRequest";
import { toast } from "sonner";
import { Progress } from "../ui/progress";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  uniqueIdx: string;
  collectionName: string;
  name: string;
  collectibleId: string;
  txid: string;
  id: string;
  isOwnListing: boolean;
  onRefresh?: () => void;
  collectionId?: string; // Add collectionId prop
}

const PendingListModal: React.FC<ModalProps> = ({
  open,
  onClose,
  imageUrl,
  uniqueIdx,
  collectionName,
  name,
  collectibleId,
  txid,
  id,
  isOwnListing,
  onRefresh,
  collectionId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPendingState, setShowPendingState] = useState(false);

  // Special collection ID that gets automatic pricing
  const SPECIAL_COLLECTION_ID = "bapper-cap";
  const isSpecialCollection = collectionId === SPECIAL_COLLECTION_ID;

  // Set price automatically for special collection
  useEffect(() => {
    if (isSpecialCollection) {
      setPrice("0.0001");
    }
  }, [isSpecialCollection]);

  const steps = [
    {
      id: 0,
      title: "Preparing Your Asset",
      description:
        "Your digital asset is being securely packaged with metadata for marketplace visibility",
    },
    {
      id: 1,
      title: "Blockchain Verification",
      description:
        "Confirming transaction authenticity through distributed network consensus",
    },
    {
      id: 2,
      title: "Marketplace Integration",
      description:
        "Finalizing visibility settings and making your asset discoverable to potential buyers",
    },
  ];

  // Calculate progress percentage
  const progressValue = (currentStep / 3) * 100;

  const { mutateAsync: listCollectiblesMutation } = useMutation({
    mutationFn: listCollectiblesForConfirm,
  });

  const { mutateAsync: confirmPendingListMutation } = useMutation({
    mutationFn: confirmPendingList,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["activityData", id] });
    },
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow price changes for special collection
    if (isSpecialCollection) {
      return;
    }

    const newValue = e.target.value;

    // Return to '0' if input is empty
    if (newValue === "") {
      setPrice("0");
      return;
    }

    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(newValue)) {
      return;
    }

    // Remove leading zeros unless it's a decimal
    if (newValue.length > 1 && newValue[0] === "0" && newValue[1] !== ".") {
      setPrice(String(parseInt(newValue, 10)));
      return;
    }

    setPrice(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Only proceed if not already loading and not own listing
      if (!isLoading && !isOwnListing) {
        handlePendingList();
      }
    }
  };

  const handlePriceBlur = () => {
    if (!isSpecialCollection && (price === "" || parseFloat(price) < 0)) {
      setPrice("0");
    }
  };

  const handlePendingList = async () => {
    setIsLoading(true);
    setShowPendingState(true);
    setCurrentStep(0);

    try {
      // Step 1: Initialize listing
      const collectibleRes = await listCollectiblesMutation({
        collectibleId: collectibleId,
        price: parseFloat(price),
        txid: txid,
      });

      if (collectibleRes && collectibleRes.success) {
        // Step 2: Sign transaction and wait for confirmation
        setCurrentStep(1);

        let txid;
        const { preparedListingTx } = collectibleRes.data.list;
        const { id: listId } = collectibleRes.data.list.sanitizedList;

        const { signer } = await getSigner();
        const signedTx = await signer?.sendTransaction(preparedListingTx);
        await signedTx?.wait();

        if (signedTx?.hash) txid = signedTx?.hash;

        // Step 3: Confirm listing
        if (listId && txid) {
          setCurrentStep(2);

          const response = await confirmPendingListMutation({
            id: listId,
            txid: txid,
            vout: 0,
            inscribedAmount: 546,
          });

          if (response && response.success) {
            // Give a moment for the user to see the completed progress
            setTimeout(() => {
              setSuccess(true);
              setShowPendingState(false);
              toast.success("Successfully listed.", response.success);
            }, 1000);
          }
        }
      } else {
        setShowPendingState(false);
        toast.error(collectibleRes.error || "Failed to list asset");
      }
    } catch (error: any) {
      setShowPendingState(false);
      toast.error("Error pending list:", error);
    } finally {
      if (!success) {
        setIsLoading(false);
      }
    }
  };

  const handleDone = () => {
    // Reset state for next time
    setSuccess(false);
    setShowPendingState(false);
    setCurrentStep(0);

    // Refresh data before closing modal
    if (onRefresh) {
      // Use custom refresh function if provided
      onRefresh();
    } else {
      // Refresh data using React Query and router
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["activityData", id] });

      // Force a page refresh if needed
      router.refresh();
    }

    // Close the modal
    onClose();
  };

  // Initial listing form
  const renderInitialForm = () => (
    <div className="flex flex-col gap-6 w-full outline-none items-center">
      <DialogHeader className="flex w-full">
        <div className="text-xl text-neutral00 font-bold text-center">
          List Asset
        </div>
      </DialogHeader>
      <div className="bg-white8 w-full h-[1px]" />
      <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
        <Image
          width={160}
          height={160}
          draggable="false"
          src={imageUrl}
          className="aspect-square rounded-xl"
          alt={`logo`}
        />
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-brand text-lg font-medium">{collectionName}</p>
          <p className="text-xl text-neutral00 font-bold">{name}</p>
        </div>
      </div>
      <div className="bg-white8 w-full h-[1px]" />
      <div className="flex flex-col gap-3 w-full">
        <p>Listing Price</p>
        <Input
          placeholder="Enter listing price"
          className={`bg-gray50 border-transparent ${
            isSpecialCollection ? "cursor-not-allowed opacity-70" : ""
          }`}
          type="text"
          value={price}
          onChange={handlePriceChange}
          onBlur={handlePriceBlur}
          onKeyDown={handleKeyDown}
          disabled={isSpecialCollection}
        />
        {isSpecialCollection && (
          <p className="text-md2 text-neutral200 mt-1 flex items-center gap-2">
            <svg
              className="w-8 h-8 text-neutral00"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            As this is part of the Citrea Bapps event requirements, the list
            price is fixed and cannot be modified.
          </p>
        )}
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
          {isLoading && !showPendingState ? (
            <Loader2
              className="animate-spin w-full"
              color="#111315"
              size={24}
            />
          ) : (
            "List"
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
    <div className="w-full outline-none flex flex-col gap-6 pt-8 pb-8 bg-white4 justify-center items-center rounded-2xl">
      <div className="p-4 flex justify-center items-center bg-white8 rounded-full">
        <Loader2 className="animate-spin" color="#FFEE32" size={36} />
      </div>

      <div className="flex flex-col gap-3 outline-none justify-center items-center w-full px-8">
        <p className="text-brand text-2xl font-bold">Listing in Progress</p>
        <p className="text-neutral100 text-start mb-2">
          Please wait while we process your listing. This may take a few
          moments.
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
                <p className="text-md text-neutral200">{step.description}</p>
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
    <div className="flex flex-col gap-6 w-full items-center justify-center">
      <div className="flex flex-col gap-6 justify-center items-center w-full">
        <div className="flex justify-center p-3 items-center rounded-2xl bg-white8">
          <Check size={40} color="#FFEE32" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-center text-2xl text-brand font-bold">
            Listing Successful!
          </p>
          <p className="text-lg font-medium text-neutral50">
            Your listing was completed successfully.
          </p>
        </div>
      </div>
      <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
        <Image
          width={160}
          height={160}
          draggable="false"
          src={imageUrl}
          className="aspect-square rounded-xl"
          alt={`logo`}
        />
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-brand text-lg font-medium">{collectionName}</p>
          <p className="text-xl text-neutral00 font-bold">{name}</p>
        </div>
      </div>
      <div className="bg-white8 w-full h-[1px]" />
      <div className="flex flex-row items-center w-full justify-between rounded-2xl p-4 bg-white8">
        <p className="text-neutral100 text-lg font-medium">Listing price</p>
        <p className="text-brand text-lg font-bold">{price}</p>
      </div>
      <div className="bg-white8 w-full h-[1px]" />
      <Button variant={"secondary"} onClick={handleDone} className="w-full">
        Done
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
        {showPendingState ? (
          renderPendingState()
        ) : success ? (
          renderSuccessState()
        ) : isOwnListing ? (
          <div className="flex flex-col gap-6 justify-center items-center">
            <p>You already own this listing</p>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          renderInitialForm()
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PendingListModal;

// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
// } from "../ui/dialog";
// import { Loader2, X, Check } from "lucide-react";
// import { Button } from "../ui/button";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { getSigner } from "@/lib/utils";
// import { Input } from "../ui/input";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   confirmPendingList,
//   listCollectiblesForConfirm,
// } from "@/lib/service/postRequest";
// import { toast } from "sonner";
// import { Progress } from "../ui/progress";

// interface ModalProps {
//   open: boolean;
//   onClose: () => void;
//   imageUrl: string;
//   uniqueIdx: string;
//   collectionName: string;
//   name: string;
//   collectibleId: string;
//   txid: string;
//   id: string;
//   isOwnListing: boolean;
//   onRefresh?: () => void; // Add new optional prop for refreshing
// }

// const PendingListModal: React.FC<ModalProps> = ({
//   open,
//   onClose,
//   imageUrl,
//   uniqueIdx,
//   collectionName,
//   name,
//   collectibleId,
//   txid,
//   id,
//   isOwnListing,
//   onRefresh,
// }) => {
//   const router = useRouter(); // Import the router
//   const queryClient = useQueryClient();
//   const [price, setPrice] = useState<string>("0");
//   const [isLoading, setIsLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [showPendingState, setShowPendingState] = useState(false);

//   // Define the steps for the listing process
//   // const steps = [
//   //   { id: 0, title: "Initiating Listing", description: "Preparing your asset for listing" },
//   //   { id: 1, title: "Confirming On-chain", description: "Verifying transaction on the blockchain" },
//   //   { id: 2, title: "Finalizing Listing", description: "Completing the listing process" }
//   // ];

//   const steps = [
//     {
//       id: 0,
//       title: "Preparing Your Asset",
//       description: "Your digital asset is being securely packaged with metadata for marketplace visibility"
//     },
//     {
//       id: 1,
//       title: "Blockchain Verification",
//       description: "Confirming transaction authenticity through distributed network consensus"
//     },
//     {
//       id: 2,
//       title: "Marketplace Integration",
//       description: "Finalizing visibility settings and making your asset discoverable to potential buyers"
//     }
//   ];

//   // Calculate progress percentage
//   const progressValue = (currentStep / 3) * 100;

//   const { mutateAsync: listCollectiblesMutation } = useMutation({
//     mutationFn: listCollectiblesForConfirm,
//   });

//   const { mutateAsync: confirmPendingListMutation } = useMutation({
//     mutationFn: confirmPendingList,
//     onSuccess: () => {
//       // Invalidate queries to refresh data
//       queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
//       queryClient.invalidateQueries({ queryKey: ["activityData", id] });
//     },
//   });

//   const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;

//     // Return to '0' if input is empty
//     if (newValue === "") {
//       setPrice("0");
//       return;
//     }

//     // Only allow numbers and decimal point
//     if (!/^\d*\.?\d*$/.test(newValue)) {
//       return;
//     }

//     // Remove leading zeros unless it's a decimal
//     if (newValue.length > 1 && newValue[0] === "0" && newValue[1] !== ".") {
//       setPrice(String(parseInt(newValue, 10)));
//       return;
//     }

//     setPrice(newValue);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       // Only proceed if not already loading and not own listing
//       if (!isLoading && !isOwnListing) {
//         handlePendingList();
//       }
//     }
//   };

//   const handlePriceBlur = () => {
//     if (price === "" || parseFloat(price) < 0) {
//       setPrice("0");
//     }
//   };

//   const handlePendingList = async () => {
//     setIsLoading(true);
//     setShowPendingState(true);
//     setCurrentStep(0);

//     try {
//       // Step 1: Initialize listing
//       const collectibleRes = await listCollectiblesMutation({
//         collectibleId: collectibleId,
//         price: parseFloat(price),
//         txid: txid,
//       });

//       if (collectibleRes && collectibleRes.success) {
//         // Step 2: Sign transaction and wait for confirmation
//         setCurrentStep(1);

//         let txid;
//         const { preparedListingTx } = collectibleRes.data.list;
//         const { id: listId } = collectibleRes.data.list.sanitizedList;

//         const { signer } = await getSigner();
//         const signedTx = await signer?.sendTransaction(preparedListingTx);
//         await signedTx?.wait();

//         if (signedTx?.hash) txid = signedTx?.hash;

//         // Step 3: Confirm listing
//         if (listId && txid) {
//           setCurrentStep(2);

//           const response = await confirmPendingListMutation({
//             id: listId,
//             txid: txid,
//             vout: 0,
//             inscribedAmount: 546,
//           });

//           if (response && response.success) {
//             // Give a moment for the user to see the completed progress
//             setTimeout(() => {
//               setSuccess(true);
//               setShowPendingState(false);
//               toast.success("Successfully listed.", response.success);
//             }, 1000);
//           }
//         }
//       } else {
//         setShowPendingState(false);
//         toast.error(collectibleRes.error || "Failed to list asset");
//       }
//     } catch (error: any) {
//       setShowPendingState(false);
//       // toast.error(error.message || "Error listing asset");
//       toast.error("Error pending list:", error);
//     } finally {
//       if (!success) {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleDone = () => {
//     // Reset state for next time
//     setSuccess(false);
//     setShowPendingState(false);
//     setCurrentStep(0);

//     // Refresh data before closing modal
//     if (onRefresh) {
//       // Use custom refresh function if provided
//       onRefresh();
//     } else {
//       // Refresh data using React Query and router
//       queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
//       queryClient.invalidateQueries({ queryKey: ["activityData", id] });

//       // Force a page refresh if needed
//       router.refresh();
//     }

//     // Close the modal
//     onClose();
//   };

//   // Initial listing form
//   const renderInitialForm = () => (
//     <div className="flex flex-col gap-6 w-full outline-none items-center">
//       <DialogHeader className="flex w-full">
//         <div className="text-xl text-neutral00 font-bold text-center">
//           List Asset
//         </div>
//       </DialogHeader>
//       <div className="bg-white8 w-full h-[1px]" />
//       <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
//         <Image
//           width={160}
//           height={160}
//           draggable="false"
//           src={imageUrl}
//           className="aspect-square rounded-xl"
//           alt={`logo`}
//         />
//         <div className="flex flex-col gap-2 justify-center items-center">
//           <p className="text-brand text-lg font-medium">
//             {collectionName}
//           </p>
//           <p className="text-xl text-neutral00 font-bold">{name}</p>
//         </div>
//       </div>
//       <div className="bg-white8 w-full h-[1px]" />
//       <div className="flex flex-col gap-3 w-full">
//         <p>Listing Price</p>
//         <Input
//           placeholder="Enter listing price"
//           className="bg-gray50 border-transparent"
//           type="text"
//           value={price}
//           onChange={handlePriceChange}
//           onBlur={handlePriceBlur}
//           onKeyDown={handleKeyDown}
//         />
//       </div>
//       <DialogFooter className="grid grid-cols-2 gap-2 w-full">
//         <Button
//           variant="secondary"
//           className="bg-white8 w-full"
//           onClick={onClose}
//         >
//           Cancel
//         </Button>
//         <Button onClick={handlePendingList} disabled={isLoading}>
//           {isLoading && !showPendingState ? (
//             <Loader2
//               className="animate-spin w-full"
//               color="#111315"
//               size={24}
//             />
//           ) : (
//             "List"
//           )}
//         </Button>
//       </DialogFooter>
//       <button
//         className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
//         onClick={onClose}
//       >
//         <X size={20} color="#D7D8D8" />
//       </button>
//     </div>
//   );

//   // Pending state with progress indicator
//   const renderPendingState = () => (
//     <div className="w-full outline-none flex flex-col gap-6 pt-8 pb-8 bg-white4 justify-center items-center rounded-2xl">
//       <div className="p-4 flex justify-center items-center bg-white8 rounded-full">
//         <Loader2 className="animate-spin" color="#FFEE32" size={36} />
//       </div>

//       <div className="flex flex-col gap-3 outline-none justify-center items-center w-full px-8">
//         <p className="text-brand text-2xl font-bold">Listing in Progress</p>
//         <p className="text-neutral100 text-start mb-2">
//           Please wait while we process your listing. This may take a few moments.
//         </p>

//         {/* Progress bar */}
//         <div className="w-full mb-4 mt-2">
//           <Progress value={progressValue} className="h-2" />
//         </div>

//         {/* Steps */}
//         <div className="w-full space-y-4">
//           {steps.map((step) => (
//             <div key={step.id} className="flex items-start w-full gap-3">
//               <div className={`flex-shrink-0 h-6 w-6 rounded-full mt-0.5 flex items-center justify-center ${
//                 step.id < currentStep ? "bg-brand" :
//                 step.id === currentStep ? "bg-brand/20" :
//                 "bg-neutral400"
//               }`}>
//                 {step.id < currentStep ? (
//                   <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M10 3L4.5 8.5L2 6" stroke="#111315" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 ) : step.id === currentStep ? (
//                   <div className="h-2 w-2 bg-brand rounded-full"></div>
//                 ) : null}
//               </div>
//               <div>
//                 <p className={`text-md2 font-medium ${
//                   step.id <= currentStep ? "text-neutral50" : "text-neutral200"
//                 }`}>
//                   {step.title}
//                 </p>
//                 <p className="text-md text-neutral200">
//                   {step.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="px-8 bg-neutral800/10 rounded-lg mt-2 w-[90%] text-center">
//         <p className="text-md text-neutral100">
//           Please keep this window open until the process completes
//         </p>
//       </div>
//     </div>
//   );

//   // Success state
//   const renderSuccessState = () => (
//     <div className="flex flex-col gap-6 w-full items-center justify-center">
//       <div className="flex flex-col gap-6 justify-center items-center w-full">
//         <div className="flex justify-center p-3 items-center rounded-2xl bg-white8">
//           <Check size={40} color="#FFEE32" />
//         </div>
//         <div className="flex flex-col gap-3">
//           <p className="text-center text-2xl text-brand font-bold">
//             Listing Successful!
//           </p>
//           <p className="text-lg font-medium text-neutral50">
//             Your listing was completed successfully.
//           </p>
//         </div>
//       </div>
//       <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
//         <Image
//           width={160}
//           height={160}
//           draggable="false"
//           src={imageUrl}
//           className="aspect-square rounded-xl"
//           alt={`logo`}
//         />
//         <div className="flex flex-col gap-2 justify-center items-center">
//           <p className="text-brand text-lg font-medium">
//             {collectionName}
//           </p>
//           <p className="text-xl text-neutral00 font-bold">{name}</p>
//         </div>
//       </div>
//       <div className="bg-white8 w-full h-[1px]" />
//       <div className="flex flex-row items-center w-full justify-between rounded-2xl p-4 bg-white8">
//         <p className="text-neutral100 text-lg font-medium">
//           Listing price
//         </p>
//         <p className="text-brand text-lg font-bold">{price}</p>
//       </div>
//       <div className="bg-white8 w-full h-[1px]" />
//       <Button
//         variant={"secondary"}
//         onClick={handleDone}
//         className="w-full"
//       >
//         Done
//       </Button>
//     </div>
//   );

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
//         {showPendingState ? (
//           renderPendingState()
//         ) : success ? (
//           renderSuccessState()
//         ) : isOwnListing ? (
//           <div className="flex flex-col gap-6 justify-center items-center">
//             <p>You already own this listing</p>
//             <Button variant="secondary" onClick={onClose}>Close</Button>
//           </div>
//         ) : (
//           renderInitialForm()
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PendingListModal;
