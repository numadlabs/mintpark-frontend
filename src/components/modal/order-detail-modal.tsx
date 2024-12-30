import React from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { X, Check } from "lucide-react";
import { Timer } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  status: string;
  orderId: string;
  quantity: number;
  networkFee: number;
  serviceFee: number;
}

const OrderDetailModal: React.FC<ModalProps> = ({
  open,
  onClose,
  status,
  quantity,
  orderId,
  networkFee,
  serviceFee,
}) => {
  const totalFee = networkFee + serviceFee;

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
  const getStatusColor = (status: string) => {
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
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
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
          <p className="text-lg2 text-neutral50 font-medium truncate">
            {orderId}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center w-full">
          <div className="border border-white8 rounded-2xl w-full px-5 pt-4 pb-5 flex flex-col gap-3">
            <p className="text-md text-neutral200 font-medium">Quantity:</p>
            <p className="text-lg text-neutal50 font-medium">{quantity}</p>
          </div>
          <div className="border border-white8 rounded-2xl w-full px-5 pt-4 pb-5 flex flex-col gap-3">
            <p className="text-md text-neutral200 font-medium">Status:</p>
            <p className="text-lg text-neutal50 font-medium">
              {getStatus(status)}
            </p>
          </div>
        </div>
        <div className="h-[1px] w-full bg-white8" />
        <div className="flex flex-row justify-between items-center -4 w-full bg-white4 rounded-2xl p-4">
          <p className="text-lg2 text-neutral100 font-medium">Total Amount</p>
          <p className="text-lg2 text-brand font-bold">
            {" "}
            {formatPrice(totalFee)} cBTC
          </p>
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
                {" "}
                Payment timeout, order closed.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-row items-center justify-between w-full bg-white4 p-4 rounded-2xl">
                <div className="flex flex-row gap-3 items-center">
                  <div
                    className={`h-8 w-8 ${
                      status === "PENDING" ? "bg-white8" : "bg-success"
                    } flex justify-center items-center rounded-[20px]`}
                  >
                    {status === "PENDING" ? (
                      <p className="text-lg text-brand font-bold">1</p>
                    ) : (
                      <Check size={16} color="#111315" />
                    )}
                  </div>
                  <p className="text-neutral50 text-lg font-bold">Payment</p>
                </div>
                <p className={`text-lg font-medium ${getStatusColor(status)}`}>
                  {getPaymentStatus(status)}
                </p>
              </div>
              <div className="flex flex-row items-center gap-4 sm:justify-between w-full bg-white4 p-4 rounded-2xl">
                <div className="flex flex-row gap-3 items-center">
                  <div
                    className={`h-8 w-8 ${
                      status === "DONE" ? "bg-success" : "bg-white8"
                    } flex justify-center items-center rounded-[20px]`}
                  >
                    {status === "DONE" ? (
                      <Check size={16} color="#111315" />
                    ) : (
                      <p className="text-lg text-neutral50 font-bold">2</p>
                    )}
                  </div>
                  <p className="text-neutral50 text-lg font-bold">Inscribe</p>
                </div>
                <p
                  className={`text-lg font-medium text-end truncate ${getStatusColor(
                    status
                  )}`}
                >
                  {getInscribeStatus(status)}
                </p>
              </div>
            </>
          )}
        </div>
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
