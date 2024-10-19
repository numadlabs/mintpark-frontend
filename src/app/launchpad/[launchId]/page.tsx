"use client";
import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import ButtonLg from "@/components/ui/buttonLg";
import { Carousel } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { collection } from "@/lib/constants";
// import {
//   fetcCollectionByCollectionId,
//   fetchLaunchById,
// } from "@/lib/service/fetcher";
import { CollectionType } from "@/lib/types";
import { generateHex } from "@/lib/service/postRequest";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetcCollectionByCollectionId } from "@/lib/service/queryHelper";
import PhaseCard from "@/components/atom/cards/phaseCard";

export default function Page({ params }: { params: { launchId: string } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCollectible, setCurrentCollectible] =
    useState<null | CollectionType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [active, setActive] = useState(false);
  // console.log(current);

  const {
    // isLoading,
    isError,
    isFetching,
    data: collection,
    error,
  } = useQuery({
    queryKey: ["collection", params.launchId],
    queryFn: () => {
      // if (typeof slug === "string") {
      return fetchLaunchById(params.launchId);
      // }
    },
    enabled: !!params.launchId,
  });

  // console.log("colDetail", collection);

  const { isLoading: isCollectibleLoading, data: collectibles } = useQuery({
    queryKey: ["collectiblesByCollections", params.launchId],
    queryFn: () => {
      // if (typeof slug === "string") {
      return fetcCollectionByCollectionId(params.launchId);
      // }
    },
    enabled: !!params.launchId,
  });
  console.log("colDetail", collectibles);

  useEffect(() => {
    if (collectibles && collectibles?.length !== 0) {
      setCurrentCollectible(collectibles[currentIndex]);
    }
  }, [currentIndex, collectibles]);

  const triggerMint = async () => {
    setIsLoading(true);
    try {
      const data = await generateHex(params.launchId);
      if (data && data.success) {
        toast.success("Successfully minted, please check your address.");
      } else {
        toast.error(data.error);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("We faced error on minting");
      setIsLoading(false);
    }
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
                  value={3}
                  className="bg-brand shadow-shadowBrands h-full w-[100]"
                />
              </div>
              <div className="flex justify-between py-1 text-neutral100">
                <span>Total minted</span>
                <h2>
                  <span className="text-neutral50">
                    {collectibles?.mintedCount}
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
                  {collectibles?.totalCount}
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between h-[464px] gap-8">
              <ScrollArea className="flex flex-col">
                <div className="flex flex-col gap-4">
                  <PhaseCard />
                </div>
              </ScrollArea>
              <ButtonLg
                type="submit"
                isSelected={true}
                className="w-full py-3 text-lg font-semibold bg-brand rounded-xl text-neutral600"
                onClick={() => triggerMint()}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Mint"}
              </ButtonLg>
            </div>
          </section>
        </DetailLayout>
      </div>
    </>
  );
}
function fetchLaunchById(launchId: string): any {
  throw new Error("Function not implemented.");
}
