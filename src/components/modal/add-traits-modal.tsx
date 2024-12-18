import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DocumentUpload, Add } from "iconsax-react";
import Image from "next/image";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const AddTraitsModal: React.FC<ModalProps> = ({ open, onClose }) => {
  const [imageFile, setImageFile] = React.useState<File[]>([]);
  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setImageFile([file]);
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          <DialogHeader className="flex w-full relative">
            <div className="text-xl text-neutral00 font-bold text-center">
              Select collection type
            </div>
          </DialogHeader>
          <div className="bg-white8 w-full h-[1px]" />
          {imageFile && imageFile[0] ? (
            <div className=" w-full bg-white4 flex justify-center items-center h-[200px] rounded-xl">
              <Image
                src={URL.createObjectURL(imageFile[0])}
                width={160}
                height={160}
                alt="image"
                sizes="100%"
                className="rounded-xl object-cover"
              />
            </div>
          ) : (
            <div className="border border-dashed border-neutral400 w-full rounded-3xl h-[200px] justify-center items-center flex cursor-pointer">
              <label className="w-full flex items-center justify-center flex-col gap-4 cursor-pointer">
                <DocumentUpload size={48} color={"#b0b0b1"} />
                <div className="flex flex-col gap-2 items-center">
                  <p className="text-xl text-neutral50 font-medium">
                    Click to browse or drag a file here
                  </p>
                  <p className="text-md text-neutral200">
                    Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and
                    GIF.
                  </p>
                </div>
                <input
                  type="file"
                  onChange={handleUploadImage}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          )}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-3">
              <p className="text-neutral50 text-lg font-medium">Trait type</p>
              <Input placeholder="E.g Background" />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-neutral50 text-lg font-medium">Trait value</p>
              <Input placeholder="E.g Black, Red..." />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-neutral50 text-lg font-medium">Trait zIndex</p>
              <Input placeholder="E.g 1,2,3..." />
            </div>
            <Button
              variant={"secondary"}
              className="flex flex-row items-center gap-3 w-fit"
            >
              <Add size={24} color="#D7D8D8" /> Add trait
            </Button>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <DialogFooter className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              className="bg-white8 w-full"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button>Confirm</Button>
          </DialogFooter>
          <DialogClose
            className="absolute h-12 w-12 top-3 right-3 flex justify-center items-center"
            onClick={onClose}
          >
            <X size={24} color="#D7D8D8" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTraitsModal;
