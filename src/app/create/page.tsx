"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Image from "next/image";
import Options from "@/components/section/options";
import { Stop, BuyCrypto } from "iconsax-react";
import ButtonLg from "@/components/ui/buttonLg";
import Layout from "@/components/layout/layout";
import SelectColModal from "@/components/modal/select-col-modal";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Define an interface for the data items
interface CreateOption {
  id: number;
  icon: React.ElementType;
  title: string;
  text: string;
  pageUrl: string | null;
  action?: () => void;
}

const Create = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionClick = (id: number) => {
    setSelectedOption((prevSelectedOption) => {
      if (prevSelectedOption === id) {
        setIsLoading(false);
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
        setIsLoading(true);
        if (selectedData.pageUrl) {
          router.push(selectedData.pageUrl);
        } else if (selectedData.action) {
          selectedData.action();
          setIsLoading(false);
        }
      }
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const data: CreateOption[] = [
    {
      id: 4,
      icon: BuyCrypto,
      title: "Collection",
      text: "A group of NFTs, best for brands and projects.",
      pageUrl: null,
      action: toggleModal,
    },
    {
      id: 2,
      icon: Stop,
      title: "Single Collectible",
      text: "Solo NFTs for unique creations and spin offs.",
      pageUrl: "/create/collectible",
      action: undefined,
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
        <div className="w-[592px] mt-12 items-center flex flex-col gap-12">
          <div className="flex flex-col w-[592px] gap-6">
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
          <ButtonLg
            isSelected={selectedOption !== null}
            onClick={handleNav}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? (
              <Loader2
                className="animate-spin w-full"
                color="#111315"
                size={24}
              />
            ) : (
              "Continue"
            )}
          </ButtonLg>
        </div>
      </div>
      <SelectColModal open={showModal} onClose={toggleModal} />
    </Layout>
  );
};

export default Create;
