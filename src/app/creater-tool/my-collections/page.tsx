"use client";
import React, { useState } from "react";
import { ArrowRight, Edit, Eye, EyeOff, ArrowLeft } from "lucide-react";
import CreaterLayout from "@/components/layout/createrLayout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Collection {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  status: 'inscribed' | 'inscribing' | 'draft';
  isVisible: boolean;
  claimAmount?: number;
  logo: string;
  inscriptionProgress?: {
    current: number;
    total: number;
    estimatedTime: string;
  };
}

const MyCollectionsPage = () => {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Hemi Bros',
      symbol: 'HEMIBROS',
      chain: 'Hemi',
      status: 'inscribed',
      isVisible: false,
      claimAmount: 0.0012,
      logo: '/api/placeholder/80/80' // Replace with actual pixel art logo
    }
  ]);

  const handleStartCreating = () => {
    router.push('/creater-tool/inscribe');
  };

  const handleLaunch = (collectionId: string) => {
    // Handle launch logic - could navigate to launch configuration
    console.log('Launch collection:', collectionId);
  };

  const handleCustomizePage = (collectionId: string) => {
    // Handle customize page logic
    console.log('Customize page:', collectionId);
  };

  const handleClaimAmount = (collectionId: string) => {
    // Handle claim amount logic
    setCollections(prev => 
      prev.map(col => 
        col.id === collectionId 
          ? { ...col, claimAmount: undefined }
          : col
      )
    );
  };

  const handleBackToCreatorTool = () => {
    router.push('/creater-tool');
  };

  const renderCollectionCard = (collection: Collection) => (
    <div key={collection.id} className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
      <div className="flex items-start gap-4">
        {/* Collection Logo */}
        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {/* Pixel art style logo - replace with actual image */}
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-sm"></div>
          </div>
        </div>

        {/* Collection Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-white">{collection.name}</h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-full"></div>
              <span className="text-sm text-lightSecondary">{collection.chain}</span>
              <div className="flex items-center gap-1">
                {collection.isVisible ? (
                  <Eye size={16} className="text-lightSecondary" />
                ) : (
                  <EyeOff size={16} className="text-lightSecondary" />
                )}
                <span className="text-sm text-lightSecondary">
                  {collection.isVisible ? 'Visible to users' : 'Not visible to users'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {collection.status === 'inscribed' && collection.claimAmount && (
            <div className="bg-successQuaternary border border-succesTertiary rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-successPrimary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Inscribed Successfully!</p>
                    <p className="text-sm text-lightSecondary">
                      Inscription fee was lower than estimated. Claim your unused amount now.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleClaimAmount(collection.id)}
                  className="bg-white text-black hover:bg-gray-200 text-sm"
                >
                  Claim {collection.claimAmount} BTC
                </Button>
              </div>
            </div>
          )}

          {/* Inscribing Status */}
          {collection.status === 'inscribing' && collection.inscriptionProgress && (
            <div className="bg-warningQueternary border border-warningTertiary rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-warningPrimary flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                </div>
                <p className="text-white font-medium">Inscription in Progress</p>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-lightSecondary">
                  {collection.inscriptionProgress.current} / {collection.inscriptionProgress.total}
                </span>
                <span className="text-lightSecondary">
                  ETA: {collection.inscriptionProgress.estimatedTime}
                </span>
              </div>
              <div className="w-full bg-transLight8 rounded-full h-2">
                <div 
                  className="bg-warningPrimary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(collection.inscriptionProgress.current / collection.inscriptionProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleCustomizePage(collection.id)}
              variant="outline"
              className="bg-transparent border-transLight16 text-white hover:bg-transLight8"
            >
              <Edit size={16} className="mr-2" />
              Customize Page
            </Button>
            <Button
              onClick={() => handleLaunch(collection.id)}
              className="bg-white text-black hover:bg-gray-200"
              disabled={collection.status !== 'inscribed'}
            >
              Launch
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CreaterLayout>
      <div className="min-h-screen w-full bg-darkPrimary py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleBackToCreatorTool}
              variant="outline"
              className="bg-transparent border-transLight16 text-lightSecondary hover:text-white hover:bg-transLight8"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              My Collections
            </h1>
          </div>

          {/* Collections Grid */}
          {collections.length > 0 ? (
            <div className="space-y-6 mb-8">
              {collections.map(renderCollectionCard)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lightSecondary mb-6">No collections found</p>
              <Button
                onClick={handleStartCreating}
                className="bg-white text-black hover:bg-gray-200"
              >
                Start Creating
              </Button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-darkSecondary border border-transLight4 rounded-xl p-6">
            <div className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-transLight12">
                  <span className="text-white font-bold text-lg">?</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg font-medium">
                    Learn about launching recursive NFT collection on Mint Park
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <ArrowRight
                  size={24}
                  className="text-lightSecondary transition-all duration-300 group-hover:translate-x-2 group-hover:text-white"
                />
              </div>
            </div>
          </div>

          {/* Create New Collection */}
          {collections.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleStartCreating}
                className="bg-white text-black hover:bg-gray-200"
              >
                Create New Collection
              </Button>
            </div>
          )}
        </div>
      </div>
    </CreaterLayout>
  );
};

export default MyCollectionsPage;