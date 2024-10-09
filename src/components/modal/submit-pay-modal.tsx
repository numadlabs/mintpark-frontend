import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarImage } from "../ui/avatar";
import Input from "../ui/input";
import { Button } from "../ui/button";

interface modalProps {
  open: boolean;
  onClose: () => void;
}

const SubmitPayModal: React.FC<modalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
        <DialogHeader className="flex w-full">
          <div className="text-xl text-neutral00 font-bold text-center">
            Submit and Pay invoice
          </div>
        </DialogHeader>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-3 border border-white8 rounded-2xl w-full px-5 pt-4 pb-5">
          <p className="text-neutral200 text-md font-medium">
            Wallet address to receive the assets:
          </p>
          <p className="text-lg2 text-neutral50 font-medium">
            bc1pqvhy3r8zsul5rf6gq7385lq5sk94ugm30xtlsa
          </p>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <Tabs defaultValue="Custom">
          <div className="flex flex-col gap-4">
            <p className="text-md text-neutral200 font-bold">
              Select the network fee you want to pay
            </p>
            <TabsList>
              <div className="grid grid-cols-3 gap-3 items-center">
                <TabsTrigger
                  value="Slow"
                  className="max-w-[176px] w-screen flex flex-col p-4 gap-2 border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                >
                  <p className="text-neutral100 text-lg font-medium">Slow</p>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-lg2 text-neutral50 font-bold">
                      0.000054
                    </p>
                    <p className="text-md text-neutral100 font-medium">
                      Sats/vB
                    </p>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Fast"
                  className="max-w-[176px] w-screen flex flex-col p-4 gap-2 border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                >
                  <p className="text-neutral100 text-lg font-medium">Fast</p>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-lg2 text-neutral50 font-bold">0.00004</p>
                    <p className="text-md text-neutral100 font-medium">
                      Sats/vB
                    </p>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Custom"
                  className="max-w-[176px] w-screen h-full text-neutral100 text-lg font-medium border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                >
                  Custom
                </TabsTrigger>
              </div>
            </TabsList>
            <TabsContent value="Custom">
              <div className="flex relative items-center">
                <Input
                  text="Amount"
                  value={0.00023}
                  onChange={() => console.log("asd")}
                />
                <div className="absolute right-3.5 top-[25px]">
                  <p className="text-md text-neutral200 font-medium">Sats/vB</p>
                </div>
              </div>
            </TabsContent>
            <div className="h-[1px] w-full bg-white8" />
            <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
              <div className="flex flex-row justify-between items-center">
                <p className="text-lg2 text-neutral100 font-medium">
                  Network Fee
                </p>
                <p className="text-lg2 text-neutral50 font-bold">0.00023 Sats</p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-lg2 text-neutral100 font-medium">
                  Service Fee
                </p>
                <p className="text-lg2 text-neutral50 font-bold">0.00023 Sats</p>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
              <p className="text-lg2 text-neutral100 font-medium">
                Total Amount
              </p>
              <p className="text-lg2 text-brand font-bold">0.00023 Sats</p>
            </div>
          </div>
        </Tabs>
        <div className="h-[1px] w-full bg-white8" />
        <DialogFooter className="grid grid-cols-2 gap-2 w-full">
          <Button variant={"secondary"} className="bg-white8 w-full">
            Cancel
          </Button>
          <Button>Pay</Button>
        </DialogFooter>
        <button
          className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
          onClick={onClose}
        >
          <X size={20} color="#D7D8D8" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitPayModal;
