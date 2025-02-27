import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloseCircle } from "iconsax-react";
import { Loader2 } from "lucide-react";

export const PendingModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          <div className="w-full flex flex-col gap-8 pt-12 pb-8 bg-white4 justify-center items-center rounded-2xl">
            <div className="p-4 flex justify-center items-center bg-white8 rounded-2xl">
              <Loader2
                className="animate-spin w-full"
                color="#FFEE32"
                size={24}
              />
            </div>
            <div className="flex flex-col gap-3 justify-center items-center w-full">
              <p className="text-brand text-2xl font-bold">Payment Pending...</p>
            </div>

            <div className="max-h-48 overflow-y-auto w-full px-4 rounded-md flex justify-center">
                <p className="text-lg text-neutral50 font-medium break-words whitespace-pre-wrap py-2 text-center">
                Your payment is being processed.
                </p>
              </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingModal;
