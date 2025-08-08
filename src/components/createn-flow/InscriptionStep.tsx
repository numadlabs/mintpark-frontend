// "use client";
// import React, { useState, useEffect } from "react";
// import { Copy, Upload, Settings } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useCreationFlow } from "./CreationFlowProvider";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { toast } from "sonner";
// import { calculateUploadParameters, truncateAddress, parseMetadataJson } from "@/lib/utils";
// import {
//   checkPaymentStatus,
//   getInscriptionProgress,
// } from "@/lib/service/queryHelper";
// import { 
//   initiateUploadSession,
//   createTraitTypes,
//   createTraitValues,
//   createRecursiveInscription,
//   createOneOfOneEditions,
//   postInvokeMint
// } from "@/lib/service/postRequest";

// // Utility function to chunk arrays
// function chunkArray<T>(array: T[], size: number): T[][] {
//   const chunks = [];
//   for (let i = 0; i < array.length; i += size) {
//     chunks.push(array.slice(i, i + size));
//   }
//   return chunks;
// }

// interface TraitGroup {
//   type: string;
//   zIndex: number;
//   files: File[];
// }

// export function InscriptionStep({ onComplete }: { onComplete?: () => void }) {
//   const { traitData, inscriptionData, collectionId, updateInscriptionData } =
//     useCreationFlow();

//   const [currentView, setCurrentView] = useState<
//     "payment" | "uploading" | "progress" | "complete"
//   >("payment");

//   const [discordUsername, setDiscordUsername] = useState("");
//   const [qrCodeUrl, setQrCodeUrl] = useState("");
//   const [isCheckingPayment, setIsCheckingPayment] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({
//     current: 0,
//     total: 0,
//     currentStep: "",
//     error: null as string | null,
//   });
//   const [progressData, setProgressData] = useState<{
//     totalTraitValueCount: number;
//     doneTraitValueCount: number;
//     totalCollectibleCount: number;
//     doneCollectibleCount: number;
//     done: number;
//     total: number;
//     etaInMinutes: number;
//   } | null>(null);

//   const router = useRouter();

//   const satsToBTC = (sats: number): number => sats / 10 ** 8;
//   const btcToUsd = (btc: number, btcPrice = 31500) =>
//     (btc * btcPrice).toLocaleString();

//   useEffect(() => {
//     if (inscriptionData?.walletAddress) {
//       const amount = satsToBTC(inscriptionData.fees.total);
//       const walletQrString = `bitcoin:${inscriptionData.walletAddress}?amount=${amount}`;
//       const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
//         walletQrString
//       )}`;
//       setQrCodeUrl(qrUrl);
//     }
//   }, [inscriptionData]);

//   useEffect(() => {
//     const fetchProgress = async () => {
//       if (currentView !== "progress") return;
//       if (!collectionId || !inscriptionData?.walletAddress) return;

//       try {
//         const res = await getInscriptionProgress({
//           collectionId,
//           userLayerId: inscriptionData.walletAddress,
//         });
//         setProgressData(res);
//       } catch (err) {
//         console.error("Failed to fetch inscription progress:", err);
//       }
//     };

//     fetchProgress();
//     const interval = setInterval(fetchProgress, 8000);
//     return () => clearInterval(interval);
//   }, [currentView, collectionId, inscriptionData?.walletAddress]);

//   // Function to extract trait groups from uploaded files
//   const extractTraitGroups = (): TraitGroup[] => {
//     if (!traitData.traitAssets) return [];

//     const fileList = (traitData.traitAssets as any).fileList as FileList;
//     if (!fileList) return [];

//     const traitGroups: Record<string, TraitGroup> = {};

//     // Get z-index data from the NFTTraitsUpload component if available
//     const traitsData = (traitData.traitAssets as any).traitsData || {};

//     for (let i = 0; i < fileList.length; i++) {
//       const file = fileList[i];
//       const pathParts = file.webkitRelativePath?.split("/") || [];

//       if (pathParts.length >= 2 && file.type.startsWith("image/")) {
//         let traitType: string;

//         if (pathParts.length === 2) {
//           traitType = pathParts[0];
//         } else if (pathParts[0] === "traits") {
//           traitType = pathParts[1];
//         } else {
//           traitType = pathParts[pathParts.length - 2];
//         }

//         if (!traitGroups[traitType]) {
//           const zIndex = traitsData[traitType]?.zIndex || 5;
//           traitGroups[traitType] = {
//             type: traitType,
//             zIndex: zIndex,
//             files: []
//           };
//         }

//         traitGroups[traitType].files.push(file);
//       }
//     }

//     return Object.values(traitGroups);
//   };

//   // Main upload process function
//   const handleUploadProcess = async () => {
//     if (!collectionId) {
//       toast.error("Collection ID is required");
//       return;
//     }

//     setCurrentView("uploading");
//     setUploadProgress({ current: 0, total: 0, currentStep: "Initializing...", error: null });

//     try {
//       // Extract trait groups and metadata
//       const traitGroups = extractTraitGroups();
//       let metadata: any[] = [];
      
