import React from 'react';
import { X } from 'lucide-react';

interface TraitsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraitsUploadModal: React.FC<TraitsUploadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-darkSecondary border border-transLight4 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-transLight4">
          <h2 className="text-xl font-bold text-white">For uploading traits</h2>
          <button 
            onClick={onClose}
            className="text-lightSecondary hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <p className="text-lightSecondary mb-4">
              Ensure you upload a single folder structured by trait categories. 
              Each subfolder should contain images for one trait group like this. 
              Please make sure your trait group names and trait names are correct.
            </p>
          </div>

          <div className="bg-darkTertiary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-lightSecondary rounded flex items-center justify-center">
                <span className="text-xs">📁</span>
              </div>
              <span className="text-white font-medium">Folder to upload</span>
            </div>
            
            <div className="ml-7 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-lightTertiary rounded flex items-center justify-center">
                  <span className="text-xs">📁</span>
                </div>
                <span className="text-lightSecondary">Background</span>
              </div>
              
              <div className="ml-6 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-transLight16 rounded flex items-center justify-center">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <span className="text-lightTertiary text-sm">Galaxy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-transLight16 rounded flex items-center justify-center">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <span className="text-lightTertiary text-sm">Dungeon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-transLight16 rounded flex items-center justify-center">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <span className="text-lightTertiary text-sm">Town</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-lightTertiary rounded flex items-center justify-center">
                  <span className="text-xs">📁</span>
                </div>
                <span className="text-lightSecondary">Eyes</span>
              </div>
              
              <div className="ml-6 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-transLight16 rounded flex items-center justify-center">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <span className="text-lightTertiary text-sm">Blue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-transLight16 rounded flex items-center justify-center">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <span className="text-lightTertiary text-sm">Asian</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-transLight16 rounded flex items-center justify-center">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <span className="text-lightTertiary text-sm">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-lg font-medium transition-colors"
          >
            I understood
          </button>
        </div>
      </div>
    </div>
  );
};