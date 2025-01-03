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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

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
    <Layout>
      <Header />
      <section className="w-full overflow-x-hidden flex flex-col gap-[56px] md:gap-[100px] 2xl:gap-[200px] mt-12 md:mt-[100px]">
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

        {/* Banner Images */}
        {/* <div className="relative z-10 h-[180px] md:h-[360px] blur-[35px] md:blur-[55px] rounded-[32px] opacity-35 scale-110overflow-x-hidden">
          <Image
            src={"/homePage/homeBanner.png"}
            alt="banner"
            width={1216}
            height={360}
            className="relative z-50"
          />
        </div>
        <Image
          src={"/homePage/homeBanner.png"}
          alt="banner"
          width={1216}
          height={360}
          className="absolute z-50 top-[475px] sm:top-[568px]"
        /> */}

        <div className="relative w-full mx-auto">
          <div className="relative z-10">
            {/* Blurred background banner */}
            <div className="relative h-60 md:h-[360px] 3xl:h-[540px] blur-[35px] sm:blur-[45px] md:blur-[55px] rounded-[32px] opacity-35 scale-110 overflow-hidden">
              <Image
                src="/homePage/homeBanner.png"
                alt="banner background"
                fill
                className="object-cover relative z-50"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 1216px"
                priority
              />
            </div>

            {/* Main banner image */}
            <div className="absolute inset-0 z-50">
              <Image
                src="/homePage/homeBanner.png"
                alt="banner"
                fill
                className="object-cover rounded-[32px]"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 1216px"
                priority
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="w-full max-w-6xl mx-auto px-4">
          <h2 className="font-bold text-center text-neutral00 text-3xl md:text-5xl mb-8 md:mb-12">
            Our service
          </h2>

          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 flex">
              {serviceData.map((service, index) => (
                <CarouselItem
                  key={index}
                  className="basis-[85%] md:basis-[60%] lg:basis-1/3"
                >
                  <Card
                    className="overflow-hidden rounded-3xl border border-white4 border-b-0 h-full"
                    style={{
                      backgroundImage: `url(https://d1orw8h9a3ark2.cloudfront.net/asset/${service.image}.png)`,
                      backgroundSize: "cover",
                    }}
                  >
                    <div className="relative h-48 md:h-56">
                      <Image
                        src={`/homePage/${service.image}.png`}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 md:p-8 text-center flex flex-col gap-4">
                      <h3 className="font-bold text-2xl md:text-3xl text-neutral00">
                        {service.title}
                      </h3>
                      <p className="font-medium text-sm md:text-base text-neutral100">
                        {service.description}
                      </p>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
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
          <h1 className="font-bold text-center text-neutral00 text-xl sm:text-3xl md:text-5xl px-4">
            Frequently Asked Questions
          </h1>
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
              <h1 className="font-bold text-2xl md:text-3xl text-neutral00">
                Learn More About Citrea and Our Vision
              </h1>
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
  );
}

// Add responsive styles for different screen sizes
const styles = {
  "@media (max-width: 640px)": {
    // Small screens
    ".artpast": {
      fontSize: "2rem",
    },
    ".text-lg": {
      fontSize: "1rem",
    },
    ".service-card": {
      width: "100%",
    },
  },
  "@media (min-width: 641px) and (max-width: 1024px)": {
    // Medium screens
    ".artpast": {
      fontSize: "2.5rem",
    },
    ".text-lg": {
      fontSize: "1.125rem",
    },
  },
  "@media (min-width: 1025px)": {
    // Large screens
    ".artpast": {
      fontSize: "3rem",
    },
    ".text-lg": {
      fontSize: "1.25rem",
    },
  },
};

// "use client";

// import { useState, useEffect } from "react";
// import Header from "@/components/layout/header";
// import Layout from "@/components/layout/layout";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { useAuth } from "@/components/provider/auth-context-provider";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";

// interface FormData {
//   name: string;
//   email: string;
//   message: string;
// }

// // Email sending function
// const sendEmail = async (formData: FormData, formType: 'partner' | 'launch') => {
//   try {
//     const subject = formType === 'partner' ? 'New Partnership Request' : 'New Launch Request';
//     const mailtoLink = `mailto:bzao.hover@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
//       `Name: ${formData.name}
// Email: ${formData.email}
// Message: ${formData.message}`
//     )}`;

//     window.location.href = mailtoLink;
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return false;
//   }
// };

// export default function Home() {
//   const { authState } = useAuth();
//   const router = useRouter();

//   // Contact Form States
//   const [partnerFormData, setPartnerFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [launchFormData, setLaunchFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [isPartnerFormValid, setIsPartnerFormValid] = useState(false);
//   const [isLaunchFormValid, setIsLaunchFormValid] = useState(false);

//   const handleNavigation = () => {
//     if (!authState.authenticated) {
//       toast.error("Please connect your wallet");
//       return;
//     }
//     router.push("/create");
//   };

//   const handleCitreaBlog = () => {
//     router.push("https://www.blog.citrea.xyz/");
//   };

//   // Validation function
//   const validateForm = (formData: FormData): boolean => {
//     const { name, email, message } = formData;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return (
//       name.trim() !== "" &&
//       email.trim() !== "" &&
//       message.trim() !== "" &&
//       emailRegex.test(email)
//     );
//   };

//   // Handle form validations
//   useEffect(() => {
//     setIsPartnerFormValid(validateForm(partnerFormData));
//   }, [partnerFormData]);

//   useEffect(() => {
//     setIsLaunchFormValid(validateForm(launchFormData));
//   }, [launchFormData]);

//   // Handle input changes
//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     setFormData: React.Dispatch<React.SetStateAction<FormData>>,
//   ) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   // Updated form submission handlers
//   const handlePartnerSubmit = async () => {
//     if (isPartnerFormValid) {
//       const emailSent = await sendEmail(partnerFormData, 'partner');
//       if (emailSent) {
//         toast.success("Partner request sent successfully!");
//         setPartnerFormData({ name: "", email: "", message: "" });
//       } else {
//         toast.error("Failed to send request. Please try again.");
//       }
//     }
//   };

//   const handleLaunchSubmit = async () => {
//     if (isLaunchFormValid) {
//       const emailSent = await sendEmail(launchFormData, 'launch');
//       if (emailSent) {
//         toast.success("Launch request sent successfully!");
//         setLaunchFormData({ name: "", email: "", message: "" });
//       } else {
//         toast.error("Failed to send request. Please try again.");
//       }
//     }
//   };

//   return (
//     <>
//       <Layout>
//         <Header />
//         <section className="w-full flex flex-col gap-[120px] mt-[100px]">
//           <div className="w-full flex flex-col items-center gap-12">
//             <div className="flex flex-col gap-8 items-center">
//               <div className="font-normal text-headText artpast text-white">
//                 Empower Your{" "}
//                 <span className="font-normal text-headText artpast text-brand">
//                   Art{" "}
//                 </span>
//               </div>
//               <div className="text-neutral100 font-medium text-center text-lg">
//                 Turn your creativity into collectibles. Join the revolution of
//                 digital ownership <br /> and showcase your unique art to the
//                 world.
//               </div>
//             </div>
//             <div className="flex gap-8">
//               <div className="relative cursor-not-allowed">
//                 <Button
//                   variant="outline"
//                   className="w-[176px] h-12 cursor-not-allowed"
//                   onClick={handleNavigation}
//                   disabled
//                 >
//                   Create
//                 </Button>
//                 <div className="absolute -top-3 -right-3 bg-brand text-neutral500 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
//                   <span className="w-2 h-2 bg-neutral500 rounded-full animate-pulse"></span>
//                   Coming Soon
//                 </div>
//               </div>
//               <Link href={"/collections"} className="cursor-pointer">
//                 <Button
//                   variant="primary"
//                   className="w-[176px] h-12 cursor-pointer"
//                 >
//                   Browse
//                 </Button>
//               </Link>
//             </div>
//           </div>

//           {/* Banner Images */}
//           <div className="relative z-10 h-[360px] blur-[55px] opacity-35 scale-110 overflow-x-hidden">
//             <Image
//               src={"/homePage/homeBanner.png"}
//               alt="banner"
//               width={1216}
//               height={360}
//               className="relative z-50"
//             />
//           </div>
//           <Image
//             src={"/homePage/homeBanner.png"}
//             alt="banner"
//             width={1216}
//             height={360}
//             className="absolute z-50 top-[568px]"
//           />

//           {/* Services Section */}
//           <div className="flex flex-col gap-12 mt-20">
//             <h1 className="font-bold text-center text-neutral00 text-5xl">
//               Our service
//             </h1>
//             <div className="flex gap-8">
//               <div className="bg-[url('https://d1orw8h9a3ark2.cloudfront.net/asset/Service-1.png')] bg-cover w-[384px] h-[384px] rounded-[32px] border border-white4 border-b-0">
//                 <div>
//                   <Image
//                     src={"/homePage/service1.png"}
//                     alt="service1"
//                     width={384}
//                     height={228}
//                   />
//                 </div>
//                 <div className="text-center flex flex-col gap-4 pt-8 pr-8 pl-8 pb-10">
//                   <h1 className="font-bold text-aboutUs text-neutral00">
//                     Launch Collection
//                   </h1>
//                   <p className="font-medium text-md text-neutral100">
//                     Create unique digital art on chain <br />
//                     today backed by bitcoin
//                   </p>
//                 </div>
//               </div>
//               <div className="bg-[url('https://d1orw8h9a3ark2.cloudfront.net/asset/Service-2.png')] bg-cover w-[384px] h-[384px] rounded-[32px] border border-white4 border-b-0">
//                 <div>
//                   <Image
//                     src={"/homePage/service2.png"}
//                     alt="service2"
//                     width={384}
//                     height={228}
//                   />
//                 </div>
//                 <div className="text-center flex flex-col gap-4 pt-8 pr-8 pl-8 pb-10">
//                   <h1 className="font-bold text-aboutUs text-neutral00">
//                     Trade
//                   </h1>
//                   <p className="font-medium text-md text-neutral100">
//                     Maximize value through seamless <br /> NFT market operations
//                   </p>
//                 </div>
//               </div>
//               <div className="bg-[url('https://d1orw8h9a3ark2.cloudfront.net/asset/Service-3.png')] bg-cover w-[384px] h-[384px] rounded-[32px] border border-white4 border-b-0">
//                 <div>
//                   <Image
//                     src={"/homePage/service3.png"}
//                     alt="service3"
//                     width={384}
//                     height={228}
//                   />
//                 </div>
//                 <div className="text-center flex flex-col gap-4 pt-8 pr-8 pl-8 pb-10">
//                   <h1 className="font-bold text-aboutUs text-neutral00">
//                     Bridge between layer-2s
//                   </h1>
//                   <p className="font-medium text-md text-neutral100">
//                     Transfer assets seamlessly across <br />
//                     Bitcoin Layer networks
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Contact Forms Section */}
//           <div className="bg-[url('/homePage/contactBg.png')] h-[488px] w-full p-12 flex justify-between rounded-[32px] border border-white4">
//             <div className="flex flex-col gap-6 items-start justify-end h-full">
//               <span className="font-bold text-5xl">
//                 Let&apos;s Build <br />
//                 <span className="text-brand">Success</span> Together
//               </span>
//               <p className="text-neutral100 font-medium text-lg">
//                 Have a project in mind? Drop us a message, and let&apos;s <br />
//                 explore the possibilities.
//               </p>
//             </div>
//             <div>
//               <Tabs
//                 defaultValue="account"
//                 className="w-[480px] h-[392px] flex flex-col gap-10 border-hidden"
//               >
//                 <TabsList className="grid w-full grid-cols-2 p-1 border border-white8 rounded-[40px] bg-white8">
//                   <TabsTrigger
//                     value="account"
//                     className="border-hidden font-semibold text-md2 text-neutral50"
//                   >
//                     Partner with Us
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="password"
//                     className="border-hidden font-semibold text-md2 text-neutral50"
//                   >
//                     Launch with Us
//                   </TabsTrigger>
//                 </TabsList>

