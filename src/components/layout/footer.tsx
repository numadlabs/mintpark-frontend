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

  return (
    <div className="h-314px pt-16 pr-48 pl-28 pb-16 mt-40 flex justify-between bg-background relative border-t border-t-neutral500">
      <div className="flex flex-col justify-between h-[186px]">
        <TextLogo />
        <p className="font-medium text-md text-neutral200">
          ©2024 Mint Park. All rights reserved.
        </p>
      </div>
      <div className="flex flex-col gap-7">
        <h1 className="font-medium text-lg text-neutral50 hover:text-neutral00 cursor-pointer">
          marketplace
        </h1>
        <p className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer">
          Create
        </p>
        <p className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer">
          Collections
        </p>
        <p className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer">
          Launchpad
        </p>
      </div>
      <div className="flex flex-col gap-7">
        <h1 className="font-medium text-lg text-neutral50">Social Links</h1>
        <p className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer">
          Twitter
        </p>
      </div>
      <div className="flex flex-col gap-7 hover:text-neutral00">
        <h1 className="font-medium text-lg text-neutral50 hover:text-neutral00 cursor-pointer">
          Legal
        </h1>
        <p
          onClick={handleTermsClick}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer"
        >
          Terms and Conditions
        </p>
        <p
          onClick={handlePrivacyClick}
          className="font-medium text-md text-neutral200 hover:text-neutral00 cursor-pointer"
        >
          Privacy Policy
        </p>
      </div>
    </div>
  );
}