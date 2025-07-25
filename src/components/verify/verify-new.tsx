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

// NFT Configuration
const NFT_CONFIGS = [
  {
    id: "hemi-bros",
    title: "Hemi Bro's NFT",
    role: 1,
  },
  {
    id: "mint-park-genesis",
    title: "Mint Park Genesis NFT",
    role: 2,
  },
  {
    id: "og-badge",
    title: "OG Badge Nft",
    role: 3,
  },
  {
    id: "kumquat",
    title: "Kumquat Nft",
    role: 4,
  },
];

export default function VerifyNew() {
  const searchParams = useSearchParams();
  const code: string | null = searchParams.get("code");

  const { authState, selectedLayerId, getWalletForLayer } = useAuth();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [verifyingStates, setVerifyingStates] = useState<Record<string, boolean>>({});
  const [canVerify, setCanVerify] = useState(false);

  const address =
    selectedLayerId && getWalletForLayer(selectedLayerId)?.address;

  useEffect(() => {
    if (authState.authenticated && selectedLayerId) {
      const wallet = getWalletForLayer(selectedLayerId);
      setCanVerify(!!wallet?.address);
    } else {
      setCanVerify(false);
    }
  }, [authState.authenticated, selectedLayerId, getWalletForLayer]);

  const REDIRECT_URL =
    "https://discord.com/oauth2/authorize?client_id=1386964242644734002&response_type=code&redirect_uri=https%3A%2F%2Fwww.mintpark.io%2Fdiscord%2Fverify&scope=identify";

  const redirectWithMessage = (msg: string) => {
    toast.error(msg);
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 2000);
  };

  const handleVerify = async (nftConfig: typeof NFT_CONFIGS[0]) => {
    if (!address || !code) {
      toast.error("Missing address or code");
      return;
    }

    try {
      setVerifyingStates(prev => ({ ...prev, [nftConfig.id]: true }));
      // Main role endpoint
      const res = await axiosClient.post(
        "https://mintpark-verification-endpoints.itnumadlabs.workers.dev/mint-park/role/test",
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
        toast.error(`${nftConfig.title}: ${message || "Verification failed. Try again."}`);
      }
    } finally {
      setVerifyingStates(prev => ({ ...prev, [nftConfig.id]: false }));
    }
  };

  const handleError = (reason?: string, message?: string, nftTitle?: string) => {
    const prefix = nftTitle ? `${nftTitle}: ` : "";
    
    switch (reason) {
      case "DONT_OWN_NFT":
        toast.error(`${prefix}NFT not found on this wallet. Please check your wallet.`);
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

  const renderNFTCard = (nftConfig: typeof NFT_CONFIGS[0]) => {
    const isVerifying = verifyingStates[nftConfig.id] || false;

    return (
      <div 
        key={nftConfig.id}
        className="w-full max-w-[600px] h-auto bg-neutral500 border border-neutral400 rounded-[32px] p-6 md:p-10 flex flex-col items-center gap-6 md:gap-8"
      >
        <h1 className="text-neutral00 font-bold text-xl md:text-2xl text-center">
          {nftConfig.title}
        </h1>
        {canVerify ? (
          <Button
            variant="secondary"
            className="w-full md:w-[336px] h-14 md:h-16 cursor-pointer flex gap-3 md:gap-4"
            onClick={() => handleVerify(nftConfig)}
            disabled={isVerifying}
          >
            <Image
              src="/wallets/Metamask.png"
              alt="Metamask"
              width={32}
              height={32}
              className="md:w-10 md:h-10"
            />
            <p className="text-neutral50 font-bold text-base md:text-lg">
              {isVerifying ? "Verifying..." : "Verify NFT"}
            </p>
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full md:w-[336px] h-14 md:h-16 cursor-pointer flex gap-3 md:gap-4"
            onClick={() => setWalletModalOpen(true)}
          >
            <Image
              src="/wallets/Metamask.png"
              alt="Metamask"
              width={32}
              height={32}
              className="md:w-10 md:h-10"
            />
            <p className="text-neutral50 font-bold text-base md:text-lg">
              Connect Wallet
            </p>
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Layout>
        <div className="h-auto w-full px-4 md:px-8 pt-[200px] md:pt-[264px] pb-[200px] md:pb-[356px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-[1280px] mx-auto">
            {NFT_CONFIGS.map(nftConfig => renderNFTCard(nftConfig))}
          </div>
        </div>
      </Layout>

      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeTab="HEMI"
        selectedLayerId={selectedLayerId as string}
        onTabChange={() => {}}
        onLayerSelect={() => {}}
      />
    </>
  );
}