import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CollectibleList } from "@/lib/types";

interface cardProps {
  params: {
    data: CollectibleList;
  }
}

const ProfileBanner: React.FC<cardProps> = ({ params }) => {
  const [walletAddress, setWalletAddress] = useState<string>("Connect Wallet");
  const [balance, setBalance] = useState<{ btc: number; usd: number }>({
    btc: 0,
    usd: 0,
  });
  const [rawAddress, setRawAddress] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const formatBalance = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return "0.00";
    return value.toFixed(4); 
  };

  const formatUSD = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return "0.00";
    return value.toFixed(2); 
  };

  const getBalance = async () => {
    try {
      let res = await window.unisat.getBalance();
      

      if (typeof res !== 'number' || isNaN(res)) {
        throw new Error('Invalid balance received');
      }


      const btcAmount = (Number(res) / 10 ** 8);
      const usdAmount = btcAmount * 65000;

      if (isNaN(btcAmount) || isNaN(usdAmount)) {
        throw new Error('Error calculating balance');
      }

      setBalance({ btc: btcAmount, usd: usdAmount });
    } catch (e) {
      console.error('Balance fetch error:', e);
      setBalance({ btc: 0, usd: 0 });
    }
  };

  const connectWallet = async () => {
    try {
      let res = await window.unisat.getAccounts();
      if (res && res[0]) {
        setRawAddress(res[0]);
        const formatted = `${res[0].slice(0, 4)}...${res[0].slice(-4)}`;
        setWalletAddress(formatted);
        await getBalance();
      }
    } catch (e) {
      console.error('Wallet connection error:', e);
      setWalletAddress("Connect Wallet");
      setRawAddress("");
    }
  };

  const handleCopy = async () => {
    if (rawAddress) {
      try {
        await navigator.clipboard.writeText(rawAddress);
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <>
      <section className="mt-[43.5px]">
        <div className="relative h-[216px] w-full rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${"/profile/banner.webp"})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div
            className="absolute inset-0 bg-neutral500 bg-opacity-[70%] z-50"
            style={{
              backdropFilter: "blur(50px)",
            }}
          />
          <div className="flex relative top-11 pl-12 pr-12 w-full z-50">
            <div className="pt-4">
              <Image
                width={120}
                height={120}
                src={"/profile/proImg.png"}
                className="aspect-square rounded-[200px]"
                alt="png"
              />
            </div>
            <div className="w-full flex flex-col justify-between gap-5 pl-6 pr-6 pt-4 pb-4">
              <div className="flex gap-4 items-center relative">
                <h3 
                  className="text-profileTitle font-bold text-neutral50 cursor-pointer"
                  onClick={connectWallet}
                >
                  {walletAddress}
                </h3>
                <div className="relative">
                  <Image
                    src={"/profile/copy.png"}
                    alt="copy"
                    width={24}
                    height={24}
                    className="w-6 h-6 cursor-pointer"
                    onClick={handleCopy}
                  />
                  {copySuccess && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm py-1 px-2 rounded">
                      Copied!
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between w-full">
                <div className="flex flex-col justify-end">
                  <h2 className="rounded-2xl bg-white4 p-4 flex gap-4 items-center">
                    <Image
                      src={"/wallets/Bitcoin.png"}
                      alt="bitcoin"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                    <p className="flex items-center font-bold text-xl text-white">
                      {formatBalance(balance.btc)} BTC
                    </p>
                    <p className="border-l border-l-white16 pl-4 h-5 text-neutral100 text-md flex items-center">
                      ${formatUSD(balance.usd)}
                    </p>
                  </h2>
                </div>
                <div className="flex gap-4 items-end">
                  <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-md font-medium">
                      Total items:
                    </p>
                    {params.data?.totalCount}
                  </span>
                  <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-md font-medium">
                      Listed items:
                    </p>
                    {params.data?.listCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileBanner;