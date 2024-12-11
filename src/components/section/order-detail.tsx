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
    const statusMap = {
      PENDING: "Pending",
      IN_QUEUE: "In queue",
      DONE: "Minted",
      EXPIRED: "Closed",
    };
    return statusMap[paymentStatus as keyof typeof statusMap] || "Pending...";
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      PENDING: "text-neutral-400",
      IN_QUEUE: "text-blue-400",
      DONE: "text-emerald-400",
      EXPIRED: "text-red-400",
    };
    return (
      colorMap[status.toUpperCase() as keyof typeof colorMap] ||
      "text-neutral-400"
    );
  };

  const getStatusBackground = (status: string) => {
    const bgMap = {
      PENDING: "bg-neutral-400/10",
      IN_QUEUE: "bg-blue-400/10",
      DONE: "bg-transparent",
      EXPIRED: "bg-red-400/10",
    };
    return bgMap[status.toUpperCase() as keyof typeof bgMap] || "bg-neutral500";
  };

  const toggleOrderModal = (order: Order | null) => {
    setSelectedOrder(order);
    setOrderModal(!orderModal);
    if (order) setOrderId(order.id);
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 relative z-10 pt-4 lg:pt-8 flex flex-col gap-4 lg:gap-6">
      {/* Search and Refresh Section */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
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
        <button
          className="flex justify-center items-center rounded-xl h-12 w-12 border border-neutral500 
                         hover:border-neutral-300 transition-colors duration-200 hover:bg-neutral-800"
        >
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
      <div className="flex flex-col w-full bg-transparent rounded-xl p-4 lg:p-6">
        {/* Table Headers */}
        <div className="flex justify-around p-5 md:grid grid-cols-4 gap-4 pb-4 border-b border-neutral-700">
          {["Order ID", "Quantity", "Status", "Date"].map((header) => (
            <div
              key={header}
              className="font-medium text-sm lg:text-base text-neutral-200"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Table Content */}
        {isLoading ? (
          <OrderDetailSkeleton />
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)] w-full">
            <div className="flex flex-col gap-3 pt-4">
              {filteredOrders.map((order: Order) => (
                <button
                  key={order.id}
                  onClick={() => toggleOrderModal(order)}
                  className="group w-full text-left bg-neutral-800/50 hover:bg-neutral-800 
                           rounded-xl p-4 transition-all duration-200"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-neutral-200 truncate max-w-[200px]">
                          {order.id}
                        </p>
                        <p className="text-sm text-neutral-400">
                          Quantity: {order.quantity}
                        </p>
                      </div>
                      <ArrowRight2
                        className="w-5 h-5 text-neutral-400 group-hover:text-neutral-200 
                                          group-hover:translate-x-1 transition-all duration-200"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div
                        className={`py-1 rounded-full text-sm font-medium ${getStatusBackground(
                          order.orderStatus
                        )} 
                                    ${getStatusColor(order.orderStatus)}`}
                      >
                        {getStatus(order.orderStatus)}
                      </div>
                      <p className="text-sm text-neutral-400">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                    <p className="font-medium text-neutral-200 truncate">
                      {order.id}
                    </p>
                    <p className="text-neutral-200">{order.quantity}</p>
                    <div
                      className={`py-1 rounded-full text-sm font-medium w-fit
                                  ${getStatusBackground(
                                    order.orderStatus
                                  )} ${getStatusColor(order.orderStatus)}`}
                    >
                      {getStatus(order.orderStatus)}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-neutral-200">
                        {formatDateTime(order.createdAt)}
                      </p>
                      <ArrowRight2
                        className="w-5 h-5 text-neutral-400 group-hover:text-neutral-200 
                                          group-hover:translate-x-1 transition-all duration-200"
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <p className="text-lg">No orders found</p>
            <p className="text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}
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
