"use client";
import React, { useState, useEffect } from 'react';
import { Copy, Upload, Settings, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreationFlow } from './CreationFlowProvider';
import { useRouter } from 'next/navigation';

interface InscriptionStepProps {
  onComplete?: () => void;
}

export function InscriptionStep({ onComplete }: InscriptionStepProps) {
  const { inscriptionData, updateInscriptionData } = useCreationFlow();
  const [currentView, setCurrentView] = useState<'payment' | 'uploading' | 'progress' | 'complete'>('payment');
  const [discordUsername, setDiscordUsername] = useState('');
  const router = useRouter();

  const mockFees = {
    inscription: 0.013,
    network: 0.0022,
    service: 0.0001,
    total: 0.0153
  };

  const mockProgress = {
    current: 12,
    total: 2000,
    estimatedTime: '1d 12h 20m'
  };

  useEffect(() => {
    if (!inscriptionData) {
      updateInscriptionData({
        orderId: '557b9526-3688-4587-a855-9d1c75ddf0e4',
        walletAddress: 'bc1p...mhw6',
        fees: mockFees,
        progress: mockProgress
      });
    }
  }, [inscriptionData, updateInscriptionData]);

  const handleCheckPayment = () => {
    setCurrentView('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setCurrentView('progress');
    }, 3000);
  };

  const handleGoToCollections = () => {
    router.push('/creater-tool/my-collections');
  };

  const handleCustomizeCollection = () => {
    // Navigate to customize page
    console.log('Navigate to customize collection');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (currentView === 'payment') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pay Inscription Fee</h1>
          <p className="text-lightSecondary">
            Submit the required fee to start the inscription process, ensuring your NFT assets are securely recorded on the blockchain.
          </p>
        </div>

        <div className="space-y-8">
          {/* QR Code Section */}
          <div className="text-center">
            <p className="text-lightSecondary mb-4">Scan the QR code with your wallet to pay</p>
            <div className="w-48 h-48 bg-white mx-auto rounded-xl flex items-center justify-center">
              {/* Replace with actual QR code */}
              <div className="w-40 h-40 bg-black flex items-center justify-center text-xs">
                QR Code
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex items-center justify-between bg-darkSecondary border border-transLight4 rounded-xl p-4">
            <div className="flex justify-between items-center w-full">
              <p className="text-lightSecondary text-sm mb-1">Wallet Address</p>
              <p className="text-white font-medium">{inscriptionData?.walletAddress}</p>
            </div>
            <button
              onClick={() => copyToClipboard(inscriptionData?.walletAddress || '')}
              className="p-2 text-lightSecondary hover:text-white transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Inscription Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">0.013 BTC</span>
                  <span className="text-lightSecondary text-sm ml-2">~$4,104</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Network Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">0.0022 BTC</span>
                  <span className="text-lightSecondary text-sm ml-2">~$139</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lightSecondary">Service Fee</span>
                <div className="text-right">
                  <span className="text-white font-medium">0.0001 BTC</span>
                  <span className="text-lightSecondary text-sm ml-2">~$32</span>
                </div>
              </div>
              
              <div className="border-t border-transLight8 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-white font-semibold">0.0153 BTC</span>
                    <span className="text-lightSecondary text-sm ml-2">~$4,275</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warningQueternary border border-warningTertiary rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-warningPrimary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-bold">i</span>
              </div>
              <p className="text-sm text-lightSecondary">
                This is an estimated fee and may be insufficient during inscribing or exceed the final cost. 
                You can claim any excess amount if applicable.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCheckPayment}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            Check Payment
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'uploading') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-transLight8 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Upload size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Uploading Trait Assets</h1>
          <p className="text-lightSecondary max-w-md mx-auto">
            Your trait assets are being uploaded to a critical storage system. This essential step is required to proceed with inscription.
          </p>
        </div>

        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lightSecondary">Uploading process</span>
            <span className="text-white font-medium">892 / 2,000</span>
          </div>
          
          <div className="w-full bg-transLight8 rounded-full h-2 mb-6">
            <div className="bg-white h-2 rounded-full" style={{ width: '44.6%' }}></div>
          </div>

          <div className="bg-warningQueternary border border-warningTertiary rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-warningPrimary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-bold">!</span>
              </div>
              <div className="text-left">
                <p className="text-white font-medium mb-1">Please do not close or refresh tab</p>
                <p className="text-sm text-lightSecondary">
                  Do not close or refresh the tab. Doing so will require you to upload your assets again from the start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'progress') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Inscription Progress</h1>
        </div>

        {/* Order ID */}
        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lightSecondary text-sm mb-1">Order ID</p>
              <p className="text-white font-medium">{inscriptionData?.orderId}</p>
            </div>
            <button
              onClick={() => copyToClipboard(inscriptionData?.orderId || '')}
              className="p-2 text-lightSecondary hover:text-white transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings size={24} className="text-white" />
            <h3 className="text-lg font-semibold text-white">Inscription Progress</h3>
          </div>
          
          <p className="text-lightSecondary mb-6">
            Track the real-time status of your Ordinal inscriptions as we record your assets on Bitcoin.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-lightSecondary text-sm mb-1">Progress</p>
              <p className="text-white font-medium">{mockProgress.current} / {mockProgress.total}</p>
            </div>
            <div>
              <p className="text-lightSecondary text-sm mb-1">Estimated remaining time</p>
              <p className="text-white font-medium">{mockProgress.estimatedTime}</p>
            </div>
          </div>
        </div>

        {/* Discord Section */}
        <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">Join Our Discord</h3>
          <p className="text-lightSecondary mb-4">
            To receive the fastest and hands-on support, enter your Discord Username and join our server. 
            We will create a private channel for your project.
          </p>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-lightSecondary">@</span>
              </div>
              <Input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="username#1234"
                className="pl-8 bg-darkTertiary border-transLight8 text-white placeholder:text-lightTertiary"
              />
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-transLight16 text-white hover:bg-transLight8"
            >
              Invite me
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleCustomizeCollection}
            variant="outline"
            className="flex-1 bg-transparent border-transLight16 text-white hover:bg-transLight8"
          >
            <Edit size={16} className="mr-2" />
            Customize Collection
          </Button>
          <Button
            onClick={handleGoToCollections}
            className="flex-1 bg-white text-black hover:bg-gray-200"
          >
            Go to My Collections →
          </Button>
        </div>
      </div>
    );
  }

  return null;
}