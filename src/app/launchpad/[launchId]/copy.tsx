"use client";
import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import ButtonLg from "@/components/ui/buttonLg";
import { Carousel } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollectionType } from "@/lib/types";
import {
  confirmOrder,
  mintFeeOfCitrea,
  generateBuyHexCitrea,
} from "@/lib/service/postRequest";
import { getSigner, s3ImageUrlBuilder } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
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
import moment from "moment";

const Page = () => {
  const router = useRouter();
  const { authState } = useAuth();
  const params = useParams();
  const id = params.launchId as string;
  const [hash, setHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePhase, setActivePhase] = useState(null);

  const { mutateAsync: createOrderToMintMutation } = useMutation({
    mutationFn: createOrderToMint,
  });

  const { mutateAsync: confirmOrderMutation } = useMutation({
    mutationFn: confirmOrder,
  });

  const { mutateAsync: mintFeeOfCitreaMutation } = useMutation({
    mutationFn: mintFeeOfCitrea,
  });

  const { mutateAsync: generateBuyHexCitreaMutation } = useMutation({
    mutationFn: generateBuyHexCitrea,
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

  // const handleConfirm = async () => {
  //   try {
  //     let txid
  //     if (!authState.address) return toast.error("address not found");
  //     if (currentLayer.layer === "CITREA") {
  //       const mintFeeRes = await mintFeeOfCitrea({
  //         ownerAddress: authState?.address,
  //         collectionAddress: "",
  //         mintFee: "0.001",
  //       });

  //       if (!mintFeeRes.success) {
  //         return toast.error(mintFeeRes.message || "Mint fee failed to send");
  //       }
  //       const { signer } = await getSigner();
  //       const signedTx = await signer?.sendTransaction(
  //         mintFeeRes.data.singleMintTxHex,
  //       );
  //       await signedTx?.wait();
  //       if (signedTx?.hash) txid=signedTx?.hash;
  //     }

  //     const createOrderRes = await createOrderToMintMutation({
  //       collectionId: id,
  //       feeRate: feeRates.fastestFee,
  //       launchOfferType: launchOfferType,
  //      txid

  //     });
  //     if (!createOrderRes ||!createOrderRes.success) {
  //       return toast.error(createOrderRes.data.message || "Mint fee failed to send");
  //     }

  //       const orderId = createOrderRes.data.order.id;
  //       const { singleMintTxHex } = createOrderRes.data;

  //       if (currentLayer.layer === "CITREA") {
  //         const { signer } = await getSigner();
  
  //         console.log(singleMintTxHex);
  //         const signedTx = await signer?.sendTransaction(singleMintTxHex);
  //         await signedTx?.wait();
  //         if (signedTx?.hash) txid=signedTx?.hash;

  //       } else if (currentLayer.layer === "FRACTAL") {
  //         await window.unisat.sendBitcoin(
  //           createOrderRes.data.order.fundingAddress,
  //           createOrderRes.data.order.fundingAmount,
  //         );
  //       }
  //       if (orderId) {
  //         router.push("/launchpad");
  //         await new Promise((resolve) => setTimeout(resolve, 5000));
  //         await confirmOrderMutation({ orderId: orderId, txid: txid });
  //       }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to create order");
  //   }
  // };

  const handlePhaseClick = (phaseType: any) => {
    setActivePhase(phaseType);
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = moment();
      const startTime = moment(collectibles.poStartsAt);
      const endTime = moment(collectibles.poEndsAt);

      if (now.isBefore(startTime)) {
        setStatus("Upcoming");
        return moment.duration(startTime.diff(now));
      } else if (now.isBefore(endTime)) {
        setStatus("Live");
        return moment.duration(endTime.diff(now));
      } else {
        setStatus("Ended");
        return moment.duration(0);
      }
    };

    const updateCountdown = () => {
      const difference = calculateTimeLeft();

      setTimeLeft({
        days: difference.days(),
        hours: difference.hours(),
        minutes: difference.minutes(),
      });

      // Update status based on conditions
      if (moment().isSameOrAfter(collectibles.poStartsAt)) {
        setStatus("Live");
      }
      if (moment().isSameOrAfter(collectibles.poEndsAt)) {
        setStatus("Ended");
      }
      if (moment().isBefore(collectibles.poStartsAt)) {
        setStatus("Upcoming");
      }
      if (!collectibles.poEndsAt) {
        setStatus("Indefinite");
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [collectibles.poStartsAt, collectibles.poEndsAt]);

  const navigateCollection = () => {
    router.push(`/collections`);
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

        // className="bg-white"
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
                  {collectibles?.poMaxMintPerWallet}
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between h-[464px] gap-8">
              <ScrollArea className="flex flex-col">
                {/* <div className="flex flex-col gap-4 w-full">
                  <PhaseCard
                    key={collectibles.id}
                    maxMintPerWallet={collectibles.poMaxMintPerWallet}
                    mintPrice={collectibles.poMintPrice}
                    endsAt={collectibles.poEndsAt}
                    startsAt={collectibles.poStartsAt}
                    isActive={activePhase === "public"}
                    onClick={() => handlePhaseClick("public")}
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
                </div> */}
              </ScrollArea>
              {status === "Ended" ? (
                <ButtonLg
                  type="submit"
                  isSelected={true}
                  className="w-full py-3 text-lg font-semibold bg-brand rounded-xl text-neutral600"
                  disabled={isLoading}
                  onClick={navigateCollection}
                >
                  Go to collection
                </ButtonLg>
              ) : status === "Live" || status === "Indefinite" ? (
                <ButtonLg
                  type="submit"
                  isSelected={true}
                  className="w-full py-3 text-lg font-semibold bg-brand rounded-xl text-neutral600"
                  disabled={isLoading}
                  // onClick={handleConfirm}
                >
                  {isLoading ? "Loading..." : "Mint"}
                </ButtonLg>
              ) : status === "Upcoming" ? (
                ""
              ) : null}
            </div>
          </section>
        </DetailLayout>
      </div>
    </>
  );
};

export default Page;
