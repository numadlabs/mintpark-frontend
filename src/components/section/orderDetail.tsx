import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { checkOrderStatus, getAllOrders } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight2 } from "iconsax-react";
import OrderDetailModal from "../modal/order-detail-modal";
import { Input } from "../ui/input";
import { useAuth } from "../provider/auth-context-provider";

interface Order {
  id: string;
  quantity: number;
  orderStatus: string;
  createdAt: string;
  networkFee: number;
  serviceFee: number;
}

const OrderDetail = () => {
  const { authState } = useAuth();
  const [orderModal, setOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  const id = authState?.userId;

  const { data: ordersData = [] } = useQuery({
    queryKey: ["orderDataType"],
    queryFn: () => getAllOrders(id as string),
    enabled: !!id,
  });

  // const { data: status = [] } = useQuery({
  //   queryKey: ["statusData"],
  //   queryFn: () => checkOrderStatus(id, txid),
  //   enabled: !!id,
  //   refetchInterval: 5000,
  // });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];

    return orders.filter((order: Order) =>
      order?.id?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [orders, searchTerm]);

  // const formatDateTime = (dateString: any) => {
  //   const date = new Date(dateString);
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const hours = String(date.getHours()).padStart(2, "0");
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  //   return `${year}/${month}/${day}, ${hours}:${minutes}`;
  // };
  const formatDateTime = (dateString: any) => {
    const date = new Date(dateString);
    const localDate = new Date(date.toLocaleString());
    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    
    return `${year}/${month}/${day}, ${hours}:${minutes}`;
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

  const toggleOrderModal = (order: any) => {
    setSelectedOrder(order);
    setOrderModal(!orderModal);
    setOrderId(order?.id);
  };

  return (
    <div className="container relative m-auto z-50 pt-11 flex flex-col gap-8">
      <div className="flex w-full gap-4">
        <div className="flex">
          <Image
            src="/collections/search.png"
            alt="search icon"
            width={20}
            height={20}
            className="w-[17.08px] h-[17.08px] relative left-8 top-4"
          />
          <Input
            type="text"
            name="Search"
            placeholder="Search by Order ID"
            className="w-[813px] h-[48px] rounded-xl pt-[14px] pr-[14px] pb-[14px] pl-10 bg-transparent border border-neutral400 text-neutral200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex justify-center items-center rounded-xl h-12 w-12 border border-neutral400 hover:border-neutral300 cursor-pointer">
          <Image
            src="/collections/refresh.png"
            alt="refresh"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
      </div>

      <div className="flex flex-col w-full pr-[52px] pl-5 gap-4">
        <div className="grid grid-cols-4 pl-4 w-full h-[18px]">
          {["Order ID", "Quantity", "Status", "Date"].map((header) => (
            <p key={header} className="font-medium text-md text-neutral200">
              {header}
            </p>
          ))}
        </div>
        <ScrollArea className="h-[700px] w-full pb-8 border-t-2 border-neutral500">
          <div className="flex flex-col w-full pt-4 gap-4">
            {filteredOrders.map((item: Order) => (
              <button
                className="bg-gray50 rounded-2xl p-5 relative flex items-center"
                key={item.id}
                onClick={() => toggleOrderModal(item)}
              >
                <div className="grid grid-cols-4 w-full h-[18px]">
                  <p className="font-medium text-md text-start w-[160px] text-neutral200 truncate">
                    {item.id}
                  </p>
                  <p className="font-medium text-md text-start pl-1 text-neutral200">
                    {item.quantity}
                  </p>
                  <p
                    className={`font-medium text-md text-start pl-2 ${getStatusColor(item.orderStatus)} capitalize truncate`}
                  >
                    {getStatus(item.orderStatus)}
                  </p>
                  <p className="font-medium text-start pl-3 text-md text-neutral200">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div className="absolute right-5">
                  <ArrowRight2 size={16} color="#D7D8D8" />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
      {selectedOrder && (
        <OrderDetailModal
          open={orderModal}
          onClose={() => toggleOrderModal(null)}
          orderId={selectedOrder.id}
          status={selectedOrder.orderStatus}
          quantity={selectedOrder.quantity}
          networkFee={selectedOrder.networkFee}
          serviceFee={selectedOrder.serviceFee}
        />
      )}
    </div>
  );
};

export default OrderDetail;
