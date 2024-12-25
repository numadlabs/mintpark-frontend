import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Check, Timer, X } from "lucide-react";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { checkOrderStatus, getOrderById } from "@/lib/service/queryHelper";
import { useRouter } from "next/navigation"; // Note: from 'navigation' instead of 'router'

interface modalProps {
  open: boolean;
  onClose: () => void;
  id: string;
  navigateOrders: () => void;
  navigateToCreate: () => void;
  txid: string | undefined;
}

const InscribeOrderModal: React.FC<modalProps> = ({
  open,
  onClose,
  id,
  navigateOrders,
  navigateToCreate,
  txid,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const { data: orders = [] } = useQuery({
    queryKey: ["orderData"],
    queryFn: () => getOrderById(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const { data: paymentStatus = [] } = useQuery({
    queryKey: ["paymentStatus"],
    queryFn:() => checkOrderStatus(id, txid),
    enabled: !!id && !!txid,
    refetchInterval: 5000,
  });

  console.log(paymentStatus)

  const totalFee = orders?.networkFee + orders?.serviceFee;
  const router = useRouter();
  const createOrder = () => {
    onClose();
    navigateOrders();
  };

  const handleNavigation = () => {
    router.push(`/orders`);
    // onClose();
    // navigateToCreate();
  };

  const getPaymentStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Pending...";
      case "IN_QUEUE":
        return "Paid";
      case "DONE":
        return "Minted";
      case "EXPIRED":
        return "Closed";
      default:
        return "Pending...";
    }
  };

  const getStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Pending";
      case "IN_QUEUE":
        return "In queue";
      case "DONE":
        return "Minted";
      case "EXPIRED":
        return "Closed";
      default:
        return "Pending...";
    }
  };

  const getInscribeStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Inscribing will start after payment is recieved";
      case "IN_QUEUE":
        return "The inscription is in queue";
      case "DONE":
        return "Minted";
      case "EXPIRED":
        return "Payment timeout, order closed";
      default:
        return "Pending...";
    }
  };

  const getStatusColor = (status?: string) => {
    // If status is undefined or null, return the default color
    if (!status) {
      return "text-[#B0B0B1]";
    }

    // Convert the input status to uppercase to match our case conditions
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case "PENDING":
        return "text-[#B0B0B1]";
      case "IN_QUEUE":
        return "text-[#6DB5E5]";
      case "DONE":
        return "text-[#2CB59E]";
      case "EXPIRED":
        return "text-[#FF5C69]";
      default:
        return "text-[#B0B0B1]";
    }
  };
  const formatPrice = (price: number) => {
    const btcAmount = price;
    return btcAmount?.toLocaleString('en-US', {
      minimumFractionDigits:0,
      maximumFractionDigits: 6
    });
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-5 max-w-[592px] w-full items-center">
        <DialogHeader className="flex w-full">
          <div className="text-xl text-neutral00 font-bold text-center">
            Inscribe Order
          </div>
        </DialogHeader>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-3 border border-white8 rounded-2xl w-full px-5 pt-4 pb-5">
          <p className="text-neutral200 text-md font-medium">Order ID:</p>
          <p className="text-lg text-neutral50 font-medium">{orders?.id}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center w-full">
          <div className="border border-white8 rounded-2xl w-full px-5 pt-4 pb-5 flex flex-col gap-3">
            <p className="text-md text-neutral200 font-medium">Quantity:</p>
            <p className="text-lg text-neutal50 font-medium">
              {orders?.quantity}
            </p>
          </div>
          <div className="border border-white8 rounded-2xl w-full px-5 pt-4 pb-5 flex flex-col gap-3">
            <p className="text-md text-neutral200 font-medium">Status:</p>
            <p className="text-lg text-neutal50 font-medium">
              {getStatus(orders?.orderStatus)}
            </p>
          </div>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        {/* <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
          <div className="flex flex-row justify-between items-center">
            <p className="text-lg text-neutral100 font-medium">Network Fee</p>
            <p className="text-lg text-neutral50 font-bold">
              {(orders?.networkFee)?.toFixed(4)} Sats
            </p>
          </div>
          <div className="flex flex-row justify-between items-center">
            <p className="text-lg text-neutral100 font-medium">Service Fee</p>
            <p className="text-lg text-neutral50 font-bold">
              {(orders?.serviceFee)?.toFixed(4)} Sats
            </p>
          </div>
        </div> */}
        <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
          <p className="text-lg text-neutral100 font-medium">Total Amount</p>
          <p className="text-lg text-brand font-bold">
            {formatPrice(totalFee)} cBTC
          </p>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-4 w-full">
          {orders?.orderStatus === "CLOSED" ? (
            <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
              <div className="flex flex-row gap-3 items-center">
                <div className="h-8 w-8 bg-white8 flex justify-center items-center rounded-[20px]">
                  <Timer size={20} color="#FF5C69" />
                </div>
                <p className="text-neutral50 text-lg font-bold">Payment</p>
              </div>
              <p className="text-errorMsg text-lg font-medium">
                Payment timeout, order closed.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
                <div className="flex flex-row gap-3 items-center">
                  <div
                    className={`h-8 w-8 ${orders?.orderStatus === "PENDING" ? "bg-white8" : "bg-success"} flex justify-center items-center rounded-[20px]`}
                  >
                    {orders?.orderStatus === "PENDING" ? (
                      <p className="text-lg text-brand font-bold">1</p>
                    ) : (
                      <Check size={16} color="#111315" />
                    )}
                  </div>
                  <p className="text-neutral50 text-lg font-bold">Payment</p>
                </div>
                <p
                  className={`text-lg font-medium ${getStatusColor(orders?.orderStatus)}`}
                >
                  {getPaymentStatus(orders?.orderStatus)}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
                <div className="flex flex-row gap-3 items-center">
                  <div
                    className={`h-8 w-8 ${orders?.orderStatus === "DONE" ? "bg-success" : "bg-white8"} flex justify-center items-center rounded-[20px]`}
                  >
                    {orders?.orderStatus === "DONE" ? (
                      <Check size={16} color="#111315" />
                    ) : (
                      <p className="text-lg text-neutral50 font-bold">2</p>
                    )}
                  </div>
                  <p className="text-neutral50 text-lg font-bold">Inscribe</p>
                </div>
                <p
                  className={`text-lg font-medium ${getStatusColor(orders?.orderStatus)}`}
                >
                  {getInscribeStatus(orders?.orderStatus)}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <p className="text-neutral200 text-lg font-medium text-start w-full">
          You can see the process of inscribing in Inscribe Order.
        </p>
        <DialogFooter className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant={"secondary"}
            className="bg-white8 w-full"
            onClick={createOrder}
          >
            Create again
          </Button>
          <Button onClick={handleNavigation}>Go to Inscribe Order</Button>
        </DialogFooter>
        <button
          className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
          onClick={onClose}
        >
          <X size={20} color="#D7D8D8" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default InscribeOrderModal;
