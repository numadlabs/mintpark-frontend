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

// export interface Order {
//   id: string;
//   feeRate: number;
//   fundingAddress: string;
//   fundingAmount: number;
//   fundingTxId: string | null;
//   createdAt: string;
//   mintedAt: string | null;
//   orderType: string;
//   orderStatus: string;
//   userId: string;
//   userLayerId: string;
//   collectionId: string;
//   launchItemId: string | null;
//   purchaseId: string | null;
//   orderSplitCount: number;
//   serviceFeeInSats: number;
//   hasTransferredServiceFee: boolean;
//   networkFeeInSats: number;
//   isBase: boolean;
//   // add more fields as needed
// }

// export interface InscriptionData {
//   order: Order;
//   walletQrString: string;
// }

// New interface for calculated upload data
export interface CalculatedUploadData {
  expectedTraitTypes: number;
  expectedTraitValues: number;
  expectedRecursive: number;
  expectedOOOEditions: number;
}

interface CreationFlowState {
  currentStep: number;
  collectionData: NewCollectionData;
  traitData: TraitData;
  inscriptionData: InscriptionData | null;
  calculatedUploadData: CalculatedUploadData | null;
  isLoading: boolean;
  collectionId: string | null;
}

interface CreationFlowContextType extends CreationFlowState {
  setCurrentStep: (step: number) => void;
  updateCollectionData: (data: Partial<NewCollectionData>) => void;
  updateTraitData: (data: Partial<TraitData>) => void;
  updateInscriptionData: (data: Partial<InscriptionData>) => void;
  updateCalculatedUploadData: (data: CalculatedUploadData) => void;
  setIsLoading: (loading: boolean) => void;
  setCollectionId: (id: string | null) => void;
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
    traitAssets: null,
    oneOfOneEditions: null,
    metadataJson: null,
  },
  inscriptionData: null,
  calculatedUploadData: null,
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

  // Add this new function
  const updateCalculatedUploadData = (data: CalculatedUploadData) => {
    setState((prev) => ({
      ...prev,
      calculatedUploadData: data,
    }));
  };

  const setIsLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  // const setCollectionId = (id: string) => {
  //   setState((prev) => ({ ...prev, collectionId: id }));
  // };

  const setCollectionId = (id: string | null) => {
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
        updateTraitData,
        updateInscriptionData,
        updateCalculatedUploadData,
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
