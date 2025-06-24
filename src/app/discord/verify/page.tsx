import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";

export default function page() {
  return (
    <>
      <Layout>
        <div className="h-auto w-full  flex items-center justify-center pt-[264px] pb-[356px]">
          <div className="w-[600px] h-auto bg-neutral500 border border-neutral400 rounded-[32px] p-10 flex flex-col items-center gap-8">
            <h1 className="text-neutral00 font-bold text-2xl">
              Verfiy your NFT
            </h1>
            <p className="text-neutral100 text-lg font-normal text-center">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              eget efficitur turpis. Vivamus lorem libero, iaculis tincidunt
              mattis eget, mattis eget justo. Sed semper tristique ipsum, ut
              sollicitudin massa euismod fermentum.{" "}
            </p>
            <Button
              variant="secondary"
              className="w-full md:w-[336px] h-16 cursor-pointer flex gap-4"
            >
              <Image
                src="/wallets/Metamask.png"
                alt="Metmask"
                width={40}
                height={40}
              />
              <p className="text-neutral50 font-bold text-lg">Metamask Wallet</p>
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
