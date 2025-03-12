import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CloseCircle } from "iconsax-react";

export const ErrorModal = ({
  isOpen,
  onClose,
  errorMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}) => {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const isTruncated = errorMessage.length > 200;
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full bg-white4 items-center backdrop-blur-[60px]">
          <div className="w-full flex flex-col gap-8 pt-12 pb-8 bg-white4 justify-center items-center rounded-2xl">
            <div className="p-4 flex justify-center items-center bg-white8 rounded-2xl">
              <CloseCircle size={48} color="#ff5c69" />
            </div>
            <div className="flex flex-col gap-3 justify-center items-center w-full">
              <p className="text-brand text-2xl font-bold">Error Occurred</p>
              <div className="max-h-48 overflow-y-auto text-center w-full px-4 rounded-md">
                <p className="text-lg text-neutral50 font-medium break-words whitespace-pre-wrap py-2">
                  {showFullMessage || !isTruncated 
                    ? errorMessage 
                    : `${errorMessage.substring(0, 200)}...`}
                </p>
              </div>
              {isTruncated && (
                <Button 
                  variant="link" 
                  className="text-brand p-0 h-auto font-medium mt-2"
                  onClick={() => setShowFullMessage(!showFullMessage)}
                >
                  {showFullMessage ? "Show Less" : "See All"}
                </Button>
              )}
            </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <DialogFooter className="grid grid-cols-1 gap-2 w-full">
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ErrorModal;
