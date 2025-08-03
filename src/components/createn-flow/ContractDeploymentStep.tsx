"use client";
import React, { useState } from 'react';
import { Upload, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreationFlow } from './CreationFlowProvider';
import Image from 'next/image';

export function ContractDeploymentStep() {
  const { collectionData, updateCollectionData, setCurrentStep } = useCreationFlow();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateCollectionData({ logo: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateCollectionData({ logo: null });
    setLogoPreview(null);
  };

  const handlePublishContract = () => {
    // Add validation here
    if (!collectionData.name || !collectionData.symbol || !collectionData.logo) {
      return;
    }
    setCurrentStep(2);
  };

  const isFormValid = collectionData.name && collectionData.symbol && collectionData.logo;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Let&apos;s Upload Your Contract</h1>
        <p className="text-lightSecondary">Enter your collection details to deploy ERC-721 contract.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="text-white font-medium">Collection logo</label>
          
          {logoPreview ? (
            <div className="relative">
              <div className="w-full h-48 bg-darkSecondary border border-transLight4 rounded-xl overflow-hidden">
                <Image
                  src={logoPreview}
                  alt="Collection logo preview"
                  className="w-full h-full object-cover"
                  width={300}
                  height={200}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="p-2 bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-opacity"
                >
                  <Edit size={16} className="text-white" />
                </button>
                <button
                  onClick={handleRemoveLogo}
                  className="p-2 bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-opacity"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById('logo-upload')?.click()}
              className="w-full h-48 border-2 border-dashed border-transLight16 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-transLight24 transition-colors"
            >
              <Upload size={32} className="text-lightSecondary mb-2" />
              <p className="text-lightSecondary font-medium">Click to upload Collection logo</p>
              <p className="text-sm text-lightTertiary mt-1">Supports: JPG, PNG, WEBP, GIF</p>
            </div>
          )}
          
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">Collection name</label>
            <Input
              value={collectionData.name}
              onChange={(e) => updateCollectionData({ name: e.target.value })}
              placeholder="Enter your collection name (Hemi Bros etc.)"
              className="bg-darkSecondary border-transLight8 text-white placeholder:text-lightTertiary"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Token symbol</label>
            <Input
              value={collectionData.symbol}
              onChange={(e) => updateCollectionData({ symbol: e.target.value })}
              placeholder="Enter your token symbol (HEMI etc.)"
              className="bg-darkSecondary border-transLight8 text-white placeholder:text-lightTertiary"
            />
          </div>

          <Button
            onClick={handlePublishContract}
            disabled={!isFormValid}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-transLight8 disabled:text-lightTertiary"
          >
            Publish Contract
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}