//                 {/* Partner Form */}
//                 <TabsContent value="account">
//                   <Card className="border-hidden flex flex-col gap-4">
//                     <CardContent className="flex flex-col gap-4">
//                       <div className="h-12">
//                         <Input
//                           id="name"
//                           placeholder="Your company name"
//                           value={partnerFormData.name}
//                           onChange={(e) =>
//                             handleInputChange(e, setPartnerFormData)
//                           }
//                           className="bg-white8"
//                         />
//                       </div>
//                       <div className="h-12">
//                         <Input
//                           id="email"
//                           placeholder="Email"
//                           value={partnerFormData.email}
//                           onChange={(e) =>
//                             handleInputChange(e, setPartnerFormData)
//                           }
//                           className="bg-white8"
//                         />
//                       </div>
//                       <div>
//                         <Input
//                           id="message"
//                           placeholder="Message"
//                           className="h-[88px] pb-10 bg-white8"
//                           value={partnerFormData.message}
//                           onChange={(e) =>
//                             handleInputChange(e, setPartnerFormData)
//                           }
//                         />
//                       </div>
//                     </CardContent>
//                     <CardFooter>
//                       <Button
//                         variant="primary"
//                         className="w-full"
//                         disabled={!isPartnerFormValid}
//                         onClick={handlePartnerSubmit}
//                       >
//                         Send
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 </TabsContent>

