"use client";

import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/provider/auth-context-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const { authState } = useAuth();
  const router = useRouter();

  const handleNavigation = () => {
    if (!authState.authenticated) {
      toast.error("Please connect your wallet");
      return;
    }
    router.push("/create");
  };
  return (
    <>
      <Layout>
        <Header />
        <section className="flex items-center justify-between h-screen">
          <div className="w-[592px] h-[520px] flex flex-col gap-8">
            <h1 className="font-normal text-blueTitle nebulax text-white">
              Empower Your <br /> Art with <br /> Mint Park
            </h1>
            <p className="text-neutral100 text-lg2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac
              ornare nisi. Aliquam eget semper risus, sed commodo elit.{" "}
            </p>
            <div className="flex gap-8">
              <Button
                variant="outline"
                className="w-[176px] h-12 cursor-pointer"
                onClick={handleNavigation}
              >
                Create
              </Button>
              <Link href={"/collections"} className="cursor-pointer">
                <Button
                  variant="primary"
                  className="w-[176px] h-12 cursor-pointer"
                >
                  Explore
                </Button>
              </Link>
            </div>
          </div>
          <div className="h-[520px] relative bottom-10">
            <Image
              src={"/bg.png"}
              alt="background"
              width={592}
              height={520}
              // sizes="100%"
              className="object-cover relative z-50"
            />
            <Image
              src={"/colCard.png"}
              alt="background"
              width={280}
              height={432}
              // sizes="100%"
              className="object-cover absolute top-[40px] right-[155px] z-50"
            />
          </div>
        </section>
        {/* <Footer/> */}
      </Layout>
    </>
  );
}
