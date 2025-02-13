import React, { useState } from "react";
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
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  id: string;
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

const CollectionSideBar: React.FC<SidebarProps> = ({ id }) => {
  const [selectedTraits, setSelectedTraits] = useState<Record<string, boolean>>(
    {}
  );
  const [availability, setAvailability] = useState<string>("option-one");
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const { data: collection } = useQuery({
    queryKey: ["collectionData", id, "recent", "desc"],
    queryFn: () => getListedCollectionById(id, "recent", "desc", 10, 0, ""),
    enabled: !!id,
    retry: 1,
  });

  const { data: traitTypes = [] } = useQuery<TraitType[]>({
    queryKey: ["traitType", id],
    queryFn: () => getCollectibleTraitTypes(id),
    enabled: !!id,
  });

  const { data: traitValues = [] } = useQuery<TraitValue[]>({
    queryKey: ["traitValue", id, expandedType],
    queryFn: () => getCollectibleTraitValues(expandedType!),
    enabled: !!expandedType,
  });

  const handleTraitSelect = (traitId: string) => {
    setSelectedTraits((prev) => ({
      ...prev,
      [traitId]: !prev[traitId],
    }));
  };

  const handleAccordionChange = (value: string) => {
    setExpandedType(value === expandedType ? null : value);
  };

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg text-neutral00 pb-4 border-b border-neutral500">
        Availability
      </h2>
      <RadioGroup
        defaultValue="option-one"
        className="pt-4"
        onValueChange={setAvailability}
      >
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "option-one" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="option-one" id="option-one" />
          <Label
            htmlFor="option-one"
            className="w-full font-bold text-lg2 pt-3 pb-3"
          >
            All
          </Label>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
            availability === "option-two" ? "bg-neutral500" : "bg-transparent"
          } border-transparent text-neutral50`}
        >
          <RadioGroupItem value="option-two" id="option-two" />
          <Label
            htmlFor="option-two"
            className="w-full font-bold text-lg2 pt-3 pb-3"
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
                    {traitValues.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center w-[280px] h-11 pr-4 pl-3 gap-3"
                      >
                        <Checkbox
                          id={value.id}
                          checked={selectedTraits[value.id]}
                          className={`h-5 w-5 p-[2px] rounded-s ${
                            selectedTraits[value.id]
                              ? "bg-brand text-background"
                              : "text-background"
                          }`}
                          onClick={() => handleTraitSelect(value.id)}
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
                    ))}
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

export default CollectionSideBar;
