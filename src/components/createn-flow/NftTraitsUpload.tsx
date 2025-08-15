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

  // FIXED: Improved getDynamicZIndex function
  const getDynamicZIndex = (
    traitType: string,
    traitOrderMap: { [key: string]: number }
  ): number => {
    const normalizedFolderName = normalizeTraitName(traitType);

    console.log(
      `Matching trait: ${traitType} (normalized: ${normalizedFolderName})`
    );
    console.log("Available traits in metadata:", Object.keys(traitOrderMap));

    // Check for exact matches first
    for (const [metadataTraitType, index] of Object.entries(traitOrderMap)) {
      const normalizedMetadataName = normalizeTraitName(metadataTraitType);

      console.log(
        `Comparing ${normalizedFolderName} with ${normalizedMetadataName} (index: ${index})`
      );

      if (normalizedFolderName === normalizedMetadataName) {
        console.log(`✓ Exact match found: ${traitType} -> index ${index}`);
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

    // If no metadata match found, assign based on existing traits count
    // This ensures new traits get higher z-index values
    const existingIndices = Object.values(traitOrderMap);
    const maxMetadataIndex = existingIndices.length > 0 ? Math.max(...existingIndices) : -1;
    const newIndex = maxMetadataIndex + 1;
    
    console.log(
      `⚠ No match found for ${traitType}, assigning next available index: ${newIndex}`
    );
    return newIndex;
  };

  // IMPROVED: Better error handling and validation
  const parseMetadataForTraitOrder = async (
    jsonFile: File
  ): Promise<{ [key: string]: number }> => {
    try {
      const jsonText = await jsonFile.text();
      
      if (!jsonText.trim()) {
        console.warn("Empty JSON file");
        return {};
      }

      const metadata = JSON.parse(jsonText);
      const traitOrderMap: { [key: string]: number } = {};

      console.log("Parsing metadata for trait order...");
      console.log("Metadata structure:", metadata);

      // Find attributes source from different possible structures
      let attributesSource: any[] | null = null;

      // Check different metadata structures
      if (metadata.collection && Array.isArray(metadata.collection) && metadata.collection[0]?.attributes) {
        attributesSource = metadata.collection[0].attributes;
        console.log("Found attributes in metadata.collection[0]");
      } else if (Array.isArray(metadata) && metadata[0]?.attributes) {
        attributesSource = metadata[0].attributes;
        console.log("Found attributes in metadata[0]");
      } else if (metadata.items && Array.isArray(metadata.items) && metadata.items[0]?.attributes) {
        attributesSource = metadata.items[0].attributes;
        console.log("Found attributes in metadata.items[0]");
      } else if (metadata.attributes && Array.isArray(metadata.attributes)) {
        attributesSource = metadata.attributes;
        console.log("Found attributes in metadata.attributes");
      }

      if (attributesSource && Array.isArray(attributesSource)) {
        console.log("Processing attributes:", attributesSource);
        attributesSource.forEach((attr: any, index: number) => {
          if (attr.trait_type && typeof attr.trait_type === 'string') {
            traitOrderMap[attr.trait_type] = index;
            console.log(`Found trait: ${attr.trait_type} -> index ${index}`);
          }
        });
      } else {
        console.warn("No valid attributes array found in metadata structure");
        console.log("Available keys in metadata:", Object.keys(metadata));
      }

      console.log("Final trait order map:", traitOrderMap);
      return traitOrderMap;
    } catch (error) {
      console.error("Error parsing metadata for trait order:", error);
      return {};
    }
  };

  // Function to create a virtual File object for the folder with all files
  const createVirtualFolderFile = (
    files: FileList,
    folderName: string
  ): File => {
    const virtualFile = new File([], folderName, { type: "folder" });
    (virtualFile as any).fileList = files;
    (virtualFile as any).traitsData = traits;
    return virtualFile;
  };

  // IMPROVED: Better error handling and async processing
  const handleFolderUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    console.log("Processing", files.length, "files");
    setUploading(true);
    setUploadStatus("Processing files...");

    try {
      // Get trait order from metadata if available
      let traitOrderMap: { [key: string]: number } = {};
      if (traitData.metadataJson && traitData.metadataJson instanceof File) {
        try {
          setUploadStatus("Parsing metadata...");
          traitOrderMap = await parseMetadataForTraitOrder(traitData.metadataJson);
          console.log("Parsed trait order map:", traitOrderMap);
        } catch (error) {
          console.error("Error parsing metadata, continuing without it:", error);
          // Continue without metadata
        }
      }

      setUploadStatus("Processing trait images...");

      // FIXED: Process files in a more controlled way
      const newTraits: TraitsState = { ...traits };
      const fileArray = Array.from(files) as FileWithPath[];
      const processedTraitTypes = new Set<string>();

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

          // Initialize trait type if not exists
          if (!newTraits[traitType]) {
            const dynamicZIndex = Object.keys(traitOrderMap).length > 0
              ? getDynamicZIndex(traitType, traitOrderMap)
              : processedTraitTypes.size; // Use processed count as fallback

            console.log(`Assigning z-index ${dynamicZIndex} to trait type: ${traitType}`);

            newTraits[traitType] = {
              name: traitType,
              zIndex: dynamicZIndex,
              images: [],
            };
            
            processedTraitTypes.add(traitType);
          }

          // Check if this image already exists to avoid duplicates
          const imageExists = newTraits[traitType].images.some(
            (img) => img.name === fileName.replace(/\.[^/.]+$/, "")
          );

          if (!imageExists) {
            newTraits[traitType].images.push({
              file,
              name: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
              preview: URL.createObjectURL(file),
            });
          }
        }
      });

      console.log("Final traits data with dynamic z-index:", newTraits);
      console.log("Trait types found:", Object.keys(newTraits).map(key => `${newTraits[key].zIndex}: "${key}"`));

      // Update state with new traits
      setTraits(newTraits);

      // Update CreationFlow context with the file data
      const folderName = fileArray[0]?.webkitRelativePath.split("/")[0] || "traits";
      const virtualFile = createVirtualFolderFile(files, folderName);
      updateTraitData({ traitAssets: virtualFile });

      setUploadStatus("Upload completed successfully!");
      setTimeout(() => setUploadStatus(""), 3000);

    } catch (error) {
      console.error("Error during file upload:", error);
      setUploadStatus("Error processing files");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setUploading(false);
    }
  };

  // IMPROVED: Re-process traits when metadata JSON is updated with better error handling
  useEffect(() => {
    const reprocessTraitsWithMetadata = async () => {
      if (
        traitData.metadataJson &&
        traitData.metadataJson instanceof File &&
        Object.keys(traits).length > 0
      ) {
        console.log("Reprocessing traits with updated metadata...");

        try {
          const traitOrderMap = await parseMetadataForTraitOrder(
            traitData.metadataJson
          );

          if (Object.keys(traitOrderMap).length > 0) {
            setTraits((prevTraits) => {
              const updatedTraits = { ...prevTraits };

              Object.keys(updatedTraits).forEach((traitType) => {
                const newZIndex = getDynamicZIndex(traitType, traitOrderMap);
                console.log(`Updating ${traitType} z-index from ${updatedTraits[traitType].zIndex} to ${newZIndex}`);
                updatedTraits[traitType] = {
                  ...updatedTraits[traitType],
                  zIndex: newZIndex,
                };
              });

              console.log("Updated traits with metadata z-index:", updatedTraits);
              console.log("Updated trait types:", Object.keys(updatedTraits).map(key => `${updatedTraits[key].zIndex}: "${key}"`));
              return updatedTraits;
            });
          }
        } catch (error) {
          console.error("Error reprocessing traits with metadata:", error);
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup all object URLs on component unmount
      Object.values(traits).forEach((trait) => {
        trait.images.forEach((image) => {
          if (image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
      });
    };
  }, []);

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
    const parsedZIndex = parseInt(zIndex);
    if (isNaN(parsedZIndex)) return;

    setTraits((prev) => ({
      ...prev,
      [traitType]: {
        ...prev[traitType],
        zIndex: parsedZIndex,
      },
    }));
  };

  // IMPROVED: Better cleanup in removeTrait
  const removeTrait = (traitType: string): void => {
    setTraits((prev) => {
      const newTraits = { ...prev };
      
      // Clean up object URLs to prevent memory leaks
      if (newTraits[traitType]?.images) {
        newTraits[traitType].images.forEach((image) => {
          if (image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
      
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

  // IMPROVED: Better cleanup in clearAllTraits
  const clearAllTraits = () => {
    // Clean up all object URLs
    Object.values(traits).forEach((trait) => {
      trait.images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
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
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          webkitdirectory=""
          directory=""
          onChange={(e) => handleFolderUpload(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        <div className="space-y-2">
          <Folder size={48} className="text-gray-400 mx-auto" />
          {uploading ? (
            <div>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-white font-medium">Processing...</p>
              {uploadStatus && (
                <p className="text-sm text-gray-400 mt-1">{uploadStatus}</p>
              )}
            </div>
          ) : isDragActive ? (
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

      {/* Upload Status */}
      {uploadStatus && !uploading && (
        <div className={`mb-4 p-3 rounded-lg ${
          uploadStatus.includes("Error") || uploadStatus.includes("⚠")
            ? "bg-red-900/20 border border-red-500/30 text-red-300"
            : "bg-green-900/20 border border-green-500/30 text-green-300"
        }`}>
          <p className="text-sm">{uploadStatus}</p>
        </div>
      )}

      {/* Clear All Button */}
      {Object.keys(traits).length > 0 && !uploading && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            You can upload additional trait folders to add more trait types
          </p>
          <button
            onClick={clearAllTraits}
            className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors"
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
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-white capitalize">
                        {traitType} ({traitData.images.length} images)
                      </h3>
                      <span className="text-xs bg-transLight8 text-lightTertiary px-2 py-1 rounded-full">
                        z-index: {traitData.zIndex}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400">Z-Index:</label>
                        <input
                          type="number"
                          value={traitData.zIndex}
                          onChange={(e) => updateTraitZIndex(traitType, e.target.value)}
                          className="w-16 px-2 py-1 text-xs bg-transLight8 border border-transLight16 rounded text-white"
                          min="0"
                        />
                      </div>
                      <button
                        onClick={() => removeTrait(traitType)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors"
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
          <li>• You can manually adjust z-index values using the input fields</li>
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
                <li>Z-index determines layering order (0=back, higher=front)</li>
              </ul>
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition-colors"
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