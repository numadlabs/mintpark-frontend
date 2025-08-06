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
    id: "kumquat",
    title: "Kumquat Nft",
    // description: "We're thrilled to announce a special collaboration between MintPark and Citrea to launch the exclusive Kumquat NFT Collection! This unique drop celebrates two major milestones: the successful Citrea Kumquat Fork and the joyous occasion of Chinese New Year. Kumquats, symbolizing prosperity and good fortune, perfectly align with the spirit of these celebrations. Each NFT in this limited collection will feature vibrant, culturally inspired designs, blending MintPark's creativity with the new beginnings of the Lunar New Year.",
    role: 1,
  },
];

export default function VerifyNew() {
  const searchParams = useSearchParams();
  const code: string | null = searchParams.get("code");

  // Fixed: Use the correct properties from your auth context
  const { isConnected, currentLayer, currentUserLayer, user, connectWallet } =
    useAuth();

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
    "https://discord.com/oauth2/authorize?client_id=1386964242644734002&response_type=code&redirect_uri=https%3A%2F%2Fwww.mintpark.io%2Fdiscord%2Fcitrea%2Fverify&scope=identify";

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
        "https://mintpark-verification-endpoints.itnumadlabs.workers.dev/citrea/role",
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
        className="w-full max-w-none sm:max-w-[500px] lg:max-w-[600px] bg-neutral500 border border-neutral400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col items-center gap-2 sm:gap-3 mx-auto"
      >
        {/* Title */}
        <h1 className="text-neutral00 font-bold text-lg sm:text-xl lg:text-2xl text-center leading-tight">
          {nftConfig.title}
        </h1>
        {/* Button */}
        <div className="w-full flex justify-center mt-2 sm:mt-3">
          {canVerify ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto sm:min-w-[300px] lg:w-[336px] xl:w-[300px] h-12 sm:h-12 lg:h-14 cursor-pointer flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6"
              onClick={() => handleVerify(nftConfig)}
              disabled={isVerifying}
            >
              <Image
                src="/wallets/Metamask.png"
                alt="Metamask"
                width={20}
                height={24}
                className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0"
              />
              <p className="text-neutral50 font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap">
                {isVerifying ? "Verifying..." : "Verify NFT"}
              </p>
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[336px] h-12 sm:h-12 lg:h-14 cursor-pointer flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6"
              onClick={handleConnectWallet}
            >
              <Image
                src="/wallets/Metamask.png"
                alt="Metamask"
                width={24}
                height={24}
                className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0"
              />
              <p className="text-neutral50 font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap">
                Connect Wallet
              </p>
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-12 flex flex-col">
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
            <div className="pt-8 sm:pt-12 lg:pt-16">
              <h1 className="font-bold text-center xl:text-start text-neutral00 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:pl-8">
                Mintpark NFT Holder Verification
              </h1>
            </div>

            <div className="w-full max-w-7xl mx-auto">
              {/* Grid layout with better responsive handling */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-6 place-items-center">
                {NFT_CONFIGS.map((nftConfig) => renderNFTCard(nftConfig))}
              </div>
            </div>
          </div>
        </div>
      </Layout>

      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        // activeTab="HEMI"
        // selectedLayerId={currentLayer?.id || ""}
        // onTabChange={() => {}}
        // onLayerSelect={() => {}}
      />
    </>
  );
}
