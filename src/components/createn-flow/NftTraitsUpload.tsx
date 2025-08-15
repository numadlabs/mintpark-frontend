
import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  FileText,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import { useCreationFlow } from "./CreationFlowProvider";

// Extend HTMLInputElement to include webkitdirectory
declare module "react" {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface TraitImage {
  file: File;
  name: string;
  preview: string;
}

interface TraitData {
  name: string;
  zIndex: number;
  images: TraitImage[];
}

interface TraitsState {
  [traitType: string]: TraitData;
}

// Extend the File interface to include webkitRelativePath
interface FileWithPath extends File {
  webkitRelativePath: string;
}

const NFTTraitsUpload: React.FC = () => {
  const [traits, setTraits] = useState<TraitsState>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get CreationFlow context
  const { traitData, updateTraitData } = useCreationFlow();

  // Function to normalize trait names for better matching
  const normalizeTraitName = (traitName: string): string => {
    return traitName
      .toLowerCase()
      .replace(/s$/, "") // Remove trailing 's' (backgrounds -> background)
      .replace(/[^a-z0-9]/g, ""); // Remove special characters
  };

  // Function to get dynamic z-index based on metadata - fully dynamic, no getDefaultZIndex
  const getDynamicZIndex = (
    traitType: string,
    traitOrderMap: { [key: string]: number }
  ): number => {
    const normalizedFolderName = normalizeTraitName(traitType);

    console.log(
      `Matching trait: ${traitType} (normalized: ${normalizedFolderName})`
    );
    console.log("Available traits in metadata:", Object.keys(traitOrderMap));

    // Check for normalized matches
    for (const [metadataTraitType, index] of Object.entries(traitOrderMap)) {
      const normalizedMetadataName = normalizeTraitName(metadataTraitType);

      console.log(
        `Comparing ${normalizedFolderName} with ${normalizedMetadataName} (index: ${index})`
      );

      if (normalizedFolderName === normalizedMetadataName) {
        console.log(`✓ Match found: ${traitType} -> index ${index}`);
        return index;
      }
    }

    // Check for partial matches (contains)
    for (const [metadataTraitType, index] of Object.entries(traitOrderMap)) {
      const normalizedMetadataName = normalizeTraitName(metadataTraitType);

      if (
        normalizedFolderName.includes(normalizedMetadataName) ||
        normalizedMetadataName.includes(normalizedFolderName)
      ) {
        console.log(`✓ Partial match found: ${traitType} -> index ${index}`);
        return index;
      }
    }

    // If no metadata match found, assign next available index
    if (Object.keys(traitOrderMap).length > 0) {
      const maxIndex = Math.max(...Object.values(traitOrderMap));
      const newIndex = maxIndex + 1;
      console.log(
        `⚠ No match found for ${traitType}, assigning next index: ${newIndex}`
      );
      return newIndex;
    }

    // Complete fallback - return 0
    console.log(`⚠ No metadata available, assigning index 0 to ${traitType}`);
    return 0;
  };

  // Function to parse metadata and extract trait order with better name normalization
  const parseMetadataForTraitOrder = async (
    jsonFile: File
  ): Promise<{ [key: string]: number }> => {
    try {
      const jsonText = await jsonFile.text();
      const metadata = JSON.parse(jsonText);
      const traitOrderMap: { [key: string]: number } = {};

      console.log("Parsing metadata for trait order...");

      // Check if it's a collection metadata with items array
      if (metadata.collection && Array.isArray(metadata.collection)) {
        // Use the first item to determine trait order
        const firstItem = metadata.collection[0];
        if (
          firstItem &&
          firstItem.attributes &&
          Array.isArray(firstItem.attributes)
        ) {
          firstItem.attributes.forEach((attr: any, index: number) => {
            if (attr.trait_type) {
              const normalizedName = normalizeTraitName(attr.trait_type);
              traitOrderMap[attr.trait_type] = index; // Store original name as key
              console.log(
                `Found trait: ${attr.trait_type} (normalized: ${normalizedName}) -> index ${index}`
              );
            }
          });
        }
      }
      // Check if it's a direct items array
      else if (Array.isArray(metadata)) {
        const firstItem = metadata[0];
        if (
          firstItem &&
          firstItem.attributes &&
          Array.isArray(firstItem.attributes)
        ) {
          firstItem.attributes.forEach((attr: any, index: number) => {
            if (attr.trait_type) {
              const normalizedName = normalizeTraitName(attr.trait_type);
              traitOrderMap[attr.trait_type] = index;
              console.log(
                `Found trait: ${attr.trait_type} (normalized: ${normalizedName}) -> index ${index}`
              );
            }
          });
        }
      }
      // Check for items property
      else if (metadata.items && Array.isArray(metadata.items)) {
        const firstItem = metadata.items[0];
        if (
          firstItem &&
          firstItem.attributes &&
          Array.isArray(firstItem.attributes)
        ) {
          firstItem.attributes.forEach((attr: any, index: number) => {
            if (attr.trait_type) {
              const normalizedName = normalizeTraitName(attr.trait_type);
              traitOrderMap[attr.trait_type] = index;
              console.log(
                `Found trait: ${attr.trait_type} (normalized: ${normalizedName}) -> index ${index}`
              );
            }
          });
        }
      }

      console.log("Final trait order map:", traitOrderMap);
      return traitOrderMap;
    } catch (error) {
      console.error("Error parsing metadata for trait order:", error);
      return {};
    }
  };

  // Dynamic function to replace getDefaultZIndex - gets z-index from metadata or defaults to 0
  const getZIndexForTrait = async (
    traitType: string,
    traitOrderMap?: { [key: string]: number }
  ): Promise<number> => {
    // If traitOrderMap is provided, use it directly
    if (traitOrderMap && Object.keys(traitOrderMap).length > 0) {
      return getDynamicZIndex(traitType, traitOrderMap);
    }

    // If no traitOrderMap provided, try to get from metadata
    if (traitData.metadataJson && traitData.metadataJson instanceof File) {
      try {
        const orderMap = await parseMetadataForTraitOrder(
          traitData.metadataJson
        );
        if (Object.keys(orderMap).length > 0) {
          return getDynamicZIndex(traitType, orderMap);
        }
      } catch (error) {
        console.error("Error parsing metadata for z-index:", error);
      }
    }

    // Default fallback - return 0 instead of calling getDefaultZIndex
    return 0;
  };

  // Function to create a virtual File object for the folder with all files
  const createVirtualFolderFile = (
    files: FileList,
    folderName: string
  ): File => {
    const virtualFile = new File([], folderName, { type: "folder" });
    (virtualFile as any).fileList = files;
    (virtualFile as any).traitsData = traits; // Include parsed traits data
    return virtualFile;
  };

  // Handle folder upload with proper error handling and dynamic z-index
  const handleFolderUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    console.log("Processing", files.length, "files");

    // Get trait order from metadata if available
    let traitOrderMap: { [key: string]: number } = {};
    if (traitData.metadataJson && traitData.metadataJson instanceof File) {
      traitOrderMap = await parseMetadataForTraitOrder(traitData.metadataJson);
    }

    // Merge with existing traits instead of replacing
    setTraits((prevTraits) => {
      const traitsData: TraitsState = { ...prevTraits };
      const fileArray = Array.from(files) as FileWithPath[];

      fileArray.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const pathParts = file.webkitRelativePath.split("/");
        console.log("Processing file:", file.name, "Path parts:", pathParts);

        if (pathParts.length >= 2) {
          // Handle different folder structures
          let traitType: string;

          if (pathParts.length === 2) {
            // Direct structure: traitType/image.png
            traitType = pathParts[0];
          } else if (pathParts.length >= 3 && pathParts[0] === "traits") {
            // Nested structure: traits/traitType/image.png
            traitType = pathParts[1];
          } else {
            // Fallback: use parent folder
            traitType = pathParts[pathParts.length - 2];
          }

          const fileName = pathParts[pathParts.length - 1];

          if (!traitsData[traitType]) {
            // Use fully dynamic z-index based on metadata - no getDefaultZIndex
            const dynamicZIndex =
              Object.keys(traitOrderMap).length > 0
                ? getDynamicZIndex(traitType, traitOrderMap)
                : 0; // Start from 0 if no metadata

            traitsData[traitType] = {
              name: traitType,
              zIndex: dynamicZIndex,
              images: [],
            };
          }

          // Check if this image already exists to avoid duplicates
          const imageExists = traitsData[traitType].images.some(
            (img) => img.name === fileName.replace(/\.[^/.]+$/, "")
          );

          if (!imageExists) {
            traitsData[traitType].images.push({
              file,
              name: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
              preview: URL.createObjectURL(file),
            });
          }
        }
      });

      console.log("Final traits data with dynamic z-index:", traitsData);
      console.log("Trait types found:", Object.keys(traitsData));

      // Update CreationFlow context with the file data
      const folderName =
        fileArray[0]?.webkitRelativePath.split("/")[0] || "traits";
      const virtualFile = createVirtualFolderFile(files, folderName);
      updateTraitData({ traitAssets: virtualFile });

      return traitsData;
    });

    setUploadStatus("");
  };

  // Re-process traits when metadata JSON is updated
  useEffect(() => {
    const reprocessTraitsWithMetadata = async () => {
      if (
        traitData.metadataJson &&
        traitData.metadataJson instanceof File &&
        Object.keys(traits).length > 0
      ) {
        console.log("Reprocessing traits with updated metadata...");

        const traitOrderMap = await parseMetadataForTraitOrder(
          traitData.metadataJson
        );

        if (Object.keys(traitOrderMap).length > 0) {
          setTraits((prevTraits) => {
            const updatedTraits = { ...prevTraits };

            Object.keys(updatedTraits).forEach((traitType) => {
              const newZIndex = getDynamicZIndex(traitType, traitOrderMap);
              updatedTraits[traitType] = {
                ...updatedTraits[traitType],
                zIndex: newZIndex,
              };
            });

            console.log("Updated traits with metadata z-index:", updatedTraits);
            return updatedTraits;
          });
        }
      }
    };

    reprocessTraitsWithMetadata();
  }, [traitData.metadataJson]);

  // Update CreationFlow context when traits change (for z-index updates)
  useEffect(() => {
    if (Object.keys(traits).length > 0 && traitData.traitAssets) {
      const fileList = (traitData.traitAssets as any).fileList as FileList;
      if (fileList) {
        const folderName = traitData.traitAssets.name;
        const updatedVirtualFile = createVirtualFolderFile(
          fileList,
          folderName
        );
        updateTraitData({ traitAssets: updatedVirtualFile });
      }
    }
  }, [traits]);

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    handleFolderUpload(files);
  };

  // Update trait z-index
  const updateTraitZIndex = (traitType: string, zIndex: string): void => {
    setTraits((prev) => ({
      ...prev,
      [traitType]: {
        ...prev[traitType],
        zIndex: parseInt(zIndex) || 0,
      },
    }));
  };

  // Remove trait
  const removeTrait = (traitType: string): void => {
    setTraits((prev) => {
      const newTraits = { ...prev };
      // Clean up object URLs to prevent memory leaks
      newTraits[traitType].images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
      delete newTraits[traitType];
      return newTraits;
    });
  };

  // Calculate total images count
  const getTotalImagesCount = (): number => {
    return Object.values(traits).reduce(
      (acc, trait) => acc + trait.images.length,
      0
    );
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Clear all traits
  const clearAllTraits = () => {
    // Clean up all object URLs
    Object.values(traits).forEach((trait) => {
      trait.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    });
    setTraits({});
    updateTraitData({ traitAssets: null });
  };

  return (
    <div className="max-w-6xl mx-auto bg-transDark4 text-white">
      {/* Upload Area */}
      <div
        onClick={handleFileInputClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-transLight4 bg-transLight2"
            : "border-transLight24 hover:border-transLight72"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          webkitdirectory=""
          directory=""
          onChange={(e) => handleFolderUpload(e.target.files)}
          className="hidden"
        />
        <div className="space-y-2">
          <Folder size={48} className="text-gray-400 mx-auto" />
          {isDragActive ? (
            <p className="text-white font-medium">
              Drop the traits folder here...
            </p>
          ) : (
            <div>
              <p className="text-white font-medium">
                Click to select or drag and drop your traits folder
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Upload multiple trait folders or a main traits folder with
                subfolders
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clear All Button */}
      {Object.keys(traits).length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            You can upload additional trait folders to add more trait types
          </p>
          <button
            onClick={clearAllTraits}
            className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
          >
            <Trash2 size={16} />
            Clear All Traits
          </button>
        </div>
      )}

      {/* Traits Preview */}
      {Object.keys(traits).length > 0 && (
        <div className="space-y-6 mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Uploaded Traits ({Object.keys(traits).length} types,{" "}
            {getTotalImagesCount()} total images)
          </h2>

          <div className="grid gap-6">
            {Object.entries(traits)
              .sort(([, a], [, b]) => a.zIndex - b.zIndex) // Sort by z-index
              .map(([traitType, traitData]) => (
                <div
                  key={traitType}
                  className="bg-transLight2 border border-transLight4 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white capitalize">
                      {traitType} ({traitData.images.length} images)
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => removeTrait(traitType)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {traitData.images.map((image, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 rounded border border-gray-600 p-2"
                      >
                        <Image
                          src={image.preview}
                          alt={image.name}
                          width={80}
                          height={80}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                        <p
                          className="text-xs text-gray-300 truncate"
                          title={image.name}
                        >
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-transLight4 border border-transLight24 rounded-lg p-4">
        <h3 className="font-medium text-lightPrimary mb-2 flex items-center gap-2">
          <HelpCircle size={16} />
          Instructions:
        </h3>
        <ul className="text-sm text-lightPrimary space-y-1">
          <li>
            • Create a main traits folder with subfolders for each trait type
          </li>
          <li>
            • Each trait type folder should contain all images for that trait
          </li>
          <li>• Supported formats: PNG, JPG, JPEG, GIF, SVG</li>
          <li>
            • Z-index values are automatically set from metadata JSON (0 = back,
            higher = front)
          </li>
          <li>• Upload metadata JSON first for automatic z-index assignment</li>
          <li>
            • Example structure: traits/background/, traits/hair/,
            traits/accessories/
          </li>
        </ul>
      </div>

      {/* Help Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Upload Help</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>To upload your NFT traits:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Organize images in folders by trait category</li>
                <li>Use clear, descriptive folder names</li>
                <li>Ensure all images are high quality</li>
                <li>
                  Common categories: background, body, clothing, accessories,
                  eyes, hair
                </li>
                <li>Upload metadata JSON for automatic z-index ordering</li>
              </ul>
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTTraitsUpload;
