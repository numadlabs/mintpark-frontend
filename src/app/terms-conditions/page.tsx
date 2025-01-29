import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mintpark Marketplace Terms and Conditions",
};

const TermsConditions = () => {
  return (
    <>
      <Layout>
        <Header />
        <section className="mt-[43.5px] grid gap-16">
          <div className="relative h-[156px] sm:h-[216px] w-full rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${"/footer/terms.webp"})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div
              className="absolute inset-0 bg-neutral500 bg-opacity-[70%] z-30"
              style={{
                backdropFilter: "blur(50px)",
              }}
            />
            <div className="relative w-full h-full flex flex-col justify-center gap-12 z-30">
              <div className="flex flex-col items-center justify-center pt-8 pb-8 gap-4 sm:gap-6">
                <h1 className="font-bold text-2xl sm:text-logoSize text-neutral50">
                  Terms and Conditions
                </h1>
                <p className="font-normal text-sm sm:text-lg text-neutral100">
                  Last updated: Jan 28, 2025
                </p>
              </div>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full flex flex-col gap-4 items-center"
          >
            <AccordionItem value="acceptance" className="max-w-[592px] w-full gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Acceptance of Terms
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                By accessing or using our NFT marketplace, you agree to be bound
                by these Terms and Conditions. If you disagree with any part of
                these terms, you may not access our services.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eligibility" className="max-w-[592px] w-full gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                 User Eligibility
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Must be 18 years or older</li>
                  <li>Must have a compatible crypto wallet</li>
                  <li>Must comply with local regulations</li>
                  <li>Must maintain account security</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="nft-listings" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  NFT Listings
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Listing Requirements
                    </h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>You must own or have rights to list NFTs</li>
                      <li>Content must not violate copyright laws</li>
                      <li>Must comply with community guidelines</li>
                      <li>Accurate description required</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Prohibited Content
                    </h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Illegal or fraudulent items</li>
                      <li>Copyrighted material without rights</li>
                      <li>Hate speech or explicit content</li>
                      <li>Malicious smart contracts</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trading" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                Trading Rules
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Transactions</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>All sales are final</li>
                      <li>
                        Payment in specified cryptocurrencies only (cBTC, BTC,
                        etc.)
                      </li>
                      <li>Gas fees paid by users</li>
                      <li>Price displayed in cBTC/USD, BTC equivalent</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Fees</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Platform fee: 2%</li>
                      <li>Gas fees: Network dependent</li>
                      <li>Additional service fees as applicable</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="responsibilities"
              className="max-w-[592px] w-full  gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                User Responsibilities
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain wallet security</li>
                  <li>Verify all transactions</li>
                  <li>Report suspicious activity</li>
                  <li>Keep account information current</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="platform-rights"
              className="max-w-[592px] w-full  gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                   Platform Rights
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">We reserve the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remove inappropriate content</li>
                  <li>Suspend suspicious accounts</li>
                  <li>Modify service features</li>
                  <li>Update fee structure</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="intellectual-property"
              className="max-w-[592px] w-full  gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                 Intellectual Property
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <div>
                  <h3 className="font-semibold mb-2"> NFT Rights</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Buyers receive token ownership</li>
                    <li>Original creator retains IP rights</li>
                    <li>Limited usage rights granted</li>
                    <li>No commercial rights unless specified</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="risk-disclosure"
              className="max-w-[592px] w-full  gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Risk Disclosure
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">Users acknowledge:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cryptocurrency price volatility</li>
                  <li>Smart contract risks</li>
                  <li>Network security risks</li>
                  <li>Market volatility</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                 Privacy & Data
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">We collect and protect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wallet addresses</li>
                  <li>Transaction history</li>
                  <li>Usage data</li>
                  <li>Communication records</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="liability" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Liability Limitations
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">The platform is not liable for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Network failures</li>
                  <li>Wallet compatibility issues</li>
                  <li>Third-party actions</li>
                  <li>Market fluctuations</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="disputes" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Dispute Resolution
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Users agree to arbitration</li>
                  <li>30-day resolution window</li>
                  <li>Platform mediates disputes</li>
                  <li>Final decision binding</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="modifications"
              className="max-w-[592px] w-full  gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Modifications
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">We may modify these terms:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With 30 days notice</li>
                  <li>Through platform announcements</li>
                  <li>Via email notification</li>
                  <li>Effect on new transactions only</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="termination" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Termination
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">We may terminate accounts for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Terms violation</li>
                  <li>Suspicious activity</li>
                  <li>Legal requirements</li>
                  <li>Platform security</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="contact" className="max-w-[592px] w-full  gap-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Contact Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p>
                  For support:{" "}
                  <a
                    href="mailto:support@mintpark.io"
                    className="text-neutral200 hover:underline"
                  >
                    support@mintpark.io
                  </a>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </Layout>
    </>
  );
};

export default TermsConditions;
