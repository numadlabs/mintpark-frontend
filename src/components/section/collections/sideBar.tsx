import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ColorOption {
  label: string;
  count: number;
}

const colorOptions: ColorOption[] = [
  { label: 'Black', count: 123 },
  { label: 'Yellow', count: 23 },
  { label: 'Red', count: 10 },
  { label: 'Blue', count: 100 },
];

interface ColorOptionProps {
  label: string;
  count: number;
  isActive: boolean;
  onToggle: () => void;
}

const ColorOption: React.FC<ColorOptionProps> = ({ label, count, isActive, onToggle }) => (
  <div className="flex items-center w-full h-11 pr-4 pl-3 pb-4 gap-3">
    <Checkbox
      id={label.toLowerCase()}
      className={`h-5 w-5 p-[2px] rounded-s ${
        isActive ? "bg-brand500 text-background" : "text-background"
      }`}
      onClick={onToggle}
    />
    <label 
      htmlFor={label.toLowerCase()} 
      className="text-sm font-medium text-neutral-500 leading-none"
    >
      {label}<span className="ml-1">({count})</span>
    </label>
  </div>
);

const CollectionSideBar: React.FC = () => {
  const [activeColors, setActiveColors] = useState<Record<string, boolean>>({});
  const [availability, setAvailability] = useState<string>("option-one");

  const toggleColor = (color: string) => {
    setActiveColors(prev => ({
      ...prev,
      [color]: !prev[color]
    }));
  };

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg text-neutral00 pb-4 border-b border-neutral500">
        Availability
      </h2>
      <RadioGroup
        defaultValue="option-one"
        className="pt-4"
        onValueChange={(e: string) => setAvailability(e)}
      >
        {[
          { value: "option-one", label: "All" },
          { value: "option-two", label: "For sale", count: 420 },
        ].map((option) => (
          <div
            key={option.value}
            className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-full ${
              availability === option.value ? "bg-neutral500" : "bg-transparent"
            } border-transparent text-neutral00`}
          >
            <RadioGroupItem value={option.value} id={option.value} />
            <Label
              htmlFor={option.value}
              className="w-full font-bold text-lg pt-3 pb-3"
            >
              {option.label} {option.count && <span>({option.count})</span>}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <h2 className="font-bold text-lg text-neutral00 pt-7 pb-4 border-b border-neutral00">
        Traits
      </h2>
      <div className="pt-4 px-3 text-neutral00">
        <Accordion type="single" collapsible>
          <AccordionItem value="body">
            <AccordionTrigger>Body</AccordionTrigger>
            <AccordionContent>
              {colorOptions.map(({ label, count }) => (
                <ColorOption
                  key={label}
                  label={label}
                  count={count}
                  isActive={!!activeColors[label]}
                  onToggle={() => toggleColor(label)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default CollectionSideBar;