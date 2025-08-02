"use client";

import { WagmiProvider } from "wagmi";
import { WalletAuthProvider } from "./auth-context-provider";
import { wagmiConfig } from "@/lib/wagmiConfig";

export default function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <WalletAuthProvider>{children}</WalletAuthProvider>
    </WagmiProvider>
  );
}
