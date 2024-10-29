"use client";
import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import ButtonLg from "@/components/ui/buttonLg";
import { Carousel } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { confirmOrder, generateHex } from "@/lib/service/postRequest";
import { getSigner, s3ImageUrlBuilder } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  getFeeRates,
  getLaunchByCollectionId,
  getLayerById,
} from "@/lib/service/queryHelper";
import PhaseCard from "@/components/atom/cards/phaseCard";
import { useParams, useRouter } from "next/navigation";
import WhiteListPhaseCard from "@/components/atom/cards/white-list-phase-card";
import { useAuth } from "@/components/provider/auth-context-provider";
import { createOrderToMint } from "@/lib/service/postRequest";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();
  const { authState } = useAuth();
  const params = useParams();
  const id = params.launchId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [activePhase, setActivePhase] = useState(null);

  const { mutateAsync: createOrderToMintMutation } = useMutation({
    mutationFn: createOrderToMint,
  });

  const { mutateAsync: confirmOrderMutation } = useMutation({
    mutationFn: confirmOrder,
  });

  const { data: collectibles = [] } = useQuery({
    queryKey: ["collectiblesByCollections", id],
    queryFn: () => getLaunchByCollectionId(id as string),
    enabled: !!id,
  });

  const { data: feeRates = [] } = useQuery({
    queryKey: ["feeRateData"],
    queryFn: () => getFeeRates(authState?.layerId as string),
    enabled: !!authState?.layerId,
  });

  const { data: currentLayer } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
  });

  console.log("first", feeRates.fastestFee);
  const launchOfferType =
    activePhase === "public"
      ? "public"
      : activePhase === "guaranteed"
        ? "guaranteed"
        : "";

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      let txid;
      const response = await createOrderToMintMutation({
        collectionId: id,
        feeRate: feeRates.fastestFee,
        launchOfferType: launchOfferType,
      });
      if (response && response.success) {
        const orderId = response.data.order.id;
        const { singleMintTxHex } = response.data;

        if (currentLayer.layer === "CITREA") {
          const { signer } = await getSigner();
          console.log(singleMintTxHex);
          const signedTx = await signer?.sendTransaction(singleMintTxHex);
          await signedTx?.wait();
          if (signedTx?.hash) txid = signedTx?.hash;
          console.log(signedTx?.hash);
        } else if (currentLayer.layer === "FRACTAL") {
          await window.unisat.sendBitcoin(
            response.data.order.fundingAddress,
            response.data.order.fundingAmount,
          );
        }
        if (orderId) {
          await confirmOrderMutation({ orderId: orderId, txid: txid });
          toast.success("Success minted.");
          router.push("/launchpad");
        }
      }
    } catch (error) {
      // console.error(error);
      toast.error("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseClick = (phaseType: any) => {
    setActivePhase(phaseType);
  };

  // Add this helper function to your utils file (e.g., /lib/utils.ts)
  const unixToISOString = (
    unixTimestamp: number | null | undefined,
  ): string => {
    try {
      // Check if timestamp is valid
      if (!unixTimestamp) return "";

      // Multiply by 1000 to convert seconds to milliseconds
      const date = new Date(unixTimestamp * 1000);

      // Validate the date is within acceptable range
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

  return (
    <>
      {/* todo enddate yahu, total minted, max mintable amount*/}
      <div
        style={{
          backgroundImage: `url(${s3ImageUrlBuilder(
            collectibles ? collectibles?.logoKey : "/launchpads/bg_1.jpg",
          )})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}

        // className="bg-white"te"
      >
        <DetailLayout>
          <Header />
          <section className="grid grid-cols-3 gap-8 h-[464px] mt-24">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl font-bold capitalize text-neutral50">
                {collectibles?.name}
              </h1>
              <span className="">
                <p className="h-1 w-[120px] rounded bg-brand shadow-shadowBrands"></p>
              </span>
              <p className="font-normal text-lg2 text-neutral100">
                {collectibles?.description}
              </p>
              <div className="flex gap-6">
                <span>
                  <Image
                    width={32}
                    height={32}
                    src="/detail_icon/icon_1.png"
                    className="aspect-square rounded-3xl"
                    alt="png"
                  />
                </span>
                <span>
                  <Image
                    width={32}
                    height={32}
                    src="/detail_icon/icon_2.png"
                    className="aspect-square rounded-3xl"
                    alt="png"
                  />
                </span>
                <span>
                  <Image
                    width={32}
                    height={32}
                    src="/detail_icon/icon_3.png"
                    className="aspect-square rounded-3xl"
                    alt="png"
                  />
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <Carousel
              // plugins={[
              //   Autoplay({
              //     delay: 2000,
              //   }),
              // ]}
              >
                {/* <CarouselPrevious onClick={() => setCurrent(current - 1)} />
              <CarouselNext onClick={() => setCurrent(current + 1)} /> */}
                {/* <CarouselContent> */}
                {/* {collectibles &&
                  collectibles.map((item, index) => {
                    return (
                      <CarouselItem
                        key={item.id}
                        onMouseEnter={() => setCurrentIndex(index)}
                      >
                        <Image
                          width={384}
                          height={384}
                          // src={item.image}
                          // src={`/launchpads/launch_${item.id}.png`}
                          src={s3ImageUrlBuilder(item.lo)}
                          className="aspect-square rounded-3xl"
                          alt="png"
                        />
                      </CarouselItem>
                    );
                  })} */}
                {collectibles?.logoKey && (
                  <Image
                    width={384}
                    height={384}
                    // src={item.image}
                    // src={`/launchpads/launch_${item.id}.png`}
                    src={s3ImageUrlBuilder(collectibles?.logoKey)}
                    className="aspect-square rounded-3xl bg-no-repeat"
                    alt="png"
                  />
                )}

                {/* <CarouselItem>
                  <Image
                    width={384}
                    height={384}
                    src="/launchpads/launch_1.png"
                    className="aspect-square rounded-3xl"
                    alt="png"
                  />
                </CarouselItem>
                <CarouselItem>
                  <Image
                    width={384}
                    height={384}
                    src="/launchpads/launch_3.png"
                    className="aspect-square rounded-3xl"
                    alt="png"
                  />
                </CarouselItem> */}
                {/* </CarouselContent> */}
              </Carousel>

              <div className="flex h-3 border rounded-lg border-1 mt-4 border-neutral400">
                <Progress
                  value={
                    (collectibles?.mintedAmount / collectibles?.supply) * 100
                  }
                  className={`w-full h-full ${collectibles?.mintedAmount === 0 ? "" : "shadow-shadowBrands"}`}
                />
              </div>
              <div className="flex justify-between py-1 text-neutral100">
                <span>Total minted</span>
                <h2>
                  <span className="text-neutral50">
                    {collectibles?.mintedAmount}
                  </span>
                  <span
                    className="text-brand"
                    // style={{
                    //   backdropFilter: "blur(30px)",
                    // }}
                  >
                    {" "}
                    /{/* <span className="h-2"></span> */}
                  </span>{" "}
                  {collectibles?.supply}
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between h-[464px] gap-8">
              <ScrollArea className="flex flex-col">
                <div className="flex flex-col gap-4 w-full">
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
              {unixToISOString(collectibles.poStartsAt) > now ? (
                ""
              ) : unixToISOString(collectibles.poEndsAt) < now ? (
                <Button disabled={isLoading} onClick={handlCollectionClick}>
                  {" "}
                  {isLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    // "Loading"
                    "Go to collection"
                  )}
                </Button>
              ) : (
                <Button
                  variant={"default"}
                  type="submit"
                  className=""
                  disabled={isLoading}
                  onClick={handleConfirm}
                >
                  {isLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    // "Loading"
                    "Mint"
                  )}
                </Button>
              )}
            </div>
          </section>
        </DetailLayout>
      </div>
    </>
  );
};

export default Page;
