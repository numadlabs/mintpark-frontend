"use client";

import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import { Carousel } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { confirmOrder, createBuyLaunch } from "@/lib/service/postRequest";
import { getSigner, s3ImageUrlBuilder } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getLaunchByCollectionId,
  getLayerById,
} from "@/lib/service/queryHelper";
import PhaseCard from "@/components/atom/cards/phase-card";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/provider/auth-context-provider";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LaunchDetailSkeleton from "@/components/atom/skeleton/launch-detail-skeleton";
import ThreadIcon from "@/components/icon/thread";
import moment from "moment";
import ImageLoaderComponent from "@/components/atom/image-loader";
import { Global, Unlimited } from "iconsax-react";

import SuccessModal from "@/components/modal/success-modal";
import ErrorModal from "@/components/modal/error-modal";
import PendingModal from "@/components/modal/pending-modal";
import DiscordIcon from "@/components/icon/hoverIcon";

const Page = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { authState, selectedLayerId } = useAuth();
  const params = useParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [steps, setSteps] = useState(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const id = params.launchId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<
    "guaranteed" | "public" | "FCFS" | null
  >(null);
  const [selectedPhase, setSelectedPhase] = useState<
    "guaranteed" | "public" | "FCFS" | null
  >(null);

  const { mutateAsync: createBuyLaunchMutation } = useMutation({
    mutationFn: createBuyLaunch,
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create buy launch";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleViewCollection = () => {
    setShowSuccessModal(false);
    router.push("/launchpad");
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };
  const handleClosePendingModal = () => {
    setShowPendingModal(false);
  };

  const { mutateAsync: confirmOrderMutation } = useMutation({
    mutationFn: confirmOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collectiblesByCollections", id],
      });
      queryClient.invalidateQueries({ queryKey: ["launchData", id] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to confirm order";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const { data: collectibles = [], isLoading: isCollectiblesLoading } =
    useQuery({
      queryKey: ["collectiblesByCollections", id],
      queryFn: () => getLaunchByCollectionId(id as string),
      enabled: !!id,
    });
  // console.log("unconfirmed", collectibles)
  // console.log("unconfirmed", collectibles.status)

  const { data: currentLayer, isLoading: isLayerLoading } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const handleConfirm = async () => {
    if (!authState.authenticated) {
      setError("Please connect wallet first");
      setShowErrorModal(true); // Show error modal instead of toast
      return;
    }

    if (!currentLayer || !authState.userLayerId) {
      setError("Layer information not available");
      setShowErrorModal(true); // Show error modal instead of toast
      return;
    }

    setIsLoading(true);
    setShowPendingModal(true);
    setError(null);

    try {
      let txid;
      let launchItemId;
      setSteps(1);
      const response = await createBuyLaunchMutation({
        id: collectibles.launchId,
        userLayerId: authState.userLayerId,
        feeRate: 1,
      });
      if (!response?.success) {
        throw new Error(response?.error || "Failed to create order");
      }

      const orderId = response.data.order.id;
      launchItemId = response.data.launchItem.id;

      if (response.data.singleMintTxHex) {
        setSteps(2);
        const { signer } = await getSigner();
        const signedTx = await signer?.sendTransaction(
          response.data.singleMintTxHex
        );
        const tx = await signedTx?.wait();
        if (tx) {
          txid = tx.hash;
        }
      } else {
        await window.unisat.sendBitcoin(
          response.data.order.fundingAddress,
          Math.ceil(response.data.order.fundingAmount)
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      if (orderId) {
        setSteps(3);
        const orderRes = await confirmOrderMutation({
          orderId,
          txid,
          launchItemId,
          userLayerId: authState.userLayerId,
          feeRate: 1,
        });

        if (orderRes?.success) {
          // Show success modal instead of toast notification
          setShowSuccessModal(true);

          // Still invalidate queries for data refresh
          queryClient.invalidateQueries({
            queryKey: ["collectiblesByCollections", id],
          });
          queryClient.invalidateQueries({ queryKey: ["launchData", id] });
        } else {
          throw new Error(orderRes?.error || "Failed to confirm order");
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      setError(errorMessage);
      // Show error modal instead of toast
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
      setShowPendingModal(false);
    }
  };

  // Helper function to check if all phases have completed
  const areAllPhasesCompleted = () => {
    const now = moment().unix();

    // Make sure we're only checking phases that are actually configured
    const wlExists = collectibles.isWhitelisted && collectibles.wlStartsAt > 0;
    const fcfsExists = collectibles.hasFCFS && collectibles.fcfsStartsAt > 0;
    const poExists = collectibles.poStartsAt > 0;

    // Check if all configured end times are in the past
    const wlEnded =
      !wlExists || (collectibles.wlEndsAt > 0 && collectibles.wlEndsAt < now);
    const fcfsEnded =
      !fcfsExists ||
      (collectibles.fcfsEndsAt > 0 && collectibles.fcfsEndsAt < now);
    const poEnded =
      !poExists || (collectibles.poEndsAt > 0 && collectibles.poEndsAt < now);

    // Only return true if at least one phase was configured and all configured phases have ended
    const hasAnyPhase = wlExists || fcfsExists || poExists;
    return hasAnyPhase && wlEnded && fcfsEnded && poEnded;
  };

  // Helper function to check if any phase has started yet
  const hasAnyPhaseStarted = () => {
    const now = moment().unix();

    // Check if any start time is in the past
    const wlStarted =
      collectibles.isWhitelisted &&
      collectibles.wlStartsAt > 0 && // Ensure valid start time
      collectibles.wlStartsAt <= now;

    const fcfsStarted =
      collectibles.hasFCFS &&
      collectibles.fcfsStartsAt > 0 && // Ensure valid start time
      collectibles.fcfsStartsAt <= now;

    const poStarted =
      collectibles.poStartsAt > 0 && // Ensure valid start time
      collectibles.poStartsAt <= now;

    return wlStarted || fcfsStarted || poStarted;
  };

  // Helper function to check if all supplies are exhausted
  const isSupplyExhausted = () => {
    // For badges with infinite supply, supply is never exhausted
    if (collectibles.isBadge && collectibles.badgeSupply === null) {
      return false;
    }

    return collectibles.supply === collectibles.mintedAmount;
  };

  // Comprehensive function to determine which button to show
  const determineButtonState = () => {
    // 1. If supply is exhausted, show "Go to Collection"
    if (isSupplyExhausted()) {
      return "goToCollection";
    }

    // 2. If mint is currently active, show "Mint"
    if (isMintActive()) {
      return "mint";
    }

    // 3. If all phases have completed (but supply remains), show "Go to Collection"
    if (areAllPhasesCompleted()) {
      return "goToCollection";
    }

    // 4. If no phase has started yet, show "Minting Soon"
    if (!hasAnyPhaseStarted()) {
      return "mintingSoon";
    }

    // // Check if status is unconfirmed
    // if (collectibles.status === "UNCONFIRMED") {
    //   return "unconfirmedCollection";
    // }

    // 5. Default: if phases exist in the future, show "Minting Soon"
    return "mintingSoon";
  };

  const determineActivePhase = () => {
    const now = moment();

    // Check Guaranteed (Whitelist) phase
    if (collectibles.isWhitelisted && collectibles.wlStartsAt > 0) {
      const wlStart = moment.unix(collectibles.wlStartsAt);
      const wlEnd = moment.unix(collectibles.wlEndsAt);

      if (
        now.isBetween(wlStart, wlEnd) ||
        (collectibles.wlStartsAt <= now.unix() && collectibles.wlEndsAt === 0)
      ) {
        return "guaranteed";
      }
    }

    // Check FCFS list phase
    if (collectibles.hasFCFS && collectibles.fcfsStartsAt > 0) {
      const fcfsStart = moment.unix(collectibles.fcfsStartsAt);
      const fcfsEnd = moment.unix(collectibles.fcfsEndsAt);

      if (
        now.isBetween(fcfsStart, fcfsEnd) ||
        (collectibles.fcfsStartsAt <= now.unix() &&
          collectibles.fcfsEndsAt === 0)
      ) {
        return "FCFS";
      }
    }

    // Check Public phase
    if (collectibles.poStartsAt > 0) {
      const poStart = moment.unix(collectibles.poStartsAt);
      const poEnd = moment.unix(collectibles.poEndsAt);

      if (
        now.isBetween(poStart, poEnd) ||
        (collectibles.poStartsAt <= now.unix() && collectibles.poEndsAt === 0)
      ) {
        return "public";
      }
    }

    return null;
  };

  const isMintActive = () => {
    const now = moment().unix();

    // For badges with infinite supply, only check if it's started
    if (collectibles.isBadge && collectibles.badgeSupply === null) {
      // Check whitelist period - only if it exists
      const isInWhitelistPeriod =
        collectibles.isWhitelisted &&
        collectibles.wlStartsAt > 0 &&
        collectibles.wlStartsAt <= now &&
        (collectibles.wlEndsAt === 0 || collectibles.wlEndsAt > now);

      // Check fcfs period - only if it exists
      const isInFcfslistPeriod =
        collectibles.hasFCFS &&
        collectibles.fcfsStartsAt > 0 &&
        collectibles.fcfsStartsAt <= now &&
        (collectibles.fcfsEndsAt === 0 || collectibles.fcfsEndsAt > now);

      // Check public period - only if it exists
      const isInPublicPeriod =
        collectibles.poStartsAt > 0 &&
        collectibles.poStartsAt <= now &&
        (collectibles.poEndsAt === 0 || collectibles.poEndsAt > now);

      return isInWhitelistPeriod || isInPublicPeriod || isInFcfslistPeriod;
    }

    // If supply is reached for non-infinite supply, minting is not active
    if (
      !collectibles.isBadge &&
      collectibles.supply === collectibles.mintedAmount
    ) {
      return false;
    }

    // Check whitelist period - only if it exists
    const isInWhitelistPeriod =
      collectibles.isWhitelisted &&
      collectibles.wlStartsAt > 0 &&
      collectibles.wlStartsAt <= now &&
      (collectibles.wlEndsAt === 0 || collectibles.wlEndsAt > now);

    // Check fcfs period - only if it exists
    const isInFcfslistPeriod =
      collectibles.hasFCFS &&
      collectibles.fcfsStartsAt > 0 &&
      collectibles.fcfsStartsAt <= now &&
      (collectibles.fcfsEndsAt === 0 || collectibles.fcfsEndsAt > now);

    // Check public period - only if it exists
    const isInPublicPeriod =
      collectibles.poStartsAt > 0 &&
      collectibles.poStartsAt <= now &&
      (collectibles.poEndsAt === 0 || collectibles.poEndsAt > now);

    return isInWhitelistPeriod || isInPublicPeriod || isInFcfslistPeriod;
  };

  const shouldShowGoToCollection = () => {
    const now = moment().unix();

    // For badges with infinite supply, only show when not active
    if (collectibles.isBadge && collectibles.badgeSupply === null) {
      const hasEitherPhaseStarted = hasAnyPhaseStarted();
      return hasEitherPhaseStarted && !isMintActive();
    }

    // Show "Go to Collection" if supply is reached
    if (collectibles.supply === collectibles.mintedAmount) {
      return true;
    }

    // Show "Go to Collection" if any phase has started but mint is not active
    return hasAnyPhaseStarted() && !isMintActive();
  };

  useEffect(() => {
    const currentPhase = determineActivePhase();
    setActivePhase(currentPhase);
    // Set the selected phase to the active phase initially
    if (!selectedPhase && currentPhase) {
      setSelectedPhase(currentPhase);
    }
  }, [collectibles]);

  const handlePhaseClick = (phaseType: "guaranteed" | "public" | "FCFS") => {
    setSelectedPhase(phaseType);
  };

  // add to go to collection condition
  const handlCollectionClick = () => {
    router.push(`/collections/${collectibles.id}`);
  };

  // Helper function to calculate progress value
  const calculateProgress = () => {
    if (collectibles.isBadge && collectibles.badgeSupply === null) {
      // For infinite supply, don't show progress
      return 0;
    }
    return (collectibles?.mintedAmount / collectibles?.supply) * 100;
  };

  // Helper function to render supply display
  const renderSupplyDisplay = () => {
    if (collectibles.isBadge && collectibles.badgeSupply === null) {
      return (
        <div className="flex gap-1 items-center">
          <span className="text-neutral50 font-medium text-lg">
            {collectibles?.mintedAmount}
          </span>
          <span className="text-brand font-medium text-lg"> / </span>
          <span className="text-neutral200 font-medium text-lg">
            {" "}
            <Unlimited size="18" color="#88898A" />
          </span>
        </div>
      );
    }

    return (
      <>
        <span className="text-neutral50 font-medium text-lg">
          {collectibles?.mintedAmount}
        </span>
        <span className="text-brand font-medium text-lg"> / </span>
        <span className="text-neutral200 font-medium text-lg">
          {collectibles?.supply}
        </span>
      </>
    );
  };

  if (isCollectiblesLoading || isLayerLoading) {
    return <LaunchDetailSkeleton />;
  }

  const links = [
    {
      url: collectibles.websiteUrl,
      isIcon: true,
      icon: <Global size={32} className="hover:text-brand text-neutral00" />,
    },
    {
      url: collectibles.twitterUrl,
      isIcon: false,
      icon: (
        <ThreadIcon size={32} className="hover:text-brand  text-neutral00" />
      ),
    },
    {
      url: collectibles.discordUrl,
      isIcon: false,
      icon: (
        <DiscordIcon size={32} className="hover:text-brand  text-neutral00" />
      ),
    },
  ].filter((link) => link.url);

  const handleSocialClick = (url: string) => {
    // console.log(url);
    if (!url) return;
    const validUrl = url.startsWith("https") ? url : `https://${url}`;
    window.open(validUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${s3ImageUrlBuilder(
            collectibles?.logoKey || ""
          )})`,
        }}
      >
        <DetailLayout>
          <Header />
          {isCollectiblesLoading || isLayerLoading ? (
            <div className="w-full">
              <LaunchDetailSkeleton />
            </div>
          ) : (
            <div className="3xl:px-[312px] pt-[56px] md:pt-0">
              <section className="flex flex-col justify-start h-full sm:h-full lg:h-[80vh] items-center lg:grid grid-cols-3 gap-8 lg:gap-8 mb-8">
                {/* Left Column - Collection Info */}
                <div className="flex w-full flex-col gap-8 sm:gap-6 order-2">
                  <div className="block lg:hidden">
                    <div className="flex gap-4 sm:gap-4">
                      {links.length > 0 && (
                        <div className="flex gap-4 sm:gap-4">
                          {links.map((link, i) => (
                            <button
                              key={i}
                              onClick={() => handleSocialClick(link.url)}
                              className="hover:bg-neutral800/10 rounded-lg transition-colors"
                            >
                              {link.icon}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold capitalize text-neutral50">
                      {collectibles?.name}
                    </h1>
                    <div className="sm:block">
                      <p className="h-1 w-[120px] rounded bg-brand shadow-shadowBrands"></p>
                    </div>
                    <p className="text-base sm:text-lg lg:text-lg text-neutral100 line-clamp-4 sm:line-clamp-none">
                      {collectibles?.description}
                    </p>
                  </div>
                  <div className="space-y-2 sm:space-y-3 block md2:hidden">
                    <div className="flex h-2 sm:h-3 border rounded-lg border-1 border-neutral400">
                      <Progress
                        value={calculateProgress()}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm sm:text-base text-neutral100">
                      <span className="font-medium text-lg text-neutral100">
                        Total minted
                      </span>
                      <h2>{renderSupplyDisplay()}</h2>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="flex gap-4 sm:gap-8 mt-2">
                      {links.length > 0 && (
                        <div className="flex gap-4 sm:gap-6">
                          {links.map((link, i) => (
                            <button
                              key={i}
                              onClick={() => handleSocialClick(link.url)}
                              className="hover:bg-neutral800/10 rounded-lg transition-colors"
                            >
                              {link.icon}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Column - Image and Progress */}
                <div className="flex flex-col pt-10 lg:p-0 gap-4 sm:gap-8 w-full order-1 lg:order-2">
                  <div className="w-full aspect-square relative rounded-2xl sm:rounded-3xl overflow-hidden max-h-[384px]">
                    <Carousel className="w-full justify-center items-center rounded-3xl flex">
                      {collectibles?.logoKey && (
                        <ImageLoaderComponent
                          width={384}
                          height={384}
                          src={s3ImageUrlBuilder(collectibles?.logoKey)}
                          className="object-cover aspect-square rounded-3xl justify-center items-center"
                          alt={collectibles?.name || "Collection image"}
                        />
                      )}
                    </Carousel>
                  </div>

                  <div className="space-y-2 sm:space-y-4 hidden lg:block">
                    <div className="flex h-2 sm:h-3 border rounded-lg border-1 border-neutral400">
                      <Progress
                        value={calculateProgress()}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm sm:text-base text-neutral100">
                      <span className="font-medium text-lg text-neutral100">
                        Total minted
                      </span>
                      <h2>{renderSupplyDisplay()}</h2>
                    </div>
                  </div>
                </div>

                {/* Right Column - Phases and Button */}
                <div className="flex flex-col gap-4 sm:gap-4 w-full lg:gap-4 order-3">
                  <ScrollArea className="flex-grow h-[384px] w-full">
                    <div className="flex flex-col gap-4">
                      {collectibles.isWhitelisted && (
                        <PhaseCard
                          phaseType="guaranteed"
                          maxMintPerWallet={collectibles.wlMaxMintPerWallet}
                          mintPrice={collectibles.wlMintPrice}
                          endsAt={collectibles.wlEndsAt}
                          startsAt={collectibles.wlStartsAt}
                          isActive={selectedPhase === "guaranteed"}
                          onClick={() => handlePhaseClick("guaranteed")}
                          supply={collectibles.supply}
                          mintedAmount={collectibles.mintedAmount}
                          isBadge={collectibles.isBadge}
                          badgeSupply={collectibles.badgeSupply}
                        />
                      )}

                      {collectibles.hasFCFS && (
                        <PhaseCard
                          phaseType="FCFS"
                          maxMintPerWallet={collectibles.fcfsMaxMintPerWallet}
                          mintPrice={collectibles.fcfsMintPrice}
                          endsAt={collectibles.fcfsEndsAt}
                          startsAt={collectibles.fcfsStartsAt}
                          isActive={selectedPhase === "FCFS"}
                          onClick={() => handlePhaseClick("FCFS")}
                          supply={collectibles.supply}
                          mintedAmount={collectibles.mintedAmount}
                          isBadge={collectibles.isBadge}
                          badgeSupply={collectibles.badgeSupply}
                        />
                      )}

                      {collectibles.poStartsAt !== 0 &&
                        collectibles.poStartsAt > 0 && (
                          <PhaseCard
                            phaseType="public"
                            maxMintPerWallet={collectibles.poMaxMintPerWallet}
                            mintPrice={collectibles.poMintPrice}
                            endsAt={collectibles.poEndsAt}
                            startsAt={collectibles.poStartsAt}
                            isActive={selectedPhase === "public"}
                            onClick={() => handlePhaseClick("public")}
                            supply={collectibles.supply}
                            mintedAmount={collectibles.mintedAmount}
                            isBadge={collectibles.isBadge}
                            badgeSupply={collectibles.badgeSupply}
                          />
                        )}
                    </div>
                  </ScrollArea>

                  {/* Updated Button Logic */}
                  {determineButtonState() === "goToCollection" ? (
                    <Button
                      className="w-full py-2 sm:py-3 sm:px-6 text-base sm:text-lg2 font-semibold mt-4"
                      disabled={isLoading}
                      onClick={handlCollectionClick}
                    >
                      {isLoading ? (
                        <Loader2
                          className="animate-spin"
                          color="#111315"
                          size={24}
                        />
                      ) : (
                        "Go to collection"
                      )}
                    </Button>
                  ) : // : determineButtonState() === "unconfirmedCollection" ? (
                  //   <Button
                  //     className="w-full py-2 sm:py-3 sm:px-6 text-base sm:text-lg2 font-semibold mt-4"
                  //     disabled={true}
                  //     onClick={handlCollectionClick}
                  //   >
                  //     Go to collection
                  //   </Button>
                  // )
                  determineButtonState() === "mint" ? (
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-full py-2 sm:py-3 sm:px-6 text-base sm:text-lg2 font-semibold"
                      disabled={isLoading}
                      onClick={handleConfirm}
                    >
                      {isLoading ? (
                        <Loader2
                          className="animate-spin"
                          color="#111315"
                          size={24}
                        />
                      ) : (
                        "Mint"
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full py-2 sm:py-3 sm:px-6 text-base sm:text-lg2 font-semibold"
                      disabled={true}
                    >
                      Minting Soon
                    </Button>
                  )}
                </div>
              </section>
            </div>
          )}
          <SuccessModal
            open={showSuccessModal}
            onClose={handleCloseSuccessModal}
            handleCreate={handleViewCollection}
          />

          <ErrorModal
            isOpen={showErrorModal}
            onClose={handleCloseErrorModal}
            errorMessage={error || "An unexpected error occurred"}
          />

          <PendingModal
            isOpen={showPendingModal}
            onClose={handleClosePendingModal}
            currentStep={steps}
          />
        </DetailLayout>
      </div>
    </>
  );
};

export default Page;
