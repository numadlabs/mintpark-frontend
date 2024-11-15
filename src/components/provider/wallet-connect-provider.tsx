"use client";

import { AuthProvider } from "./auth-context-provider";

export default function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
