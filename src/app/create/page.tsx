"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Image from "next/image";
import Options from "@/components/section/options";
import { Gallery, Stop, BuyCrypto } from "iconsax-react";
import ButtonLg from "@/components/ui/buttonLg";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

const Create = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionClick = (id: number) => {
    setSelectedOption((prevSelectedOption) => {
      if (prevSelectedOption === id) {
        return null;
      } else {
        return id;
      }
    });
  };

  const handleNav = () => {
    if (selectedOption !== null) {
      const selectedData = data.find((item) => item.id === selectedOption);
      if (selectedData) {
        router.push(selectedData.pageUrl);
      }
    }
  };

  const data = [
    // {
    //   id: 1,
    //   icon: Gallery,
    //   title: "Collection",
    //   text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    //   pageUrl: "/create/collection",
    // },
    {
      id: 4,
      icon: BuyCrypto,
      title: "Collection",
      text: "A group of NFTs, best for brands and projects.",
      pageUrl: "/create/launchPad",
    },
    {
      id: 2,
      icon: Stop,
      title: "Single Collectible",
      text: "Solo NFTs for unique creations and spin offs.",
      pageUrl: "/create/collectible",
    },
    {
      id: 3,
      icon: BuyCrypto,
      title: "Token",
      text: "Fungible assets for in-app currency or governance.",
      pageUrl: "/create/token",
    },
  ];

  return (
    <Layout>
      <div className="flex h-full w-full flex-col justify-start items-center pb-[148px]">
        <Header />
        <div className="flex flex-col items-center w-full gap-12 mt-[42.5px] z-50">
          <div className="relative w-full h-40 flex justify-center max-w-[1216px]">
            <Image
              src={"/background.png"}
              alt="background"
              width={0}
              height={160}
              sizes="100%"
              className="object-cover w-full h-full rounded-3xl"
            />
            <div className="absolute top-0 flex flex-col items-center justify-center w-full h-full gap-6 bg-bannerBlack rounded-3xl backdrop-blur-3xl">
              <p className="text-4xl font-bold text-neutral50">
              What do you want to create?
              </p>
              <p className="text-xl text-neutral-100">
                Choose one to continue.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-[592px] mt-12 items-center flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            {data.map((item) => (
              <Options
                key={item.id}
                id={item.id}
                title={item.title}
                text={item.text}
                icon={item.icon}
                isSelected={selectedOption === item.id}
                onClick={() => handleOptionClick(item.id)}
              />
            ))}
          </div>
          <ButtonLg isSelected={selectedOption !== null} onClick={handleNav}>
            Continue
          </ButtonLg>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
