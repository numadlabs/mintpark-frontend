"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/provider/auth-context-provider";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { WalletConnectionModal } from "@/components/modal/wallet-connect-modal";

const NFT_CONFIGS = [
  {
    id: "hemi-bros",
    title: "Hemi Bro's NFT",
    // description:
    //   "HemiBros is a premier PFP NFT collection on Hemi, blend of nostalgia, authenticity, and innovation. Every Bro NFT unlocks entry to Bro Town. An upcoming chill farming game built natively on Hemi.",
    role: 1,
  },
  {
    id: "mint-park-genesis",
    title: "Mint Park Genesis NFT",
    // description: "Genesis is our inaugural collection marking the beginning of our journey to bring EVM efficiency to Bitcoin Ordinals. These NFTs embody simplicity and value, created specifically for our community as we launch on Hemi.",
    role: 2,
  },
  {
    id: "og-badge",
    title: "OG Badge Nft",
    // description: "Be part of Mint Park's history with our exclusive OG Badge - a special NFT collection minted on Citrea testnet marking our early supporters. These badges represent the pioneers who joined us in building the future of Bitcoin Layer 2 NFTs.",
    role: 3,
  },
  {
    id: "kumquat",
    title: "Kumquat Nft",
    // description: "We're thrilled to announce a special collaboration between MintPark and Citrea to launch the exclusive Kumquat NFT Collection! This unique drop celebrates two major milestones: the successful Citrea Kumquat Fork and the joyous occasion of Chinese New Year. Kumquats, symbolizing prosperity and good fortune, perfectly align with the spirit of these celebrations. Each NFT in this limited collection will feature vibrant, culturally inspired designs, blending MintPark's creativity with the new beginnings of the Lunar New Year.",
    role: 4,
  },
];

