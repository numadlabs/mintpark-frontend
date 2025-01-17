import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelList, confirmCancelList } from "@/lib/service/postRequest";
import { getSigner } from "@/lib/utils";
import { toast } from "sonner";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  id: string;
  listId: string | null;
}

const CancelListModal: React.FC<ModalProps> = ({
  open,
  onClose,
  id,
  listId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: cancelListMutation } = useMutation({
    mutationFn: cancelList,
  });

  const { mutateAsync: confirmCancelListMutation } = useMutation({
    mutationFn: confirmCancelList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionData", id] });
      queryClient.invalidateQueries({ queryKey: ["activityData", id] });
    },
  });

  const handleCancelList = async () => {
    setIsLoading(true);

    try {
      if (listId) {
        const txResponse = await cancelListMutation({ id: listId });
        if (txResponse && txResponse.data.result) {
          // const { approveTxHex } = txResponse.data;
          const { signer } = await getSigner();
          const signedTx = await signer?.sendTransaction(
            txResponse.data.result,
          );
          await signedTx?.wait();

          const response = await confirmCancelListMutation({ id: listId });
          if (response && response.success) {
            onClose();
            toast.success("Successfully cancelled");
          }
        }
      }
    } catch (error: any) {
      console.error("Error listing:", error);
      toast.error("Error cancel listing: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
          <div className="w-full flex flex-col gap-8 pt-12 pb-8 bg-white4 justify-center items-center rounded-2xl">
            <div className="w-20 h-20 flex justify-center items-center bg-white8 rounded-2xl">
              <X size={32} color="#FF5C69" />
            </div>
            <div className="flex flex-col gap-3 justify-center items-center">
              <p className="text-neutral00 text-2xl font-bold">
                Cancel Listing
              </p>
              <p className="text-lg text-neutral50 font-medium">
                Are you sure you want to cancel listing?
              </p>
            </div>
          </div>
          <div className="bg-white8 w-full h-[1px]" />
          <DialogFooter className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              className="bg-white8 w-full"
              onClick={onClose}
            >
              No
            </Button>
            <Button onClick={handleCancelList} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" color="#111315" size={24} />
              ) : (
                "Yes, Cancel Listing"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancelListModal;
