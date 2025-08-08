// import React, { useState, useRef } from "react";
// import {
//   Folder,
//   FileText,
//   Trash2,
//   AlertCircle,
//   HelpCircle,
// } from "lucide-react";
// import Image from "next/image";


// // Extend HTMLInputElement to include webkitdirectory
// declare module "react" {
//   interface InputHTMLAttributes<T> {
//     webkitdirectory?: string;
//     directory?: string;
//   }
// }

// interface TraitImage {
//   file: File;
//   name: string;
//   preview: string;
// }

// interface TraitData {
//   name: string;
//   zIndex: number;
//   images: TraitImage[];
// }

// interface TraitsState {
//   [traitType: string]: TraitData;
// }

// // Extend the File interface to include webkitRelativePath
// interface FileWithPath extends File {
//   webkitRelativePath: string;
// }

// const NFTTraitsUpload: React.FC = () => {
//   const [traits, setTraits] = useState<TraitsState>({});
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [uploadStatus, setUploadStatus] = useState<string>("");
//   const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
//   const [isDragActive, setIsDragActive] = useState<boolean>(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Handle folder upload with proper error handling
//   const handleFolderUpload = (files: FileList | null) => {
//     if (!files || files.length === 0) return;

//     // Merge with existing traits instead of replacing
//     setTraits((prevTraits) => {
//       const traitsData: TraitsState = { ...prevTraits };
//       const fileArray = Array.from(files) as FileWithPath[];

//       fileArray.forEach((file) => {
//         if (!file.type.startsWith("image/")) return;

//         const pathParts = file.webkitRelativePath.split("/");

//         if (pathParts.length >= 2) {
//           // Handle different folder structures
//           let traitType: string;

//           if (pathParts.length === 2) {
//             // Direct structure: traitType/image.png
//             traitType = pathParts[0];
//           } else if (pathParts.length >= 3 && pathParts[0] === "traits") {
//             // Nested structure: traits/traitType/image.png
//             traitType = pathParts[1];
//           } else {
//             // Fallback: use parent folder
//             traitType = pathParts[pathParts.length - 2];
//           }

//           const fileName = pathParts[pathParts.length - 1];

//           if (!traitsData[traitType]) {
//             traitsData[traitType] = {
//               name: traitType,
//               zIndex: getDefaultZIndex(traitType),
//               images: [],
//             };
//           }

//           // Check if this image already exists to avoid duplicates
//           const imageExists = traitsData[traitType].images.some(
//             (img) => img.name === fileName.replace(/\.[^/.]+$/, "")
//           );

//           if (!imageExists) {
//             traitsData[traitType].images.push({
//               file,
//               name: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
//               preview: URL.createObjectURL(file),
//             });
//           }
//         }
//       });

//       return traitsData;
//     });

//     setUploadStatus("");
//   };

//   // Handle drag and drop
//   const handleDragEnter = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragActive(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragActive(false);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragActive(false);

//     const files = e.dataTransfer.files;
//     handleFolderUpload(files);
//   };

//   // Default z-index values for common trait types
//   const getDefaultZIndex = (traitType: string): number => {
//     const zIndexMap: Record<string, number> = {
//       background: 1,
//       body: 2,
//       clothing: 3,
//       accessories: 4,
//       eyes: 5,
//       mouth: 6,
//       hair: 7,
//       hat: 8,
//     };
//     return zIndexMap[traitType.toLowerCase()] || 5;
//   };

//   // Update trait z-index
//   const updateTraitZIndex = (traitType: string, zIndex: string): void => {
//     setTraits((prev) => ({
//       ...prev,
//       [traitType]: {
//         ...prev[traitType],
//         zIndex: parseInt(zIndex) || 1,
//       },
//     }));
//   };

//   // Remove trait
//   const removeTrait = (traitType: string): void => {
//     setTraits((prev) => {
//       const newTraits = { ...prev };
//       // Clean up object URLs to prevent memory leaks
//       newTraits[traitType].images.forEach((image) => {
//         URL.revokeObjectURL(image.preview);
//       });
//       delete newTraits[traitType];
//       return newTraits;
//     });
//   };

//   // Calculate total images count
//   const getTotalImagesCount = (): number => {
//     return Object.values(traits).reduce(
//       (acc, trait) => acc + trait.images.length,
//       0
//     );
//   };
//   const handleFileInputClick = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-transDark4 text-white">
//       {/* <div className="mb-8">
//         <h1 className="text-3xl font-bold text-white mb-2">
//           NFT Traits Upload
//         </h1>
//         <p className="text-gray-400">
//           Upload your traits folder structure. Each trait type should be in its
//           own folder containing the trait images.
//         </p>
//       </div> */}

