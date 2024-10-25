import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import {
  generateBuyHex,
  buyListedCollectible,
} from "@/lib/service/postRequest";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  collectionName: string;
  name: string;
  uniqueIdx: string;
  price: number;
  networkFee: number;
  serviceFee: number;
  total: number;
  listId: string;
}

const BuyAssetModal: React.FC<ModalProps> = ({
  open,
  onClose,
  fileKey,
  collectionName,
  name,
  uniqueIdx,
  price,
  listId,
}) => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: generateBuyHexMutation } = useMutation({
    mutationFn: generateBuyHex,
  });

  const { mutateAsync: buyListedCollectibleMutation } = useMutation({
    mutationFn: buyListedCollectible,
  });

  const handlePendingList = async () => {
    try {
      const params = await generateBuyHexMutation({
        id: listId,
        feeRate: 1,
      });
      if (params && params.success) {
        const psbtHex = params.data.hex;
        const hex = await window.unisat.signPsbt(psbtHex);
        if (hex && listId) {
          const response = await buyListedCollectibleMutation({
            id: listId,
            hex: hex,
          });
          if (response && response.success) {
            setIsSuccess(true);
          }
        }
      }
    } catch (error) {
      console.error("Error pending list:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          {isSuccess ? (
            <div></div>
          ) : (
            <div className="w-full items-center flex flex-col p-6 gap-6">
              <DialogHeader className="flex w-full">
                <div className="text-xl text-neutral00 font-bold text-center">
                  List Asset
                </div>
              </DialogHeader>
              <div className="bg-white8 w-full h-[1px]" />
              <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
                <Image
                  width={160}
                  height={160}
                  src={
                    fileKey
                      ? s3ImageUrlBuilder(fileKey)
                      : ordinalsImageCDN(uniqueIdx)
                  }
                  className="aspect-square rounded-xl"
                  alt={`logo`}
                />
                <div className="flex flex-col gap-2 justify-center items-center">
                  <p className="text-brand text-lg font-medium">
                    {collectionName}
                  </p>
                  <p className="text-xl text-neutral00 font-bold">{name}</p>
                </div>
              </div>
              <div className="bg-white8 w-full h-[1px]" />
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-5 bg-white4 p-4 rounded-2xl">
                  <div className="w-full flex flex-row items-center justify-between">
                    <p className="text-lg text-neutral100 font-medium">
                      List Price
                    </p>
                    <p className="text-lg text-neutral50 font-bold">
                      {(price)?.toFixed(6)} Sats
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="secondary"
                  className="bg-white8 w-full"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button onClick={handlePendingList}>Buy</Button>
              </DialogFooter>
              <button
                className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
                onClick={onClose}
              >
                <X size={20} color="#D7D8D8" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuyAssetModal;
