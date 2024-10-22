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
  confirmPendingList,
  listCollectibleConfirm,
} from "@/lib/service/postRequest";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  uniqueIdx: string;
  collectionName: string;
  name: string;
  collectibleId: string;
}

const PendingListModal: React.FC<ModalProps> = ({
  open,
  onClose,
  fileKey,
  uniqueIdx,
  collectionName,
  name,
  collectibleId,
}) => {
  const router = useRouter();
  const [price, setPrice] = useState<number>(0);
  const { mutateAsync: listCollectibleConfirmMutation } = useMutation({
    mutationFn: listCollectibleConfirm,
  });

  const { mutateAsync: confirmPendingListMutation } = useMutation({
    mutationFn: confirmPendingList,
  });

  const handlePendingList = async () => {
    try {
      const params = await listCollectibleConfirmMutation({
        collectibleId: collectibleId,
        price: price,
      });
      if (params && params.success) {
        const id = params.data.list.id;
        const address = params.data.list.address;
        const inscriptionId = uniqueIdx;
        const txid = await window.unisat.sendInscription(
          address,
          inscriptionId,
        );
        if (txid && id) {
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const response = await confirmPendingListMutation({
            id: id,
            txid: txid,
            vout: 0,
            inscribedAmount: 546,
          });
          if (response && response.success) {
            router.push("/collections");
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
              <p className="text-brand text-lg font-medium">{collectionName}</p>
              <p className="text-xl text-neutral00 font-bold">{name}</p>
            </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <div className="flex flex-col gap-3 w-full">
            <p>Listing Price</p>
            <Input
              placeholder="Enter listing price"
              className="bg-gray50"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              className="bg-white8 w-full"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handlePendingList}>List</Button>
          </DialogFooter>
          <button
            className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
            onClick={onClose}
          >
            <X size={20} color="#D7D8D8" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingListModal;
