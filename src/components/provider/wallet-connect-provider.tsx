"use client";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";

export default function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}

// "use client";

// import { WalletAuthProvider } from "./auth-context-provider";

// export default function WalletConnectProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <WalletAuthProvider>{children}</WalletAuthProvider>;
// }
