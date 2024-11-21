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

  const statusConfig = {
    PENDING: {
      inscribeMessage: "Inscribing will start after payment is received",
      paymentMessage: "Pending...",
      status: "Pending",
      colorClass: "text-neutral-400",
      bgClass: "bg-transparent",
    },
    IN_QUEUE: {
      inscribeMessage: "The inscription is in queue",
      paymentMessage: "Paid",
      status: "In queue",
      colorClass: "text-blue-400",
      bgClass: "bg-transparent",
    },
    DONE: {
      // inscribeMessage: "Minted",
      paymentMessage: "Minted",
      status: "Minted",
      colorClass: "text-emerald-400",
      bgClass: "bg-transparent",
    },
    EXPIRED: {
      inscribeMessage: "Payment timeout, order closed",
      paymentMessage: "Closed",
      status: "Closed",
      colorClass: "text-red-400",
      bgClass: "bg-transparent",
    },
  };

  const currentStatus =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="flex flex-col p-4 sm:p-6 gap-4 sm:gap-6 max-w-[592px] w-full mx-auto 
                               bg-neutral-900 border border-neutral-800 rounded-xl"
      >
        <DialogHeader className="flex w-full relative">
          <h2 className="text-lg sm:text-xl font-bold text-center text-neutral-50 w-full">
            Inscribe Order
          </h2>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-neutral-800 rounded-lg 
                     transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </DialogHeader>

        <div className="h-px w-full bg-neutral-800" />

        {/* Order ID Section */}
        <div className="flex flex-col gap-2 border border-neutral-800 rounded-xl p-4">
          <p className="text-sm text-neutral-400">Order ID:</p>
          <p className="text-base sm:text-lg font-medium text-neutral-50 break-all">
            {orderId}
          </p>
        </div>

        {/* Quantity and Status Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="border border-neutral-800 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-sm text-neutral-400">Quantity:</p>
            <p className="text-base sm:text-lg font-medium text-neutral-50">
              {quantity}
            </p>
          </div>
          <div className="border border-neutral-800 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-sm text-neutral-400">Status:</p>
            <div
              className={`inline-flex px-3 py-1 bg-transparent rounded-full ${currentStatus.bgClass} ${currentStatus.colorClass} 
                          text-sm font-medium w-fit`}
            >
              {currentStatus.status}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-neutral-800" />

        {/* Total Amount Section */}
        <div className="flex flex-row justify-between items-center w-full bg-neutral-800/50 rounded-xl p-4">
          <p className="text-base text-neutral-300">Total Amount</p>
          <p className="text-base sm:text-lg font-bold text-brand500">
            {formatPrice(totalFee)} cBTC
          </p>
        </div>

        <div className="h-px w-full bg-neutral-800" />

        {/* Status Timeline Section */}
        <div className="flex flex-col gap-4 w-full">
          {status === "EXPIRED" ? (
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between 
                          w-full bg-neutral-800/50 p-4 rounded-xl gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-neutral-800 flex items-center justify-center rounded-full">
                  <Timer className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-base sm:text-lg font-bold text-neutral-50">
                  Payment
                </p>
              </div>
              <p className="text-red-400 text-sm sm:text-base font-medium">
                Payment timeout, order closed.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Status */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between 
                            w-full bg-neutral-800/50 p-4 rounded-xl gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full
                                ${status === "PENDING" ? "bg-neutral-800" : "bg-emerald-400"}`}
                  >
                    {status === "PENDING" ? (
                      <span className="text-blue-400 font-bold">1</span>
                    ) : (
                      <Check className="w-4 h-4 text-neutral-900" />
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-bold text-neutral-50">
                    Payment
                  </p>
                </div>
              </div>

              {/* Inscribe Status */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between 
                            w-full bg-neutral-800/50 p-4 rounded-xl gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full
                                ${status === "DONE" ? "bg-emerald-400" : "bg-neutral-800"}`}
                  >
                    {status === "DONE" ? (
                      <Check className="w-4 h-4 text-neutral-900" />
                    ) : (
                      <span className="text-neutral-50 font-bold">2</span>
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-bold text-neutral-50">
                    Inscribe
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
