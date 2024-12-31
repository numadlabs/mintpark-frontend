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
  createCollection,
} from "@/lib/service/postRequest";
import { useAuth } from "../provider/auth-context-provider";
import {
  CollectionData,
  FeeRateAmount,
  InscribeOrderData,
  MintCollectibleDataType,
  MintDataType,
} from "@/lib/types";
import { toast } from "sonner";
import InscribeOrderModal from "./insribe-order-modal";
import { getLayerById } from "@/lib/service/queryHelper";
import { useRouter } from "next/navigation";
import { getSigner } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  fileTypeSizes: number[];
  fileSizes: number[];
  files: File[];
  name: string;
  creator: string;
  description: string;
  navigateOrders: () => void;
  navigateToCreate: () => void;
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
  navigateOrders,
  navigateToCreate,
}) => {
  const router = useRouter();
  const { authState, getAddressforCurrentLayer } = useAuth();
  const connectedWallet = getAddressforCurrentLayer();

  const [feeRate, setFeeRate] = useState<number>(1);
  const [data, setData] = useState<string>("");
  const [inscribeModal, setInscribeModal] = useState(false);
  const [hash, setHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<"Slow" | "Fast" | "Custom">(
    "Custom",
  );
  const [estimatedFee, setEstimatedFee] = useState<EstimatedFee>({
    networkFee: 0,
    serviceFee: 0,
    totalFee: 0,
  });

  const { mutateAsync: createCollectionMutation } = useMutation({
    mutationFn: createCollection,
  });

  const { mutateAsync: feeAmountMutation } = useMutation({
    mutationFn: feeAmount,
  });

  const { mutateAsync: createCollectiblesMutation } = useMutation({
    mutationFn: createMintCollectible,
  });

  const { data: currentLayer } = useQuery({
    queryKey: ["currentLayerData", authState.layerId],
    queryFn: () => getLayerById(authState.layerId as string),
    enabled: !!authState.layerId,
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
      // toast.error("Failed to calculate fee rate");
    }
  }, [feeAmountMutation, feeRate, fileSizes, fileTypeSizes]);

  const handlePay = async () => {
    if (!currentLayer) {
      toast.error("Layer information not available");
      return false;
    }
    setIsLoading(true);
    try {
      const collectionParams: CollectionData = {
        logo: files[0],
        name: name,
        // creator: creator,
        description: description,
        priceForLaunchpad: 0,
        userLayerId: authState.userLayerId,
        layerId: authState.layerId,
        type: "INSCRIPTION",
      };
      if (collectionParams) {
        let collectionTxid;
        let collectionResponse = await createCollectionMutation({
          data: collectionParams,
        });
        if (collectionResponse && collectionResponse.success) {
          const { id } = collectionResponse.data.collection;
          const { deployContractTxHex } = collectionResponse.data;
          setCollectionId(id);
          console.log("create collection success", collectionResponse);

          if (currentLayer.layer === "CITREA") {
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(deployContractTxHex);
            await signedTx?.wait();
            if (signedTx?.hash) collectionTxid = signedTx?.hash;
            console.log(signedTx);
          }
        }
        const params: MintCollectibleDataType = {
          // orderType: "COLLECTIBLE",
          file: files,
          // name: name,
          // creator: creator,
          feeRate: 1,
          txid: collectionTxid,
          collectionId: "",
        };

        const response = await createCollectiblesMutation({ data: params });
        console.log("🚀 ~ handlePay ~ response:", response);
        if (response && response.success) {
          if (currentLayer.layer === "CITREA") {
            const { batchMintTxHex } = response.data;
            const { signer } = await getSigner();
            const signedTx = await signer?.sendTransaction(batchMintTxHex);
            await signedTx?.wait();
            if (signedTx?.hash) setHash(signedTx?.hash);
          } else if (currentLayer.layer === "FRACTAL") {
            console.log(
              response.data.order.fundingAddress,
              response.data.order.fundingAmount,
            );
            await window.unisat.sendBitcoin(
              response.data.order.fundingAddress,
              Math.ceil(response.data.order.fundingAmount),
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setData(response.data.order.id);
          onClose();
          setInscribeModal(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    } finally {
      setIsLoading(false);
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
        ? feeRate
        : selectedTab === "Fast"
          ? feeRate
          : feeRate,
    );
  }, [selectedTab]);

  useEffect(() => {
    if (fileSizes.length > 0 && fileTypeSizes) {
      calculateFeeRate();
    }
  }, [calculateFeeRate, feeRate, fileSizes, fileTypeSizes]);
  const formatPrice = (price: number) => {
    const btcAmount = price;
    return btcAmount?.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
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
            <p className="text-lg text-neutral50 font-medium">
              {connectedWallet?.address}
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
                          <p className="text-lg text-neutral50 font-bold">
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
                      <p className="text-lg text-neutral100 font-medium">
                        Network Fee
                      </p>
                      <p className="text-lg text-neutral50 font-bold">
                        {formatPrice(estimatedFee.networkFee)} Sats
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-lg text-neutral100 font-medium">
                        Service Fee
                      </p>
                      <p className="text-lg text-neutral50 font-bold">
                        {formatPrice(estimatedFee.serviceFee)} Sats
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full bg-white4 rounded-2xl p-4">
                    <p className="text-lg text-neutral100 font-medium">
                      Total Amount
                    </p>
                    <p className="text-lg text-brand font-bold">
                      {formatPrice(estimatedFee.totalFee)} Sats
                    </p>
                  </div>
                </div>
              </TabsContent>
              {/* <div className="h-[1px] w-full bg-white8" /> */}
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
            <Button
              className="flex items-center justify-center"
              onClick={handlePay}
              disabled={isLoading}
            >
              {isLoading
                ? // <Loader2 className="animate-spin" color="#111315" size={24} />
                  "Loading"
                : "Pay"}
            </Button>
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
          id={data}
          navigateOrders={navigateOrders}
          navigateToCreate={navigateToCreate}
          txid={hash}
        />
      )}
    </>
  );
};

export default SubmitPayModal;