//       if (traitData.metadataJson) {
//         const { collectionItems } = await parseMetadataJson(traitData.metadataJson);
//         metadata = collectionItems;
//       }

//       // Get one-of-one files
//       const oooFiles: File[] = [];
//       if (traitData.oneOfOneEditions) {
//         const oooFileList = (traitData.oneOfOneEditions as any).fileList as FileList;
//         if (oooFileList) {
//           for (let i = 0; i < oooFileList.length; i++) {
//             const file = oooFileList[i];
//             if (file.type.startsWith("image/")) {
//               oooFiles.push(file);
//             }
//           }
//         }
//       }

//       // Calculate total steps
//       const totalSteps = traitGroups.length + // trait types
//                        traitGroups.reduce((acc, g) => acc + Math.ceil(g.files.length / 10), 0) + // trait values
//                        Math.ceil(metadata.length / 10) + // recursive inscriptions
//                        Math.ceil(oooFiles.length / 10); // 1-of-1 editions

//       setUploadProgress(prev => ({ ...prev, total: totalSteps }));

//       let currentStep = 0;

//       // Step 1: Create trait types in batches
//       setUploadProgress(prev => ({ ...prev, currentStep: "Creating trait types..." }));
//       const traitTypeBatches = chunkArray(traitGroups, 10);
//       let traitTypeIdMap: Record<string, string> = {};

//       for (const batch of traitTypeBatches) {
//         const res = await createTraitTypes({
//           collectionId,
//           data: batch.map((g) => ({ name: g.type, zIndex: g.zIndex })),
//         });

//         for (const tt of res.data.traitTypes) {
//           traitTypeIdMap[tt.name] = tt.id;
//         }

//         currentStep++;
//         setUploadProgress(prev => ({ ...prev, current: currentStep }));
//       }

//       // Step 2: Upload trait values for each trait type
//       setUploadProgress(prev => ({ ...prev, currentStep: "Uploading trait values..." }));
//       let traitValueIdMap: Record<string, string> = {};

//       for (const group of traitGroups) {
//         const fileBatches = chunkArray(group.files, 10);
        
//         for (const files of fileBatches) {
//           const res = await createTraitValues({
//             value: group.type, // Using group type as value
//             traitTypeId: traitTypeIdMap[group.type],
//             files,
//           });

//           for (const tv of res.data.traitValues) {
//             traitValueIdMap[`${group.type}:${tv.value}`] = tv.id;
//           }

//           currentStep++;
//           setUploadProgress(prev => ({ ...prev, current: currentStep }));
//         }
//       }

//       // Step 3: Map metadata to traitValueIds and create recursive inscriptions
//       if (metadata.length > 0) {
//         setUploadProgress(prev => ({ ...prev, currentStep: "Creating recursive inscriptions..." }));
        
//         let matrix: string[][] = [];
//         try {
//           matrix = metadata.map((item, idx) => {
//             if (!item.attributes || !Array.isArray(item.attributes))
//               throw new Error(`Item ${idx} missing attributes array`);
            
//             return item.attributes.map((attr: any) => {
//               const type = attr.trait_type.replace(/\s+/g, "_").toLowerCase();
//               const value = attr.value.replace(/\s+/g, "_").toLowerCase();
//               const key = `${type}:${value}`;
//               const id = traitValueIdMap[key];
//               if (!id) throw new Error(`No traitValueId for ${key}`);
//               return id;
//             });
//           });
//         } catch (err: any) {
//           throw new Error(`Failed to map metadata: ${err.message}`);
//         }

//         // Submit recursive inscriptions in batches
//         const matrixBatches = chunkArray(matrix, 10);
//         let totalRecursive = 0;

//         for (const batch of matrixBatches) {
//           const recursiveRes = await createRecursiveInscription({
//             collectionId,
//             data: batch.map((row) => row.map((id) => ({ traitValueId: id }))),
//           });

//           totalRecursive += recursiveRes.data?.collectibles?.length || 0;
//           currentStep++;
//           setUploadProgress(prev => ({ ...prev, current: currentStep }));
//         }
//       }

//       // Step 4: Upload 1-of-1 editions if any
//       if (oooFiles.length > 0) {
//         setUploadProgress(prev => ({ ...prev, currentStep: "Uploading 1-of-1 editions..." }));
        
//         const oooBatches = chunkArray(oooFiles, 10);
//         let totalOoo = 0;

//         for (const files of oooBatches) {
//           const oooRes = await createOneOfOneEditions({
//             collectionId,
//             files,
//           });

//           totalOoo += oooRes.data?.collectibles?.length || 0;
//           currentStep++;
//           setUploadProgress(prev => ({ ...prev, current: currentStep }));
//         }
//       }

//       // Step 5: Invoke mint if order ID exists
//       if (inscriptionData?.orderId) {
//         setUploadProgress(prev => ({ ...prev, currentStep: "Invoking mint..." }));
        
