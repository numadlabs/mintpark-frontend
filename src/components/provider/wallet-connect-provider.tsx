"use client";

import {
  UseConnectorProvider,
  useConnector,
} from "anduro-wallet-connector-react";
import { AuthProvider } from "./auth-context-provider";
import { useContext } from "react";

function InnerProvider({ children }: { children: React.ReactNode }) {
  const connector = useContext<any>(useConnector);
  // const connector = useConnector();

  return <AuthProvider connector={connector}>{children}</AuthProvider>;
}

export default function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UseConnectorProvider>
      <InnerProvider>{children}</InnerProvider>
    </UseConnectorProvider>
  );
}
