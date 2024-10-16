import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { X } from "lucide-react";
import { Timer } from "iconsax-react";

interface modalProps {
  open: boolean;
  onClose: () => void;
  status: string;
  orderId: string;
  quantity: number;
}

const OrderDetailModal: React.FC<modalProps> = ({
  open,
  onClose,
  status,
  quantity,
  orderId,
}) => {
  const [networkFee, setNetworkFee] = useState(0.00023);
  const [serviceFee, setServiceFee] = useState(0.00053);
  const totalFee = networkFee + serviceFee;

  const getPaymentStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending...";
      case "INSCRIBED":
        return "Paid";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-[#D7D8D8]";
      case "INSCRIBED":
        return "text-[#2CB59E]";
      default:
        return "text-[#D7D8D8]";
    }
  };

  const getInscribeStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Inscribing will start after payment is received";
      case "INSCRIBED":
        return "Inscribed";
      default:
        return status;
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
          <p className="text-lg2 text-neutral50 font-medium">{orderId}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center w-full">
          <div className="border border-white8 rounded-2xl w-full px-5 pt-4 pb-5 flex flex-col gap-3">
            <p className="text-md text-neutral200 font-medium">Quantity:</p>
            <p className="text-lg text-neutal50 font-medium">{quantity}</p>
          </div>
          <div className="border border-white8 rounded-2xl w-full px-5 pt-4 pb-5 flex flex-col gap-3">
            <p className="text-md text-neutral200 font-medium">Status:</p>
            <p className="text-lg text-neutal50 font-medium">
              {capitalizeFirstLetter(status)}
            </p>
          </div>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-5 p-4 w-full bg-white4 rounded-2xl">
          <div className="flex flex-row justify-between items-center">
            <p className="text-lg2 text-neutral100 font-medium">Network Fee</p>
            <p className="text-lg2 text-neutral50 font-bold">
              {networkFee} Sats
            </p>
          </div>
          <div className="flex flex-row justify-between items-center">
            <p className="text-lg2 text-neutral100 font-medium">Service Fee</p>
            <p className="text-lg2 text-neutral50 font-bold">
              {serviceFee} Sats
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
          <p className="text-lg2 text-neutral100 font-medium">Total Amount</p>
          <p className="text-lg2 text-brand font-bold">{totalFee} Sats</p>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-col gap-4 w-full">
          {status === "CLOSED" ? (
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
                  <div className="h-8 w-8 bg-white8 flex justify-center items-center rounded-[20px]">
                    <p className="text-lg text-brand font-bold">1</p>
                  </div>
                  <p className="text-neutral50 text-lg font-bold">Payment</p>
                </div>
                <p className={`text-lg font-medium ${getStatusColor(status)}`}>
                  {getPaymentStatus(status)}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
                <div className="flex flex-row gap-3 items-center">
                  <div className="h-8 w-8 bg-white8 flex justify-center items-center rounded-[20px]">
                    <p className="text-lg text-neutral50 font-bold">2</p>
                  </div>
                  <p className="text-neutral50 text-lg font-bold">Inscribe</p>
                </div>
                <p className={`text-lg font-medium ${getStatusColor(status)}`}>
                  {getInscribeStatus(status)}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <p className="text-neutral200 text-md font-medium text-start w-full">
          You can see the process of inscribing in Inscribe Order.
        </p>
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

export default OrderDetailModal;