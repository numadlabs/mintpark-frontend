"use client";
import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreationFlow } from './CreationFlowProvider';

interface Chain {
  id: string;
  name: string;
  icon: string;
  features: string[];
  isAvailable: boolean;
}

interface ChainSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChainSelectionModal({ isOpen, onClose }: ChainSelectionModalProps) {
  const { updateCollectionData, setCurrentStep } = useCreationFlow();

  const chains: Chain[] = [
    {
      id: 'hemi-mainnet',
      name: 'Hemi Mainnet',
      icon: '⚪', 
      features: [
        'NFTs bridging Bitcoin and Ethereum',
        'Secure with Bitcoin\'s PoP consensus',
        'Handles high transaction volumes',
        'Developer-friendly with hVM and tools'
      ],
      isAvailable: true,
    },
    {
      id: 'core-mainnet',
      name: 'Core Mainnet',
      icon: '⬟', 
      features: [
        'Low fees for minting and trading',
        'High scalability for large projects',
        'Large user base for visibility',
        'EVM-compatible for easy development'
      ],
      isAvailable: true,
    },
    {
      id: 'citrea',
      name: 'Citrea',
      icon: '⬢',
      features: [
        'ZK rollups boost Bitcoin scalability',
        'Inherits Bitcoin\'s robust security',
        'Lowers fees with off-chain processing',
        'EVM compatibility eases development'
      ],
      isAvailable: false,
    },
  ];

  const handleChainSelect = (chainId: string) => {
    // updateCollectionData({ selectedChain: chainId });
       // Use layerId instead of selectedChain
    // updateCollectionData({ layerId: chainId });
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-darkPrimary border border-transLight4 rounded-2xl p-8 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Choose a Chain to Create a Collection</h2>
          <button
            onClick={onClose}
            className="text-lightSecondary hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chains.map((chain) => (
            <div
              key={chain.id}
              className={`
                bg-darkSecondary border border-transLight4 rounded-xl p-6 h-full
                ${chain.isAvailable ? 'cursor-pointer hover:border-transLight16' : 'opacity-50'}
              `}
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-transLight8 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">{chain.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{chain.name}</h3>
              </div>

              <div className="space-y-3 mb-6">
                {chain.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check size={16} className="text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-lightSecondary">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleChainSelect(chain.id)}
                disabled={!chain.isAvailable}
                className={`
                  w-full
                  ${chain.isAvailable
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-transLight8 text-lightSecondary cursor-not-allowed'
                  }
                `}
              >
                {chain.isAvailable ? 'Choose' : 'Coming Soon'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}