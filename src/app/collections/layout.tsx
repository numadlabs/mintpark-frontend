import Header from "@/components/layout/header";
import { ReactNode } from "react";

export default function CollectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
      <div className="w-full max-w-[1216px]">
        <Header />
        {children}
      </div>
    </div>
  );
}