//                 {/* Launch Form */}
//                 <TabsContent value="password">
//                   <Card className="border-hidden flex flex-col gap-4">
//                     <CardContent className="flex flex-col gap-4">
//                       <div className="h-12">
//                         <Input
//                           id="name"
//                           placeholder="Your company name"
//                           value={launchFormData.name}
//                           onChange={(e) =>
//                             handleInputChange(e, setLaunchFormData)
//                           }
//                           className="bg-white8"
//                         />
//                       </div>
//                       <div className="h-12">
//                         <Input
//                           id="email"
//                           placeholder="Email"
//                           value={launchFormData.email}
//                           onChange={(e) =>
//                             handleInputChange(e, setLaunchFormData)
//                           }
//                           className="bg-white8"
//                         />
//                       </div>
//                       <div>
//                         <Input
//                           id="message"
//                           placeholder="Message"
//                           className="h-[88px] pb-10 bg-white8"
//                           value={launchFormData.message}
//                           onChange={(e) =>
//                             handleInputChange(e, setLaunchFormData)
//                           }
//                         />
//                       </div>
//                     </CardContent>
//                     <CardFooter>
//                       <Button
//                         variant="primary"
//                         className="w-full"
//                         disabled={!isLaunchFormValid}
//                         onClick={handleLaunchSubmit}
//                       >
//                         Send
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>