//         try {
//           const mintResult = await postInvokeMint(inscriptionData.orderId);
//           if (mintResult.success) {
//             toast.success("Mint invoked successfully!");
//           } else {
//             console.error("Mint invoke failed:", mintResult.error);
//             toast.warning("Upload completed but mint invoke failed: " + mintResult.error);
//           }
//         } catch (err: any) {
//           console.error("Failed to invoke mint:", err);
//           // Don't fail the entire process for mint invoke error
//           toast.warning("Upload completed but mint invoke failed: " + (err?.message || "Unknown error"));
//         }
//       }

//       setUploadProgress(prev => ({ 
//         ...prev, 
//         current: totalSteps, 
//         currentStep: "Upload completed!" 
//       }));

//       setTimeout(() => {
//         setCurrentView("progress");
//         onComplete?.();
//       }, 2000);

//       toast.success("All files uploaded successfully!");

//     } catch (error: any) {
//       console.error("Upload process failed:", error);
//       setUploadProgress(prev => ({ 
//         ...prev, 
//         error: error?.message || "Upload failed" 
//       }));
//       toast.error(error?.message || "Upload failed");
//     }
//   };

//   const handleCheckPayment = async () => {
//     if (!inscriptionData?.orderId || !collectionId) {
//       toast.error("Order ID or Collection ID missing");
//       return;
//     }

//     setIsCheckingPayment(true);

//     try {
//       const result = await checkPaymentStatus(inscriptionData.orderId);

//       if (result.success && result.data?.isPaid === true) {
//         toast.success("Payment confirmed! Starting upload process...");
        
//         try {
//           // Get the calculated values from localStorage or recalculate
//           const storedData = localStorage.getItem('calculatedUploadData');
//           let calculatedValues;

//           if (storedData) {
//             calculatedValues = JSON.parse(storedData);
//             console.log("Using stored calculated values:", calculatedValues);
//           } else {
//             // Recalculate if not stored (fallback)
//             console.log("Recalculating upload parameters...");
//             const isOneOfOneEnabled = !!traitData.oneOfOneEditions;
//             calculatedValues = await calculateUploadParameters(traitData, isOneOfOneEnabled);
//             console.log("Recalculated values:", calculatedValues);
//           }

//           // Validate that we have meaningful values
//           if (calculatedValues.expectedTraitTypes === 0 && calculatedValues.expectedTraitValues === 0) {
//             console.warn("No trait data found! Check file upload structure.");
//             toast.error("No trait data found. Please check your file uploads.");
//             return;
//           }

//           console.log("Final values being sent to upload session:", calculatedValues);

//           // Initiate upload session with correct values
//           const uploadResponse = await initiateUploadSession({
//             collectionId,
//             expectedTraitTypes: calculatedValues.expectedTraitTypes,
//             expectedTraitValues: calculatedValues.expectedTraitValues,
//             expectedRecursive: calculatedValues.expectedRecursive,
//             expectedOOOEditions: calculatedValues.expectedOOOEditions,
//           });

//           console.log("Upload session response:", uploadResponse);

//           const {
//             expectedTraitTypes: t,
//             expectedTraitValues: v,
//             expectedRecursive: r,
//             expectedOOOEditions: ooo,
//             startedAt,
//           } = uploadResponse.data;

//           updateInscriptionData({
//             progress: {
//               current: 0,
//               total: t + v + r + (ooo || 0),
//               estimatedTime: new Date(startedAt).toLocaleTimeString(),
//             },
//           });

//           // Clean up stored data
//           localStorage.removeItem('calculatedUploadData');

//           // Start the actual upload process
//           await handleUploadProcess();

//         } catch (uploadError) {
//           console.error("Upload session failed:", uploadError);
//           toast.error("Failed to initiate upload session: " + (uploadError as Error).message);
//           return;
//         }
//       } else {
//         toast.error(result?.error || "Payment not yet confirmed");
//       }
//     } catch (error: unknown) {
//       console.error("Payment check error:", error);
//       toast.error("Failed to check payment status");
//     } finally {
//       setIsCheckingPayment(false);
//     }
//   };

//   const handleGoToCollections = () => router.push("/creater-tool");
//   const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

//   if (!inscriptionData) {
//     return (
//       <div className="max-w-2xl mx-auto text-center">
//         <p className="text-lightSecondary">Loading inscription data...</p>
//       </div>
//     );
//   }

//   if (currentView === "payment") {
//     const inscriptionFeeBTC = satsToBTC(inscriptionData.fees.inscription);
//     const serviceFeeBTC = satsToBTC(inscriptionData.fees.service);
//     const totalBTC = satsToBTC(inscriptionData.fees.total);

//     return (
//       <div className="max-w-2xl mx-auto py-8">
//         <div className="text-start mb-8">
//           <h1 className="text-3xl font-bold text-white mb-2">
//             Pay Inscription Fee
//           </h1>
//           <p className="text-lightSecondary">
//             Submit the required fee to start the inscription process, ensuring
//             your NFT assets are securely recorded on the blockchain.
//           </p>
//         </div>

