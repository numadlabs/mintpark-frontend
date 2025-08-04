"use client";
import React, { useState } from 'react';
import { Folder, FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreationFlow } from './CreationFlowProvider';
import Toggle from "@/components/ui/toggle";
// import Toggle, { toggle } from '@/components/ui/toggle';

export function TraitsUploadStep() {
  const { traitData, updateTraitData, setCurrentStep } = useCreationFlow();
  const [isChecked, setIsChecked] = useState(false);

  const handleFileUpload = (type: 'traitAssets' | 'oneOfOneEditions' | 'metadataJson') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      updateTraitData({ [type]: file });
    }
  };

  const toggleOneOfOne = () =>{
    setIsChecked(!isChecked);
  }

  const handleRemoveFile = (type: 'traitAssets' | 'oneOfOneEditions' | 'metadataJson') => {
    updateTraitData({ [type]: null });
  };

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const isFormValid = traitData.traitAssets && traitData.metadataJson && 
    (!toggleOneOfOne || traitData.oneOfOneEditions);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Collection Assets</h1>
        <p className="text-lightSecondary">
          Upload trait groups, one-of-one editions (if any), and your metadata JSON.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload trait assets */}
        <div>
          <label className="block text-white font-medium mb-4">Upload trait assets</label>
          
          {traitData.traitAssets ? (
            <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder size={24} className="text-white" />
                <span className="text-white font-medium">{traitData.traitAssets.name}</span>
              </div>
              <button
                onClick={() => handleRemoveFile('traitAssets')}
                className="p-2 text-lightSecondary hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById('trait-assets-upload')?.click()}
              className="border-2 border-dashed border-transLight16 rounded-xl p-8 text-center cursor-pointer hover:border-transLight24 transition-colors"
            >
              <Folder size={32} className="text-lightSecondary mx-auto mb-2" />
              <p className="text-white font-medium">Click to upload Trait assets</p>
              <p className="text-sm text-lightTertiary mt-1">Upload the folder containing trait group assets</p>
            </div>
          )}
          
          <input
            id="trait-assets-upload"
            type="file"
            accept=".zip,.rar"
            onChange={handleFileUpload('traitAssets')}
            className="hidden"
          />
        </div>

        {/* One of one editions toggle */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">One of one editions</span>
            <div className="w-4 h-4 rounded-full bg-lightTertiary flex items-center justify-center text-xs text-white">
              ?
            </div>
          </div>
            <Toggle isChecked={isChecked} onChange={toggleOneOfOne} />
        </div>

        {/* One of one editions upload */}
        {isChecked && (
          <div>
            {traitData.oneOfOneEditions ? (
              <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder size={24} className="text-white" />
                  <span className="text-white font-medium">{traitData.oneOfOneEditions.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile('oneOfOneEditions')}
                  className="p-2 text-lightSecondary hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById('one-of-one-upload')?.click()}
                className="border-2 border-dashed border-transLight16 rounded-xl p-8 text-center cursor-pointer hover:border-transLight24 transition-colors"
              >
                <Folder size={32} className="text-lightSecondary mx-auto mb-2" />
                <p className="text-white font-medium">Hemi Bros One of One Editions</p>
              </div>
            )}
            
            <input
              id="one-of-one-upload"
              type="file"
              accept=".zip,.rar"
              onChange={handleFileUpload('oneOfOneEditions')}
              className="hidden"
            />
          </div>
        )}

        {/* Metadata JSON */}
        <div>
          <label className="block text-white font-medium mb-4">Metadata JSON</label>
          
          {traitData.metadataJson ? (
            <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-white" />
                <span className="text-white font-medium">{traitData.metadataJson.name}</span>
              </div>
              <button
                onClick={() => handleRemoveFile('metadataJson')}
                className="p-2 text-lightSecondary hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById('metadata-upload')?.click()}
              className="border-2 border-dashed border-transLight16 rounded-xl p-8 text-center cursor-pointer hover:border-transLight24 transition-colors"
            >
              <FileText size={32} className="text-lightSecondary mx-auto mb-2" />
              <p className="text-white font-medium">Click to upload JSON file</p>
              <p className="text-sm text-lightTertiary mt-1">Provide the metadata file with trait and edition data</p>
            </div>
          )}
          
          <input
            id="metadata-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload('metadataJson')}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
          className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-transLight8 disabled:text-lightTertiary"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}