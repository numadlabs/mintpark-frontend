import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSigner, ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmPendingList,
  listCollectiblesForConfirm,
} from "@/lib/service/postRequest";
import { toast } from "sonner";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  uniqueIdx: string;
  collectionName: string;
  name: string;
  collectibleId: string;
  txid: string;
  id: string;
}

const PendingListModal: React.FC<ModalProps> = ({
  open,
  onClose,
  imageUrl,
  uniqueIdx,
  collectionName,
  name,
  collectibleId,
  txid,
  id,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [price, setPrice] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { mutateAsync: listCollectiblesMutation } = useMutation({
    mutationFn: listCollectiblesForConfirm,
  });

  const { mutateAsync: confirmPendingListMutation } = useMutation({
    mutationFn: confirmPendingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["acitivtyData", id] });
    },
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Return to '0' if input is empty
    if (newValue === "") {
      setPrice("0");
      return;
    }

    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(newValue)) {
      return;
    }

    // Remove leading zeros unless it's a decimal
    if (newValue.length > 1 && newValue[0] === "0" && newValue[1] !== ".") {
      setPrice(String(parseInt(newValue, 10)));
      return;
    }

    setPrice(newValue);
  };

  const handlePriceBlur = () => {
    if (price === "" || parseFloat(price) < 0) {
      setPrice("0");
    }
  };

  const handlePendingList = async () => {
    setIsLoading(true);
    try {
      const collectibleRes = await listCollectiblesMutation({
        collectibleId: collectibleId,
        price: parseFloat(price),
        txid: txid,
      });
      if (collectibleRes && collectibleRes.success) {
        let txid;
        const { preparedListingTx } = collectibleRes.data.list;
        const { id } = collectibleRes.data.list.sanitizedList;
        const { signer } = await getSigner();
        const signedTx = await signer?.sendTransaction(preparedListingTx);
        await signedTx?.wait();
        if (signedTx?.hash) txid = signedTx?.hash;

        if (id && txid) {
          const response = await confirmPendingListMutation({
            id: id,
            txid: txid,
            vout: 0,
            inscribedAmount: 546,
          });
          if (response && response.success) {
            setSuccess(true);
            toast.success("Successfully.");
          }
        }
      } else {
        toast.error(collectibleRes.error);
      }
    } catch (error) {
      toast.error("error pending list.");
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
                <div className="flex justify-center p-3 items-center rounded-2xl bg-white8">
                  <Check size={40} color="#FFEE32" />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-center text-2xl text-brand font-bold">
                    Listing Successful!
                  </p>
                  <p className="text-lg font-medium text-neutral50">
                    Your listing was completed successfully.
                  </p>
                </div>
              </div>
              <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
                <Image
                  width={160}
                  height={160}
                  src={imageUrl}
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
              <div className="flex flex-row items-center w-full justify-between rounded-2xl p-4 bg-white8">
                <p className="text-neutral100 text-lg font-medium">
                  Listing price
                </p>
                <p className="text-brand text-lg font-bold">{price}</p>
              </div>
              <div className="bg-white8 w-full h-[1px]" />
              <Button
                variant={"secondary"}
                onClick={onClose}
                className="w-full"
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
                  src={imageUrl}
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
                  type="text"
                  value={price}
                  onChange={handlePriceChange}
                  onBlur={handlePriceBlur}
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
                      className="animate-spin w-full"
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
