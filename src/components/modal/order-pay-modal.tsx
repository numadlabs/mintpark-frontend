import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getFeeRatesByLayer } from "@/lib/service/queryHelper";
import {
  feeAmount,
  createCollectibleMint,
  createOrder,
  createMintCollection
} from "@/lib/service/postRequest";
import { useAuth } from "../provider/auth-context-provider";
import { CollectibleDataType, FeeRateAmount, InscribeOrderData } from "@/lib/types";
import { toast } from "sonner";
import InscribeOrderModal from "./insribe-order-modal";

interface modalProps {
  open: boolean;
  onClose: () => void;
  fileType: string;
  fileSize: number;
  id: string;
}

interface EstimatedFee {
  networkFee: number;
  serviceFee: number;
  totalFee: number;
}

const OrderPayModal: React.FC<modalProps> = ({
  open,
  onClose,
  fileSize,
  fileType,
  id
}) => {
  const { authState } = useAuth();
  const [feeRate, setFeeRate] = useState<number>(0);
  const [data, setData] = useState<InscribeOrderData | null>(null);
  const [orderType, setOrderType] = useState<string>("")
  const [inscribeModal, setInscribeModal] = useState(false);

  const toggleInscribeModal = () => {
    setInscribeModal(!inscribeModal);
  };

  const [estimatedFee, setEstimatedFee] = useState<{
    slow: EstimatedFee;
    fast: EstimatedFee;
    custom: EstimatedFee;
  }>({
    slow: { networkFee: 0, serviceFee: 0, totalFee: 0 },
    fast: { networkFee: 0, serviceFee: 0, totalFee: 0 },
    custom: { networkFee: 0, serviceFee: 0, totalFee: 0 },
  });

  const { mutateAsync: feeAmountMutation } = useMutation({
    mutationFn: feeAmount,
  });

  const { mutateAsync: createOrderMutation } = useMutation({
    mutationFn: createOrder,
  });

  const { mutateAsync: createMintMutation } = useMutation({
    mutationFn: createMintCollection,
  });

  const calculateFeeAmount = async (feeRate: number): Promise<EstimatedFee> => {
    try {
      const feeRateAmount: FeeRateAmount = {
        fileSize: fileSize,
        layerType: "BITCOIN_TESTNET",
        fileType: fileType,
        feeRate: feeRate,
      };
      const result = await feeAmountMutation({ data: feeRateAmount });
      
      // Check if result is null or undefined, or if estimatedFee is missing
      if (!result || !result.estimatedFee) {
        console.error('Invalid response from feeAmountMutation:', result);
        return { networkFee: 0, serviceFee: 0, totalFee: 0 };
      }
      
      return result.estimatedFee;
    } catch (error) {
      console.error("Error calculating fee amount:", error);
      return { networkFee: 0, serviceFee: 0, totalFee: 0 };
    }
  };
  const updateAllEstimatedFees = async () => {
    try {
      const slowFee = await calculateFeeAmount(1);  // Always use 1 for slow
      const fastFee = await calculateFeeAmount(1);  // Always use 1 for fast
      const customFee = await calculateFeeAmount(feeRate);

      setEstimatedFee({
        slow: slowFee,
        fast: fastFee,
        custom: customFee,
      });
    } catch (error) {
      console.error("Error updating estimated fees:", error);
      // Set default values if there's an error
      setEstimatedFee({
        slow: { networkFee: 0, serviceFee: 0, totalFee: 0 },
        fast: { networkFee: 0, serviceFee: 0, totalFee: 0 },
        custom: { networkFee: 0, serviceFee: 0, totalFee: 0 },
      });
    }
  };

  useEffect(() => {
    updateAllEstimatedFees();
  }, [feeRate]);

  const handleFeeRateChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFeeRate = Number(e.target.value);
    setFeeRate(newFeeRate);
    const customFee = await calculateFeeAmount(newFeeRate);
    setEstimatedFee((prev) => ({ ...prev, custom: customFee }));
  };

  const handlePay = async () => {
    try {
      if (id) {
        const response = await createOrderMutation({ id: id, feeRate: feeRate });
        if (response && response.success) {
          let txid = await window.unisat.sendBitcoin(
            response.data.fundingAddress,
            response.data.requiredAmountToFund + 546,
          );
          const {
            orderId,
            serviceFee,
            networkFee,
            status,
            quantity
          } = response.data;
          setData({ orderId, serviceFee, networkFee, quantity, status });
          onClose();
          setInscribeModal(true);
          if (txid) {
            await new Promise((resolve) => setTimeout(resolve, 1000000));

            const res = await createMintMutation({id: response.data.orderId  });
            if (res && res.success) {
              console.log("Minting successful");
              const { orderStatus } = res.data;
              setOrderType(orderStatus);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
        <DialogHeader className="flex w-full">
          <div className="text-xl text-neutral00 font-bold text-center">
            Submit and Pay invoice
          </div>
        </DialogHeader>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-3 border border-white8 rounded-2xl w-full px-5 pt-4 pb-5">
          <p className="text-neutral200 text-md font-medium">
            Wallet address to receive the assets:
          </p>
          <p className="text-lg2 text-neutral50 font-medium">
            {authState?.address}
          </p>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <Tabs defaultValue="Custom">
          <div className="flex flex-col gap-4">
            <p className="text-md text-neutral200 font-bold">
              Select the network fee you want to pay
            </p>
            <TabsList>
              <div className="grid grid-cols-3 gap-3 items-center">
                <TabsTrigger
                  value="Slow"
                  className="max-w-[176px] w-screen flex flex-col p-4 gap-2 border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                >
                  <p className="text-neutral100 text-lg font-medium">Slow</p>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-lg2 text-neutral50 font-bold">
                      1
                    </p>
                    <p className="text-md text-neutral100 font-medium">
                      Sats/vB
                    </p>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Fast"
                  className="max-w-[176px] w-screen flex flex-col p-4 gap-2 border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                >
                  <p className="text-neutral100 text-lg font-medium">Fast</p>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-lg2 text-neutral50 font-bold">
                      1
                    </p>
                    <p className="text-md text-neutral100 font-medium">
                      Sats/vB
                    </p>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Custom"
                  className="max-w-[176px] w-screen h-full text-neutral100 text-lg font-medium border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                >
                  Custom
                </TabsTrigger>
              </div>
            </TabsList>
            <TabsContent value="Slow">
              <div className="flex flex-col gap-6">
                <div className="h-[1px] w-full bg-white8" />
                <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Network Fee
                    </p>
                    <p className="text-lg2 text-neutral50 font-bold">
                      {estimatedFee.slow.networkFee} Sats
                    </p>
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Service Fee
                    </p>
                    <p className="text-lg2 text-neutral50 font-bold">
                      {estimatedFee.slow.serviceFee} Sats
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
                  <p className="text-lg2 text-neutral100 font-medium">
                    Total Amount
                  </p>
                  <p className="text-lg2 text-brand font-bold">
                    {estimatedFee.slow.totalFee} Sats
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="Fast">
              <div className="flex flex-col gap-6">
                <div className="h-[1px] w-full bg-white8" />
                <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Network Fee
                    </p>
                    <p className="text-lg2 text-neutral50 font-bold">
                      {estimatedFee.fast.networkFee} Sats
                    </p>
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Service Fee
                    </p>
                    <p className="text-lg2 text-neutral50 font-bold">
                      {estimatedFee.fast.serviceFee} Sats
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
                  <p className="text-lg2 text-neutral100 font-medium">
                    Total Amount
                  </p>
                  <p className="text-lg2 text-brand font-bold">
                    {estimatedFee.fast.totalFee} Sats
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="Custom">
              <div className="flex flex-col gap-6">
                <div className="flex relative items-center">
                  <Input value={feeRate} onChange={handleFeeRateChange} />
                  <div className="absolute right-3.5 top-[25px]">
                    <p className="text-md text-neutral200 font-medium">
                      Sats/vB
                    </p>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-white8" />
                <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Network Fee
                    </p>
                    <p className="text-lg2 text-neutral50 font-bold">
                      {estimatedFee.custom.networkFee} Sats
                    </p>
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Service Fee
                    </p>
                    <p className="text-lg2 text-neutral50 font-bold">
                      {estimatedFee.custom.serviceFee} Sats
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
                  <p className="text-lg2 text-neutral100 font-medium">
                    Total Amount
                  </p>
                  <p className="text-lg2 text-brand font-bold">
                    {estimatedFee.custom.totalFee} Sats
                  </p>
                </div>
              </div>
            </TabsContent>
            <div className="h-[1px] w-full bg-white8" />
          </div>
        </Tabs>
        <div className="h-[1px] w-full bg-white8" />
        <DialogFooter className="grid grid-cols-2 gap-2 w-full">
          <Button variant={"secondary"} className="bg-white8 w-full">
            Cancel
          </Button>
          <Button onClick={handlePay}>Pay</Button>
        </DialogFooter>
        <button
          className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
          onClick={onClose}
        >
          <X size={20} color="#D7D8D8" />
        </button>
      </DialogContent>
    </Dialog>
    {data &&<InscribeOrderModal open={inscribeModal} onClose={toggleInscribeModal} data={data} orderStatus={orderType} />}
    </>
  );
};

export default OrderPayModal;