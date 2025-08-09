

import WalletConnectProvider from "@/components/provider/wallet-connect-provider";
import { ReactQueryClientProvider } from "@/components/provider/query-client-provider";
import { Toaster } from "@/components/ui/toaster";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary.tsx";
import { Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";

const bai_Jamjuree = Bai_Jamjuree({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
});

export { metadata } from "./metadata";

export const viewport: Viewport = {
  // Add viewport export
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111315",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <head>
          <link
            rel="canonical"
            href={
              process.env.NEXT_PUBLIC_SITE_URL || "https://www.mintpark.io/"
            }
          />
        </head>
        <body>
          <main className={bai_Jamjuree.className}>
            <ErrorBoundary>
              <WalletConnectProvider>{children}</WalletConnectProvider>
            </ErrorBoundary>
            <Toaster />
          </main>
          <Analytics />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
