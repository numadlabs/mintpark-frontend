"use client";
import { useAuth } from "@/components/provider/auth-context-provider";
import { redirect } from "next/navigation";
import Footer from "@/components/layout/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  if (!authState.loading && !authState.authenticated) {
    redirect("/");
    return null;
  }
  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
      <div className="w-full max-w-[1216px] px-8 xl:px-0">{children}</div>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
