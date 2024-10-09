import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function page() {
  return (
    <>
      <Layout>
        <Header />
        <div className="flex justify-between pt-16 relative z-50">
          <div>
            {" "}
            <Image
              width={560}
              height={560}
              src={"/launchpads/launch_2.png"}
              className="aspect-square rounded-xl"
              alt="png"
            />
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              {" "}
              <p className="font-medium text-xl text-neutral200">Abstracto</p>
              <span className="flex text-3xl font-bold text-neutral50">
                Abstracto #<h1>130</h1>
              </span>
            </div>
            <div className="w-[592px] h-[1px] bg-neutral500" />
            <div className="flex justify-between items-center">
              <div className="flex gap-3  w-[204px]">
                <span className="font-bold text-neutral50 text-profileTitle">
                  <h1>0.04 BTC</h1>
                </span>
                <span className="font-medium pt-3 text-end text-lg2 text-neutral200">
                  <p>$2307.65</p>
                </span>
              </div>
              <div className="">
                <Button variant={"default"} className="w-60 h-12">
                  Buy now
                </Button>
              </div>
            </div>
            <div className="w-[592px] h-[1px] bg-neutral500" />
            <div className="flex flex-col gap-6">
              <h1 className="font-medium text-lg2 text-neutral50">Attribute</h1>
              <div className="grid grid-cols-3 gap-2">
                <div className="w-[192px] rounded-xl grid gap-2 border border-neutral500 pt-3 pb-4 pl-4 pr-4">
                  <p className="font-medium text-sm text-neutral200">
                    Background
                  </p>
                  <h1 className="font font-medium text-md text-neutral50">
                    Black
                  </h1>
                </div>
              </div>
            </div>
            <div className="w-[592px] h-[1px] bg-neutral500" />
            <div>
              <Accordion type="single" collapsible className="w-[592px]">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    Detail
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-6">
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Owned by
                      </h1>
                      <p className="font-medium text-md text-neutral50">
                        bc1p...6942
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Floor difference
                      </h1>
                      <p className="font-medium text-md text-success">120%</p>
                    </div>
                    <div className="flex justify-between">
                      <h1 className="font-medium text-md text-neutral200">
                        Owned by
                      </h1>
                      <p className="font-medium text-md text-neutral50">
                        bc1p...6942
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    About Abstracto
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-neutral200 font-medium text-md">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Proin ac ornare nisi. Aliquam eget semper risus, sed
                      commodo elit. Curabitur sed congue magna. Donec ultrices
                      dui nec ullamcorper aliquet. Nunc efficitur mauris id mi
                      venenatis imperdiet. Integer mauris lectus, pretium eu
                      nibh molestie, rutrum lobortis tortor. Duis sit amet sem
                      fermentum, consequat est nec, ultricies justo.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-medium text-xl text-neutral50">
                    Activity
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Yes. It&apos;s animated by default, but you can disable it
                    if you prefer. */}
                    <div className="flex flex-col gap-4">
                      <div className="w-[592px] h-[110px] border border-neutral500 flex justify-between items-center gap-4 rounded-2xl pt-4 pr-4 pb-5 pl-4">
                        <div className="flex flex-col gap-5">
                          <span className="flex justify-center rounded-lg gap-2 bg-gray50 pt-2 pr-3 pb-2 pl-3">
                            <Image
                              width={16}
                              height={16}
                              src={"/collections/tag.png"}
                              className="aspect-square rounded-xl"
                              alt="png"
                            />
                            <p className="text-neutral50 font-medium text-md">
                              Listed
                            </p>
                          </span>
                          <span className="flex items-center gap-2">
                            <p className="text-neutral50 font-medium text-lg2">
                              0.003 BTC
                            </p>{" "}
                            <p className="text-neutral200 text-md items-center font-medium">
                              $12.87
                            </p>
                          </span>
                        </div>
                        <div className="flex flex-col gap-5">
                          <span className="flex flex-col">
                            <span className="text-neutral200 text-md font-medium">
                              4 days ago
                            </span>
                          </span>
                          <span className="text-neutral50 font-medium text-md">
                            bc1a...5sd6
                          </span>
                        </div>
                      </div>
                      <div className="w-[592px] h-[110px] border border-neutral500 flex justify-between items-center gap-4 rounded-2xl pt-4 pr-4 pb-5 pl-4">
                        <div className="flex flex-col gap-5">
                          <span className="flex justify-center rounded-lg gap-2 bg-gray50 pt-2 pr-3 pb-2 pl-3">
                            <Image
                              width={16}
                              height={16}
                              src={"/collections/cube.png"}
                              className="aspect-square rounded-xl"
                              alt="png"
                            />
                            <p className="text-neutral50 font-medium text-md">
                              Inscribed
                            </p>
                          </span>
                          <span className="flex items-center gap-2">
                            <p className="text-neutral50 font-medium text-lg2">
                              0.003 BTC
                            </p>{" "}
                            <p className="text-neutral200 text-md items-center font-medium">
                              $12.87
                            </p>
                          </span>
                        </div>
                        <div className="flex flex-col gap-5">
                          <span className="flex flex-col">
                            <span className="text-neutral200 text-md font-medium">
                              4 days ago
                            </span>
                          </span>
                          <span className="text-neutral50 font-medium text-md">
                            bc1a...5sd6
                          </span>
                        </div>
                      </div>
                      <div className="w-[592px] h-[110px] border border-neutral500 flex justify-between items-center gap-4 rounded-2xl pt-4 pr-4 pb-5 pl-4">
                        <div className="flex flex-col gap-5">
                          <span className="flex justify-center rounded-lg gap-2 bg-gray50 pt-2 pr-3 pb-2 pl-3">
                            <Image
                              width={16}
                              height={16}
                              src={"/collections/check.png"}
                              className="aspect-square rounded-xl"
                              alt="png"
                            />
                            <p className="text-neutral50 font-medium text-md">
                              Purchased
                            </p>
                          </span>
                          <span className="flex items-center gap-2">
                            <p className="text-neutral50 font-medium text-lg2">
                              0.003 BTC
                            </p>{" "}
                            <p className="text-neutral200 text-md items-center font-medium">
                              $12.87
                            </p>
                          </span>
                        </div>
                        <div className="flex flex-col gap-5">
                          <span className="flex flex-col">
                            <span className="text-neutral200 text-right text-md font-medium">
                              4 days ago
                            </span>
                          </span>
                          <span className="flex gap-2 text-neutral50 font-medium text-md">
                            <p> bc1a...5sd6</p>
                            <Image
                              width={16}
                              height={16}
                              src={"/collections/arrowR.png"}
                              className="aspect-square rounded-xl"
                              alt="png"
                            />
                            <p> bc1a...5sd6</p>
                          </span>
                        </div>
                      </div>
                      <div className="w-[592px] h-[110px] border border-neutral500 flex justify-between items-center gap-4 rounded-2xl pt-4 pr-4 pb-5 pl-4">
                        <div className="flex flex-col gap-5">
                          <span className="flex justify-center rounded-lg gap-2 bg-gray50 pt-2 pr-3 pb-2 pl-3">
                            <Image
                              width={16}
                              height={16}
                              src={"/collections/transaction.png"}
                              className="aspect-square rounded-xl"
                              alt="png"
                            />
                            <p className="text-neutral50 font-medium text-md">
                              Transfared
                            </p>
                          </span>
                          <span className="flex items-center gap-2">
                            <p className="text-neutral50 font-medium text-lg2">
                              0.003 BTC
                            </p>{" "}
                            <p className="text-neutral200 text-md items-center font-medium">
                              $12.87
                            </p>
                          </span>
                        </div>
                        <div className="flex flex-col gap-5">
                          <span className="flex flex-col">
                            <span className="text-neutral200 text-end text-md font-medium">
                              4 days ago
                            </span>
                          </span>
                          <span className="text-neutral50 font-medium text-md">
                            <span className="flex gap-2 text-neutral50 font-medium text-md">
                              <p> bc1a...5sd6</p>
                              <Image
                                width={16}
                                height={16}
                                src={"/collections/arrowR.png"}
                                className="aspect-square rounded-xl"
                                alt="png"
                              />
                              <p> bc1a...5sd6</p>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
