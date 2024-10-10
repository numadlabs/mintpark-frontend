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
  reset: () => void;
}

const useCreateFormState = create<FormState>((set) => ({
  imageFile: [],
  setImageFile: (files: File[]) => set((state) => ({ imageFile: [...state.imageFile, ...files] })),

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

  reset: () =>
    set({
      imageFile: [],
      name: "",
      creator: "",
      description: "",
      mintLayerType: "",
      feeRate: 0,
    }),
}));

export default useCreateFormState;
