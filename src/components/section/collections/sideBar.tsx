import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

const CollectionSideBar = () => {
  const [active, setActive] = useState(false);
  const [availibality, setAvailabality] = useState("option-one");
  return (
    <>
      <div className="w-full">
        <h2 className="font-bold text-lg2 text-neutral50 pb-4 border-b border-neutral400">
          Availability
        </h2>
        <RadioGroup
          defaultValue="option-one"
          className="pt-4"
          onValueChange={(e: string) => setAvailabality(e)}
        >
          <div
            className={`flex items-center space-x-2 border rounded-xl  pl-4 pr-4 gap-3 w-[280px] ${
              availibality == "option-one" ? "bg-neutral500" : "bg-transparent"
            } border-transparent text-neutral50`}
          >
            <RadioGroupItem value="option-one" id="option-one" color="brand" />
            <Label
              htmlFor="option-one"
              className="w-full font-bold text-lg2  pt-3 pb-3"
            >
              All
            </Label>
          </div>
          <div
            className={`flex items-center space-x-2 border rounded-xl pl-4 pr-4 gap-3 w-[280px] ${
              availibality == "option-two" ? "bg-neutral500" : "bg-transparent"
            } border-transparent text-neutral50`}
          >
            <RadioGroupItem value="option-two" id="option-two" />
            <Label
              htmlFor="option-two"
              className="w-full font-bold text-lg2 pt-3 pb-3"
            >
              For sale <span>(420)</span>
            </Label>
          </div>
        </RadioGroup>
        <h2 className="font-bold text-lg2 text-neutral50 pt-7 pb-4 border-b border-neutral400">
          Traits
        </h2>
        <div className="pt-4 pl-3 pr-3 text-neutral50">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Body</AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center w-[280px] h-11 pr-4 pl-3 pb-4 gap-3">
                  <Checkbox
                    id="terms"
                    className={`h-5 w-5 p-[2px] rounded-s ${
                      active ? "bg-brand text-background" : " text-background"
                    }`}
                    onClick={() => setActive(!active)}
                  />
                  <label className="text-bold font-md text-neutral50 leading-none">
                    Black<span className="ml-1">(123)</span>
                  </label>
                </div>
                <div className="flex items-center w-[280px] h-11 pr-4 pl-3 pb-4 gap-3">
                  <Checkbox id="terms" className="h-5 w-5 p-[2px] rounded-s" />
                  <label className="text-sm font-md text-neutral50 leading-none">
                    Yellow <span className="ml-1">(23)</span>
                  </label>
                </div>
                <div className="flex items-center w-[280px] h-11 pr-4 pl-3 pb-4 gap-3">
                  <Checkbox id="terms" className="h-5 w-5 p-[2px] rounded-s" />
                  <label className="text-sm font-md text-neutral50 leading-none">
                    Red<span className="ml-1">(10)</span>
                  </label>
                </div>
                <div className="flex items-center w-[280px] h-11 pr-4 pl-3 pb-4 gap-3">
                  <Checkbox id="terms" className="h-5 w-5 p-[2px] rounded-s"/>
                  <label className="text-sm font-md text-neutral50 leading-none">
                    Blue<span className="ml-1">(100)</span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default CollectionSideBar;
