// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { CollectibleList } from "@/lib/types";

// interface cardProps {
//   params: {
//     data: CollectibleList;
//   }
// }

// interface UnisatBalance {
//   confirmed: number;
//   unconfirmed: number;
//   total: number;
// }

// const ProfileBanner: React.FC<cardProps> = ({ params }) => {
//   const [walletAddress, setWalletAddress] = useState<string>("Connect Wallet");
//   const [balance, setBalance] = useState<{ btc: number; usd: number }>({
//     btc: 0,
//     usd: 0,
//   });
//   const [rawAddress, setRawAddress] = useState<string>("");
//   const [copySuccess, setCopySuccess] = useState<boolean>(false);

//   const formatBalance = (value: number): string => {
//     if (typeof value !== 'number' || isNaN(value)) return "0.00";
//     return value.toFixed(8);
//   };

//   const formatUSD = (value: number): string => {
//     if (typeof value !== 'number' || isNaN(value)) return "0.00";
//     return value.toFixed(2);
//   };

//   const getBalance = async () => {
//     try {
//       const res: UnisatBalance = await window.unisat.getBalance();
//       console.log('Balance response:', res);

//       if (!res || typeof res.total !== 'number') {
//         throw new Error('Invalid balance format received');
//       }

//       const btcAmount = (Number(res.total) / 10 ** 8);
//       const usdAmount = btcAmount * 65000; // Using your existing BTC/USD rate

//       if (isNaN(btcAmount) || isNaN(usdAmount)) {
//         throw new Error('Error calculating balance');
//       }

//       setBalance({ btc: btcAmount, usd: usdAmount });
//     } catch (e) {
//       console.error('Balance fetch error:', e);
//       setBalance({ btc: 0, usd: 0 });
//     }
//   };
//   const connectWallet = async () => {
//     try {
//       let res = await window.unisat.getAccounts();
//       if (res && res[0]) {
//         setRawAddress(res[0]);
//         const formatted = `${res[0].slice(0, 4)}...${res[0].slice(-4)}`;
//         setWalletAddress(formatted);
//         await getBalance();
//       }
//     } catch (e) {
//       console.error('Wallet connection error:', e);
//       setWalletAddress("Connect Wallet");
//       setRawAddress("");
//     }
//   };

//   const handleCopy = async () => {
//     if (rawAddress) {
//       try {
//         await navigator.clipboard.writeText(rawAddress);
//         setCopySuccess(true);
//         setTimeout(() => {
//           setCopySuccess(false);
//         }, 2000);
//       } catch (err) {
//         console.error('Failed to copy address:', err);
//       }
//     }
//   };

//   useEffect(() => {
//     connectWallet();
//   }, []);

