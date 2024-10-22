import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CollectibleList } from "@/lib/types";

interface cardProps {
  data: CollectibleList;
}

const ProfileBanner: React.FC<cardProps> = ({ data }) => {
  const [walletAddress, setWalletAddress] = useState<string>("Connect Wallet");
  const [balance, setBalance] = useState<{ btc: number; usd: number }>({
    btc: 0,
    usd: 0,
  });

  const getBalance = async () => {
    try {
      let res = await window.unisat.getBalance();
      console.log(res);

      const btcAmount = res / 10 ** 8;
      const usdAmount = btcAmount * 65000;
      setBalance({ btc: btcAmount, usd: usdAmount });
    } catch (e) {
      console.log(e);
      setBalance({ btc: 0, usd: 0 });
    }
  };
  const displayBalance = (value: number) => {
    return isNaN(value) ? "0.00" : value.toFixed(2);
  };

  const displayUsd = (value: number) => {
    return isNaN(value) ? "0.00" : value.toFixed(2);
  };
  
  const connectWallet = async () => {
    try {
      let res = await window.unisat.getAccounts();
      if (res && res[0]) {
        const formatted = `${res[0].slice(0, 4)}...${res[0].slice(-4)}`;
        setWalletAddress(formatted);
        // Get balance after successful wallet connection
        await getBalance();
      }
      console.log(res);
    } catch (e) {
      console.log(e);
      setWalletAddress("Connect Wallet");
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
              <div className="flex gap-4 items-center">
                <h3 
                  className="text-profileTitle font-bold text-neutral50 cursor-pointer"
                  onClick={connectWallet}
                >
                  {walletAddress}
                </h3>
                <Image
                  src={"/profile/copy.png"}
                  alt="copy"
                  width={24}
                  height={24}
                  className="w-6 h-6 cursor-pointer"
                />
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
                      {balance.btc.toFixed(2)} BTC
                    </p>
                    <p className="border-l border-l-white16 pl-4 h-5 text-neutral100 text-md flex items-center">
                      ${balance.usd.toFixed(2)}
                    </p>
                  </h2>
                </div>
                <div className="flex gap-4 items-end">
                  <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-md font-medium">
                    ${displayUsd(balance.usd)}
                    </p>
                    {displayBalance(balance.btc)} BTC
                  </span>
                  <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
                    <p className="text-neutral100 text-md font-medium">
                      Listed items:
                    </p>
                    {data?.listCount}
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