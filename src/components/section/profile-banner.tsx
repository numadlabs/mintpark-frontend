import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../provider/auth-context-provider";
import { formatPriceBtc, formatPriceUsd } from "@/lib/utils";
import { getLayerById } from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { useAssetsContext } from "@/lib/hooks/useAssetContext";
import { getCurrencySymbol, getCurrencyImage } from "@/lib/service/currencyHelper";

declare global {
  interface Window {
    ethereum: any;
    unisat: any;
  }
}

const ProfileBanner: React.FC = () => {
  const { getAddressforCurrentLayer, selectedLayerId } = useAuth();
  const connectedWallet = getAddressforCurrentLayer();
  const [balance, setBalance] = useState({
    amount: 0,
    usdAmount: 0,
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  
  // Get assets data from context
  const { assetsData } = useAssetsContext();

  const { data: currentLayer, isLoading: isLayersLoading } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
  });

  const getBalance = async () => {
    if (!connectedWallet) return;

    setIsLoading(true);
    try {
      if (connectedWallet.layerType === "EVM") {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [connectedWallet.address, "latest"],
        });

        const ethAmount = Number(BigInt(balance)) / 1e18;
        const usdAmount = ethAmount * currentLayer?.price;

        setBalance({
          amount: ethAmount,
          usdAmount: usdAmount,
        });

        // console.log("balance", ethAmount, usdAmount);
        
      } else if (connectedWallet.layerType === "BITCOIN") {
        if (!window.unisat) throw new Error("Unisat not installed");

        const res = await window.unisat.getBalance();
        if (!res || typeof res.total !== "number") {
          throw new Error("Invalid balance format received");
        }

        const btcAmount = Number(res.total) / 1e8; // Convert satoshis to BTC
        const usdAmount = btcAmount * 97500; // Using example BTC price

        setBalance({
          amount: btcAmount,
          usdAmount: usdAmount,
        });
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch balance");
      console.error("Balance fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connectedWallet) {
      getBalance();
      // console.log(getBalance());
      
    }
  }, [connectedWallet]);

  const handleCopyAddress = async () => {
    if (!connectedWallet?.address) return;
    try {
      await navigator.clipboard.writeText(connectedWallet.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const formatWalletAddress = (address: string | null): string => {
    if (!address) return "Connect Wallet";
    const prefix = address.slice(0, 4);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  };
  

  // Get totalCount and listCount from assetsData
  const totalCount = assetsData?.data?.totalCount || 0;
  const listCount = assetsData?.data?.listCount || 0;

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
                  {connectedWallet &&
                    formatWalletAddress(connectedWallet.address)}
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
              <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
                {/* Wallet Balance Section */}
                {connectedWallet && (
                  <div className="rounded-2xl bg-white4 p-3 sm:p-4 flex gap-4 items-center w-full md:w-fit justify-center md:justify-start">
                    <div className="flex flex-row items-center gap-2 md:gap-3">
                      <Image
                        src={getCurrencyImage(connectedWallet.layer)}
                        alt="crypto"
                        draggable="false"
                        width={24}
                        height={24}
                        className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg"
                      />
                      <p className="flex items-center font-bold text-lg md:text-xl text-white">
                        {formatPriceBtc(balance.amount)}{" "}
                        {
                          getCurrencySymbol(connectedWallet.layer)
                        }
                      </p>
                    </div>
                    <div className="h-6 w-[1px] bg-white16" />
                    <p className="h-5 text-neutral100 text-md flex items-center">
                      ${formatPriceUsd(balance.usdAmount)}
                    </p>
                  </div>
                )}

                {/* Items Count Section */}
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
              {error && (
                <div className="text-errorMsg text-sm mt-2 text-center md:text-left">
                  {error}
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