//   return (
//     <>
//       <section className="mt-[43.5px]">
//         <div className="relative h-[216px] w-full rounded-3xl overflow-hidden">
//           <div
//             className="absolute inset-0"
//             style={{
//               backgroundImage: `url(${"/profile/banner.webp"})`,
//               backgroundPosition: "center",
//               backgroundSize: "cover",
//               backgroundRepeat: "no-repeat",
//             }}
//           />
//           <div
//             className="absolute inset-0 bg-neutral500 bg-opacity-[70%] z-50"
//             style={{
//               backdropFilter: "blur(50px)",
//             }}
//           />
//           <div className="flex relative top-11 pl-12 pr-12 w-full z-50">
//             <div className="pt-4">
//               <Image
//                 width={120}
//                 height={120}
//                 src={"/profile/proImg.png"}
//                 className="aspect-square rounded-[200px]"
//                 alt="png"
//               />
//             </div>
//             <div className="w-full flex flex-col justify-between gap-5 pl-6 pr-6 pt-4 pb-4">
//               <div className="flex gap-4 items-center relative">
//                 <h3
//                   className="text-profileTitle font-bold text-neutral50 cursor-pointer"
//                   onClick={connectWallet}
//                 >
//                   {walletAddress}
//                 </h3>
//                 <div className="relative">
//                   <Image
//                     src={"/profile/copy.png"}
//                     alt="copy"
//                     width={24}
//                     height={24}
//                     className="w-6 h-6 cursor-pointer"
//                     onClick={handleCopy}
//                   />
//                   {copySuccess && (
//                     <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm py-1 px-2 rounded">
//                       Copied!
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex justify-between w-full">
//                 <div className="flex flex-col justify-end">
//                   <h2 className="rounded-2xl bg-white4 p-4 flex gap-4 items-center">
//                     <Image
//                       src={"/wallets/Bitcoin.png"}
//                       alt="bitcoin"
//                       width={24}
//                       height={24}
//                       className="h-6 w-6"
//                     />
//                     <p className="flex items-center font-bold text-xl text-white">
//                       {formatBalance(balance.btc)} BTC
//                     </p>
//                     <p className="border-l border-l-white16 pl-4 h-5 text-neutral100 text-md flex items-center">
//                       ${formatUSD(balance.usd)}
//                     </p>
//                   </h2>
//                 </div>
//                 <div className="flex gap-4 items-end">
//                   <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
//                     <p className="text-neutral100 text-md font-medium">
//                       Total items:
//                     </p>
//                     {params.data?.totalCount}
//                   </span>
//                   <span className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl text-neutral50 bg-white4 items-center">
//                     <p className="text-neutral100 text-md font-medium">
//                       Listed items:
//                     </p>
//                     {params.data?.listCount}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default ProfileBanner;

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CollectibleList } from "@/lib/types";
import { useAuth } from "../provider/auth-context-provider";

interface CardProps {
  params: {
    data: CollectibleList;
  };
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
  const { authState } = useAuth();
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

  const formatBalance = (value: number): string => {
    if (typeof value !== "number" || isNaN(value)) return "0.00";
    return value.toFixed(8);
  };

  const formatUSD = (value: number): string => {
    if (typeof value !== "number" || isNaN(value)) return "0.00";
    return value.toFixed(2);
  };

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

  const getMetaMaskBalance = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");

      // Reset any existing wallet state
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
      const usdAmount = ethAmount * 3500; // Example rate - replace with real price feed

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

      // Reset any existing wallet state
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

      const btcAmount = Number(res.total) / 10 ** 8;
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

  // Set up listeners for both wallet types
  useEffect(() => {
    const setupMetaMaskListeners = () => {
      if (!window.ethereum) return;
      if (authState.walletType == "metamask") {
        console.log("triggered eth");
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

    // Set up listeners for both wallet types
    const cleanupMetaMask = setupMetaMaskListeners();
    const cleanupUnisat = setupUnisatListeners();

    // Cleanup function
    return () => {
      if (cleanupMetaMask) cleanupMetaMask();
      if (cleanupUnisat) cleanupUnisat();
    };
  }, [activeWallet, authState.walletType]); // Only re-run when activeWallet changes

  return (
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
              {authState.address}

              <div className="relative">
                <Image
                  src={"/profile/copy.png"}
                  alt="copy"
                  width={24}
                  height={24}
                  className="w-6 h-6 cursor-pointer"
                  onClick={handleCopyAddress}
                />
                {copySuccess && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm py-1 px-2 rounded">
                    Copied!
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between w-full">
              <div className="flex gap-4">
                {activeWallet === "metamask" && (
                  <h2 className="rounded-2xl bg-white4 p-4 flex gap-4 items-center">
                    <Image
                      src={"/wallets/Ethereum.png"}
                      alt="ethereum"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                    <p className="flex items-center font-bold text-xl text-white">
                      {formatBalance(balance.eth)} ETH
                    </p>
                    <p className="border-l border-l-white16 pl-4 h-5 text-neutral100 text-md flex items-center">
                      ${formatUSD(balance.usdEth)}
                    </p>
                  </h2>
                )}
                {activeWallet === "unisat" && (
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
                      ${formatUSD(balance.usdBtc)}
                    </p>
                  </h2>
                )}
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
  );
};

export default ProfileBanner;
