import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { getAllOrders } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import OrderDetailModal from "../modal/order-detail-modal";
import { Input } from "../ui/input";
import { useAuth } from "../provider/auth-context-provider";
import OrderDetailSkeleton from "../atom/skeleton/order-detail-skeleton";
import { ArrowRight2, SearchNormal1 } from "iconsax-react";

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

  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ["orderDataType"],
    queryFn: () => getAllOrders(id as string),
    enabled: !!id,
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];
    return orders.filter((order: Order) =>
      order?.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const formatDateTime = (dateString: any) => {
    const date = new Date(dateString);
    const localDate = new Date(date.toLocaleString());

    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(localDate);
  };

  const getStatus = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return "Pending...";
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

  const toggleOrderModal = (order: any) => {
    setSelectedOrder(order);
    setOrderModal(!orderModal);
    setOrderId(order?.id);
  };

  return (
    <div className="max-w-[800px] w-full mx-auto relative z-10 pt-8 flex flex-col gap-8">
      {/* Search and Refresh Section */}
      <div className="flex flex-row w-full gap-4">
        <div className="flex-1 relative">
          <SearchNormal1 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <Input
            type="text"
            name="Search"
            placeholder="Search by Order ID"
            className="w-full h-12 rounded-xl pl-10 bg-transparent border border-white8 text-neutral-200 
                     focus:border-neutral-300 focus:ring-1 focus:ring-neutral-300 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex justify-center items-center rounded-xl h-12 w-12 border border-neutral400">
          <Image
            src="/collections/refresh.png"
            alt="refresh"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Orders Table */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col min-w-[800px]">
          {/* Table Headers */}
          <div className="flex flex-row gap-14 items-center w-full border-b border-neutral500 pl-5 pb-4">
            <p className="w-[160px] font-medium text-md text-neutral200">
              Order ID
            </p>
            <div className="flex flex-row gap-4 items-center">
              <p className="w-[160px] font-medium text-md text-neutral200">
                Quantity
              </p>
              <p className="w-[160px] font-medium text-md text-neutral200">
                Status
              </p>
              <p className="w-[160px] font-medium text-md text-neutral200">
                Date
              </p>
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <OrderDetailSkeleton />
          ) : (
            <ScrollArea className="h-[700px] w-full pb-8 border-t-2 border-neutral500">
              <div className="flex flex-col w-full pt-4 gap-4">
                {filteredOrders.map((item: Order) => (
                  <button
                    className="bg-gray50 rounded-2xl p-5 relative flex items-center hover:bg-white8 transition-all duration-200"
                    key={item.id}
                    onClick={() => toggleOrderModal(item)}
                  >
                    <div className="w-full flex flex-row items-center gap-14">
                      <p className="font-medium text-md text-start w-[160px] text-neutral200 truncate">
                        {item.id}
                      </p>
                      <div className="flex flex-row gap-4 items-center">
                        <p className="font-medium text-md text-start text-neutral200 w-[160px]">
                          {item.quantity}
                        </p>
                        <p
                          className={`font-medium w-[160px] text-md text-start ${getStatusColor(
                            item.orderStatus
                          )} capitalize truncate`}
                        >
                          {getStatus(item.orderStatus)}
                        </p>
                        <p className="font-medium w-[160px] text-start text-md text-neutral200">
                          {formatDateTime(item.createdAt)}
                        </p>
                        <div className="absolute right-5">
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
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
