import Layout from "@/components/layout/layout";
import React from "react";
import Header from "@/components/layout/header";
import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const PrivacyPolicy = () => {
  return (
    <>
      <Layout>
        <section className="mt-[43.5px] grid gap-16">
          <div className="relative h-[156px] sm:h-[216px] w-full rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${"/footer/privacy.webp"})`,
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
                  Privacy Policy
                </h1>
                <p className="font-normal text-sm sm:text-lg text-neutral100">
                  Last updated: January 29, 2025
                </p>
              </div>
            </div>
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-full flex flex-col gap-4 items-center"
          >
            <AccordionItem
              value="introduction"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Introduction
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                Welcome to MintPark (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).  This Privacy Policy
                explains how we collect, use, disclose, and protect your
                information when you use our marketplace and services.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="information-collection"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Information We Collect
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Personal Information:
                    </h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Wallet addresses</li>
                      <li>Transaction history</li>
                      <li>Username</li>
                      <li>IP address</li>
                      <li>Device information</li>
                      <li>Browser data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Automatic Collection:
                    </h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Log data</li>
                      <li>Usage patterns</li>
                      <li>Transaction timestamps</li>
                      <li>Smart contract interactions</li>
                      <li>Network metadata</li>
                      <li>Platform analytics</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Blockchain Data:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Wallet addresses</li>
                      <li>Transaction records</li>
                      <li>Smart contract interactions</li>
                      <li>Token holdings</li>
                      <li>Trading history</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="information-use"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  How We Use Your Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <h3 className="font-semibold mb-2">
                  We use your information to:
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process transactions</li>
                  <li>Provide marketplace services</li>
                  <li>Improve user experience</li>
                  <li>Prevent fraud</li>
                  <li>Meet legal requirements</li>
                  <li>Communicate about services</li>
                  <li>Provide technical support</li>
                  <li>Analyze platform performance</li>
                  <li>Monitor security</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="information-sharing"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Information Sharing
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      We Share Information With:
                    </h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Trusted service providers</li>
                      <li>Legal authorities (when required)</li>
                      <li>Business partners (with your consent)</li>
                      <li>Analytics providers</li>
                      <li>Security services</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">We Never Share:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Private keys</li>
                      <li>Passwords</li>
                      <li>Personal financial data</li>
                      <li>Sensitive personal information</li>
                      <li>Confidential communications</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="data-security"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Data Security
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <h3 className="font-semibold mb-2">
                  We protect your data through:
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Advanced encryption protocols</li>
                  <li>Secure servers</li>
                  <li>Regular security audits</li>
                  <li>Strict access controls</li>
                  <li>Comprehensive employee training</li>
                  <li>Incident response procedures</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="your-rights"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Your Rights
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <h3 className="font-semibold mb-2">You have the right to:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request data deletion</li>
                  <li>Opt out of communications</li>
                  <li>Export your data</li>
                  <li>Restrict data processing</li>
                  <li>File complaints</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="data-retention"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Data Retention
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">We retain your data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>For as long as necessary to provide services</li>
                  <li>As required by applicable laws</li>
                  <li>To prevent fraud</li>
                  <li>For audit purposes</li>
                  <li>To defend legal claims</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="cookies"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Cookies and Tracking
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">We Use:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Essential cookies for platform functionality</li>
                      <li>Analytics cookies to improve services</li>
                      <li>Performance cookies for optimization</li>
                      <li>Functionality cookies for user preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Your Control:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Manage cookie preferences</li>
                      <li>Opt out of tracking</li>
                      <li>Clear stored cookies</li>
                      <li>Use private browsing</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="childrens-privacy"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                Children&apos;s Privacy
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our service is not intended for users under 18</li>
                  <li>We don&apos;t knowingly collect data from minors</li>
                  <li>Parents may request data deletion</li>
                  <li>Age verification is required</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="international"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  International Transfers
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">We may transfer data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Between our affiliated entities</li>
                  <li>To authorized service providers</li>
                  <li>Across different jurisdictions</li>
                  <li>With appropriate security measures</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="updates"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Policy Updates
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <ul className="list-disc pl-6 space-y-2">
                  <li>We may update this policy periodically</li>
                  <li>We will notify you of significant changes</li>
                  <li>Your continued use implies acceptance</li>
                  <li>Previous versions are available upon request</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="third-party"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Third-Party Services
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p className="mb-2">When using third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>External links are not under our control</li>
                  <li>Separate privacy policies may apply</li>
                  <li>Independent payment processors have their own terms</li>
                  <li>Third-party providers maintain their own policies</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="contact"
              className="max-w-[592px] w-full  gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Contact Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 flex flex-col gap-2 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <p>For privacy inquiries:</p>
                <p>
                  Email:{" "}
                  <Link
                    href="mailto:support@mintpark.io"
                    className="text-infoMsg hover:underline"
                  >
                    support@mintpark.io
                  </Link>
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="Legal-Compliance"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Legal Compliance
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                <h3 className="font-semibold mb-2">MintPark complies with:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>GDPR requirements</li>
                  <li>Local privacy regulations</li>
                  <li>Industry standards</li>
                  <li>Data protection laws</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="Your-acceptance"
              className="max-w-[592px] w-full gap-4"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="font-medium text-lg sm:text-xl text-neutral50">
                  Your Acceptance
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral200 font-medium text-md sm:text-lg">
                By using MintPark, you accept this privacy policy and consent to
                the collection and use of information as described above.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </Layout>
    </>
  );
};

export default PrivacyPolicy;
