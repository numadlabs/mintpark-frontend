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
import { Gallery, Coin, BuyCrypto } from "iconsax-react";
import { useRouter } from "next/navigation";
import CollectionTypeCard from "../atom/cards/collection-type-card";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const SelectColModal: React.FC<ModalProps> = ({ open, onClose }) => {
  const router = useRouter();
  const handleNavigation = () => {
    router.push("/launchpad");
  };

  const data = [
    {
      title: "Inscription",
      description: "Create inscription directly on the blockchain ",
      icon: Gallery,
      handleNav: () => router.push("/create/collection/inscription"),
    },
    {
      title: "Recursive inscription",
      description: "NFT’s  with customizable traits  and attributes ",
      icon: Coin,
      handleNav: () => router.push("/create/collection/recursive"),
    },
    {
      title: "IPFS",
      description: "Store your NFT’s usign decentralized IPFS storage ",
      icon: BuyCrypto,
      handleNav: () => router.push("/create/collection/ipfs"),
    },
  ];
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
          <div className="flex flex-col w-full gap-4">
            {data.map((item, index) => (
              <CollectionTypeCard
                key={index}
                title={item.title}
                description={item.description}
                icon={item.icon}
                handleNav={item.handleNav}
              />
            ))}
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
            <Button>Continue</Button>
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

export default SelectColModal;
