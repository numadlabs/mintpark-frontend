import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../provider/auth-context-provider";
import { formatPriceBtc, formatPriceUsd } from "@/lib/utils";
import { getLayerById } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAssetsContext } from "@/lib/hooks/useAssetContext";
import { getCurrencySymbol, getChainIcon } from "@/lib/service/currencyHelper";
import { useBalance, useAccount } from "wagmi";
import { formatEther } from "viem";
import { useLoyaltyPoints } from "@/lib/hooks/useLoyaltyPoint";
import { Star } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
    // unisat?: any;
  }
}

interface Balance {
  amount: number;
  usdAmount: number;
}

const ProfileBanner: React.FC = () => {
  const { currentUserLayer, currentLayer } = useAuth();
  const { address, isConnected } = useAccount();

  // Loyalty points hook
  const {
    loyaltyPoints,
    isLoading: isPointsLoading,
    isError: isPointsError,
  } = useLoyaltyPoints();

  const [balance, setBalance] = useState<Balance>({
    amount: 0,
    usdAmount: 0,
  });
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get assets data from context
  const { assetsData } = useAssetsContext();

  const { data: currentUserLayerData, isLoading: isLayersLoading } = useQuery({
    queryKey: ["currentLayerData", currentUserLayer?.layerId],
    queryFn: () => getLayerById(currentUserLayer?.layerId as string),
    enabled: !!currentUserLayer?.layerId,
  });

  // Wagmi useBalance hook for EVM chains
  const {
    data: wagmiBalance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address: (address || currentUserLayer?.address) as `0x${string}`,
    query: {
      // Enable if we have address, regardless of currentUserLayerData
      enabled: !!(address || currentUserLayer?.address),
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Fallback manual balance fetch
  const getManualBalance = async (): Promise<void> => {
    const targetAddress = address || currentUserLayer?.address;
    if (!targetAddress || !window.ethereum) return;

    setIsLoading(true);
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [targetAddress, "latest"],
      });

      const ethAmount = Number(BigInt(balance)) / 1e18;
      const usdAmount = ethAmount * (currentUserLayerData?.price || 0);

      setBalance({
        amount: ethAmount,
        usdAmount: usdAmount,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch balance");
      console.error("Manual balance fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Bitcoin balance fetching function
  const getBitcoinBalance = async (): Promise<void> => {
    if (!currentUserLayerData || currentUserLayerData.type !== "BITCOIN")
      return;

    setIsLoading(true);
    try {
      if (!window.unisat) throw new Error("Unisat not installed");

      const res = await window.unisat.getBalance();
      if (!res || typeof res.total !== "number") {
        throw new Error("Invalid balance format received");
      }

      const btcAmount = Number(res.total) / 1e8; // Convert satoshis to BTC
      const usdAmount = btcAmount * (currentUserLayerData?.price || 97500);

      setBalance({
        amount: btcAmount,
        usdAmount: usdAmount,
      });
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch Bitcoin balance",
      );
      console.error("Bitcoin balance fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  //todo: remove manual balance fetching function. Wagmi is enough
  useEffect(() => {
    // Try wagmi first
    if (wagmiBalance && wagmiBalance.value) {
      const ethAmount = parseFloat(formatEther(wagmiBalance.value));
      const usdAmount = ethAmount * (currentUserLayerData?.price || 0);

      setBalance({
        amount: ethAmount,
        usdAmount: usdAmount,
      });
      setError(null);
    }
    // Fallback to manual for EVM or if wagmi fails
    else if (
      (address || currentUserLayer?.address) &&
      !isBalanceLoading &&
      !wagmiBalance
    ) {
      getManualBalance();
    }
    // Bitcoin handling
    else if (currentUserLayerData?.type === "BITCOIN") {
      getBitcoinBalance();
    } else {
      console.log("No balance conditions met");
    }
  }, [
    wagmiBalance,
    currentUserLayerData,
    isConnected,
    address,
    currentUserLayer?.address,
    isBalanceLoading,
  ]);

  // Handle wagmi balance errors
  useEffect(() => {
    if (isBalanceError && currentUserLayerData?.type === "EVM") {
      setError("Failed to fetch EVM balance");
    }
  }, [isBalanceError, currentUserLayerData?.type]);

  const handleCopyAddress = async (): Promise<void> => {
    const addressToCopy = address || currentUserLayer?.address;
    if (!addressToCopy) return;

    try {
      await navigator.clipboard.writeText(addressToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const formatWalletAddress = (address: string | null | undefined): string => {
    if (!address) return "Connect Wallet";
    const prefix = address.slice(0, 4);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  };

  // Get totalCount and listCount from assetsData
  const totalCount = assetsData?.data?.totalCount || 0;
  const listCount = assetsData?.data?.listCount || 0;

  // Show loading state
  const showLoading = isLoading || isBalanceLoading;
  const showPointsLoading = isPointsLoading;

  return (
    <section className="mt-[43.5px] w-full">
      <div className="relative z-10 h-auto min-h-[216px] w-full rounded-3xl overflow-hidden">
        {/* Banner Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${"/profile/banner.webp"})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Blur Overlay */}
        <div
          className="absolute inset-0 bg-neutral500 bg-opacity-[70%] z-10"
          style={{
            backdropFilter: "blur(50px)",
          }}
        />

        {/* Main Content Container */}
        <div className="relative py-12 px-4 sm:px-6 md:px-8 lg:px-12 w-full z-10">
          <div className="flex flex-col md:flex-row gap-6 xl:gap-10 items-center md:items-end">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <Image
                width={120}
                draggable="false"
                height={120}
                src={"/profile/proImg.png"}
                className="aspect-square rounded-[200px] w-24 h-24 md:w-[120px] md:h-[120px]"
                alt="profile"
                priority
              />
            </div>

            {/* Profile Content */}
            <div className="w-full flex flex-col gap-4 md:gap-5">
              {/* Wallet Address and Copy Button */}
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <span className="font-bold text-xl sm:text-profileTitle">
                  {formatWalletAddress(address || currentUserLayer?.address)}
                </span>
                <div className="relative">
                  <Image
                    src={"/profile/copy.png"}
                    alt="copy"
                    draggable="false"
                    width={24}
                    height={24}
                    className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                    onClick={handleCopyAddress}
                  />
                  {copySuccess && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-success text-white text-sm py-1 px-2 rounded">
                      Copied!
                    </div>
                  )}
                </div>
              </div>

              {/* Balance and Items Info */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between w-full">
                {/* Left section - Balance and Loyalty Points */}
                <div className="flex flex-col md:flex-row gap-4 w-full lg:w-fit">
                  {/* Wallet Balance Section */}
                  {(isConnected || currentUserLayer?.address) && (
                    <div className="rounded-2xl bg-white4 p-3 sm:p-4 flex gap-4 items-center w-full md:w-fit justify-center md:justify-start">
                      <div className="flex flex-row items-center gap-2 md:gap-3">
                        <Image
                          src={
                            currentLayer?.layer
                              ? getCurrencySymbol(currentLayer.layer)
                              : ""
                          }
                          alt="crypto"
                          draggable="false"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg"
                        />
                        <p className="flex items-center font-bold text-lg md:text-xl text-white">
                          {showLoading ? (
                            <span className="animate-pulse">Loading...</span>
                          ) : (
                            <>
                              {formatPriceBtc(balance.amount)}{" "}
                              {currentLayer?.layer
                                ? getCurrencySymbol(currentLayer.layer)
                                : ""}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="h-6 w-[1px] bg-white16" />
                      <p className="h-5 text-neutral100 text-md flex items-center">
                        {showLoading ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          `${formatPriceUsd(balance.usdAmount)}`
                        )}
                      </p>
                    </div>
                  )}

                  {/* Loyalty Points Section */}
                  {(isConnected || currentUserLayer?.address) && (
                    <div className="rounded-2xl  bg-white4  border-yellow-500/20 p-3 sm:p-4 flex gap-3 items-center w-full md:w-fit justify-center md:justify-start backdrop-blur-lg">
                      <div className="flex flex-row items-center gap-2 md:gap-3">
                        <div className="relative">
                          <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-yellow-400" />
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-neutral-300 font-medium leading-tight">
                            Loyalty Points
                          </span>
                          <span className="text-lg md:text-xl text-white font-bold leading-tight">
                            {showPointsLoading ? (
                              <span className="animate-pulse">Loading...</span>
                            ) : (
                              loyaltyPoints.toLocaleString()
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right section - Items Count */}
                <div className="grid grid-cols-2 md:flex flex-row md:flex-col lg:flex-row justify-center lg:justify-end gap-4 items-center lg:ml-auto">
                  <span className="py-3 px-4 items-center justify-center flex gap-2 sm:gap-3 rounded-xl text-neutral50 bg-white4">
                    <p className="text-neutral100 text-sm sm:text-md font-medium">
                      Total items:
                    </p>
                    <span className="text-md">{totalCount}</span>
                  </span>
                  <span className="py-3 px-4 flex justify-center gap-2 sm:gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-sm sm:text-md font-medium">
                      Listed items:
                    </p>
                    <span className="text-md">{listCount}</span>
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {(error || isPointsError) && (
                <div className="text-errorMsg text-sm mt-2 text-center md:text-left">
                  {error || (isPointsError && "Failed to load loyalty points")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileBanner;
