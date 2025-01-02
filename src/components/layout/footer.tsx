"use client";
import React from "react";
import TextLogo from "../icon/textLogo";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const handleTermsClick = () => router.push("/terms-conditions");
  const handlePrivacyClick = () => router.push("/privacy-policy");
  const handleTwitter = () => router.push("https://x.com/mintpark_io");
  const handleLogoClick = () => router.push("/");
  const handleCreate = () => router.push("/create");
  const handleLaunchapd = () => router.push("/launchpad");
  const handleCollections = () => router.push("/collections");

  return (
    <footer className="w-full max-w-[19200px] mt-40 bg-background border-t border-t-neutral500">
      <div className="max-w-[1920px] mx-auto  px-4 sm:px-[112px] 3xl:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Logo and Copyright Section */}
          <div className="flex flex-col justify-between">
            <div className="cursor-pointer" onClick={handleLogoClick}>
              <TextLogo />
            </div>
            <p className="font-medium text-md text-neutral200 mt-4 lg:mt-0">
              ©2024 Mint Park. All rights reserved.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-3  grid-cols-1 gap-8">
            {/* Marketplace Section */}
            <div className="space-y-7">
              <h1 className="font-medium text-lg text-neutral50">
                Marketplace
              </h1>
              <div className="flex flex-col gap-6">
                <button
                  className="hidden md:block font-medium text-md text-neutral200 text-left transition-all duration-300 ease-out cursor-not-allowed"
                  disabled
                >
                  Create
                </button>
                <button
                  onClick={handleCollections}
                  className="font-medium text-md text-neutral200 hover:text-neutral00 text-left transition-all duration-300 ease-out"
                >
                  Collections
                </button>
                <button
                  onClick={handleLaunchapd}
                  className="font-medium text-md text-neutral200 hover:text-neutral00 text-left transition-all duration-300 ease-out"
                >
                  Launchpad
                </button>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-7">
              <h1 className="font-medium text-lg text-neutral50">
                Social Links
              </h1>
              <div className="flex flex-col gap-6">
                <button
                  onClick={handleTwitter}
                  className="font-medium text-md text-neutral200 hover:text-neutral00 text-left transition-all duration-300 ease-out"
                >
                  Twitter
                </button>
              </div>
            </div>

            {/* Legal Section */}
            <div className="space-y-7">
              <h1 className="font-medium text-lg text-neutral50">Legal</h1>
              <div className="flex flex-col gap-6">
                <button
                  onClick={handleTermsClick}
                  className="font-medium text-md text-neutral200 hover:text-neutral00 text-left transition-all duration-300 ease-out"
                >
                  Terms and Conditions
                </button>
                <button
                  onClick={handlePrivacyClick}
                  className="font-medium text-md text-neutral200 hover:text-neutral00 text-left transition-all duration-300 ease-out"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
