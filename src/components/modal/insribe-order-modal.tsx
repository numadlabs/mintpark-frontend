import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { checkOrderStatus, getOrderById } from "@/lib/service/queryHelper";
import router from "next/router";

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
  txid
}) => {
  const { data: orders = [] } = useQuery({
    queryKey: ["orderData"],
    queryFn: () => getOrderById(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });
  const { data: status = [] } = useQuery({
    queryKey: ["statusData"],
    queryFn: () => checkOrderStatus(id, txid),
    enabled: !!id,
    refetchInterval: 5000,
  });

  console.log("status", status);
  const totalFee = orders?.networkFee + orders?.serviceFee;
  console.log("oasdfkid", orders);

  const createOrder = () => {
    onClose();
    navigateOrders();
  };

  const handleNavigation = () => {
    onClose();
    navigateToCreate();
    router.push('/orders');
  };

  const getInscribeStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Inscribing will start after payment is received";
      case "IN_QUEUE":
        return "The inscription is in queue";
      case "DONE":
        return "Inscribed";
      case "EXPIRED":
        return "Payment timeout, order closed";
      default:
        return "Unknown status";
    }
  };

  const getPaymentStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Pending...";
      case "IN_QUEUE":
        return "Paid";
      case "DONE":
        return "Inscribed";
      case "EXPIRED":
        return "Closed";
      default:
        return "Unknown status";
    }
  };

  const getStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Pending";
      case "IN_QUEUE":
        return "In queue";
      case "DONE":
        return "Inscribed";
      case "EXPIRED":
        return "Closed";
      default:
        return "Unknown status";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[592px] w-full items-center">
        <DialogHeader className="flex w-full">
          <div className="text-xl text-neutral00 font-bold text-center">
            Inscribe Order
          </div>
        </DialogHeader>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-3 border border-white8 rounded-2xl w-full px-5 pt-4 pb-5">
          <p className="text-neutral200 text-md font-medium">Order ID:</p>
          <p className="text-lg2 text-neutral50 font-medium">{orders?.id}</p>
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
        <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
          <div className="flex flex-row justify-between items-center">
            <p className="text-lg2 text-neutral100 font-medium">Network Fee</p>
            <p className="text-lg2 text-neutral50 font-bold">
              {(orders?.networkFee/10**8).toFixed(4)} Sats
            </p>
          </div>
          <div className="flex flex-row justify-between items-center">
            <p className="text-lg2 text-neutral100 font-medium">Service Fee</p>
            <p className="text-lg2 text-neutral50 font-bold">
              {(orders?.serviceFee/10**8).toFixed(4)} Sats
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
          <p className="text-lg2 text-neutral100 font-medium">Total Amount</p>
          <p className="text-lg2 text-brand font-bold">{(totalFee/10**8).toFixed(4)} Sats</p>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
            <div className="flex flex-row gap-3 items-center">
              <div className="h-8 w-8 bg-white8 flex justify-center items-center rounded-[20px]">
                <p className="text-lg text-brand font-bold">1</p>
              </div>
              <p className="text-neutral50 text-lg font-bold">Payment</p>
            </div>
            <p className="text-neutral50 text-lg font-medium">
              {getPaymentStatus(orders.orderStatus)}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
            <div className="flex flex-row gap-3 items-center">
              <div className="h-8 w-8 bg-white8 flex justify-center items-center rounded-[20px]">
                <p className="text-lg text-neutral50 font-bold">2</p>
              </div>
              <p className="text-neutral50 text-lg font-bold">Inscribe</p>
            </div>
            <p className="text-neutral50 text-lg font-medium">
              {getInscribeStatus((orders?.orderStatus/10**8).toFixed(4))}
            </p>
          </div>
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
