import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../provider/auth-context-provider";
import { AssetSchema } from "@/lib/validations/asset-validation";
import { formatPriceBtc, formatPriceUsd } from "@/lib/utils";

interface CardProps {
  params: AssetSchema;
}

interface WalletBalance {
  eth: number;
  btc: number;
  usdEth: number;
  usdBtc: number;
}

interface UnisatBalance {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

declare global {
  interface Window {
    ethereum: any;
    unisat: any;
  }
}

const ProfileBanner: React.FC<CardProps> = ({ params }) => {
  const { authState, citreaPrice } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>("Connect Wallet");
  const [balance, setBalance] = useState<WalletBalance>({
    eth: 0,
    btc: 0,
    usdEth: 0,
    usdBtc: 0,
  });
  const [rawAddress, setRawAddress] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeWallet, setActiveWallet] = useState<
    "metamask" | "unisat" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resetWalletState = () => {
    setWalletAddress("Connect Wallet");
    setRawAddress("");
    setBalance({
      eth: 0,
      btc: 0,
      usdEth: 0,
      usdBtc: 0,
    });
    setError(null);
  };

  const formatWalletAddress = (address: string | null): string => {
    if (!address) return "Connect Wallet";
    const prefix = address.slice(0, 4);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  };

  const getMetaMaskBalance = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");

      if (activeWallet === "unisat") {
        resetWalletState();
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts[0]) throw new Error("No account found");

      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });

      setRawAddress(accounts[0]);
      setWalletAddress(accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4));

      const ethAmount = Number(BigInt(balance)) / 1e18;
      const usdAmount = ethAmount *  citreaPrice; // Example rate - replace with real price feed

      setBalance((prev) => ({
        ...prev,
        eth: ethAmount,
        usdEth: usdAmount,
        btc: 0,
        usdBtc: 0,
      }));

      setActiveWallet("metamask");
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch MetaMask balance",
      );
      console.error("MetaMask balance fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getUnisatBalance = async () => {
    setIsLoading(true);
    try {
      if (!window.unisat) throw new Error("Unisat not installed");

      if (activeWallet === "metamask") {
        resetWalletState();
      }

      const accounts = await window.unisat.requestAccounts();
      if (!accounts[0]) throw new Error("No account found");

      setRawAddress(accounts[0]);
      setWalletAddress(accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4));

      const res = await window.unisat.getBalance();
      if (!res || typeof res.total !== "number") {
        throw new Error("Invalid balance format received");
      }

      const btcAmount = Number(res.total);
      const usdAmount = btcAmount * 65000; // Example rate - replace with real price feed

      setBalance((prev) => ({
        ...prev,
        btc: btcAmount,
        usdBtc: usdAmount,
        eth: 0,
        usdEth: 0,
      }));

      setActiveWallet("unisat");
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch Unisat balance",
      );
      console.error("Unisat balance fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(rawAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  useEffect(() => {
    const setupMetaMaskListeners = () => {
      if (!window.ethereum) return;
      if (authState.walletType == "metamask") {
        getMetaMaskBalance();
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (activeWallet === "metamask") {
          if (accounts.length === 0) {
            resetWalletState();
            setActiveWallet(null);
          } else {
            getMetaMaskBalance();
          }
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", getMetaMaskBalance);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("chainChanged", getMetaMaskBalance);
      };
    };

    const setupUnisatListeners = () => {
      if (!window.unisat) return;
      if (authState.walletType == "unisat") {
        getUnisatBalance();
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (activeWallet === "unisat") {
          if (accounts.length === 0) {
            resetWalletState();
            setActiveWallet(null);
          } else {
            getUnisatBalance();
          }
        }
      };

      window.unisat.on("accountsChanged", handleAccountsChanged);
      window.unisat.on("networkChanged", getUnisatBalance);

      return () => {
        window.unisat.removeListener("accountsChanged", handleAccountsChanged);
        window.unisat.removeListener("networkChanged", getUnisatBalance);
      };
    };

    const cleanupMetaMask = setupMetaMaskListeners();
    const cleanupUnisat = setupUnisatListeners();

    return () => {
      if (cleanupMetaMask) cleanupMetaMask();
      if (cleanupUnisat) cleanupUnisat();
    };
  }, [activeWallet, authState.walletType]);

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
        <div className="relative py-12  px-4 sm:px-6 md:px-8 lg:px-12 w-full z-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <Image
                width={120}
                height={120}
                src={"/profile/proImg.png"}
                className="aspect-square rounded-[200px] w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-[120px] lg:h-[120px]"
                alt="profile"
                priority
              />
            </div>

            {/* Profile Content */}
            <div className="flex-grow w-full flex flex-col gap-4 md:gap-5">
              {/* Wallet Address and Copy Button */}
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <span className="font-bold text-lg sm:text-profileTitle">
                  {formatWalletAddress(authState.address)}
                </span>
                <div className="relative">
                  <Image
                    src={"/profile/copy.png"}
                    alt="copy"
                    width={24}
                    height={24}
                    className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                    onClick={handleCopyAddress}
                  />
                  {copySuccess && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm py-1 px-2 rounded">
                      Copied!
                    </div>
                  )}
                </div>
              </div>

              {/* Balance and Items Info */}
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                {/* Wallet Balance Section */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  {activeWallet === "metamask" && (
                    <div className="rounded-2xl bg-white4 p-3 sm:p-4 flex gap-2 sm:gap-4 items-center">
                      <Image
                        src={"/wallets/Bitcoin.png"}
                        alt="ethereum"
                        width={24}
                        height={24}
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      />
                      <p className="flex items-center font-bold text-lg sm:text-xl text-white">
                        {formatPriceBtc(balance.eth)} cBTC
                      </p>
                      <p className="border-l border-l-white16 pl-2 sm:pl-4 h-5 text-neutral100 text-sm sm:text-md flex items-center">
                        ${formatPriceUsd(balance.usdEth)}
                      </p>
                    </div>
                  )}
                  {activeWallet === "unisat" && (
                    <div className="rounded-2xl bg-white4 p-3 sm:p-4 flex gap-2 sm:gap-4 items-center">
                      <Image
                        src={"/wallets/Bitcoin.png"}
                        alt="bitcoin"
                        width={24}
                        height={24}
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      />
                      <p className="flex items-center font-bold text-lg sm:text-xl text-white">
                        {formatPriceBtc(balance.btc)} cBTC
                      </p>
                      <p className="border-l border-l-white16 pl-2 sm:pl-4 h-5 text-neutral100 text-sm sm:text-md flex items-center">
                        ${formatPriceUsd(balance.usdBtc)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Count Section */}
                <div className="flex flex-wrap justify-center lg:justify-end gap-4 items-center lg:ml-auto">
                  <span className="p-2 sm:pt-3 sm:pr-4 sm:pb-3 sm:pl-4 flex gap-2 sm:gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-sm sm:text-md font-medium">
                      Total items:
                    </p>
                    <span className="text-sm sm:text-base">
                      {params?.data.totalCount}
                    </span>
                  </span>
                  <span className="p-2 sm:pt-3 sm:pr-4 sm:pb-3 sm:pl-4 flex gap-2 sm:gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-sm sm:text-md font-medium">
                      Listed items:
                    </p>
                    <span className="text-sm sm:text-base">
                      {params?.data.listCount}
                    </span>
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="text-red-500 text-sm mt-2 text-center md:text-left">
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