//       {/* Upload Area */}
//       <div
//         onClick={handleFileInputClick}
//         onDragEnter={handleDragEnter}
//         onDragLeave={handleDragLeave}
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//         className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${
//           isDragActive
//             ? "border-transLight4 bg-transLight2"
//             : "border-transLight24 hover:border-transLight72"
//         }`}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           webkitdirectory=""
//           directory=""
//           onChange={(e) => handleFolderUpload(e.target.files)}
//           className="hidden"
//         />
//         <div className="space-y-2">
//           <Folder size={48} className="text-gray-400 mx-auto" />
//           {isDragActive ? (
//             <p className="text-white font-medium">
//               Drop the traits folder here...
//             </p>
//           ) : (
//             <div>
//               <p className="text-white font-medium">
//                 Click to select or drag and drop your traits folder
//               </p>
//               <p className="text-sm text-gray-400 mt-1">
//                 Upload multiple trait folders or a main traits folder with
//                 subfolders
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Clear All Button */}
//       {Object.keys(traits).length > 0 && (
//         <div className="flex justify-between items-center mb-6">
//           <p className="text-gray-400">
//             You can upload additional trait folders to add more trait types
//           </p>
//           <button
//             onClick={() => {
//               // Clean up all object URLs
//               Object.values(traits).forEach((trait) => {
//                 trait.images.forEach((image) => {
//                   URL.revokeObjectURL(image.preview);
//                 });
//               });
//               setTraits({});
//             }}
//             className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
//           >
//             <Trash2 size={16} />
//             Clear All Traits
//           </button>
//         </div>
//       )}
//       {/* Traits Preview */}
//       {Object.keys(traits).length > 0 && (
//         <div className="space-y-6 mb-6">
//           <h2 className="text-2xl font-semibold text-white">
//             Uploaded Traits ({Object.keys(traits).length} types)
//           </h2>

//           <div className="grid gap-6">
//             {Object.entries(traits).map(([traitType, traitData]) => (
//               <div key={traitType} className="bg-transLight2 border border-transLight4 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-medium text-white capitalize">
//                     {traitType} ({traitData.images.length} images)
//                   </h3>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex items-center space-x-2">
//                       <label className="text-sm font-medium text-gray-300">
//                         Z-Index:
//                       </label>
//                       <input
//                         type="number"
//                         value={traitData.zIndex}
//                         onChange={(e) =>
//                           updateTraitZIndex(traitType, e.target.value)
//                         }
//                         className="w-16 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         min="1"
//                         max="100"
//                       />
//                     </div>
//                     <button
//                       onClick={() => removeTrait(traitType)}
//                       className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
//                     >
//                       <Trash2 size={16} />
//                       Remove
//                     </button>
//                   </div>
//                 </div>

//                 {/* Images Grid */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
//                   {traitData.images.map((image, index) => (
//                     <div
//                       key={index}
//                       className="bg-gray-700 rounded border border-gray-600 p-2"
//                     >
//                       <Image
//                         src={image.preview}
//                         alt={image.name}
//                         width={80}
//                         height={80}
//                         className="w-full h-20 object-cover rounded mb-2"
//                       />
//                       <p
//                         className="text-xs text-gray-300 truncate"
//                         title={image.name}
//                       >
//                         {image.name}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Upload Button and Status */}
//       {/* {Object.keys(traits).length > 0 && (
//         <div className="flex items-center justify-between bg-transLight4 rounded-lg p-4">
//           <div className="flex items-center space-x-4">
//             {uploadStatus && (
//               <div
//                 className={`text-sm font-medium flex items-center gap-2 ${
//                   uploadStatus.includes("success")
//                     ? "text-green-400"
//                     : uploadStatus.includes("error") ||
//                       uploadStatus.includes("failed")
//                     ? "text-red-400"
//                     : "text-blue-400"
//                 }`}
//               >
//                 {(uploadStatus.includes("error") ||
//                   uploadStatus.includes("failed")) && <AlertCircle size={16} />}
//                 {uploadStatus}
//               </div>
//             )}
//           </div>

//           <div className="text-sm text-lightPrimary">
//             Total images: {getTotalImagesCount()}
//           </div>
//         </div>
//       )} */}

