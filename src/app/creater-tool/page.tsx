"use client";
import React, { useState, useEffect } from "react";
import { Grid, ArrowRight, X, Settings, Copy, Check } from "lucide-react";
import CreaterLayout from "@/components/layout/createrLayout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import NewCollectionCard from "@/components/atom/cards/new-collection-card";
import { CreatorCollection } from "@/lib/validations/collection-validation";
import {
  createrCollection,
  getInscriptionProgress,
} from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import CreateInfoCard from "@/components/atom/cards/create-info-card";
import { toast } from "sonner";

interface ProgressData {
  totalTraitValueCount: number;
  doneTraitValueCount: number;
  totalCollectibleCount: number;
  doneCollectibleCount: number;
  done: number;
  total: number;
  etaInMinutes: number;
  orderId?: string;
  estimatedFeeToComplete?: number; // in satoshis
  walletAddress?: string;
  feeBreakdown?: {
    inscriptionFee: number;
    networkFee: number;
    serviceFee: number;
    total: number;
  };
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

  // New state for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const userLayerId = currentUserLayer?.id || "";

  useEffect(() => {
    fetchCreatorCollections();
  }, []);

  // Effect to fetch progress data when showing inscription progress
  useEffect(() => {
    if (showInscriptionProgress && selectedCollectionId) {
      fetchProgressData();
      // Set up interval for real-time updates
      const interval = setInterval(fetchProgressData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [showInscriptionProgress, selectedCollectionId]);

  const fetchCreatorCollections = async () => {
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

  const formatUSD = (satoshis: number, btcPrice = 65000) => {
    const btcAmount = satoshis / 1e8;
    return `~$${Math.round(btcAmount * btcPrice).toLocaleString()}`;
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      // Simulate payment check API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, you would call an API to check if payment was received
      // For now, we'll just refresh the progress data
      await fetchProgressData();

      // If payment was successful, close the modal and refresh collections
      setShowPaymentModal(false);
      await fetchCreatorCollections();
    } catch (error) {
      console.error("Failed to check payment:", error);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleLaunch = (collectionId: string) => {
    console.log("Launching collection:", collectionId);
    router.push(`/creater-tool/launchProgress/${collectionId}`);
  };

  const handleClaim = async (collectionId: string, amount: number) => {
    console.log(
      "Claiming leftover amount:",
      amount,
      "for collection:",
      collectionId
    );
    // Handle claiming leftover BTC
    // After successful claim, refresh collections
    // await claimLeftoverBTC(collectionId);
    // fetchCreatorCollections();
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
    } else {
      // For other states, navigate to the separate page
      router.push(`/creater-tool/inscription-progress/${collectionId}`);
    }
  };

  const handleGoToCollections = () => {
    setShowInscriptionProgress(false);
    setSelectedCollectionId(null);
    setProgressData(null);
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

    const feeBreakdown = progressData.feeBreakdown || {
      inscriptionFee: progressData.estimatedFeeToComplete || 1300000, // 0.013 BTC default
      networkFee: 220000, // 0.0022 BTC
      serviceFee: 10000, // 0.0001 BTC
      total: progressData.estimatedFeeToComplete || 1530000, // 0.0153 BTC
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Pay Remaining Fee</h2>
            <Button
              onClick={() => setShowPaymentModal(false)}
              variant="outline"
              size="sm"
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
                QR Code
                <br />
                {progressData.walletAddress || "bc1p...mhw6"}
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
                    {progressData.walletAddress || "bc1p...mhw6"}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    handleCopyAddress(
                      progressData.walletAddress || "bc1p...mhw6"
                    )
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

          {/* Fee Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Inscription Fee</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatBTC(feeBreakdown.inscriptionFee)} BTC
                </div>
                <div className="text-lightSecondary text-sm">
                  {formatUSD(feeBreakdown.inscriptionFee)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Network Fee</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatBTC(feeBreakdown.networkFee)} BTC
                </div>
                <div className="text-lightSecondary text-sm">
                  {formatUSD(feeBreakdown.networkFee)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lightSecondary">Service Fee</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatBTC(feeBreakdown.serviceFee)} BTC
                </div>
                <div className="text-lightSecondary text-sm">
                  {formatUSD(feeBreakdown.serviceFee)}
                </div>
              </div>
            </div>

            <div className="h-px bg-transLight4"></div>

            <div className="flex justify-between items-center font-bold">
              <span className="text-white text-lg">Total</span>
              <div className="text-right">
                <div className="text-white text-lg">
                  {formatBTC(feeBreakdown.total)} BTC
                </div>
                <div className="text-lightSecondary">
                  {formatUSD(feeBreakdown.total)}
                </div>
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
                size="sm"
                className="p-2"
              >
                <X size={20} />
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
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
                      {formatBTC(
                        progressData?.estimatedFeeToComplete || 1530000
                      )}{" "}
                      BTC
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
                    {(progressData?.orderId || isPaused) && (
                      <div className="border-t border-transLight4 pt-4 pb-4">
                        <p className="text-lightSecondary text-sm mb-2">
                          Order ID
                        </p>
                        <div className="flex items-center justify-between bg-darkPrimary border border-transLight4 rounded-lg p-3">
                          <p className="text-white font-mono text-sm break-all flex-1">
                            {progressData?.orderId ||
                              "557b9526-3688-4587-a855-9d1c75ddf0e4"}
                          </p>
                          <Button
                            onClick={() =>
                              handleCopyAddress(
                                progressData?.orderId ||
                                  "557b9526-3688-4587-a855-9d1c75ddf0e4"
                              )
                            }
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
                          Paused - Add funds to continue
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
                    {(progressData?.orderId || !isPaused) && (
                      <div className="border-t border-transLight4 pt-4 pb-8">
                        <p className="text-lightSecondary text-sm mb-2">
                          Order ID
                        </p>
                        <div className="flex items-center justify-between bg-darkPrimary border border-transLight4 rounded-lg p-3">
                          <p className="text-white font-mono text-sm break-all flex-1">
                            {progressData?.orderId ||
                              "557b9526-3688-4587-a855-9d1c75ddf0e4"}
                          </p>
                          <Button
                            onClick={() =>
                              handleCopyAddress(
                                progressData?.orderId ||
                                  "557b9526-3688-4587-a855-9d1c75ddf0e4"
                              )
                            }
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
