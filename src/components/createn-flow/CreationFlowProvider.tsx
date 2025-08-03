"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CollectionData {
  name: string;
  symbol: string;
  logo: File | null;
  background: File | null;
  selectedChain: string;
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
    network: number;
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
  collectionData: CollectionData;
  traitData: TraitData;
  inscriptionData: InscriptionData | null;
  isLoading: boolean;
}

interface CreationFlowContextType extends CreationFlowState {
  setCurrentStep: (step: number) => void;
  updateCollectionData: (data: Partial<CollectionData>) => void;
  updateTraitData: (data: Partial<TraitData>) => void;
  updateInscriptionData: (data: Partial<InscriptionData>) => void;
  setIsLoading: (loading: boolean) => void;
  resetFlow: () => void;
}

const initialState: CreationFlowState = {
  currentStep: 0,
  collectionData: {
    name: '',
    symbol: '',
    logo: null,
    background: null,
    selectedChain: '',
  },
  traitData: {
    traitAssets: null,
    oneOfOneEditions: null,
    metadataJson: null,
  },
  inscriptionData: null,
  isLoading: false,
};

const CreationFlowContext = createContext<CreationFlowContextType | undefined>(undefined);

export function CreationFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreationFlowState>(initialState);

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const updateCollectionData = (data: Partial<CollectionData>) => {
    setState(prev => ({
      ...prev,
      collectionData: { ...prev.collectionData, ...data }
    }));
  };

  const updateTraitData = (data: Partial<TraitData>) => {
    setState(prev => ({
      ...prev,
      traitData: { ...prev.traitData, ...data }
    }));
  };

  const updateInscriptionData = (data: Partial<InscriptionData>) => {
    setState(prev => ({
      ...prev,
      inscriptionData: prev.inscriptionData 
        ? { ...prev.inscriptionData, ...data }
        : data as InscriptionData
    }));
  };

  const setIsLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
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
        setIsLoading,
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
    throw new Error('useCreationFlow must be used within a CreationFlowProvider');
  }
  return context;
}