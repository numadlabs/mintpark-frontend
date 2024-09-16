"use client";
import DetailLayout from "@/components/layout/detailLayout";
import Header from "@/components/layout/header";
import ButtonLg from "@/components/ui/buttonLg";
import { Carousel } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { collection } from "@/lib/constants";
import {
  fetcCollectionByCollectionId,
  fetchLaunchById,
} from "@/lib/service/fetcher";
import { CollectibleType } from "@/lib/types";
import { generateHex } from "@/lib/service/postRequest";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page({ params }: { params: { launchId: string } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCollectible, setCurrentCollectible] =
    useState<null | CollectibleType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [active, setActive] = useState(false);
  // console.log(current);

  const {
    // isLoading,
    isError,
    isFetching,
    data: collectionDetail,
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

  const { isLoading: isCollectibleLoading, data: collectibles } = useQuery({
    queryKey: ["collectiblesByCollections", params.launchId],
    queryFn: () => {
      // if (typeof slug === "string") {
      return fetcCollectionByCollectionId(params.launchId);
      // }
    },
    enabled: !!params.launchId,
  });

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
            collectionDetail
              ? collectionDetail?.logoKey
              : "/launchpads/bg_1.jpg",
          )})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}

        // className="bg-background"
      >
        <DetailLayout>
          <Header />
          <section className="grid grid-cols-3 gap-8 h-[464px] mt-24">
            <div className="">
              <h1 className="pt-10 text-4xl font-bold capitalize pb-7 text-neutral50">
                {collectionDetail?.name}
              </h1>
              <span className="">
                <p className="h-1 w-[120px] rounded bg-brand shadow-shadowBrands"></p>
              </span>
              <p className="font-normal text-lg2 pt-7 text-neutral100">
                {collectionDetail?.description}
              </p>
              <div className="flex gap-6 pt-8">
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
                <Image
                  width={384}
                  height={384}
                  // src={item.image}
                  // src={`/launchpads/launch_${item.id}.png`}
                  src={s3ImageUrlBuilder(collectionDetail?.logoKey)}
                  className="aspect-square rounded-3xl bg-no-repeat"
                  alt="png"
                />

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
                    {collectionDetail?.mintedCount}
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
                  {collectionDetail?.totalCount}
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between h-[464px] gap-8">
              <ScrollArea className="flex flex-col">
                <div className="flex flex-col justify-between">
                  <div
                    onClick={() => setActive(true)}
                    className={`flex flex-col justify-between border  rounded-3xl p-5  gap-4 ${
                      active ? "border-brand" : "border-neutral400"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-brand border bg-neutral400 bg-opacity-[30%] border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3">
                        Public
                      </span>
                      <p className="border bg-neutral400  bg-opacity-[30%] border-transparent text-md rounded-lg pt-2 pr-3 pb-2 pl-3 text-neutral50">
                        <span className="text-neutral-100">Ends in:</span> 7d
                        11h 31m
                      </p>
                    </div>
                    <div className="flex">
                      <Image
                        width={24}
                        height={24}
                        src="/detail_icon/Bitcoin.png"
                        alt="png"
                        className="aspect-square"
                      />
                      {collectionDetail?.price && (
                        <p className="pl-2 text-neutral50">
                          <span className="mr-1">
                            {collectionDetail?.price / 10 ** 8}
                          </span>
                          BTC
                        </p>
                      )}
                    </div>
                    <div className="text-md">
                      <div className="flex justify-between">
                        <h1 className="text-neutral100">Max:</h1>
                        <h2 className="text-neutral50">
                          <span>3</span> per wallet
                        </h2>
                      </div>
                    </div>
                  </div>
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
