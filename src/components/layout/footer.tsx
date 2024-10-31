"use client";
import React from "react";
import TextLogo from "../icon/textLogo";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const handleTermsClick = () => {
    router.push("/terms-conditions");
  };

  const handlePrivacyClick = () => {
    router.push("/privacy-policy");
  };
  const handleTwitter = () => {
    router.push("/");
  };
  const handleLogoClick = () => {
    router.push("/");
  };

  const handleCreate = () => {
    router.push("/create");
  };
  const handleLaunchapd = () => {
    router.push("/launchpad");
  };
  const handleCollections = () => {
    router.push("/collections");
  };

  return (
    <div className="h-314px pt-16 pr-48 pl-28 pb-16 mt-40 flex justify-between bg-background relative border-t border-t-neutral500">
      <div className="flex flex-col justify-between h-[186px]">
        <div className="cursor-pointer" onClick={handleLogoClick}>
          <TextLogo />
        </div>{" "}
        <p className="font-medium text-md text-neutral200">
          ©2024 Mint Park. All rights reserved.
        </p>
      </div>
      <div className="flex flex-col gap-7">
        <h1 className="font-medium text-lg text-neutral50">Marketplace</h1>
        <p
          onClick={handleCreate}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer transition-all duration-300 ease-out"
        >
          Create
        </p>
        <p
          onClick={handleCollections}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer transition-all duration-300 ease-out"
        >
          Collections
        </p>
        <p
          onClick={handleLaunchapd}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer transition-all duration-300 ease-out"
        >
          Launchpad
        </p>
      </div>
      <div className="flex flex-col gap-7">
        <h1 className="font-medium text-lg text-neutral50">Social Links</h1>
        <p
          onClick={handleTwitter}
          className="font-medium text-md text-neutral200 hover:text-neutral00 transition-all duration-300 ease-out cursor-pointer"
        >
          Twitter
        </p>
      </div>
      <div className="flex flex-col gap-7 hover:text-neutral00">
        <h1 className="font-medium text-lg text-neutral50">Legal</h1>
        <p
          onClick={handleTermsClick}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer transition-all duration-300 ease-out"
        >
          Terms and Conditions
        </p>
        <p
          onClick={handlePrivacyClick}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer transition-all duration-300 ease-out"
        >
          Privacy Policy
        </p>
      </div>
    </div>
  );
}
