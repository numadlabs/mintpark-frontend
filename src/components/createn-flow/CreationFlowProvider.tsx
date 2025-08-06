"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface NewCollectionData {
  name: string;
  symbol?: string;
  logo: File | null;
  description: string;
  type: string;
  userLayerId: string | null;
  layerId: string | null;
}

export interface TraitData {
  traitAssets: File | null;
  oneOfOneEditions: File | null;
  metadataJson: File | null;
}

export interface InscriptionData {
  orderId: string;
  walletAddress: string;
  fees: {
    inscription: number;
    service: number;
    total: number;
  };
  progress: {
    current: number;
    total: number;
    estimatedTime: string;
  };
}

interface CreationFlowState {
  currentStep: number;
  collectionData: NewCollectionData;
  traitData: TraitData;
  inscriptionData: InscriptionData | null;
  isLoading: boolean;
  collectionId: string | null;
}

interface CreationFlowContextType extends CreationFlowState {
  setCurrentStep: (step: number) => void;
  updateCollectionData: (data: Partial<NewCollectionData>) => void;
  updateTraitData: (data: Partial<TraitData>) => void; // Энэ line байгаа эсэхийг шалгаарай
  updateInscriptionData: (data: Partial<InscriptionData>) => void;
  setIsLoading: (loading: boolean) => void;
  setCollectionId: (id: string) => void;
  resetFlow: () => void;
}

const initialState: CreationFlowState = {
  currentStep: 0,
  collectionData: {
    name: "",
    symbol: "",
    logo: null,
    description: "",
    type: "",
    layerId: "",
    userLayerId: "",
  },
  traitData: {
    // Энэ хэсэг байгаа эсэхийг шалгаарай
    traitAssets: null,
    oneOfOneEditions: null,
    metadataJson: null,
  },
  inscriptionData: null,
  isLoading: false,
  collectionId: null,
};

const CreationFlowContext = createContext<CreationFlowContextType | undefined>(
  undefined
);

export function CreationFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreationFlowState>(initialState);

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const updateCollectionData = (data: Partial<NewCollectionData>) => {
    setState((prev) => ({
      ...prev,
      collectionData: { ...prev.collectionData, ...data },
    }));
  };

  // Энэ функц байгаа эсэхийг шалгаарай
  const updateTraitData = (data: Partial<TraitData>) => {
    setState((prev) => ({
      ...prev,
      traitData: { ...prev.traitData, ...data },
    }));
  };

  const updateInscriptionData = (data: Partial<InscriptionData>) => {
    setState((prev) => ({
      ...prev,
      inscriptionData: prev.inscriptionData
        ? { ...prev.inscriptionData, ...data }
        : (data as InscriptionData),
    }));
  };

  const setIsLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  const setCollectionId = (id: string) => {
    setState((prev) => ({ ...prev, collectionId: id }));
  };

  const resetFlow = () => {
    setState(initialState);
  };

  return (
    <CreationFlowContext.Provider
      value={{
        ...state,
        setCurrentStep,
        updateCollectionData,
        updateTraitData, // Энэ line байгаа эсэхийг шалгаарай
        updateInscriptionData,
        setIsLoading,
        setCollectionId,
        resetFlow,
      }}
    >
      {children}
    </CreationFlowContext.Provider>
  );
}

export function useCreationFlow() {
  const context = useContext(CreationFlowContext);
  if (context === undefined) {
    throw new Error(
      "useCreationFlow must be used within a CreationFlowProvider"
    );
  }
  return context;
}