export default function VerifyNew() {
  const searchParams = useSearchParams();
  const code: string | null = searchParams.get("code");

  // Fixed: Use the correct properties from your auth context
  const { 
    isConnected, 
    currentLayer, 
    currentUserLayer, 
    user,
    connectWallet 
  } = useAuth();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [verifyingStates, setVerifyingStates] = useState<
    Record<string, boolean>
  >({});
  const [canVerify, setCanVerify] = useState(false);

  // Get the address from currentUserLayer
  const address = currentUserLayer?.address;

  useEffect(() => {
    // Check if user is connected and has an address
    setCanVerify(isConnected && !!address);
  }, [isConnected, address]);

  const REDIRECT_URL =
    "https://discord.com/oauth2/authorize?client_id=1386964242644734002&response_type=code&redirect_uri=https%3A%2F%2Fwww.mintpark.io%2Fdiscord%2Fmint-park%2Fverify&scope=identify";

  const redirectWithMessage = (msg: string) => {
    toast.error(msg);
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 2000);
  };

  const handleVerify = async (nftConfig: (typeof NFT_CONFIGS)[0]) => {
    if (!address || !code) {
      toast.error("Missing address or code");
      return;
    }

    try {
      setVerifyingStates((prev) => ({ ...prev, [nftConfig.id]: true }));
      // Main role endpoint
      const res = await axiosClient.post(
        "https://mintpark-verification-endpoints.itnumadlabs.workers.dev/mint-park/role",
        { address, code, role: nftConfig.role }
      );

      const { hasError, reason, message } = res.data;

      if (hasError) {
        handleError(reason, message);
      } else {
        if (message) {
          toast.success(`${nftConfig.title}: ${message}`);
        } else if (reason) {
          toast.info(`${nftConfig.title}: ${reason}`);
        } else {
          toast.success(`${nftConfig.title} verification completed!`);
        }
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const hasError = data?.hasError;
      const reason = data?.reason;
      const message = data?.message;

      if (hasError) {
        handleError(reason, message, nftConfig.title);
      } else {
        toast.error(
          `${nftConfig.title}: ${message || "Verification failed. Try again."}`
        );
      }
    } finally {
      setVerifyingStates((prev) => ({ ...prev, [nftConfig.id]: false }));
    }
  };

  const handleError = (
    reason?: string,
    message?: string,
    nftTitle?: string
  ) => {
    const prefix = nftTitle ? `${nftTitle}: ` : "";

    switch (reason) {
      case "DONT_OWN_NFT":
        toast.error(
          `${prefix}NFT not found on this wallet. Please check your wallet.`
        );
        break;
      case "ALREADY_VERIFIED":
        toast.info(`${prefix}This wallet has already been verified.`);
        break;
      case "SERVER_ERROR":
        toast.error(`${prefix}Server error occurred. Please try again later.`);
        break;
      default:
        redirectWithMessage(
          message || "Discord Access has been revoked. Redirecting..."
        );
        break;
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setWalletModalOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const renderNFTCard = (nftConfig: (typeof NFT_CONFIGS)[0]) => {
    const isVerifying = verifyingStates[nftConfig.id] || false;

    return (
      <div
        key={nftConfig.id}
        className="w-full max-w-none sm:max-w-[500px] lg:max-w-[500px] h-auto bg-neutral500 border border-neutral400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-6 xl:p-6 flex flex-col items-center gap-2 sm:gap-2 lg:gap-2 mx-auto"
      >
        {/* Title */}
        <h1 className="text-neutral00 font-bold text-lg sm:text-xl lg:text-2xl text-center leading-tight">
          {nftConfig.title}
        </h1>
        {/* Button */}
        <div className="w-full flex justify-center mt-2 sm:mt-4">
          {canVerify ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto sm:min-w-[300px] lg:w-[336px] xl:w-[300px] h-12 sm:h-14 lg:h-16 cursor-pointer flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6"
              onClick={() => handleVerify(nftConfig)}
              disabled={isVerifying}
            >
              <Image
                src="/wallets/Metamask.png"
                alt="Metamask"
                width={20}
                height={24}
                className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0"
              />
              <p className="text-neutral50 font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap">
                {isVerifying ? "Verifying..." : "Verify NFT"}
              </p>
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[336px] h-12 sm:h-14 lg:h-16 cursor-pointer flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6"
              onClick={handleConnectWallet}
            >
              <Image
                src="/wallets/Metamask.png"
                alt="Metamask"
                width={24}
                height={24}
                className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0"
              />
              <p className="text-neutral50 font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap">
                Connect Wallet
              </p>
            </Button>
          )}
        </div>

        {/* Show connection status for this card */}
        {canVerify && address && (
          <div className="text-center mt-2">
            <p className="text-neutral300 text-xs">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            {currentLayer && (
              <p className="text-neutral400 text-xs">
                Layer: {currentLayer.name || currentLayer.layer}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Layout>
        <div className="min-h-screen w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16 xl:py-20 flex flex-col">
          <div className="flex-1 flex flex-col gap-8 sm:gap-10 lg:gap-12">
            <div className="pt-16 sm:pt-20 lg:pt-24">
              <h1 className="font-bold text-center xl:text-start text-neutral00 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:pl-8">
                Mintpark NFT Holder Verification
              </h1>
            </div>
            
            <div className="flex-1 w-full max-w-7xl mx-auto">
              {/* Grid layout with better responsive handling */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-6 lg:gap-6 place-items-center h-full content-center">
                {NFT_CONFIGS.map((nftConfig) => renderNFTCard(nftConfig))}
              </div>
            </div>

            {/* Global connection status */}
            {isConnected && address && (
              <div className="text-center border-t border-neutral400 pt-6">
                <p className="text-neutral200 text-sm">Wallet Connected:</p>
                <p className="text-neutral50 text-sm font-mono">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </p>
                {currentLayer && (
                  <p className="text-neutral300 text-xs">
                    Active Layer: {currentLayer.name || currentLayer.layer}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>

      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeTab="HEMI"
        selectedLayerId={currentLayer?.id || ""}
        onTabChange={() => {}}
        onLayerSelect={() => {}}
      />
    </>
  );
}
