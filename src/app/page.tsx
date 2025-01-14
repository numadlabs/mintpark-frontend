"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/provider/auth-context-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { serviceData } from "@/lib/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface FormData {
  name: string;
  email: string;
  message: string;
}

//email ajilladag bolgoh. Bolku bol backend deer rate limiter tei endpoint garguulah.
const sendEmail = async (
  formData: FormData,
  formType: "partner" | "launch"
) => {
  try {
    const subject =
      formType === "partner" ? "New Partnership Request" : "New Launch Request";
    const mailtoLink = `mailto:bzao.hover@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default function Home() {
  const { authState } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [partnerFormData, setPartnerFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [launchFormData, setLaunchFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [isPartnerFormValid, setIsPartnerFormValid] = useState(false);
  const [isLaunchFormValid, setIsLaunchFormValid] = useState(false);

  const handleNavigation = () => {
    if (!authState.authenticated) {
      toast.error("Please connect your wallet");
      return;
    }
    router.push("/create");
  };

  const handleCitreaBlog = () => {
    router.push("https://www.blog.citrea.xyz/");
  };

  const validateForm = (formData: FormData): boolean => {
    const { name, email, message } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      message.trim() !== "" &&
      emailRegex.test(email)
    );
  };

  useEffect(() => {
    setIsPartnerFormValid(validateForm(partnerFormData));
  }, [partnerFormData]);

  useEffect(() => {
    setIsLaunchFormValid(validateForm(launchFormData));
  }, [launchFormData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePartnerSubmit = async () => {
    if (isPartnerFormValid) {
      const emailSent = await sendEmail(partnerFormData, "partner");
      if (emailSent) {
        toast.success("Partner request sent successfully!");
        setPartnerFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send request. Please try again.");
      }
    }
  };

  const handleLaunchSubmit = async () => {
    if (isLaunchFormValid) {
      const emailSent = await sendEmail(launchFormData, "launch");
      if (emailSent) {
        toast.success("Launch request sent successfully!");
        setLaunchFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send request. Please try again.");
      }
    }
  };

  return (
<>
    <Layout>
      <Header />
      <section className="w-full flex flex-col gap-[56px] md:gap-[100px] 2xl:gap-[200px] mt-12 md:mt-[100px]">
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center gap-8 md:gap-12">
          <div className="flex flex-col gap-6 md:gap-8 items-center">
            <div className="font-normal text-blueTitle md:text-headText artpast text-white text-center">
              Empower Your{" "}
              <span className="font-normal text-blueTitle md:text-headText artpast text-brand">
                Art{" "}
              </span>
            </div>
            <div className="text-neutral100 font-medium text-center text-sm md:text-lg px-4">
              Turn your creativity into collectibles. Join the revolution of
              digital ownership {!isMobile && <br />} and showcase your unique
              art to the world.
            </div>
          </div>
          <div className="flex flex-row gap-4 md:gap-8 w-full items-center md:justify-center">
            <div className="relative w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full md:w-[200px] h-12 cursor-not-allowed"
                onClick={handleNavigation}
                disabled
              >
                Create
              </Button>
              <div className="absolute -top-3 -right-3 bg-brand text-neutral500 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-neutral500 rounded-full animate-pulse"></span>
                Coming Soon
              </div>
            </div>
            <Link href="/collections" className="w-full md:w-auto">
              <Button variant="primary" className="w-full md:w-[200px] h-12">
                Browse
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative w-full mx-auto">
          <div className="relative z-10 w-full">
            {/* Blurred background banner */}
            {/* <div className="w-full relative h-60 md:h-[360px] 3xl:h-[540px] blur-[35px] sm:blur-[45px] md:blur-[55px] rounded-[32px] opacity-35 scale-110 overflow-hidden">
              <Image
                src="/homePage/homeBanner.png"
                alt="banner"
                width={0}
                height={0}
                sizes="100%"
                className="object-cover rounded-[32px] w-full h-full"
              />
            </div> */}

            {/* Main banner image */}
            <div className="inset-0 z-50 w-full h-full">
              <Image
                src="/homePage/homeBanner.png"
                alt="banner"
                width={0}
                height={0}
                sizes="100%"
                className="object-cover rounded-[32px] w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="w-full flex flex-col gap-16 justify-center items-center">
          <h2 className="font-bold text-center text-neutral00 text-3xl md:text-5xl">
            Our service
          </h2>
          <ScrollArea className="w-full max-w-[1216px]">
            <div className="flex flex-row lg:grid lg:grid-cols-3 items-center gap-4 sm:gap-8">
              {serviceData.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-[32px] border-white4 flex flex-col min-w-[327px] lg:min-w-0"
                >
                  <Image
                    src={`/homePage/${item.image}.png`}
                    alt={item.title}
                    width={384}
                    height={228}
                    className="object-cover w-full"
                  />
                  <div className="p-8 flex flex-col gap-4">
                    <p className="text-center text-lg 2xl:text-2xl text-neutral00 font-bold">
                      {item.title}
                    </p>
                    <p className="text-center text-md font-medium text-neutral100">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="mt-4" />
          </ScrollArea>
        </div>

        {/* Contact Forms Section */}
        <div className="w-full items-center justify-center flex">
          <div className="bg-[url('/homePage/contactBg.png')] items-center max-w-[1216px] w-full bg-cover min-h-[480px] p-6 pt-12 pb-8 md:px-12 md:pb-12 flex flex-col md:flex-row justify-between rounded-[32px] border border-white4 border-b-0 gap-8">
            <div className="flex flex-col gap-2 sm:gap-6 w-full md:w-auto">
              <span className="font-bold text-xl sm:text-3xl md:text-5xl flex flex-row sm:flex-col gap-1.5">
                Let&apos;s Build <br />
                <div className="flex flex-row gap-1.5">
                  <span className="text-brand">Success</span> Together
                </div>
              </span>
              <p className="text-neutral100 font-medium text-sm sm:text-lg">
                Have a project in mind? Drop us a message, and let&apos;s
                explore the possibilities.
              </p>
            </div>

            <Tabs
              defaultValue="account"
              className="w-full md:w-[480px] flex flex-col gap-6 md:gap-10 border-hidden"
            >
              <TabsList className="grid w-full grid-cols-2 p-1 border border-white8 rounded-[40px] bg-white8">
                <TabsTrigger
                  value="account"
                  className="text-sm md:text-md2 rounded-3xl border border-transparent"
                >
                  Partner with Us
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="text-sm md:text-md2 border rounded-3xl border-transparent"
                >
                  Launch with Us
                </TabsTrigger>
              </TabsList>

              {/* Form Content - Same for both tabs */}
              {["account", "password"].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue}>
                  <Card className="border-hidden flex flex-col gap-4">
                    <CardContent className="flex flex-col gap-4 p-0">
                      <Input
                        id="name"
                        placeholder="Your company name"
                        value={
                          tabValue === "account"
                            ? partnerFormData.name
                            : launchFormData.name
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            tabValue === "account"
                              ? setPartnerFormData
                              : setLaunchFormData
                          )
                        }
                        className="bg-white8 h-12"
                      />
                      <Input
                        id="email"
                        placeholder="Email"
                        value={
                          tabValue === "account"
                            ? partnerFormData.email
                            : launchFormData.email
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            tabValue === "account"
                              ? setPartnerFormData
                              : setLaunchFormData
                          )
                        }
                        className="bg-white8 h-12"
                      />
                      <Input
                        id="message"
                        placeholder="Message"
                        value={
                          tabValue === "account"
                            ? partnerFormData.message
                            : launchFormData.message
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            tabValue === "account"
                              ? setPartnerFormData
                              : setLaunchFormData
                          )
                        }
                        className="bg-white8 h-[88px] pb-10"
                      />
                    </CardContent>
                    <CardFooter className="p-0">
                      <Button
                        variant="primary"
                        className="w-full"
                        disabled={
                          tabValue === "account"
                            ? !isPartnerFormValid
                            : !isLaunchFormValid
                        }
                        onClick={
                          tabValue === "account"
                            ? handlePartnerSubmit
                            : handleLaunchSubmit
                        }
                      >
                        Send
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="flex flex-col items-center gap-8 md:gap-12 w-full">
          <h4 className="font-bold text-center text-neutral00 text-xl sm:text-3xl md:text-5xl px-4">
            Frequently Asked Questions
          </h4>
          <div className="w-full max-w-[800px] px-4">
            <Accordion
              type="single"
              collapsible
              className="flex flex-col gap-4 md:gap-6"
            >
              {[
                {
                  question:
                    "What is the Creator Program, and how does it work?",
                  answer:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi volutpat convallis velit at bibendum.",
                },
                {
                  question:
                    "What is a cross-chain marketplace, and why does it matter?",
                  answer:
                    "A Bitcoin cross-chain marketplace enables seamless trading of digital assets across different Bitcoin Layer 2 networks.",
                },
                {
                  question: "What wallets and payment methods are supported?",
                  answer:
                    "We support industry-standard EVM wallets like MetaMask and WalletConnect.",
                },
                {
                  question: 'What is "Collectible as a Service" (CaaS)?',
                  answer:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi volutpat convallis velit at bibendum.",
                },
              ].map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index + 1}`}
                  className="border border-b-neutral500 py-3"
                >
                  <AccordionTrigger className="text-neutral00 text-start font-medium text-md md:text-xl px-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral100 font-normal text-md md:text-lg px-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* About Section */}
        <div className="flex flex-col items-center w-full gap-8 md:gap-16 mb-12">
          <div className="relative w-full max-w-[320px] aspect-square">
            <div className="relative z-10 w-full h-full blur-[45px] md:blur-[90px] opacity-35">
              <Image
                src="/homePage/citreaMeme.png"
                alt="citrea"
                layout="fill"
                objectFit="cover"
                className="rounded-[32px]"
              />
            </div>
            <div className="absolute inset-0 z-50">
              <Image
                src="/homePage/citreaMeme.png"
                alt="citrea"
                layout="fill"
                objectFit="cover"
                className="rounded-[32px]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 md:gap-12 px-4">
            <div className="text-center grid gap-4 md:gap-6">
              <h3 className="font-bold text-2xl md:text-3xl text-neutral00">
                Learn More About Citrea and Our Vision
              </h3>
              <p className="font-medium text-sm md:text-lg text-neutral100">
                Explore who we are, what we stand for, and how we&apos;re
                shaping the future.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleCitreaBlog}
              className="w-full md:w-auto"
            >
              Read about Citrea
            </Button>
          </div>
        </div>
      </section>
    </Layout>
</>
  );
}
