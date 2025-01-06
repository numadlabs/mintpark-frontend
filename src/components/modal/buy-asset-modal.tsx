import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useAuth } from "../provider/auth-context-provider";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  collectionName: string;
  name: string;
  uniqueIdx: string;
  price: number;
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
                <Button disabled={isLoading}>
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
