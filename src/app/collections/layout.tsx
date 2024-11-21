import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ReactNode } from "react";

export default function CollectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col w-full h-full bg-background items-center">
      <div className="w-full max-w-[1216px] px-8 xl:px-0">
        <Header />
        {children}
      </div>
      <Footer/>
    </div>
  );
}
