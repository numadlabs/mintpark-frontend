"use client";
import React, { useState } from "react";
import { Folder, FileText, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreationFlow } from "./CreationFlowProvider";
import Toggle from "@/components/ui/toggle";
import { useTraitsStore } from "@/lib/store/traitsStore";
import NFTTraitsUpload from "./NftTraitsUpload";

// Extend HTMLInputElement attributes to include webkitdirectory
declare module "react" {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: boolean | string;
    directory?: boolean | string;
  }
}

export function TraitsUploadStep() {
  const { setCurrentStep } = useCreationFlow();
  const {
    traitData,
    validationErrors,
    isValidating,
    updateTraitData,
    validateJsonFile,
  } = useTraitsStore();

  const [isOneOfOneEnabled, setIsOneOfOneEnabled] = useState(false);

  const handleFileUpload =
    (type: "traitAssets" | "oneOfOneEditions" | "metadataJson") =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        if (type === "metadataJson") {
          // Single JSON file
          const file = files[0];
          updateTraitData({ [type]: file });
          await validateJsonFile(file);
        } else {
          // Folder upload - create a virtual file object representing the folder
          const folderName = files[0].webkitRelativePath.split("/")[0];
          const virtualFile = new File([], folderName, { type: "folder" });

          // Store the FileList for processing later
          (virtualFile as any).fileList = files;
          updateTraitData({ [type]: virtualFile });
        }
      }
    };

  const toggleOneOfOne = () => {
    const newState = !isOneOfOneEnabled;
    setIsOneOfOneEnabled(newState);

    // Clear the file when disabling
    if (!newState) {
      updateTraitData({ oneOfOneEditions: null });
    }
  };

  const handleRemoveFile = (
    type: "traitAssets" | "oneOfOneEditions" | "metadataJson"
  ) => {
    updateTraitData({ [type]: null });
  };

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const getFieldErrors = (field: string) => {
    return validationErrors.filter((error) => error.field === field);
  };

  const hasJsonErrors = getFieldErrors("metadataJson").length > 0;

  // Updated form validation - made One of One truly optional
  const isFormValid =
    traitData.metadataJson &&
    !hasJsonErrors &&
    (!isOneOfOneEnabled || (isOneOfOneEnabled && traitData.oneOfOneEditions));

  return (
    <>
      <div className="max-w-2xl py-12 gap-8 mx-auto">
        <div className="text-start grid gap-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Upload Your Collection Assets
          </h1>
          <p className="text-lightSecondary">
            Upload trait groups, one-of-one editions (if any), and your metadata
            JSON.
          </p>
        </div>

        <div className="space-y-6 mt-4">
          {/* Upload trait assets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <label className="block text-white font-medium">
                Upload trait assets
              </label>
            </div>

            {/* NFTTraitsUpload component handles its own file management */}
            <NFTTraitsUpload />
          </div>

          {/* One of one editions toggle - improved styling */}
          <div className="border-t border-transLight4 pt-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">
                  One of One Editions
                </span>
                <span className="text-xs text-lightTertiary bg-transLight8 px-2 py-1 rounded-full">
                  Optional
                </span>
              </div>
              <Toggle isChecked={isOneOfOneEnabled} onChange={toggleOneOfOne} />
            </div>
            <p className="text-sm text-lightTertiary mt-2">
              Upload special unique assets that don&apos;t follow the trait
              combination system
            </p>
          </div>

          {/* One of one editions upload - improved with animation */}
          {isOneOfOneEnabled && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              {traitData.oneOfOneEditions ? (
                <div className="bg-darkSecondary border border-transLight4 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-transLight8 rounded-lg">
                        <Folder size={20} className="text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium block">
                          {traitData.oneOfOneEditions.name}
                        </span>
                        <span className="text-sm text-lightTertiary">
                          One of One Editions folder
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile("oneOfOneEditions")}
                      className="p-2 text-lightSecondary hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove folder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    document.getElementById("one-of-one-upload")?.click()
                  }
                  className="border-2 border-dashed border-transLight16 rounded-xl p-6 text-center cursor-pointer hover:border-transLight24 hover:bg-transLight4 transition-all duration-200"
                >
                  <div className="p-3 bg-transLight8 rounded-full w-fit mx-auto mb-3">
                    <Folder size={24} className="text-lightSecondary" />
                  </div>
                  <p className="text-white font-medium mb-1">
                    Select One of One Editions folder
                  </p>
                  <p className="text-sm text-lightTertiary">
                    Upload unique assets that won&apos;t be part of trait
                    combinations
                  </p>
                </div>
              )}

              <input
                id="one-of-one-upload"
                type="file"
                webkitdirectory
                multiple
                onChange={handleFileUpload("oneOfOneEditions")}
                className="hidden"
              />
            </div>
          )}

          {/* Metadata JSON - improved styling */}
          <div className="border-t border-transLight4 pt-6">
            <label className="block text-white font-medium mb-4">
              Metadata JSON
              <span className="text-red-400 ml-1">*</span>
            </label>

            {traitData.metadataJson ? (
              <div
                className={`border rounded-xl p-4 transition-colors ${
                  hasJsonErrors
                    ? "border-red-500 bg-red-900/10"
                    : "border-transLight4 bg-darkSecondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        hasJsonErrors ? "bg-red-900/20" : "bg-transLight8"
                      }`}
                    >
                      <FileText
                        size={20}
                        className={
                          hasJsonErrors ? "text-red-400" : "text-white"
                        }
                      />
                    </div>
                    <div>
                      <span className="text-white font-medium block">
                        {traitData.metadataJson.name}
                      </span>
                      {isValidating ? (
                        <span className="text-sm text-blue-400">
                          Validating...
                        </span>
                      ) : hasJsonErrors ? (
                        <span className="text-sm text-red-400">
                          Validation failed
                        </span>
                      ) : (
                        <span className="text-sm text-green-400">
                          Valid JSON file
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile("metadataJson")}
                    className="p-2 text-lightSecondary hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {hasJsonErrors && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        size={16}
                        className="text-red-400 mt-0.5 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-red-400">
                          Validation Errors:
                        </p>
                        {getFieldErrors("metadataJson").map((error, index) => (
                          <p key={index} className="text-sm text-red-300">
                            • {error.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() =>
                  document.getElementById("metadata-upload")?.click()
                }
                className="border-2 border-dashed border-transLight16 rounded-xl p-6 text-center cursor-pointer hover:border-transLight24 hover:bg-transLight4 transition-all duration-200"
              >
                <div className="p-3 bg-transLight8 rounded-full w-fit mx-auto mb-3">
                  <FileText size={24} className="text-lightSecondary" />
                </div>
                <p className="text-white font-medium mb-1">
                  Upload Metadata JSON
                </p>
                <p className="text-sm text-lightTertiary">
                  Provide the metadata file with trait and edition data
                </p>
              </div>
            )}

            <input
              id="metadata-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload("metadataJson")}
              className="hidden"
            />
          </div>

          {/* Continue button with improved validation feedback */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={!isFormValid || isValidating}
              className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-transLight8 disabled:text-lightTertiary transition-all duration-200"
            >
              {isValidating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Validating...
                </span>
              ) : (
                "Continue"
              )}
            </Button>

            {!isFormValid && !isValidating && (
              <p className="text-sm text-lightTertiary text-center mt-2">
                {!traitData.metadataJson
                  ? "Please upload your metadata JSON file to continue"
                  : hasJsonErrors
                  ? "Please fix JSON validation errors to continue"
                  : isOneOfOneEnabled && !traitData.oneOfOneEditions
                  ? "Please upload One of One Editions folder or disable the option"
                  : "Please complete all required fields"}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
