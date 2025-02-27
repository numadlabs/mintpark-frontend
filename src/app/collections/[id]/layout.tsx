import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ReactNode } from "react";

export default function CollectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
  <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
       <div className="w-full sticky top-0 z-50">
         <div className="max-w-[1920px] mx-auto px-4 md2:px-[112px] 3xl:px-10">
           <Header />
         </div>
       </div>
       
       <div className="w-full max-w-[1920px] px-4 md2:px-[112px] 3xl:px-10">
         {children}
       </div>
       
       <div className="max-w-[1920px] w-full">
         <Footer />
       </div>
     </div>
  );
}
