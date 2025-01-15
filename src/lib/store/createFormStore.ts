import { create } from "zustand";

interface FormState {
  imageFile: File[];
  setImageFile: (imageFile: File[]) => void;
  name: string;
  setName: (name: string) => void;
  creator: string;
  setCreator: (creator: string) => void;
  description: string;
  setDescription: (description: string) => void;
  mintLayerType: string;
  setMintLayerType: (mintLayerType: string) => void;
  feeRate: number;
  setFeeRate: (feeRate: number) => void;
  POStartsAtDate: string;
  setPOStartsAtDate: (POStartsAtDate: string) => void;
  POStartsAtTime: string;
  setPOStartsAtTime: (POStartsAtTime: string) => void;
  POEndsAtDate: string;
  setPOEndsAtDate: (POEndsAtDate: string) => void;
  POEndsAtTime: string;
  setPOEndsAtTime: (POEndsAtTime: string) => void;
  POMintPrice: number;
  setPOMintPrice: (POMintPrice: number) => void;
  POMaxMintPerWallet: number;
  setPOMaxMintPerWallet: (POMaxMintPerWallet: number) => void;
  WLStartsAtDate: string;
  setWLStartsAtDate: (WLStartsAtDate: string) => void;
  WLStartsAtTime: string;
  setWLStartsAtTime: (WLStartsAtTime: string) => void;
  WLEndsAtDate: string;
  setWLEndsAtDate: (WLEndsAtDate: string) => void;
  WLEndsAtTime: string;
  setWLEndsAtTime: (WLEndsAtTime: string) => void;
  WLMintPrice: number;
  setWLMintPrice: (WLMintPrice: number) => void;
  WLMaxMintPerWallet: number;
  setWLMaxMintPerWallet: (WLMaxMintPerWallet: number) => void;
  supply: number;
  setSupply: (supply: number) => void;
  txid: string;
  setTxid: (txid: string) => void;
  reset: () => void;
}

const useCreateFormState = create<FormState>((set) => ({
  imageFile: [],
  setImageFile: (files: File[]) => set({ imageFile: files }),
  name: "",
  setName: (name: string) => set({ name }),
  creator: "",
  setCreator: (creator: string) => set({ creator }),
  description: "",
  setDescription: (description: string) => set({ description }),
  mintLayerType: "",
  setMintLayerType: (mintLayerType: string) => set({ mintLayerType }),
  feeRate: 0,
  setFeeRate: (feeRate: number) => set({ feeRate }),
  POStartsAtDate: "",
  setPOStartsAtDate: (POStartsAtDate: string) => set({ POStartsAtDate }),
  POStartsAtTime: "",
  setPOStartsAtTime: (POStartsAtTime: string) => set({ POStartsAtTime }),
  POEndsAtDate: "",
  setPOEndsAtDate: (POEndsAtDate: string) => set({ POEndsAtDate }),
  POEndsAtTime: "",
  setPOEndsAtTime: (POEndsAtTime: string) => set({ POEndsAtTime }),
  POMintPrice: 0,
  setPOMintPrice: (POMintPrice: number) => set({ POMintPrice }),
  POMaxMintPerWallet: 0,
  setPOMaxMintPerWallet: (POMaxMintPerWallet: number) =>
    set({ POMaxMintPerWallet }),
  WLStartsAtDate: "",
  setWLStartsAtDate: (WLStartsAtDate: string) => set({ WLStartsAtDate }),
  WLStartsAtTime: "",
  setWLStartsAtTime: (WLStartsAtTime: string) => set({ WLStartsAtTime }),
  WLEndsAtDate: "",
  setWLEndsAtDate: (WLEndsAtDate: string) => set({ WLEndsAtDate }),
  WLEndsAtTime: "",
  setWLEndsAtTime: (WLEndsAtTime: string) => set({ WLEndsAtTime }),
  WLMintPrice: 0,
  setWLMintPrice: (WLMintPrice: number) => set({ WLMintPrice }),
  WLMaxMintPerWallet: 0,
  setWLMaxMintPerWallet: (WLMaxMintPerWallet: number) =>
    set({ WLMaxMintPerWallet }),
  supply: 0,
  setSupply: (supply) => set({ supply }),
  txid: "",
  setTxid: (txid: string) => set({ txid }),

  reset: () =>
    set({
      imageFile: [],
      name: "",
      creator: "",
      description: "",
      mintLayerType: "",
      feeRate: 0,
      POStartsAtDate: "",
      POStartsAtTime: "",
      POEndsAtDate: "",
      POEndsAtTime: "",
      POMintPrice: 0,
      POMaxMintPerWallet: 0,
      WLStartsAtDate: "",
      WLStartsAtTime: "",
      WLEndsAtDate: "",
      WLEndsAtTime: "",
      WLMintPrice: 0,
      supply: 0,
      txid: "",
    }),
}));

export default useCreateFormState;
