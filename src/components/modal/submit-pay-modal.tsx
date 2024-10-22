import React, { useEffect, useState, useCallback } from "react";
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
import {
  feeAmount,
  createMintCollectible,
} from "@/lib/service/postRequest";
import { useAuth } from "../provider/auth-context-provider";
import {
  FeeRateAmount,
  InscribeOrderData,
  MintCollectibleDataType,
  MintDataType,
} from "@/lib/types";
import { toast } from "sonner";
import InscribeOrderModal from "./insribe-order-modal";
import { getFeeRates } from "@/lib/service/queryHelper";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileTypeSizes: number[];
  fileSizes: number[];
  files: File[];
  name: string;
  creator: string;
  description: string;
}

interface EstimatedFee {
  networkFee: number;
  serviceFee: number;
  totalFee: number;
}

const SubmitPayModal: React.FC<ModalProps> = ({
  open,
  onClose,
  fileSizes,
  fileTypeSizes,
  files,
  name,
  creator,
  description,
}) => {
  const { authState } = useAuth();
  const [feeRate, setFeeRate] = useState<number>(1);
  const [data, setData] = useState<InscribeOrderData | null>(null);
  const [inscribeModal, setInscribeModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"Slow" | "Fast" | "Custom">(
    "Custom",
  );
  const [estimatedFee, setEstimatedFee] = useState<EstimatedFee>({
    networkFee: 0,
    serviceFee: 0,
    totalFee: 0,
  });

  const { mutateAsync: feeAmountMutation } = useMutation({
    mutationFn: feeAmount,
  });

  const { mutateAsync: createCollectiblesMutation } = useMutation({
    mutationFn: createMintCollectible,
  });

  const { data: feeRates = [] } = useQuery({
    queryKey: ["feeRateData"],
    queryFn: () => getFeeRates(authState?.layerId as string),
    enabled: !!authState?.layerId,
  });

  const handleFeeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFeeRate = Number(e.target.value);
    setFeeRate(newFeeRate);
    setSelectedTab("Custom");
  };

  const calculateFeeRate = useCallback(async () => {
    if (fileSizes.length === 0 || !fileTypeSizes.length) {
      console.error("Invalid fileSize or fileType");
      return;
    }

    try {
      const params: FeeRateAmount = {
        feeRate,
        fileSizes,
        fileTypeSizes,
      };
      const response = await feeAmountMutation({ data: params });

      if (response && response.success) {
        setEstimatedFee({
          networkFee: response.data.estimatedFee.networkFee,
          serviceFee: response.data.estimatedFee.serviceFee,
          totalFee: response.data.estimatedFee.totalAmount,
        });
      }
    } catch (error) {
      console.error("Error calculating fee rate:", error);
      toast.error("Failed to calculate fee rate");
    }
  }, [feeAmountMutation, feeRate, fileSizes, fileTypeSizes]);

  const handlePay = async () => {
    try {
      const params: MintCollectibleDataType = {
        orderType: "COLLECTIBLE",
        files: files,
        description: description,
        name: name,
        creator: creator,
        feeRate:
          selectedTab === "Slow"
            ? feeRates?.economyFee
            : selectedTab === "Fast"
              ? feeRates?.fastestFee
              : feeRate,
      };

      const response = await createCollectiblesMutation({ data: params });
      if (response && response.success) {
        console.log(
          response.data.order.fundingAddress,
          response.data.order.fundingAmount,
        );
        await window.unisat.sendBitcoin(
          response.data.order.fundingAddress,
          response.data.order.fundingAmount,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const { id, serviceFee, networkFee, orderStatus, quantity } =
          response.data.order;
        setData({ id, serviceFee, networkFee, quantity, orderStatus });
        onClose();
        setInscribeModal(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    }
  };

  useEffect(() => {
    if (open && fileSizes.length > 0 && fileTypeSizes) {
      calculateFeeRate();
    }
  }, [open, fileSizes, fileTypeSizes, calculateFeeRate]);

  useEffect(() => {
    setFeeRate(
      selectedTab === "Slow"
        ? feeRates?.economyFee
        : selectedTab === "Fast"
          ? feeRates?.fastestFee
          : feeRate,
    );
  }, [selectedTab]);

  useEffect(() => {
    if (fileSizes.length > 0 && fileTypeSizes) {
      calculateFeeRate();
    }
  }, [calculateFeeRate, feeRate, fileSizes, fileTypeSizes]);

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
          <Tabs
            value={selectedTab}
            onValueChange={(value) =>
              setSelectedTab(value as "Slow" | "Fast" | "Custom")
            }
          >
            <div className="flex flex-col gap-4">
              <p className="text-md text-neutral200 font-bold">
                Select the network fee you want to pay
              </p>
              <TabsList>
                <div className="grid grid-cols-3 gap-3 items-center h-full">
                  {["Slow", "Fast", "Custom"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="w-[176px] h-[84px] flex flex-col p-4 gap-2 border-0 data-[state=active]:border-brand data-[state=active]:border bg-white4"
                    >
                      <p className="text-neutral100 text-lg font-medium">
                        {tab}
                      </p>
                      {tab !== "Custom" && (
                        <div className="flex flex-row gap-1 items-center">
                          <p className="text-lg2 text-neutral50 font-bold">
                            {tab === "Slow" ? "1" : "2"}
                          </p>
                          <p className="text-md text-neutral100 font-medium">
                            Sats/vB
                          </p>
                        </div>
                      )}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
              <TabsContent value={selectedTab}>
                <div className="flex flex-col gap-6">
                  {selectedTab === "Custom" && (
                    <div className="flex relative items-center">
                      <Input
                        value={feeRate}
                        onChange={handleFeeRateChange}
                        type="number"
                        min="1"
                      />
                      <div className="absolute right-3.5 top-[25px]">
                        <p className="text-md pr-6  text-neutral200 font-medium">
                          Sats/vB
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="h-[1px] w-full bg-white8" />
                  <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-lg2 text-neutral100 font-medium">
                        Network Fee
                      </p>
                      <p className="text-lg2 text-neutral50 font-bold">
                        {estimatedFee.networkFee} Sats
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-lg2 text-neutral100 font-medium">
                        Service Fee
                      </p>
                      <p className="text-lg2 text-neutral50 font-bold">
                        {estimatedFee.serviceFee} Sats
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full bg-white4 rounded-2xl p-4">
                    <p className="text-lg2 text-neutral100 font-medium">
                      Total Amount
                    </p>
                    <p className="text-lg2 text-brand font-bold">
                      {estimatedFee.totalFee} Sats
                    </p>
                  </div>
                </div>
              </TabsContent>
              <div className="h-[1px] w-full bg-white8" />
            </div>
          </Tabs>
          <div className="h-[1px] w-full bg-white8" />
          <DialogFooter className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              className="bg-white8 w-full"
              onClick={onClose}
            >
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
      {data && (
        <InscribeOrderModal
          open={inscribeModal}
          onClose={() => setInscribeModal(false)}
          data={data}
        />
      )}
    </>
  );
};

export default SubmitPayModal;
