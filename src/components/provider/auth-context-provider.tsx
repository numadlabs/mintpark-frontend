
'use client';

import React, { createContext, useContext, useEffect } from "react";
import { useWallet } from "@/lib/hooks/useWallet";
import { initializeAxios } from "@/lib/axios";
import { Layer, User, UserLayer } from "@/lib/types/wallet";

// Updated interface to match the new useWallet hook structure
interface WalletAuthContextType {
  // State
  isConnected: boolean;
  currentLayer: Layer | null;
  currentUserLayer: UserLayer | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  availableLayers: Layer[];
  selectedLayerId: string | null;
  defaultLayer: Layer | null;

  // Actions
  setSelectedLayerId: (layerId: string | null) => void;
  connectWallet: (targetLayerId?: string) => Promise<void>;
  authenticateWithWallet: (targetLayerId?: string) => Promise<void>;
  switchLayer: (targetLayer: Layer) => Promise<void>;
  setDefaultLayer: (data: { layer: Layer; userLayer?: UserLayer }) => void;
  disconnectWallet: () => void;
  getUserLayerFromCache: (layerId: string) => any;
}

const WalletAuthContext = createContext<WalletAuthContextType | null>(null);

export const WalletAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wallet = useWallet();

  useEffect(() => {
    // Initialize axios with disconnect function
    initializeAxios(wallet.disconnectWallet);
  }, [wallet.disconnectWallet]);

  const value: WalletAuthContextType = {
    // State from useWallet
    isConnected: wallet.isConnected,
    currentLayer: wallet.currentLayer,
    currentUserLayer: wallet.currentUserLayer,  
    user: wallet.user, 
    isLoading: wallet.isLoading,
    error: wallet.error,
    availableLayers: wallet.availableLayers,
    selectedLayerId: wallet.selectedLayerId,
    defaultLayer:wallet.currentLayer,

    // Actions from useWallet
    setSelectedLayerId: wallet.setSelectedLayerId,
    connectWallet:wallet.connectWallet,
    setDefaultLayer:wallet.setLayer,
    authenticateWithWallet: wallet.authenticateWithWallet,
    switchLayer: wallet.switchLayer,
    disconnectWallet: wallet.disconnectWallet,
    getUserLayerFromCache: wallet.getUserLayerFromCache,
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
    throw new Error("useWalletAuth must be used within a WalletAuthProvider");
  }
  return context;
};



