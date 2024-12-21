import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  formatPrice,
  getSigner,
  ordinalsImageCDN,
  s3ImageUrlBuilder,
} from "@/lib/utils";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateBuyHex,
  buyListedCollectible,
} from "@/lib/service/postRequest";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { id } from "ethers";
import { useAuth } from "../provider/auth-context-provider";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  collectionName: string;
  name: string;
  uniqueIdx: string;
  price: number;
  // networkFee: number;
  // serviceFee: number;
  // total: number;
  listId: string | null;
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
  const queryClient = useQueryClient();
  const params = useParams();
  const { authState } = useAuth();

  const id = params.detailId as string;
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: generateBuyHexMutation } = useMutation({
    mutationFn: generateBuyHex,
  });
  const { mutateAsync: buyListedCollectibleMutation } = useMutation({
    mutationFn: buyListedCollectible,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["acitivtyData", id] });
    },
  });

  // const handlePendingList = async () => {
  //   try {
  //     const params = await generateBuyHexMutation({
  //       id: listId,
  //       feeRate: 1,
  //     });
  //     if (params && params.success) {
  //       const psbtHex = params.data.txHex;
  //       const { signer } = await getSigner();
  //         const signedTx = await signer?.sendTransaction(
  //           response.data.batchMintTxHex,
  //         );
  //         await signedTx?.wait();
  //       const hex = await window.unisat.signPsbt(psbtHex);
  //       if (hex && listId) {
  //         const response = await buyListedCollectibleMutation({
  //           id: listId,
  //           hex: hex,
  //         });
  //         if (response && response.success) {
  //           setIsSuccess(true);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error pending list:", error);
  //   }
  // };

  const handlePendingList = async () => {
    setIsLoading(true);
    try {
      const pendingRes = await generateBuyHexMutation({
        id: listId,
        feeRate: 1,
        userLayerId: authState.userLayerId as string,
      });
      if (pendingRes && pendingRes.success) {
        let txid;
        const { signer } = await getSigner();
        const signedTx = await signer?.sendTransaction(pendingRes.data.txHex);
        await signedTx?.wait();

        if (signedTx?.hash) {
          const response = await buyListedCollectible({
            id: listId,
            txid: signedTx?.hash,
            userLayerId: authState.userLayerId as string,
          });
          if (response && response.success) {
            setIsSuccess(true);
            toast.success("Purchase successful");
            queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
            queryClient.invalidateQueries({ queryKey: ["acitivtyData", id] });
          } else {
            toast.error("Error");
          }
        } else {
          toast.error("txid missing error");
        }
      } else {
        toast.error("Sent buy request error");
      }
    } catch (error) {
      toast.error("Error pending list.");
      console.error("Error pending list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          {isSuccess ? (
            <div className="w-full flex flex-col gap-6 items-center justify-center">
              <div className="flex flex-col gap-6 p-4 w-full justify-center items-center">
                <div className="p-3 flex justify-center items-center rounded-2xl bg-white8 w-16 h-16">
                  <Check size={40} color="#FFEE32" />
                </div>
                <div className="flex flex-col gap-3 justify-center items-center">
                  <p className="text-2xl text-brand font-bold">
                    Purchase Successful!
                  </p>
                  <p className="text-lg text-neutral50 font-medium">
                    Your purchase was completed successfully.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 justify-center items-center w-full bg-white4 rounded-2xl p-8">
                <Image
                  width={160}
                  height={160}
                  src={fileKey}
                  className="aspect-square rounded-xl"
                  alt={`logo`}
                />
                <div className="flex flex-col gap-2 justify-center items-center">
                  <p className="text-lg text-brand font-medium">
                    {collectionName}
                  </p>
                  <p className="text-xl text-neutral50 font-bold">{name}</p>
                </div>
              </div>
              <div className="h-[1px] w-full bg-white8" />
              <Button
                variant={"secondary"}
                className="w-full"
                // onClick={() => router.push("/collections")}
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="w-full items-center flex flex-col gap-6">
              <DialogHeader className="flex w-full">
                <div className="text-xl text-neutral00 font-bold text-center">
                  Buy Asset
                </div>
              </DialogHeader>
              <div className="bg-white8 w-full h-[1px]" />
              <div className="w-full flex flex-col gap-8 py-8 bg-white4 justify-center items-center rounded-2xl">
                <Image
                  width={160}
                  height={160}
                  src={fileKey}
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
                      {formatPrice(price)} cBTC
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
                <Button onClick={handlePendingList} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2
                      className="animate-spin w-full"
                      color="#111315"
                      size={24}
                    />
                  ) : (
                    "Buy"
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

export default BuyAssetModal;
