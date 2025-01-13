"use client";

import { WalletAuthProvider } from "./auth-context-provider";

export default function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletAuthProvider>{children}</WalletAuthProvider>;
}
