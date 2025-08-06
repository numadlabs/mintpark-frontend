import { create } from 'zustand';

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

interface TraitFileData {
  traitAssets: File | null;
  oneOfOneEditions: File | null;
  metadataJson: File | null;
}

interface ValidationError {
  field: string;
  message: string;
}

interface TraitsStore {
  traitData: TraitFileData;
  processedTraits: TraitsState;
  validationErrors: ValidationError[];
  isValidating: boolean;
  showUploadModal: boolean;
  
  // Actions
  updateTraitData: (data: Partial<TraitFileData>) => void;
  updateProcessedTraits: (traits: TraitsState) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setIsValidating: (validating: boolean) => void;
  validateJsonFile: (file: File) => Promise<boolean>;
  resetStore: () => void;
}

const initialState = {
  traitData: {
    traitAssets: null,
    oneOfOneEditions: null,
    metadataJson: null,
  },
  processedTraits: {},
  validationErrors: [],
  isValidating: false,
  showUploadModal: false,
};

export const useTraitsStore = create<TraitsStore>((set, get) => ({
  ...initialState,

  updateTraitData: (data) =>
    set((state) => ({
      traitData: { ...state.traitData, ...data },
      validationErrors: state.validationErrors.filter(
        (error) => !Object.keys(data).includes(error.field)
      ),
    })),

  updateProcessedTraits: (traits) => set({ processedTraits: traits }),

  setValidationErrors: (errors) => set({ validationErrors: errors }),

  setIsValidating: (validating) => set({ isValidating: validating }),

  validateJsonFile: async (file) => {
    set({ isValidating: true });
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      const errors: ValidationError[] = [];
      
      // Validate JSON structure
      if (!json.name || typeof json.name !== 'string') {
        errors.push({ field: 'metadataJson', message: 'Missing or invalid "name" field' });
      }
      
      if (!json.collection || !Array.isArray(json.collection)) {
        errors.push({ field: 'metadataJson', message: 'Missing or invalid "collection" array' });
      } else {
        // Validate collection items
        json.collection.forEach((item: any, index: number) => {
          if (!item.name) {
            errors.push({ 
              field: 'metadataJson', 
              message: `Collection item ${index + 1}: Missing "name" field` 
            });
          }
          
          if (!item.image) {
            errors.push({ 
              field: 'metadataJson', 
              message: `Collection item ${index + 1}: Missing "image" field` 
            });
          }
          
          if (!item.attributes || !Array.isArray(item.attributes)) {
            errors.push({ 
              field: 'metadataJson', 
              message: `Collection item ${index + 1}: Missing or invalid "attributes" array` 
            });
          } else {
            // Validate attributes
            item.attributes.forEach((attr: any, attrIndex: number) => {
              if (!attr.trait_type || !attr.value) {
                errors.push({ 
                  field: 'metadataJson', 
                  message: `Collection item ${index + 1}, attribute ${attrIndex + 1}: Missing "trait_type" or "value"` 
                });
              }
            });
          }
        });
      }
      
      set({ validationErrors: errors, isValidating: false });
      return errors.length === 0;
    } catch (error) {
      const parseError = { 
        field: 'metadataJson', 
        message: 'Invalid JSON format. Please check your file syntax.' 
      };
      set({ validationErrors: [parseError], isValidating: false });
      return false;
    }
  },

  resetStore: () => set(initialState),
}));