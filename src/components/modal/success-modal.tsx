import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { TickCircle } from "iconsax-react";
import { useRouter } from "next/navigation";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  handleCreate: () => void;
}

const SuccessModal: React.FC<ModalProps> = ({ open, onClose, handleCreate }) => {
    const router = useRouter();
    const handleNavigation = () => {
        router.push("/launchpad");
      };
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          <div className="w-full flex flex-col gap-8 pt-12 pb-8 bg-white4 justify-center items-center rounded-2xl">
            <div className="p-4 flex justify-center items-center bg-white8 rounded-2xl">
              <TickCircle size={48} color="#FFEE32" />
            </div>
            <div className="flex flex-col gap-3 justify-center items-center">
              <p className="text-brand text-2xl font-bold">Success!</p>
              <p className="text-lg text-neutral50 font-medium">
                Your collection is in Launchpad now!
              </p>
            </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <DialogFooter className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              className="bg-white8 w-full"
              onClick={handleCreate}
            >
              Create again
            </Button>
            <Button onClick={handleNavigation}>Go to Launchpad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuccessModal;