//         <div className="space-y-8">
//           {/* QR Code Section */}
//           <div className="text-center">
//             <p className="text-lightSecondary mb-4">
//               Scan the QR code with your wallet to pay
//             </p>
//             <div className="w-48 h-48 bg-white mx-auto rounded-xl flex items-center justify-center">
//               {qrCodeUrl ? (
//                 <Image
//                   src={qrCodeUrl}
//                   alt="Payment QR Code"
//                   width={160}
//                   height={160}
//                   className="w-40 h-40 rounded-lg"
//                 />
//               ) : (
//                 <div className="w-40 h-40 bg-black flex items-center justify-center text-xs text-white">
//                   Generating QR Code...
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Wallet Address */}
//           <div className="flex items-center justify-between bg-darkSecondary border border-transLight4 rounded-xl p-4">
//             <div className="flex justify-between items-center w-full">
//               <p className="text-lightSecondary text-sm mb-1">Wallet Address</p>
//               <p className="text-white font-medium">
//                 {truncateAddress(inscriptionData.walletAddress)}
//               </p>
//             </div>
//             <Button
//               onClick={async () => {
//                 try {
//                   await copyToClipboard(inscriptionData.walletAddress);
//                   toast.success("Address copied to clipboard!");
//                 } catch (error) {
//                   toast.error("Failed to copy address", {
//                     description: "Please try again.",
//                   });
//                 }
//               }}
//               className="p-2 text-lightSecondary hover:text-white bg-transparent hover:bg-transparent transition-colors"
//             >
//               <Copy size={16} />
//             </Button>
//           </div>

//           {/* Fee Breakdown */}
//           <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-lightSecondary">Network Fee</span>
//                 <div className="text-right">
//                   <span className="text-white font-medium">
//                     {inscriptionFeeBTC.toFixed(6)} BTC
//                   </span>
//                   <span className="text-lightSecondary text-sm ml-2">
//                     ~${btcToUsd(inscriptionFeeBTC)}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-lightSecondary">Service Fee</span>
//                 <div className="text-right">
//                   <span className="text-white font-medium">
//                     {serviceFeeBTC.toFixed(6)} BTC
//                   </span>
//                   <span className="text-lightSecondary text-sm ml-2">
//                     ~${btcToUsd(serviceFeeBTC)}
//                   </span>
//                 </div>
//               </div>

//               <div className="border-t border-transLight8 pt-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-white font-semibold">Total</span>
//                   <div className="text-right">
//                     <span className="text-white font-semibold">
//                       {totalBTC.toFixed(6)} BTC
//                     </span>
//                     <span className="text-lightSecondary text-sm ml-2">
//                       ~${btcToUsd(totalBTC)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Warning */}
//           <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4">
//             <div className="flex gap-3">
//               <div className="w-5 h-5 rounded-full bg-transparent border border-lightSecondary flex items-center justify-center flex-shrink-0 mt-0.5">
//                 <span className="text-lightSecondary text-xs font-bold">i</span>
//               </div>
//               <p className="text-sm text-lightSecondary">
//                 This is an estimated fee and may be insufficient during
//                 inscribing or exceed the final cost. You can claim any excess
//                 amount if applicable.
//               </p>
//             </div>
//           </div>

