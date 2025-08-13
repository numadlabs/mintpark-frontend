"use client";
import React, { useState, useEffect } from "react";
import { Grid, ArrowRight, X, Settings, Copy, Check } from "lucide-react";
import CreaterLayout from "@/components/layout/createrLayout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NewCollectionCard from "@/components/atom/cards/new-collection-card";
import { CreatorCollection } from "@/lib/validations/collection-validation";
import {
  createrCollection,
  getInscriptionProgress,
  getOrderByCollectionIdBase,
} from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import CreateInfoCard from "@/components/atom/cards/create-info-card";
import { toast } from "sonner";
import { truncateAddress } from "@/lib/utils";
import { retopFundingPromise } from "@/lib/service/postRequest";

interface ProgressData {
  totalTraitValueCount: number;
  doneTraitValueCount: number;
  totalCollectibleCount: number;
  doneCollectibleCount: number;
  done: number;
  total: number;
  etaInMinutes: number;
  estimatedFeeToComplete?: number; // in satoshis
  walletAddress?: string;
}

// Add interface for order data
interface OrderData {
  id: string; // Changed from orderId to id
  walletQrString: string;
  fundingAddress: string;
  retopAmount: number;
  // Add other order fields as needed
  status?: string;
  createdAt?: string;
}

const CreatorTool = () => {
  const router = useRouter();
  const { currentUserLayer } = useAuth();
  const [collections, setCollections] = useState<CreatorCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for inscription progress view
  const [showInscriptionProgress, setShowInscriptionProgress] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Add state for order data
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // New state for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Get userLayerId safely
  const userLayerId = currentUserLayer?.id;

  useEffect(() => {
    // Only fetch if we have a valid userLayerId
    if (userLayerId) {
      fetchCreatorCollections();
    } else {
      // If no userLayerId, set loading to false
      setLoading(false);
    }
  }, [userLayerId]);

  // Effect to fetch progress data when showing inscription progress
  useEffect(() => {
    if (showInscriptionProgress && selectedCollectionId) {
      fetchProgressData();
      fetchOrderData(); // Fetch order data when showing progress
      // Set up interval for real-time updates
      const interval = setInterval(fetchProgressData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [showInscriptionProgress, selectedCollectionId]);

  // FIXED: Updated fetchCreatorCollections with guard
  const fetchCreatorCollections = async () => {
    // Guard against empty userLayerId
    if (!userLayerId) {
      console.log("No userLayerId available, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await createrCollection(userLayerId, 1, 10);
      setCollections(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch creator collections:", error);
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderData?.fundingAddress) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        orderData.walletQrString
      )}`;
      setQrCodeUrl(qrUrl);
    }
  }, [orderData]);

  const fetchProgressData = async () => {
    if (!selectedCollectionId) return;

    try {
      setIsLoadingProgress(true);
      const data = await getInscriptionProgress({
        collectionId: selectedCollectionId,
        userLayerId: currentUserLayer?.id,
      });
      setProgressData(data);
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
      // Don't show error to user, just use fallback data
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Add function to fetch order data
  const fetchOrderData = async () => {
    if (!selectedCollectionId) return;

    try {
      setIsLoadingOrder(true);
      // console.log("Fetching order data for collection:", selectedCollectionId);
      const data = await getOrderByCollectionIdBase(selectedCollectionId);
      // console.log("Order data received:", data);
      setOrderData(data);
    } catch (error) {
      console.error("Failed to fetch order data:", error);
      // console.error("Error details:", error.message);
      // Don't show error to user, just continue without order data
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    minutes = Math.floor(minutes);
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const formatBTC = (satoshis: number) => {
    return (satoshis / 1e8).toFixed(8);
  };

  // const formatUSD = (satoshis: number, btcPrice = 65000) => {
  //   const btcAmount = satoshis / 1e8;
  //   return `~$${Math.round(btcAmount * btcPrice).toLocaleString()}`;
  // };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      // Call the actual retop funding API
      if (selectedCollectionId) {
        const response = await retopFundingPromise({
          collectionId: selectedCollectionId,
        });

        // Check if the response indicates success
        if (response && response.success === false) {
          // Backend returned error
          throw new Error(response.error || "Payment processing failed");
        }

        // Show success message
        toast.success("Payment processed successfully!");

        // Refresh the progress data to get updated status
        await fetchProgressData();
        await fetchOrderData();

        // If payment was successful, close the modal and refresh collections
        setShowPaymentModal(false);
        await fetchCreatorCollections();
      } else {
        throw new Error("No collection selected");
      }
    } catch (error: any) {
      console.error("Failed to process payment:", error);
      toast.error(error.message);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleLaunch = (collectionId: string) => {
    router.push(`/creater-tool/launchProgress/${collectionId}`);
  };

  const handleClaim = async (collectionId: string, amount: number) => {
    console.log(
      "Claiming leftover amount:",
      amount,
      "for collection:",
      collectionId
    );
  };

  const handleInscriptionProgress = (collectionId: string) => {
    console.log("View inscription progress for collection:", collectionId);

    // Find the collection to check its state
    const collection = collections.find((c) => c.collectionId === collectionId);

    // If collection is in QUEUED or RAN_OUT_OF_FUNDS state, show inscription step
    if (
      collection &&
      (collection.progressState === "QUEUED" ||
        collection.progressState === "RAN_OUT_OF_FUNDS")
    ) {
      setSelectedCollectionId(collectionId);
      setShowInscriptionProgress(true);
      setProgressData(null); // Reset progress data
      setOrderData(null); // Reset order data
    } else {
      // For other states, navigate to the separate page
      router.push(`/creater-tool/inscription-progress/${collectionId}`);
    }
  };

  const handleGoToCollections = () => {
    setShowInscriptionProgress(false);
    setSelectedCollectionId(null);
    setProgressData(null);
    setOrderData(null); // Reset order data
    setShowPaymentModal(false);
  };

  const handlePayRemainingFee = () => {
    setShowPaymentModal(true);
  };

  const getSelectedCollection = () => {
    return collections.find((c) => c.collectionId === selectedCollectionId);
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal || !progressData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mb-[450px]">
        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Pay Remaining Fee</h2>
            <Button
              onClick={() => setShowPaymentModal(false)}
              variant="outline"
              size="lg"
              className="p-2"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="text-center mb-6">
            <p className="text-lightSecondary mb-4">
              Scan the QR code with your wallet to pay
            </p>

            {/* QR Code Placeholder - Replace with actual QR code generation */}
            <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
              <div className="text-black text-xs text-center">
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
            <div className="bg-darkPrimary border border-transLight4 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <p className="text-lightSecondary text-sm mb-1">
                    Wallet Address
                  </p>
                  <p className="text-white font-mono text-sm break-all">
                    {truncateAddress(orderData?.fundingAddress || "")}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    handleCopyAddress(orderData?.fundingAddress || "not found")
                  }
                  className="ml-2 p-1.5 bg-transLight4 hover:bg-transLight3 text-white"
                  size="sm"
                >
                  {copiedAddress ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCheckPayment}
            disabled={isCheckingPayment}
            className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3"
          >
            {isCheckingPayment ? "Checking Payment..." : "Check Payment"}
          </Button>
        </div>
      </div>
    );
  };

  // If showing inscription progress, render that view
  if (showInscriptionProgress) {
    const selectedCollection = getSelectedCollection();
    const isPaused = selectedCollection?.progressState === "RAN_OUT_OF_FUNDS";

    return (
      <CreaterLayout>
        <div className="min-h-screen w-full flex flex-col items-center bg-darkPrimary py-28">
          <div className="w-[800px]">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={handleGoToCollections}
                variant="outline"
                size="lg"
                className="p-2 border-hidden"
              >
                <X size={20} />
              </Button>
              <h1 className="text-3xl font-bold text-white">
                Inscription Progress
              </h1>
            </div>

            {/* Status Card */}
            {isPaused && (
              <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-errorQueternary border border-errorQueternary p-2 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-errorPrimary rounded"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Inscribing Paused
                  </h3>
                </div>
                <p className="text-lightSecondary mb-6">
                  Your paid estimated inscription fee is insufficient. Please
                  add more funds to continue the process.
                </p>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-lightSecondary text-sm mb-1">
                      Estimated fee to continue
                    </p>
                    <p className="text-white font-bold text-2xl">
                      {formatBTC(orderData?.retopAmount || 0)} BTC
                    </p>
                  </div>
                  <Button
                    onClick={handlePayRemainingFee}
                    className="bg-white text-black hover:bg-gray-200 font-semibold px-6 py-3"
                  >
                    Pay remaining fee
                  </Button>
                </div>

                {/* Inscription Progress Section */}
                {progressData && (
                  <div className="border-t border-transLight4 grid gap-4 pt-6 mb-6">
                    {/* Order ID */}
                    {orderData?.id && (
                      <div className="border-t border-transLight4 pt-4 pb-4">
                        <p className="text-lightSecondary text-lg mb-2">
                          Order ID
                        </p>
                        <div className="flex items-center justify-between bg-darkPrimary border border-transLight4 rounded-lg p-3">
                          <p className="text-white font-mono text-lg break-all flex-1">
                            {orderData.id}
                          </p>
                          <Button
                            onClick={() => handleCopyAddress(orderData.id)}
                            className="ml-2 bg-transLight4 hover:bg-transLight3 text-white"
                            size="sm"
                          >
                            <Copy size={24} />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <Settings size={24} className="text-white" />
                      <h3 className="text-lg font-semibold text-white">
                        Inscription Progress
                      </h3>
                    </div>
                    <p className="text-lightSecondary mb-6">
                      Track the real-time status of your Ordinal inscriptions as
                      we record your assets on Bitcoin.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-lightSecondary text-sm mb-1">
                          Progress
                        </p>
                        <p className="text-white font-medium">
                          {progressData.done} / {progressData.total}
                        </p>
                      </div>
                      <div>
                        <p className="text-lightSecondary text-sm mb-1">
                          Estimated remaining time
                        </p>
                        <p className="text-white font-medium">
                          {formatTimeRemaining(progressData.etaInMinutes)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Data for non-paused states */}
            {!isPaused && (
              <>
                {!progressData ? (
                  <p className="text-lightSecondary h-[400px] flex justify-center items-center">
                    Loading progress...
                  </p>
                ) : (
                  <div className="bg-darkSecondary border border-transLight4 grid gap-4 rounded-xl p-6 mb-8">
                    {/* Order ID */}
                    {orderData?.id && (
                      <div className="border-t border-transLight4 pt-4 pb-8">
                        <p className="text-lightSecondary text-lg mb-2">
                          Order ID
                        </p>
                        <div className="flex items-center justify-between bg-darkPrimary border border-transLight4 rounded-lg p-3">
                          <p className="text-white font-medium text-lg break-all flex-1">
                            {orderData.id}
                          </p>
                          <Button
                            onClick={() => handleCopyAddress(orderData.id)}
                            className="ml-2 p-1.5 bg-transLight4 hover:bg-transLight3 text-white"
                            size="sm"
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <Settings size={24} className="text-white" />
                      <h3 className="text-lg font-semibold text-white">
                        Inscription Progress
                      </h3>
                    </div>
                    <p className="text-lightSecondary mb-6">
                      Track the real-time status of your Ordinal inscriptions as
                      we record your assets on Bitcoin.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-lightSecondary text-sm mb-1">
                          Progress
                        </p>
                        <p className="text-white font-medium">
                          {progressData.done} / {progressData.total}
                        </p>
                      </div>
                      <div>
                        <p className="text-lightSecondary text-sm mb-1">
                          Estimated remaining time
                        </p>
                        <p className="text-white font-medium">
                          {formatTimeRemaining(progressData.etaInMinutes)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleGoToCollections}
                    className="flex-1 bg-white text-black hover:bg-gray-200"
                  >
                    {progressData ? "Go to My Collections →" : "Loading..."}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal />
      </CreaterLayout>
    );
  }

  const renderCollections = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center bg-darkSecondary justify-center min-h-[400px] text-center border border-transLight4 rounded-xl">
          <div className="text-lightSecondary">Loading collections...</div>
        </div>
      );
    }

    // FIXED: Handle case when no user is logged in
    if (!userLayerId) {
      return (
        <div className="flex flex-col items-center bg-darkSecondary justify-center min-h-[400px] text-center border border-transLight4 rounded-xl">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <Grid size={32} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <p className="text-xl mb-4 max-w-md text-lightPrimary">
            Please log in to view your collections.
          </p>
          {error && <p className="text-errorPrimary text-sm mb-4">{error}</p>}
        </div>
      );
    }

    if (collections.length === 0) {
      return (
        <div className="flex flex-col items-center bg-darkSecondary justify-center min-h-[400px] text-center border border-transLight4 rounded-xl">
          {/* Grid Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <Grid size={32} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          {/* Empty State Text */}
          <p className="text-xl mb-12 max-w-md text-lightPrimary">
            Looks like you don&lsquo;t have any collections yet.
          </p>
          {/* Start Creating Button */}
          <Button
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-xl"
            onClick={() => router.push("/creater-tool/inscribe")}
          >
            <span>Start Creating</span>
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {collections.map((collection) => (
          <NewCollectionCard
            key={collection.collectionId}
            collection={collection}
            onLaunch={() => handleLaunch(collection.collectionId)}
            onClaim={() =>
              handleClaim(collection.collectionId, collection.leftoverAmount)
            }
            onInscriptionProgress={() =>
              handleInscriptionProgress(collection.collectionId)
            }
          />
        ))}
      </div>
    );
  };

  return (
    <CreaterLayout>
      <div className="min-h-screen w-full flex flex-col items-center bg-darkPrimary py-12">
        {/* Main Content Container */}
        <div className="w-[800px]">
          {/* Page Title */}
          <div className="text-start mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              My Collections
            </h1>
          </div>

          {/* Collections Grid */}
          <div className="grid gap-4">{renderCollections()}</div>

          <div className="w-full h-[1px] my-8 bg-transLight4" />

          {/* Info Card */}
          <CreateInfoCard />
        </div>
      </div>
    </CreaterLayout>
  );
};

export default CreatorTool;
