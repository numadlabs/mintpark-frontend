import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSigner, ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import {
  confirmPendingList,
  listCollectiblesForConfirm,
} from "@/lib/service/postRequest";
import { Check } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  uniqueIdx: string;
  collectionName: string;
  name: string;
  collectibleId: string;
  txid: string;
}

const PendingListModal: React.FC<ModalProps> = ({
  open,
  onClose,
  fileKey,
  uniqueIdx,
  collectionName,
  name,
  collectibleId,
  txid,
}) => {
  const router = useRouter();
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hash, setHash] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const { mutateAsync: listCollectiblesMutation } = useMutation({
    mutationFn: listCollectiblesForConfirm,
  });

  const { mutateAsync: confirmPendingListMutation } = useMutation({
    mutationFn: confirmPendingList,
  });

  // if (collectibleRes && collectibleRes.success) {
  //   const id = params.data.list.id;
  //   const address = params.data.list.address;
  //   const inscriptionId = uniqueIdx;
  //   const txid = await window.unisat.sendInscription(
  //     address,
  //     inscriptionId,
  //   );
  //   if (txid && id) {
  //     await new Promise((resolve) => setTimeout(resolve, 5000));

  //     const response = await confirmPendingListMutation({
  //       id: id,
  //       txid: txid,
  //       vout: 0,
  //       inscribedAmount: 546,
  //     });
  //     if (response && response.success) {
  //       router.push("/collections");
  //     }
  //   }
  // }

  const handlePendingList = async () => {
    setIsLoading(true);
    try {
      const collectibleRes = await listCollectiblesMutation({
        collectibleId: collectibleId,
        price: price,
        txid: txid,
      });
      if (collectibleRes && collectibleRes.success) {
        const { preparedListingTx } = collectibleRes.data.list;
        const { id } = collectibleRes.data.list.sanitizedList;
        const { signer } = await getSigner();
        const signedTx = await signer?.sendTransaction(preparedListingTx);
        await signedTx?.wait();
        if (signedTx?.hash) setHash(signedTx?.hash);

        if (id && hash) {
          const response = await confirmPendingListMutation({
            id: id,
            txid: hash,
            vout: 0,
            inscribedAmount: 546,
          });
          if (response && response.success) {
            setSuccess(true);
          }
        }
      }
    } catch (error) {
      console.error("Error pending list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          {success ? (
            <div className="flex flex-col gap-6 w-full items-center justify-center">
              <div className="flex flex-col gap-6 justify-center items-center w-full">
                <div className="flex justify-center items-center rounded-2xl bg-white8">
                  <Check size={40} color="#FFEE32" />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-center text-2xl text-brand font-bold">
                    Listing Successful!
                  </p>
                  <p className="text-2xl font-medium text-neutral50">
                    Your listing was completed successfully.
                  </p>
                </div>
              </div>
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
              <div className="text-white8 w-full h-[1px]" />
              <div className="flex flex-row items-center justify-between rounded-2xl p-4 bg-white8">
                <p className="text-neutral100 text-lg font-medium">
                  Listing price
                </p>
                <p className="text-brand text-lg font-bold">{price}</p>
              </div>
              <div className="text-white8 w-full h-[1px]" />
              <Button
                variant={"secondary"}
                onClick={() => router.push("/assets")}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full items-center">
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
                <Button onClick={handlePendingList} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2
                      className="animate-spin"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "List"
                  )}
                </Button>
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

export default PendingListModal;
