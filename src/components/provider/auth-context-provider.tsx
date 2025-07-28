"use client";

import React, { createContext, useContext, useEffect } from "react";
import useWalletStore, {
  ConnectedWallet,
  Wallet,
  WalletStore,
} from "@/lib/hooks/useWalletAuth";
import { useWagmiWalletAuth } from "@/lib/hooks/useWagmiWalletAuth";
import { initializeAxios } from "@/lib/axios";

interface ExtendedWalletStore extends WalletStore {
  // Wagmi-specific properties and methods
  wagmiAddress?: string;
  wagmiIsConnected?: boolean;
  wagmiChainId?: number;
  isSigningPending?: boolean;
  isSwitchingChain?: boolean;
  connectEvmWallet?: (layerId: string, isLinking?: boolean) => Promise<void>;
  disconnectEvmWallet?: (layerId: string) => Promise<void>;
  switchToLayer?: (layerId: string) => Promise<void>;
  linkAccountToCurrentLayer?: () => Promise<ConnectedWallet>;
}

const WalletAuthContext = createContext<ExtendedWalletStore | null>(null);

export const WalletAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = useWalletStore();

  // Get wagmi-specific functionality
  const wagmiAuth = useWagmiWalletAuth();

  useEffect(() => {
    initializeAxios(store.onLogout);
  }, [store.onLogout]);

  const value: ExtendedWalletStore = {
    // Original store properties - ALL OF THEM
    authState: store.authState,
    selectedLayerId: store.selectedLayerId,
    setSelectedLayerId: store.setSelectedLayerId,
    updateAuthStateForLayer: store.updateAuthStateForLayer,
    layers: store.layers,
    onLogout: store.onLogout,
    setLayers: store.setLayers,
    connectedWallets: store.connectedWallets,
    connectWallet: store.connectWallet,
    disconnectWallet: store.disconnectWallet,
    isWalletConnected: store.isWalletConnected,
    getWalletForLayer: store.getWalletForLayer,
    getAddressforCurrentLayer: store.getAddressforCurrentLayer,
    proceedWithLinking: store.proceedWithLinking,

    // Add the missing properties from WalletStore
    pendingConnection: store.pendingConnection,
    setPendingConnection: store.setPendingConnection,
    clearPendingConnection: store.clearPendingConnection,
    completeEvmWalletConnection: store.completeEvmWalletConnection,

    // Add wagmi-specific properties
    wagmiAddress: wagmiAuth.address,
    wagmiIsConnected: wagmiAuth.isConnected,
    wagmiChainId: wagmiAuth.chainId,
    isSigningPending: wagmiAuth.isSigningPending,
    isSwitchingChain: wagmiAuth.isSwitchingChain,
    connectEvmWallet: wagmiAuth.connectEvmWallet,
    disconnectEvmWallet: wagmiAuth.disconnectEvmWallet,
    switchToLayer: wagmiAuth.switchToLayer,
    linkAccountToCurrentLayer: wagmiAuth.linkAccountToCurrentLayer,
  };

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a WalletAuthProvider");
  }
  return context;
};

// 'use client';

// import React, { createContext, useContext, useEffect } from "react";
// import useWalletStore, {
//   ConnectedWallet,
//   Wallet,
//   WalletStore,
// } from "@/lib/hooks/useWalletAuth";
// import { useWagmiWalletAuth } from "@/lib/hooks/useWagmiWalletAuth";
// import { initializeAxios } from "@/lib/axios";

// interface ExtendedWalletStore extends WalletStore {
//   // Wagmi-specific properties and methods
//   wagmiAddress?: string;
//   wagmiIsConnected?: boolean;
//   wagmiChainId?: number;
//   isSigningPending?: boolean;
//   isSwitchingChain?: boolean;
//   connectEvmWallet?: (layerId: string, isLinking?: boolean) => Promise<void>;
//   disconnectEvmWallet?: (layerId: string) => Promise<void>;
//   switchToLayer?: (layerId: string) => Promise<void>;
// }

// const WalletAuthContext = createContext<ExtendedWalletStore | null>(null);

// export const WalletAuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const store = useWalletStore();

//   // Get wagmi-specific functionality
//   const wagmiAuth = useWagmiWalletAuth();

//   useEffect(() => {
//     initializeAxios(store.onLogout);
//   }, [store.onLogout]);

//   const value: ExtendedWalletStore = {
//     // Original store properties - ALL OF THEM
//     authState: store.authState,
//     selectedLayerId: store.selectedLayerId,
//     setSelectedLayerId: store.setSelectedLayerId,
//     updateAuthStateForLayer: store.updateAuthStateForLayer,
//     layers: store.layers,
//     onLogout: store.onLogout,
//     setLayers: store.setLayers,
//     connectedWallets: store.connectedWallets,
//     connectWallet: store.connectWallet,
//     disconnectWallet: store.disconnectWallet,
//     isWalletConnected: store.isWalletConnected,
//     getWalletForLayer: store.getWalletForLayer,
//     getAddressforCurrentLayer: store.getAddressforCurrentLayer,
//     proceedWithLinking: store.proceedWithLinking,

//     // Add the missing properties from WalletStore
//     pendingConnection: store.pendingConnection,
//     setPendingConnection: store.setPendingConnection,
//     clearPendingConnection: store.clearPendingConnection,
//     completeEvmWalletConnection: store.completeEvmWalletConnection,

//     // Add wagmi-specific properties
//     wagmiAddress: wagmiAuth.address,
//     wagmiIsConnected: wagmiAuth.isConnected,
//     wagmiChainId: wagmiAuth.chainId,
//     isSigningPending: wagmiAuth.isSigningPending,
//     isSwitchingChain: wagmiAuth.isSwitchingChain,
//     connectEvmWallet: wagmiAuth.connectEvmWallet,
//     disconnectEvmWallet: wagmiAuth.disconnectEvmWallet,
//     switchToLayer: wagmiAuth.switchToLayer,
//   };

//   return (
//     <WalletAuthContext.Provider value={value}>
//       {children}
//     </WalletAuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(WalletAuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within a WalletAuthProvider");
//   }
//   return context;
// };
