import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getCollectibleTraitTypes,
  getCollectibleTraitValues,
  getListedCollectionById,
} from "@/lib/service/queryHelper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollectionDataType } from "@/lib/types";
import { useRouter } from "next/navigation";

interface SidebarProps {
  id: string;
  onAvailabilityChange?: (isListed: boolean) => void;
  onTraitsChange?: (selectedTraits: Record<string, string[]>) => void;
  collectionData: CollectionDataType | null;
}

interface TraitType {
  id: string;
  name: string;
}

interface TraitValue {
  id: string;
  value: string;
  collectibleTraitCount: number;
}

const CollectionSideBar: React.FC<SidebarProps> = ({
  id,
  onAvailabilityChange,
  onTraitsChange,
  collectionData,
}) => {
  const router = useRouter();
  const [selectedTraits, setSelectedTraits] = useState<
    Record<string, string[]>
  >({});
  const [availability, setAvailability] = useState<string>("isListed");
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Use ref to track if we should notify parent about trait changes
  const isInitialMount = useRef(true);
  const skipNextUpdate = useRef(false);
  // Cache for trait values to avoid refetching
  const traitValuesCache = useRef<Record<string, TraitValue[]>>({});
  // Get query client for manual cache management
  const queryClient = useQueryClient();

  // Initialize state from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Parse traits from URL
    const traitsParam = urlParams.get("traits");
    if (traitsParam) {
      try {
        const parsedTraits = JSON.parse(decodeURIComponent(traitsParam));
        setSelectedTraits(parsedTraits);
      } catch (error) {
        console.error("Error parsing traits from URL:", error);
      }
    }

    // Parse availability from URL
    const availabilityParam = urlParams.get("availability");
    if (availabilityParam) {
      setAvailability(availabilityParam);
    }

    // Parse expanded type from URL
    const expandedParam = urlParams.get("expanded");
    if (expandedParam) {
      setExpandedType(expandedParam);
    }
  }, []);

  // Update URL when state changes
  const updateURL = useCallback(
    (
      traits: Record<string, string[]>,
      avail: string,
      expanded?: string | null
    ) => {
      const urlParams = new URLSearchParams(window.location.search);

      // Update traits in URL
      if (Object.keys(traits).length > 0) {
        urlParams.set("traits", encodeURIComponent(JSON.stringify(traits)));
      } else {
        urlParams.delete("traits");
      }

      // Update availability in URL
      if (avail !== "all") {
        urlParams.set("availability", avail);
      } else {
        urlParams.delete("availability");
      }

      // Update expanded type in URL
      if (expanded) {
        urlParams.set("expanded", expanded);
      } else {
        urlParams.delete("expanded");
      }

      // Update URL without triggering navigation
      const newUrl = `${window.location.pathname}${
        urlParams.toString() ? "?" + urlParams.toString() : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    },
    []
  );

  // Use stale time to prevent refetching
  const { data: collection } = useQuery({
    queryKey: ["collectionData", id, "recent", "desc"],
    queryFn: () =>
      getListedCollectionById(id, "recent", "desc", 10, 0, "", false, {}),
    enabled: !!id,
    retry: 1,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

// useEffect(() => {
//   if (collection) {
//     const listedCount = Number(collection.listedCollectibleCount) || 0;

//     if (listedCount === 0) {
//       setAvailability("all");
//     } else {
//       setAvailability("isListed");
//     }
//   }
// }, [collection]);



  const { data: traitTypes = [] } = useQuery<TraitType[]>({
    queryKey: ["traitType", id],
    queryFn: () => getCollectibleTraitTypes(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes stale time
    refetchOnWindowFocus: false,
  });

  // Fetch trait values for the expanded type
  const { data: traitValues = [], isLoading: isLoadingTraitValues } = useQuery<
    TraitValue[]
  >({
    queryKey: ["traitValue", id, expandedType],
    queryFn: async () => {
      if (!expandedType) return [];

      // Check cache first
      if (traitValuesCache.current[expandedType]) {
        return traitValuesCache.current[expandedType];
      }

      // Fetch if not in cache
      const values = await getCollectibleTraitValues(expandedType);

      // Handle the response structure - adjust based on your actual API response
      const processedValues = Array.isArray(values)
        ? values
        : values?.traitValues || [];

      // Store in cache
      traitValuesCache.current[expandedType] = processedValues;

      return processedValues;
    },
    enabled: !!expandedType,
    staleTime: 300000, // 5 minutes stale time
    refetchOnWindowFocus: false,
  });

  // Memoized trait selection handler
  const handleTraitSelect = useCallback(
    (traitTypeId: string, traitValueId: string) => {
      skipNextUpdate.current = false;
      setSelectedTraits((prev) => {
        const newTraits = { ...prev };
        if (!newTraits[traitTypeId]) {
          newTraits[traitTypeId] = [];
        }

        const valueIndex = newTraits[traitTypeId].indexOf(traitValueId);
        if (valueIndex === -1) {
          newTraits[traitTypeId] = [...newTraits[traitTypeId], traitValueId];
        } else {
          newTraits[traitTypeId] = newTraits[traitTypeId].filter(
            (id) => id !== traitValueId
          );
        }

        // Remove empty arrays
        if (newTraits[traitTypeId].length === 0) {
          delete newTraits[traitTypeId];
        }

        // Update URL with new traits
        updateURL(newTraits, availability, expandedType);

        return newTraits;
      });
    },
    [availability, expandedType, updateURL]
  );

  // Memoized accordion change handler
  const handleAccordionChange = useCallback(
    (value: string) => {
      const newExpandedType = value === expandedType ? null : value;
      setExpandedType(newExpandedType);

      // Update URL with new expanded type
      updateURL(selectedTraits, availability, newExpandedType);
    },
    [expandedType, selectedTraits, availability, updateURL]
  );

  // Use debounce to prevent too many updates and avoid re-renders
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (skipNextUpdate.current) {
      skipNextUpdate.current = false;
      return;
    }

    // Create a delayed notification
    const timer = setTimeout(() => {
      if (onTraitsChange) {
        onTraitsChange(selectedTraits);
      }
    }, 500); // Increased debounce to 500ms for better UX

    return () => clearTimeout(timer);
  }, [selectedTraits, onTraitsChange]);

  // Memoized availability change handler
  const handleAvailabilityChange = useCallback(
    (value: string) => {
      setAvailability(value);

      // Update URL with new availability
      updateURL(selectedTraits, value, expandedType);

      if (onAvailabilityChange) {
        onAvailabilityChange(value === "isListed");
      }
    },
    [onAvailabilityChange, selectedTraits, expandedType, updateURL]
  );

  // Get trait values for current expanded type from cache or API
  const currentTraitValues = expandedType
    ? traitValuesCache.current[expandedType] || traitValues
    : [];

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg text-neutral00 pb-4 border-b border-neutral500">
        Availability
      </h2>
      <RadioGroup
        value={availability}
        className="pt-4"
        onValueChange={handleAvailabilityChange}
      >
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "all" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="all" id="all" />
          <Label
            htmlFor="all"
            className="w-full cursor-pointer font-bold text-lg2 pt-3 pb-3"
          >
            All
          </Label>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "isListed" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="isListed" id="isListed" />
          <Label
            htmlFor="isListed"
            className="w-full cursor-pointer font-bold text-lg2 pt-3 pb-3"
          >
            For sale <span>({collection?.listedCollectibleCount || 0})</span>
          </Label>
        </div>
      </RadioGroup>

      {traitTypes.length > 0 && (
        <>
          <h2 className="font-bold text-lg text-neutral00 pt-7 pb-4 border-b border-neutral500">
            Traits
          </h2>
          <div className="pt-4 px-3 text-neutral00">
            <Accordion
              type="single"
              collapsible
              value={expandedType || ""}
              onValueChange={handleAccordionChange}
            >
              {traitTypes.map((traitType) => (
                <AccordionItem value={traitType.id} key={traitType.id}>
                  <AccordionTrigger>{traitType.name}</AccordionTrigger>
                  <AccordionContent>
                    {isLoadingTraitValues && expandedType === traitType.id ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin h-5 w-5 border-2 border-neutral100 rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      expandedType === traitType.id &&
                      currentTraitValues.map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center w-[280px] h-11 pr-4 pl-3 gap-3"
                        >
                          <Checkbox
                            id={value.id}
                            checked={selectedTraits[traitType.id]?.includes(
                              value.id
                            )}
                            className={`h-5 w-5 p-[2px] rounded-s ${
                              selectedTraits[traitType.id]?.includes(value.id)
                                ? "bg-brand text-background"
                                : "text-background"
                            }`}
                            onClick={() =>
                              handleTraitSelect(traitType.id, value.id)
                            }
                          />
                          <label
                            htmlFor={value.id}
                            className="text-bold font-md text-neutral50 leading-none"
                          >
                            {value.value}
                            <span className="ml-1">
                              ({value.collectibleTraitCount})
                            </span>
                          </label>
                        </div>
                      ))
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(CollectionSideBar);

