// store.ts
import { MergedObject } from "@/types";
import { create } from "zustand";

interface FormState {
  ticker: string;
  setTicker: (ticker: string) => void;
  headline: string;
  setHeadline: (headline: string) => void;
  imageBase64: string;
  setImageBase64: (imageBase64: string) => void;
  description: string;
  setDescription: (description: string) => void;
  price: number;
  setPrice: (price: number) => void;
  imageMime: string;
  setImageMime: (imageMime: string) => void;
  collectionId: string;
  setCollectionId: (collectionId: string) => void;
  supply: number;
  setSupply: (supply: number) => void;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  txUrl: string;
  setTxUrl: (txUrl: string) => void;
  mergedArray: MergedObject[];
  setMergedArray: (mergedArray: MergedObject[]) => void;
  reset: () => void;
}

const useFormState = create<FormState>((set) => ({
  ticker: "",
  setTicker: (ticker) => set({ ticker }),
  headline: "",
  setHeadline: (headline) => set({ headline }),
  imageBase64: "",
  setImageBase64: (imageBase64) => set({ imageBase64 }),
  imageMime: "",
  setImageMime: (imageMime) => set({ imageMime }),
  supply: 1,
  setSupply: (supply) => set({ supply }),
  imageUrl: "",
  setImageUrl: (imageUrl) => set({ imageUrl }),
  description: "",
  setDescription: (description) => set({ description }),
  price: 0,
  setPrice: (price) => set({ price }),
  collectionId: "",
  setCollectionId: (collectionId) => set({ collectionId }),
  txUrl: "",
  setTxUrl: (txUrl) => set({ txUrl }),
  mergedArray: [],
  setMergedArray: (mergedArray) => set({ mergedArray }),
  reset: () =>
    set({
      ticker: "",
      headline: "",
      imageBase64: "",
      description: "",
      price: 0,
      imageMime: "",
      collectionId: "",
      supply: 1,
      imageUrl: "",
      txUrl: "",
      mergedArray: [],
    }),
}));

export default useFormState;
