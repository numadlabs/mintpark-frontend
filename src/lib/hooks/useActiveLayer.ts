import { useAuth } from "@/components/provider/auth-context-provider";
import { useMemo } from "react";


export function useActiveLayer() {
  const { currentLayer, availableLayers, selectedLayerId } = useAuth();

  const activeLayer = useMemo(() => {
    // If user is authenticated, use current layer
    if (currentLayer) {
      return currentLayer;
    }

    // For public access, use selectedLayerId from cache
    if (selectedLayerId && availableLayers.length > 0) {
      const layer = availableLayers.find(
        (layer) => layer.id === selectedLayerId,
      );
      if (layer) return layer;
    }

    // Default to first available layer if nothing else is selected
    if (availableLayers.length > 0) {
      // Prefer HEMI layer if available, otherwise use first layer
      const hemiLayer = availableLayers.find((layer) => layer.layer === "HEMI");
      return hemiLayer || availableLayers[0];
    }

    return null;
  }, [currentLayer, availableLayers, selectedLayerId]);

  return activeLayer;
}
