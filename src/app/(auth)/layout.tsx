//src/app/(auth)/layout.tsx

"use client";
import { useAuth } from "@/components/provider/auth-context-provider";
import { redirect } from "next/navigation";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only check authentication after initial client render
  // and when authState is not loading
  if (isClient && authState && !authState.loading && !authState.authenticated) {
    redirect("/");
  }

  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
      <div className="w-full overflow-x-hidden max-w-[1920px] px-4 md2:px-[112px] 3xl:px-10">
        {authState && authState.loading ? (
          <div className="flex flex-col justify-center items-center h-screen">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="mt-4 text-lg font-medium text-primary animate-pulse">
              Loading your account...
            </p>
          </div>
        ) : (
          children
        )}
      </div>
      <Footer />
    </div>
  );
}