//           {/* FAQ Section */}
//           <div className="flex flex-col items-center gap-12 w-full mt-20">
//             <h1 className="font-bold text-center text-neutral00 text-5xl">
//               Frequently Asked Questions
//             </h1>
//             <div className="w-[800px]">
//               <Accordion
//                 type="single"
//                 collapsible
//                 className="flex flex-col gap-6 justify-center"
//               >
//                 <AccordionItem
//                   value="item-1"
//                   className="border border-b-neutral500 pt-3 pb-3"
//                 >
//                   <AccordionTrigger className="text-neutral00 font-medium text-xl">
//                     What is the Creator Program, and how does it work?
//                   </AccordionTrigger>
//                   <AccordionContent className="text-neutral100 font-normal text-lg">
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit.
//                     Morbi volutpat convallis velit at bibendum. Suspendisse
//                     pulvinar, ligula volutpat scelerisque semper, eros sem
//                     aliquet arcu, ac pulvinar sapien nibh in nulla. Duis commodo
//                     laoreet ligula, a vulputate lorem commodo non. Quisque
//                     congue urna at finibus vestibulum.
//                   </AccordionContent>
//                 </AccordionItem>
//                 <AccordionItem
//                   value="item-2"
//                   className="border border-b-neutral500 pt-3 pb-3"
//                 >
//                   <AccordionTrigger className="text-neutral00 font-medium text-xl">
//                     What is a cross-chain marketplace, and why does it matter?
//                   </AccordionTrigger>
//                   <AccordionContent className="text-neutral100 font-normal text-lg">
//                     A Bitcoin cross-chain marketplace enables seamless trading
//                     of digital assets across different Bitcoin Layer 2networks,
//                     unifying liquidity and access while reducing fragmentation
//                     that would occur if each network operated in isolation.
//                   </AccordionContent>
//                 </AccordionItem>
//                 <AccordionItem
//                   value="item-3"
//                   className="border border-b-neutral500 pt-3 pb-3"
//                 >
//                   <AccordionTrigger className="text-neutral00 font-medium text-xl">
//                     What wallets and payment methods are supported?
//                   </AccordionTrigger>
//                   <AccordionContent className="text-neutral100 font-normal text-lg">
//                     We support industry-standard EVM wallets like MetaMask and
//                     WalletConnect.
//                   </AccordionContent>
//                 </AccordionItem>
//                 <AccordionItem
//                   value="item-4"
//                   className="border border-b-neutral500 pt-3 pb-3"
//                 >
//                   <AccordionTrigger className="text-neutral00 font-medium text-xl">
//                     What is &quot;Collectible as a Service&quot; (CaaS)?
//                   </AccordionTrigger>
//                   <AccordionContent className="text-neutral100 font-normal text-lg">
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit.
//                     Morbi volutpat convallis velit at bibendum. Suspendisse
//                     pulvinar, ligula volutpat scelerisque semper, eros sem
//                     aliquet arcu, ac pulvinar sapien nibh in nulla. Duis commodo
//                     laoreet ligula, a vulputate lorem commodo non. Quisque
//                     congue urna at finibus vestibulum.
//                   </AccordionContent>
//                 </AccordionItem>
//               </Accordion>
//             </div>
//           </div>

//           {/* About Section */}
//           <div className="flex flex-col items-center w-full gap-16">
//             <div className="relative z-10 w-[320px] h-[320px] blur-[90px] opacity-35 scale-120">
//               <Image
//                 src={"/homePage/citreaMeme.png"}
//                 alt="search"
//                 width={320}
//                 height={320}
//                 className="rounded-[32px] aspect-square relative z-50"
//               />
//             </div>
//             <Image
//               src={"/homePage/citreaMeme.png"}
//               alt="search"
//               width={320}
//               height={320}
//               className="rounded-[32px] aspect-square absolute z-50"
//             />
//             <div className="flex flex-col items-center gap-12">
//               <div className="text-center grid m-0 gap-6">
//                 <h1 className="font-bold text-3xl text-neutral00">
//                   Learn More About Citrea and Our Vision
//                 </h1>
//                 <p className="font-medium text-lg text-neutral100">
//                   Explore who we are, what we stand for, and how we&apos;re
//                   shaping the future.
//                 </p>
//               </div>
//               <Button variant="secondary" onClick={handleCitreaBlog}>
//                 Read about Citrea
//               </Button>
//             </div>
//           </div>
//         </section>
//       </Layout>
//     </>
//   );
// }
