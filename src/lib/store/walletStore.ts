import { create } from "zustand";

type WalletState = {
  isConnected: boolean;
  setConnected: (isConnected: boolean) => void;
  connectedAddress: string;
  setConnectedAddress: (connectedAddress: string) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  setConnected: (isConnected: boolean) =>
    set((state) => ({ ...state, isConnected: isConnected })),
  connectedAddress: "",
  setConnectedAddress: (data) =>
    set((state) => ({ ...state, connectedAddress: data })),
}));
