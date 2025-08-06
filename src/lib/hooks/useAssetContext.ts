// assetsContext.ts
import { createContext, useContext } from "react";
//todo: get query params from the current link. Don't use context here for asset data and query because react query does this

// Define types for the assets data
export interface CollectibleSchema {
  id: string;
  name: string;
  uniqueIdx: string;
  createdAt: string;
  fileKey: string;
  highResolutionImageUrl: string;
  collectionId: string;
  collectionName: string;
  listedAt: string | null;
  listId: string | null;
  price: number | null;
  floor: number;
}

export interface AssetsData {
  success: boolean;
  data: {
    collectibles: CollectibleSchema[];
    totalCount: number;
    listCount: number;
    collections: AssetColSchema[];
  };
}

import { Dispatch, SetStateAction } from "react";
import { AssetColSchema } from "../validations/asset-validation";

// Define the type for our assets context
export interface AssetsContextType {
  assetsData: AssetsData | undefined;
  isLoading: boolean;
  refetch: () => void;
  filters: {
    orderBy: string;
    setOrderBy: Dispatch<SetStateAction<string>>;
    orderDirection: string;
    setOrderDirection: Dispatch<SetStateAction<string>>;
    limit: number;
    setLimit: Dispatch<SetStateAction<number>>;
    offset: number;
    setOffset: Dispatch<SetStateAction<number>>;
    selectedCollectionIds: string[];
    setSelectedCollectionIds: Dispatch<SetStateAction<string[]>>;
    availability: string;
    setAvailability: Dispatch<SetStateAction<string>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
  };
}

// Create initial context value that matches the type
const initialContextValue: AssetsContextType = {
  assetsData: undefined,
  isLoading: false,
  refetch: () => {},
  filters: {
    orderBy: "",
    setOrderBy: () => {},
    orderDirection: "",
    setOrderDirection: () => {},
    limit: 0,
    setLimit: () => {},
    offset: 0,
    setOffset: () => {},
    selectedCollectionIds: [],
    setSelectedCollectionIds: () => {},
    availability: "",
    setAvailability: () => {},
    searchQuery: "",
    setSearchQuery: () => {},
  },
};

// Create the context with proper type
export const AssetsContext =
  createContext<AssetsContextType>(initialContextValue);

// Custom hook to use the assets context
export const useAssetsContext = () => {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error("useAssetsContext must be used within an AssetsProvider");
  }
  return context;
};