//       {/* Instructions */}
//       <div className="mt-8 bg-transLight4 border border-transLight24 rounded-lg p-4">
//         <h3 className="font-medium text-lightPrimary mb-2 flex items-center gap-2">
//           <HelpCircle size={16} />
//           Instructions:
//         </h3>
//         <ul className="text-sm text-lightPrimary space-y-1">
//           <li>
//             • Create a main traits folder with subfolders for each trait type
//           </li>
//           <li>
//             • Each trait type folder should contain all images for that trait
//           </li>
//           <li>• Supported formats: PNG, JPG, JPEG, GIF, SVG</li>
//           <li>
//             • Adjust z-index values to control layering order (higher = front)
//           </li>
//           <li>
//             • Example structure: traits/background/, traits/hair/,
//             traits/accessories/
//           </li>
//         </ul>
//       </div>

//       {/* Help Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-white mb-4">Upload Help</h3>
//             <div className="space-y-3 text-gray-300 text-sm">
//               <p>To upload your NFT traits:</p>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Organize images in folders by trait category</li>
//                 <li>Use clear, descriptive folder names</li>
//                 <li>Ensure all images are high quality</li>
//                 <li>
//                   Common categories: background, body, clothing, accessories,
//                   eyes, hair
//                 </li>
//               </ul>
//             </div>
//             <button
//               onClick={() => setShowUploadModal(false)}
//               className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
//             >
//               Got it
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NFTTraitsUpload;



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
import { getDefaultZIndex } from "@/lib/utils";

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

  // Function to create a virtual File object for the folder with all files
  const createVirtualFolderFile = (files: FileList, folderName: string): File => {
    const virtualFile = new File([], folderName, { type: "folder" });
    (virtualFile as any).fileList = files;
    (virtualFile as any).traitsData = traits; // Include parsed traits data
    return virtualFile;
  };

  // Handle folder upload with proper error handling
  const handleFolderUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    console.log("Processing", files.length, "files");

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
            traitsData[traitType] = {
              name: traitType,
              zIndex: getDefaultZIndex(traitType),
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

      console.log("Final traits data:", traitsData);
      console.log("Trait types found:", Object.keys(traitsData));

      // Update CreationFlow context with the file data
      const folderName = fileArray[0]?.webkitRelativePath.split("/")[0] || "traits";
      const virtualFile = createVirtualFolderFile(files, folderName);
      updateTraitData({ traitAssets: virtualFile });

      return traitsData;
    });

    setUploadStatus("");
  };

  // Update CreationFlow context when traits change (for z-index updates)
  useEffect(() => {
    if (Object.keys(traits).length > 0 && traitData.traitAssets) {
      const fileList = (traitData.traitAssets as any).fileList as FileList;
      if (fileList) {
        const folderName = traitData.traitAssets.name;
        const updatedVirtualFile = createVirtualFolderFile(fileList, folderName);
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
        zIndex: parseInt(zIndex) || 1,
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
            Uploaded Traits ({Object.keys(traits).length} types, {getTotalImagesCount()} total images)
          </h2>

          <div className="grid gap-6">
            {Object.entries(traits)
              .sort(([, a], [, b]) => a.zIndex - b.zIndex) // Sort by z-index
              .map(([traitType, traitData]) => (
              <div key={traitType} className="bg-transLight2 border border-transLight4 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white capitalize">
                    {traitType} ({traitData.images.length} images)
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-300">
                        Z-Index:
                      </label>
                      <input
                        type="number"
                        value={traitData.zIndex}
                        onChange={(e) =>
                          updateTraitZIndex(traitType, e.target.value)
                        }
                        className="w-16 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="100"
                      />
                    </div>
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

      {/* Summary Card */}
      {Object.keys(traits).length > 0 && (
        <div className="bg-transLight4 border border-transLight24 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-lightPrimary mb-2">Upload Summary:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-lightSecondary">Trait Types:</span>
              <span className="text-white font-medium ml-2">{Object.keys(traits).length}</span>
            </div>
            <div>
              <span className="text-lightSecondary">Total Images:</span>
              <span className="text-white font-medium ml-2">{getTotalImagesCount()}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-lightTertiary">
            <p>Z-Index Order: {Object.entries(traits)
              .sort(([, a], [, b]) => a.zIndex - b.zIndex)
              .map(([type, data]) => `${type}(${data.zIndex})`)
              .join(" → ")}</p>
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
            • Adjust z-index values to control layering order (1 = back, higher = front)
          </li>
          <li>
            • Example structure: traits/background/, traits/hair/, traits/accessories/
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
                  Common categories: background, body, clothing, accessories, eyes, hair
                </li>
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
