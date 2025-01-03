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
      <div className="w-full overflow-x-auto px-4 max-w-[1920px] md2:px-[112px] 3xl:px-10">
        <Header />
        {children}
      </div>
      <Footer/>
    </div>
  );
}
