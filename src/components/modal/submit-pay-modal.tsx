import React, { useState } from "react";
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
import { useAuth } from "../provider/auth-context-provider";
import InscribeOrderModal from "./insribe-order-modal";
import { useRouter } from "next/navigation";

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
  navigateOrders,
  navigateToCreate,
}) => {
const { currentUserLayer, currentLayer } = useAuth();
const connectedWallet = currentUserLayer?.address || currentLayer?.name || "Not connected";

  const [feeRate, setFeeRate] = useState<number>(1);
  const [data, setData] = useState<string>("");
  const [inscribeModal, setInscribeModal] = useState(false);
  const [hash, setHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"Slow" | "Fast" | "Custom">(
    "Custom"
  );
  const [estimatedFee, setEstimatedFee] = useState<EstimatedFee>({
    networkFee: 0,
    serviceFee: 0,
    totalFee: 0,
  });

  const handleFeeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFeeRate = Number(e.target.value);
    setFeeRate(newFeeRate);
    setSelectedTab("Custom");
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
              {connectedWallet}
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
                        {estimatedFee.networkFee} Sats
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-lg text-neutral100 font-medium">
                        Service Fee
                      </p>
                      <p className="text-lg text-neutral50 font-bold">
                        {estimatedFee.serviceFee} Sats
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full bg-white4 rounded-2xl p-4">
                    <p className="text-lg text-neutral100 font-medium">
                      Total Amount
                    </p>
                    <p className="text-lg text-brand font-bold">
                      {estimatedFee.totalFee} Sats
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
