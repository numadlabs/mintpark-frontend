import WalletConnecProvider from "@/components/provider/wallet-connect-provider";
import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/provider/query-client-provider";
import { Toaster } from "@/components/ui/toaster";

const bai_Jamjuree = Bai_Jamjuree({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mint Park",
  description: "Mint Park example app made for demo purpose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body>
          <main className={bai_Jamjuree.className}>
            <link rel="icon" href="/logo.png" sizes="any" />
            <WalletConnecProvider>{children}</WalletConnecProvider>
            {/* <Transition>{children}</Transition> */}
            <Toaster />
          </main>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