//           <Button
//             onClick={handleCheckPayment}
//             disabled={isCheckingPayment}
//             className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
//           >
//             {isCheckingPayment ? "Checking Payment..." : "Check Payment"}
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (currentView === "uploading") {
//     return (
//       <div className="max-w-2xl mx-auto py-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-white mb-2">
//             Uploading Your Assets
//           </h1>
//           <p className="text-lightSecondary">
//             Please wait while we process and upload your NFT collection to the blockchain.
//           </p>
//         </div>

//         <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <Upload size={24} className="text-white" />
//             <h3 className="text-lg font-semibold text-white">
//               Upload Progress
//             </h3>
//           </div>

//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <span className="text-lightSecondary">Current Step:</span>
//               <span className="text-white font-medium">{uploadProgress.currentStep}</span>
//             </div>
            
//             <div className="flex justify-between items-center">
//               <span className="text-lightSecondary">Progress:</span>
//               <span className="text-white font-medium">
//                 {uploadProgress.current} / {uploadProgress.total}
//               </span>
//             </div>

//             {/* Progress Bar */}
//             <div className="w-full bg-gray-700 rounded-full h-2.5">
//               <div 
//                 className="bg-white h-2.5 rounded-full transition-all duration-300"
//                 style={{ 
//                   width: uploadProgress.total > 0 
//                     ? `${(uploadProgress.current / uploadProgress.total) * 100}%` 
//                     : '0%' 
//                 }}
//               />
//             </div>

//             {uploadProgress.error && (
//               <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
//                 <p className="text-sm text-red-400">
//                   Error: {uploadProgress.error}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (currentView === "progress") {
//     return (
//       <div className="max-w-2xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-white mb-4">
//             Inscription Progress
//           </h1>
//         </div>

//         <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-lightSecondary text-sm mb-1">Order ID</p>
//               <p className="text-white font-medium">
//                 {inscriptionData.orderId}
//               </p>
//             </div>
//             <button
//               onClick={() => copyToClipboard(inscriptionData.orderId)}
//               className="p-2 text-lightSecondary hover:text-white transition-colors"
//             >
//               <Copy size={16} />
//             </button>
//           </div>
//         </div>

//         {!progressData ? (
//           <p className="text-lightSecondary">Loading progress...</p>
//         ) : (
//           <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
//             <div className="flex items-center gap-3 mb-4">
//               <Settings size={24} className="text-white" />
//               <h3 className="text-lg font-semibold text-white">
//                 Inscription Progress
//               </h3>
//             </div>
//             <p className="text-lightSecondary mb-6">
//               Track the real-time status of your Ordinal inscriptions as we
//               record your assets on Bitcoin.
//             </p>
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <p className="text-lightSecondary text-sm mb-1">Progress</p>
//                 <p className="text-white font-medium">
//                   {progressData.done} / {progressData.total}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-lightSecondary text-sm mb-1">
//                   Estimated remaining time
//                 </p>
//                 <p className="text-white font-medium">
//                   {progressData.etaInMinutes} minutes
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
//           <h3 className="text-lg font-semibold text-white mb-2">
//             Join Our Discord
//           </h3>
//           <p className="text-lightSecondary mb-4">
//             To receive the fastest and hands-on support, enter your Discord
//             Username and join our server. We will create a private channel for
//             your project.
//           </p>
//           <div className="flex gap-3">
//             <div className="flex-1 relative">
//               <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                 <span className="text-lightSecondary">@</span>
//               </div>
//               <Input
//                 value={discordUsername}
//                 onChange={(e) => setDiscordUsername(e.target.value)}
//                 placeholder="username#1234"
//                 className="pl-8 bg-darkTertiary border-transLight8 text-white placeholder:text-lightTertiary"
//               />
//             </div>
//             <Button
//               variant="outline"
//               className="bg-transparent border-transLight16 text-white hover:bg-transLight8"
//             >
//               Invite me
//             </Button>
//           </div>
//         </div>

//         <div className="flex gap-4">
//           <Button
//             onClick={handleGoToCollections}
//             className="flex-1 bg-white text-black hover:bg-gray-200"
//           >
//             Go to My Collections →
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return null;
// }



"use client";
import React, { useState, useEffect } from "react";
import { Copy, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreationFlow } from "./CreationFlowProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { calculateUploadParameters, truncateAddress, parseMetadataJson } from "@/lib/utils";
import {
  checkPaymentStatus,
  getInscriptionProgress,
} from "@/lib/service/queryHelper";
import { 
  initiateUploadSession,
  createTraitTypes,
  createTraitValues,
  createRecursiveInscription,
  createOneOfOneEditions,
  postInvokeMint
} from "@/lib/service/postRequest";

// Utility function to chunk arrays
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

interface TraitGroup {
  type: string;
  zIndex: number;
  files: File[];
}

export function InscriptionStep({ onComplete }: { onComplete?: () => void }) {
  const { traitData, inscriptionData, collectionId, updateInscriptionData } =
    useCreationFlow();

  const [currentView, setCurrentView] = useState<
    "payment" | "uploading" | "progress" | "complete"
  >("payment");

  const [discordUsername, setDiscordUsername] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    currentStep: "",
    error: null as string | null,
  });
  const [progressData, setProgressData] = useState<{
    totalTraitValueCount: number;
    doneTraitValueCount: number;
    totalCollectibleCount: number;
    doneCollectibleCount: number;
    done: number;
    total: number;
    etaInMinutes: number;
  } | null>(null);

  const router = useRouter();

  const satsToBTC = (sats: number): number => sats / 10 ** 8;
  const btcToUsd = (btc: number, btcPrice = 31500) =>
    (btc * btcPrice).toLocaleString();

  useEffect(() => {
    if (inscriptionData?.walletAddress) {
      const amount = satsToBTC(inscriptionData.fees.total);
      const walletQrString = `bitcoin:${inscriptionData.walletAddress}?amount=${amount}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        walletQrString
      )}`;
      setQrCodeUrl(qrUrl);
    }
  }, [inscriptionData]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (currentView !== "progress") return;
      if (!collectionId) return;

      try {
        const res = await getInscriptionProgress({
          collectionId,
          userLayerId: inscriptionData?.walletAddress, // Now optional
        });
        setProgressData(res);
      } catch (err) {
        console.error("Failed to fetch inscription progress:", err);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 8000);
    return () => clearInterval(interval);
  }, [currentView, collectionId, inscriptionData?.walletAddress]);

  // Function to extract trait groups from uploaded files
  const extractTraitGroups = (): TraitGroup[] => {
    if (!traitData.traitAssets) return [];

    const fileList = (traitData.traitAssets as any).fileList as FileList;
    if (!fileList) return [];

    const traitGroups: Record<string, TraitGroup> = {};

    // Get z-index data from the NFTTraitsUpload component if available
    const traitsData = (traitData.traitAssets as any).traitsData || {};

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const pathParts = file.webkitRelativePath?.split("/") || [];

      if (pathParts.length >= 2 && file.type.startsWith("image/")) {
        let traitType: string;

        if (pathParts.length === 2) {
          traitType = pathParts[0];
        } else if (pathParts[0] === "traits") {
          traitType = pathParts[1];
        } else {
          traitType = pathParts[pathParts.length - 2];
        }

        if (!traitGroups[traitType]) {
          const zIndex = traitsData[traitType]?.zIndex || 5;
          traitGroups[traitType] = {
            type: traitType,
            zIndex: zIndex,
            files: []
          };
        }

        traitGroups[traitType].files.push(file);
      }
    }

    return Object.values(traitGroups);
  };

  // Main upload process function
  const handleUploadProcess = async () => {
    if (!collectionId) {
      toast.error("Collection ID is required");
      return;
    }

    setCurrentView("uploading");
    setUploadProgress({ current: 0, total: 0, currentStep: "Initializing...", error: null });

    try {
      // Extract trait groups and metadata
      const traitGroups = extractTraitGroups();
      let metadata: any[] = [];
      
      if (traitData.metadataJson) {
        const { collectionItems } = await parseMetadataJson(traitData.metadataJson);
        metadata = collectionItems;
      }

      // Get one-of-one files
      const oooFiles: File[] = [];
      if (traitData.oneOfOneEditions) {
        const oooFileList = (traitData.oneOfOneEditions as any).fileList as FileList;
        if (oooFileList) {
          for (let i = 0; i < oooFileList.length; i++) {
            const file = oooFileList[i];
            if (file.type.startsWith("image/")) {
              oooFiles.push(file);
            }
          }
        }
      }

      // Calculate total steps
      const totalSteps = traitGroups.length + // trait types
                       traitGroups.reduce((acc, g) => acc + Math.ceil(g.files.length / 10), 0) + // trait values
                       Math.ceil(metadata.length / 10) + // recursive inscriptions
                       Math.ceil(oooFiles.length / 10); // 1-of-1 editions

      setUploadProgress(prev => ({ ...prev, total: totalSteps }));

      let currentStep = 0;

      // Step 1: Create trait types in batches
      setUploadProgress(prev => ({ ...prev, currentStep: "Creating trait types..." }));
      const traitTypeBatches = chunkArray(traitGroups, 10);
      let traitTypeIdMap: Record<string, string> = {};

      for (const batch of traitTypeBatches) {
        const res = await createTraitTypes({
          collectionId,
          data: batch.map((g) => ({ name: g.type, zIndex: g.zIndex })),
        });

        for (const tt of res.data.traitTypes) {
          traitTypeIdMap[tt.name] = tt.id;
        }

        currentStep++;
        setUploadProgress(prev => ({ ...prev, current: currentStep }));
      }

      // Step 2: Upload trait values for each trait type
      setUploadProgress(prev => ({ ...prev, currentStep: "Uploading trait values..." }));
      let traitValueIdMap: Record<string, string> = {};

      for (const group of traitGroups) {
        const fileBatches = chunkArray(group.files, 10);
        
        for (const files of fileBatches) {
          const res = await createTraitValues({
            value: group.type, // Using group type as value
            traitTypeId: traitTypeIdMap[group.type],
            files,
          });

          for (const tv of res.data.traitValues) {
            traitValueIdMap[`${group.type}:${tv.value}`] = tv.id;
          }

          currentStep++;
          setUploadProgress(prev => ({ ...prev, current: currentStep }));
        }
      }

      // Step 3: Map metadata to traitValueIds and create recursive inscriptions
      if (metadata.length > 0) {
        setUploadProgress(prev => ({ ...prev, currentStep: "Creating recursive inscriptions..." }));
        
        let matrix: string[][] = [];
        try {
          matrix = metadata.map((item, idx) => {
            if (!item.attributes || !Array.isArray(item.attributes))
              throw new Error(`Item ${idx} missing attributes array`);
            
            return item.attributes.map((attr: any) => {
              const type = attr.trait_type.replace(/\s+/g, "_").toLowerCase();
              const value = attr.value.replace(/\s+/g, "_").toLowerCase();
              const key = `${type}:${value}`;
              const id = traitValueIdMap[key];
              if (!id) throw new Error(`No traitValueId for ${key}`);
              return id;
            });
          });
        } catch (err: any) {
          throw new Error(`Failed to map metadata: ${err.message}`);
        }

        // Submit recursive inscriptions in batches
        const matrixBatches = chunkArray(matrix, 10);
        let totalRecursive = 0;

        for (const batch of matrixBatches) {
          const recursiveRes = await createRecursiveInscription({
            collectionId,
            data: batch.map((row) => row.map((id) => ({ traitValueId: id }))),
          });

          totalRecursive += recursiveRes.data?.collectibles?.length || 0;
          currentStep++;
          setUploadProgress(prev => ({ ...prev, current: currentStep }));
        }
      }

      // Step 4: Upload 1-of-1 editions if any
      if (oooFiles.length > 0) {
        setUploadProgress(prev => ({ ...prev, currentStep: "Uploading 1-of-1 editions..." }));
        
        const oooBatches = chunkArray(oooFiles, 10);
        let totalOoo = 0;

        for (const files of oooBatches) {
          const oooRes = await createOneOfOneEditions({
            collectionId,
            files,
          });

          totalOoo += oooRes.data?.collectibles?.length || 0;
          currentStep++;
          setUploadProgress(prev => ({ ...prev, current: currentStep }));
        }
      }

      // Step 5: Invoke mint if order ID exists
      if (inscriptionData?.orderId) {
        setUploadProgress(prev => ({ ...prev, currentStep: "Invoking mint..." }));
        
        try {
          const mintResult = await postInvokeMint(inscriptionData.orderId);
          
          if (mintResult.success) {
            console.log("Mint invoked successfully:", mintResult.data);
            toast.success("Mint invoked successfully!");
            
            // Optionally update inscription data with mint result
            if (mintResult.data?.order) {
              updateInscriptionData({
                // You can add any additional data from the mint response here
                progress: {
                  ...inscriptionData.progress,
                  estimatedTime: "Mint process initiated",
                },
              });
            }
          } else {
            console.error("Mint invoke failed:", mintResult.error);
            toast.warning("Upload completed but mint invoke failed: " + (mintResult.error || "Unknown error"));
          }
        } catch (err: any) {
          console.error("Failed to invoke mint:", err);
          // Don't fail the entire process for mint invoke error
          const errorMessage = err?.response?.data?.error || err?.message || "Unknown error";
          toast.warning("Upload completed but mint invoke failed: " + errorMessage);
        }
      }

      setUploadProgress(prev => ({ 
        ...prev, 
        current: totalSteps, 
        currentStep: "Upload completed!" 
      }));

      setTimeout(() => {
        setCurrentView("progress");
        onComplete?.();
      }, 2000);

      toast.success("All files uploaded successfully!");

    } catch (error: any) {
      console.error("Upload process failed:", error);
      setUploadProgress(prev => ({ 
        ...prev, 
        error: error?.message || "Upload failed" 
      }));
      toast.error(error?.message || "Upload failed");
    }
  };

  const handleCheckPayment = async () => {
    if (!inscriptionData?.orderId || !collectionId) {
      toast.error("Order ID or Collection ID missing");
      return;
    }

    setIsCheckingPayment(true);

    try {
      const result = await checkPaymentStatus(inscriptionData.orderId);

      if (result.success && result.data?.isPaid === true) {
        toast.success("Payment confirmed! Starting upload process...");
        
        try {
          // Get the calculated values from localStorage or recalculate
          const storedData = localStorage.getItem('calculatedUploadData');
          let calculatedValues;

          if (storedData) {
            calculatedValues = JSON.parse(storedData);
            console.log("Using stored calculated values:", calculatedValues);
          } else {
            // Recalculate if not stored (fallback)
            console.log("Recalculating upload parameters...");
            const isOneOfOneEnabled = !!traitData.oneOfOneEditions;
            calculatedValues = await calculateUploadParameters(traitData, isOneOfOneEnabled);
            console.log("Recalculated values:", calculatedValues);
          }

          // Validate that we have meaningful values
          if (calculatedValues.expectedTraitTypes === 0 && calculatedValues.expectedTraitValues === 0) {
            console.warn("No trait data found! Check file upload structure.");
            toast.error("No trait data found. Please check your file uploads.");
            return;
          }

          console.log("Final values being sent to upload session:", calculatedValues);

          // Initiate upload session with correct values
          const uploadResponse = await initiateUploadSession({
            collectionId,
            expectedTraitTypes: calculatedValues.expectedTraitTypes,
            expectedTraitValues: calculatedValues.expectedTraitValues,
            expectedRecursive: calculatedValues.expectedRecursive,
            expectedOOOEditions: calculatedValues.expectedOOOEditions,
          });

          console.log("Upload session response:", uploadResponse);

          const {
            expectedTraitTypes: t,
            expectedTraitValues: v,
            expectedRecursive: r,
            expectedOOOEditions: ooo,
            startedAt,
          } = uploadResponse.data;

          updateInscriptionData({
            progress: {
              current: 0,
              total: t + v + r + (ooo || 0),
              estimatedTime: new Date(startedAt).toLocaleTimeString(),
            },
          });

          // Clean up stored data
          localStorage.removeItem('calculatedUploadData');

          // Start the actual upload process
          await handleUploadProcess();

        } catch (uploadError) {
          console.error("Upload session failed:", uploadError);
          toast.error("Failed to initiate upload session: " + (uploadError as Error).message);
          return;
        }
      } else {
        toast.error(result?.error || "Payment not yet confirmed");
      }
    } catch (error: unknown) {
      console.error("Payment check error:", error);
      toast.error("Failed to check payment status");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleGoToCollections = () => router.push("/creater-tool");
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  if (!inscriptionData) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-lightSecondary">Loading inscription data...</p>
      </div>
    );
  }

  if (currentView === "payment") {
    const inscriptionFeeBTC = satsToBTC(inscriptionData.fees.inscription);
    const serviceFeeBTC = satsToBTC(inscriptionData.fees.service);
    const totalBTC = satsToBTC(inscriptionData.fees.total);

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-start mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Pay Inscription Fee
          </h1>
          <p className="text-lightSecondary">
            Submit the required fee to start the inscription process, ensuring
            your NFT assets are securely recorded on the blockchain.
          </p>
        </div>

        <div className="space-y-8">
          {/* QR Code Section */}
          <div className="text-center">
            <p className="text-lightSecondary mb-4">
              Scan the QR code with your wallet to pay
            </p>
            <div className="w-48 h-48 bg-white mx-auto rounded-xl flex items-center justify-center">
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 bg-black flex items-center justify-center text-xs text-white">
                  Generating QR Code...
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex items-center justify-between bg-darkSecondary border border-transLight4 rounded-xl p-4">
            <div className="flex justify-between items-center w-full">
              <p className="text-lightSecondary text-sm mb-1">Wallet Address</p>
              <p className="text-white font-medium">
                {truncateAddress(inscriptionData.walletAddress)}
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  await copyToClipboard(inscriptionData.walletAddress);
                  toast.success("Address copied to clipboard!");
                } catch (error) {
                  toast.error("Failed to copy address", {
                    description: "Please try again.",
                  });
                }
              }}
              className="p-2 text-lightSecondary hover:text-white bg-transparent hover:bg-transparent transition-colors"
            >
              <Copy size={16} />
            </Button>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Network Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">
                    {inscriptionFeeBTC.toFixed(6)} BTC
                  </span>
                  <span className="text-lightSecondary text-sm ml-2">
                    ~${btcToUsd(inscriptionFeeBTC)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Service Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">
                    {serviceFeeBTC.toFixed(6)} BTC
                  </span>
                  <span className="text-lightSecondary text-sm ml-2">
                    ~${btcToUsd(serviceFeeBTC)}
                  </span>
                </div>
              </div>

              <div className="border-t border-transLight8 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-white font-semibold">
                      {totalBTC.toFixed(6)} BTC
                    </span>
                    <span className="text-lightSecondary text-sm ml-2">
                      ~${btcToUsd(totalBTC)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-transparent border border-lightSecondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lightSecondary text-xs font-bold">i</span>
              </div>
              <p className="text-sm text-lightSecondary">
                This is an estimated fee and may be insufficient during
                inscribing or exceed the final cost. You can claim any excess
                amount if applicable.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCheckPayment}
            disabled={isCheckingPayment}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {isCheckingPayment ? "Checking Payment..." : "Check Payment"}
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === "uploading") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Uploading Your Assets
          </h1>
          <p className="text-lightSecondary">
            Please wait while we process and upload your NFT collection to the blockchain.
          </p>
        </div>

        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload size={24} className="text-white" />
            <h3 className="text-lg font-semibold text-white">
              Upload Progress
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Current Step:</span>
              <span className="text-white font-medium">{uploadProgress.currentStep}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Progress:</span>
              <span className="text-white font-medium">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-white h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: uploadProgress.total > 0 
                    ? `${(uploadProgress.current / uploadProgress.total) * 100}%` 
                    : '0%' 
                }}
              />
            </div>

            {uploadProgress.error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  Error: {uploadProgress.error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "progress") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Inscription Progress
          </h1>
        </div>

        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lightSecondary text-sm mb-1">Order ID</p>
              <p className="text-white font-medium">
                {inscriptionData.orderId}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(inscriptionData.orderId)}
              className="p-2 text-lightSecondary hover:text-white transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {!progressData ? (
          <p className="text-lightSecondary">Loading progress...</p>
        ) : (
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={24} className="text-white" />
              <h3 className="text-lg font-semibold text-white">
                Inscription Progress
              </h3>
            </div>
            <p className="text-lightSecondary mb-6">
              Track the real-time status of your Ordinal inscriptions as we
              record your assets on Bitcoin.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-lightSecondary text-sm mb-1">Progress</p>
                <p className="text-white font-medium">
                  {progressData.done} / {progressData.total}
                </p>
              </div>
              <div>
                <p className="text-lightSecondary text-sm mb-1">
                  Estimated remaining time
                </p>
                <p className="text-white font-medium">
                  {progressData.etaInMinutes} minutes
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            Join Our Discord
          </h3>
          <p className="text-lightSecondary mb-4">
            To receive the fastest and hands-on support, enter your Discord
            Username and join our server. We will create a private channel for
            your project.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-lightSecondary">@</span>
              </div>
              <Input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="username#1234"
                className="pl-8 bg-darkTertiary border-transLight8 text-white placeholder:text-lightTertiary"
              />
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-transLight16 text-white hover:bg-transLight8"
            >
              Invite me
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleGoToCollections}
            className="flex-1 bg-white text-black hover:bg-gray-200"
          >
            Go to My Collections →
          </Button>
        </div>
      </div>
    );
  }

  return null;
}