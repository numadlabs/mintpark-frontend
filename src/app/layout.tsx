// import WalletConnecProvider from "@/components/provider/wallet-connect-provider";
// import type { Metadata } from "next";
// import { Bai_Jamjuree } from "next/font/google";
// import "./globals.css";
// import { ReactQueryClientProvider } from "@/components/provider/query-client-provider";
// import { Toaster } from "@/components/ui/toaster";

// const bai_Jamjuree = Bai_Jamjuree({
//   weight: ["400", "700"],
//   style: "normal",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Mint Park",
//   description: "Mint Park example app made for demo purpose",
//   metadataBase: new URL("https://www.mintpark.io"),
//   openGraph: {
//     title: "Mint Park",
//     description: "Mint Park example app made for demo purpose",
//     url: "https://www.mintpark.io/",
//     siteName: "Mint Park",
//     type: "website",
//     // Add the image URL when available
//     images: [
//       {
//         url: "/logo.png", // Add your OG image URL here
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Mint Park",
//     description: "Mint Park example app made for demo purpose",
//     // Add the image URL when available
//     images: ["/detail_icon/icon_2.png"], // Add your Twitter image URL here
//     site: "@mintpark", // Add your Twitter handle if available
//   },
//   icons: {
//     icon: "/logo.png",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <ReactQueryClientProvider>
//       <html lang="en">
//         <body>
//           <main className={bai_Jamjuree.className}>
//             <WalletConnecProvider>{children}</WalletConnecProvider>
//             {/* <Transition>{children}</Transition> */}
//             <Toaster />
//           </main>
//         </body>
//       </html>
//     </ReactQueryClientProvider>
//   );
// }


// import WalletConnectProvider from "@/components/provider/wallet-connect-provider";
// import { ReactQueryClientProvider } from "@/components/provider/query-client-provider";
// import { Toaster } from "@/components/ui/toaster";
// import { Bai_Jamjuree } from "next/font/google";
// import "./globals.css";

// const bai_Jamjuree = Bai_Jamjuree({
//   weight: ["400", "700"],
//   style: "normal",
//   subsets: ["latin"],
// });

// export { metadata } from './metadata';

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <ReactQueryClientProvider>
//       <html lang="en">
//         <head>
//           <link 
//             rel="canonical" 
//             href={process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mintpark.io/'} 
//           />
//           <meta name="viewport" content="width=device-width, initial-scale=1" />
//         </head>
//         <body>
//           <main className={bai_Jamjuree.className}>
//             <WalletConnectProvider>{children}</WalletConnectProvider>
//             <Toaster />
//           </main>
//         </body>
//       </html>
//     </ReactQueryClientProvider>
//   );
// }


import WalletConnectProvider from "@/components/provider/wallet-connect-provider";
import { ReactQueryClientProvider } from "@/components/provider/query-client-provider";
import { Toaster } from "@/components/ui/toaster";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary.tsx";

const bai_Jamjuree = Bai_Jamjuree({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
});

export { metadata } from './metadata';

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
            href={process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mintpark.io/'} 
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <main className={bai_Jamjuree.className}>
            <ErrorBoundary>
              <WalletConnectProvider>{children}</WalletConnectProvider>
            </ErrorBoundary>
            <Toaster />
          </main>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}