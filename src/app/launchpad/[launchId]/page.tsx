"use client";

import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import { Carousel } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  confirmOrder,
  createBuyLaunch,
  generateHex,
} from "@/lib/service/postRequest";
import { getSigner, s3ImageUrlBuilder } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  getFeeRates,
  getLaunchByCollectionId,
  getLayerById,
} from "@/lib/service/queryHelper";
import PhaseCard from "@/components/atom/cards/phase-card";
import { useParams, useRouter } from "next/navigation";
import WhiteListPhaseCard from "@/components/atom/cards/white-list-phase-card";
import { useAuth } from "@/components/provider/auth-context-provider";
import { createOrderToMint } from "@/lib/service/postRequest";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LaunchDetailSkeleton from "@/components/atom/skeleton/launch-detail-skeleton";
import { Global } from "iconsax-react";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import { LaunchsDetailSchema } from "@/lib/validations/launchpad-validation";

const Page = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { authState } = useAuth();
  const params = useParams();
  const id = params.launchId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [activePhase, setActivePhase] = useState(null);

  const { mutateAsync: createBuyLaunchMutation } = useMutation({
    mutationFn: createBuyLaunch,
  });

  const { mutateAsync: confirmOrderMutation } = useMutation({
    mutationFn: confirmOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collectiblesByCollections", id],
      });
      queryClient.invalidateQueries({ queryKey: ["launchData", id] });
    },
  });

  const { data: collectibles = [], isLoading: isCollectiblesLoading } =
    useQuery({
      queryKey: ["collectiblesByCollections", id],
      queryFn: () => getLaunchByCollectionId(id as string),
      enabled: !!id,
    });

  // const { data: feeRates = [], isLoading: isFeeRatesLoading } = useQuery({
  //   queryKey: ["feeRateData"],
  //   queryFn: () => getFeeRates(authState?.userLayerId as string),
  //   enabled: !!authState?.userLayerId,
  // });

  const { data: currentLayer, isLoading: isLayerLoading } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  const launchOfferType =
    activePhase === "public"
      ? "public"
      : activePhase === "guaranteed"
      ? "guaranteed"
      : "";

  const handleConfirm = async () => {
    if (!authState.authenticated)
      return toast.error("Please connect wallet first");

    if (!currentLayer || !authState.userLayerId) {
      toast.error("Layer information not available");
      return false;
    }
    setIsLoading(true);
    try {
      let txid;
      let launchItemId;
      let orderRes;

      const response = await createBuyLaunchMutation({
        id: collectibles.launchId,
        userLayerId: authState.userLayerId,
        feeRate: 1,
      });

      if (response && response.success) {
        const orderId = response.data.order.id;
        launchItemId = response.data.launchItem.id;
        // const { singleMintTxHex } = response.data;

        // } else if (currentLayer.layer === "FRACTAL") {
        await window.unisat.sendBitcoin(
          response.data.order.fundingAddress,
          Math.ceil(response.data.order.fundingAmount)
        );
      await new Promise((resolve) => setTimeout(resolve, 1000));

        // }
        if (orderId) {
          orderRes = await confirmOrderMutation({
            orderId: orderId,
            // txid: txid,
            launchItemId: launchItemId,
            userLayerId: authState.userLayerId,
            feeRate: 1,
          });
          if (orderRes && orderRes.success) {
            toast.success("Success minted.");
            router.push("/launchpad");
          } else {
            toast.error("Failed to confirm order");
          }
        }
      } else {
        // toast.error(response.error);
        toast.error(`Failed to create order ${response.error}`);
      }
    } catch (error) {
      toast.error(`Failed to create order ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseClick = (phaseType: any) => {
    setActivePhase(phaseType);
  };

  const unixToISOString = (
    unixTimestamp: number | null | undefined
  ): string => {
    try {
      if (!unixTimestamp) return "";
      const date = new Date(unixTimestamp * 1000);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString();
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return "";
    }
  };

  const now = new Date().toISOString();

  const handlCollectionClick = () => {
    router.push("/collections");
  };

  if (isCollectiblesLoading || isLayerLoading) {
    return <LaunchDetailSkeleton />;
  }

  const links = [
    // {
    //   url: "collectionsData?.websiteUrl",
    //   isIcon: true,
    //   icon: (
    //     <Global
    //       size={32}
    //       className="sm:size-8 lg:size-8 hover:text-brand text-neutral00"
    //     />
    //   ),
    // },
    // {
    //   url: "collectionsData?.discordUrl",
    //   isIcon: false,
    //   icon: (
    //     <DiscordIcon
    //       size={32}
    //       className="sm:size-8 lg:size-8 hover:text-brand text-neutral00"
    //     />
    //   ),
    // },
    {
      url: "https://x.com/mintpark_io",
      isIcon: false,
      icon: (
        <ThreadIcon
          size={32}
          className="sm:size-8 lg:size-8 hover:text-brand text-neutral00"
        />
      ),
    },
  ].filter(
    (link) => link.url !== null && link.url !== undefined && link.url !== ""
  );

  const handleSocialClick = (url: string | undefined) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(validUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${s3ImageUrlBuilder(
          collectibles ? collectibles?.logoKey : "/launchpads/bg_1.jpg"
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
            <section className="flex flex-col justify-center h-full sm:h-full  lg:h-[80vh] items-center lg:grid grid-cols-3 gap-8 lg:gap-8 mb-8">
              {/* Left Column - Collection Info */}
              <div className="flex w-full flex-col gap-8 sm:gap-6 order-2">
                <div className="block lg:hidden">
                  <div className="flex gap-4 sm:gap-8">
                    {links.length > 0 && (
                      <div className="flex gap-4 sm:gap-6">
                        {links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => handleSocialClick(link.url)}
                            className="p-2 hover:bg-neutral800/10 rounded-lg transition-colors"
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
                <div className="space-y-2 sm:space-y-3  block md2:hidden">
                  <div className="flex h-2 sm:h-3 border rounded-lg border-1 border-neutral400">
                    <Progress
                      value={
                        (collectibles?.mintedAmount / collectibles?.supply) *
                        100
                      }
                      className={`w-full h-full ${
                        collectibles?.mintedAmount === 0 ? "" : ""
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center py-1 text-sm sm:text-base  text-neutral100">
                    <span className="font-medium text-lg text-neutral100">
                      Total minted
                    </span>
                    <h2>
                      <span className="text-neutral50 font-medium text-lg">
                        {collectibles?.mintedAmount}
                      </span>
                      <span className="text-brand font-medium text-lg">
                        {" "}
                        /{" "}
                      </span>
                      <span className="text-neutral100 font-medium text-lg">
                        {collectibles?.supply}
                      </span>{" "}
                    </h2>
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
                            className="p-2 hover:bg-neutral800/10 rounded-lg transition-colors"
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
              <div className="flex flex-col gap-4 sm:gap-6 w-full  order-1 lg:order-2">
                <div className="w-full aspect-square relative rounded-2xl sm:rounded-3xl overflow-hidden max-h-[384px]">
                  <Carousel className="w-full justify-center items-center flex">
                    {collectibles?.logoKey && (
                      <Image
                        width={384}
                        height={384}
                        src={s3ImageUrlBuilder(collectibles?.logoKey)}
                        className="object-cover rounded-2xl"
                        alt={collectibles?.name || "Collection image"}
                      />
                    )}
                  </Carousel>
                </div>

                <div className="space-y-2 sm:space-y-3 hidden lg:block">
                  <div className="flex h-2 sm:h-3 border rounded-lg border-1 border-neutral400">
                    <Progress
                      value={
                        (collectibles?.mintedAmount / collectibles?.supply) *
                        100
                      }
                      className={`w-full h-full ${
                        collectibles?.mintedAmount === 0 ? "" : ""
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center py-1 text-sm sm:text-base  text-neutral100">
                    <span className="font-medium text-lg text-neutral100">
                      Total minted
                    </span>
                    <h2>
                      <span className="text-neutral50 font-medium text-lg">
                        {collectibles?.mintedAmount}
                      </span>
                      <span className="text-brand font-medium text-lg">
                        {" "}
                        /{" "}
                      </span>
                      <span className="text-neutral100 font-medium text-lg">
                        {collectibles?.supply}
                      </span>{" "}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right Column - Phases and Button */}
              <div className="flex flex-col gap-4 sm:gap-6 w-full lg:gap-8 order-3">
                <ScrollArea className="flex-grow">
                  <div className="flex flex-col gap-4">
                    <PhaseCard
                      key={collectibles.id}
                      maxMintPerWallet={collectibles.poMaxMintPerWallet}
                      mintPrice={collectibles.poMintPrice}
                      endsAt={collectibles.poEndsAt}
                      startsAt={collectibles.poStartsAt}
                      isActive={activePhase === "public"}
                      onClick={() => handlePhaseClick("public")}
                      createdAt={collectibles.createdAt}
                    />
                    {collectibles.isWhiteListed && (
                      <WhiteListPhaseCard
                        key={collectibles.id}
                        maxMintPerWallet={collectibles.wlMaxMintPerWallet}
                        mintPrice={collectibles.wlMintPrice}
                        endsAt={collectibles.wlEndsAt}
                        startsAt={collectibles.wlStartsAt}
                        isActive={activePhase === "guaranteed"}
                        onClick={() => handlePhaseClick("guaranteed")}
                      />
                    )}
                  </div>
                </ScrollArea>

                {unixToISOString(collectibles.poStartsAt) >
                now ? null : unixToISOString(collectibles.poEndsAt) < now &&
                  unixToISOString(collectibles.poEndsAt) > "0" ? (
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
                ) : (
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
                )}
              </div>
            </section>
          </div>
        )}
      </DetailLayout>
    </div>
  );
};

export default Page;
