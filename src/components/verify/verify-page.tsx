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

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const code: string | null = searchParams.get("code");

  const { authState, selectedLayerId, getWalletForLayer } = useAuth();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const handleVerify = async () => {
    if (!address || !code) {
      toast.error("Missing address or code");
      return;
    }

    try {
      setIsVerifying(true);

      const res = await axiosClient.post(
        "https://mintpark-verification-endpoints.itnumadlabs.workers.dev/role",
        { address, code }
      );

      const { hasError, reason, message } = res.data;

      if (hasError) {
        handleError(reason, message);
      } else {
        if (message) {
          toast(message);
        } else if (reason) {
          toast.info(reason);
        } else {
          redirectWithMessage(
            "Discord Access has been revoked. Redirecting..."
          );
        }
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const hasError = data?.hasError;
      const reason = data?.reason;
      const message = data?.message;

      if (hasError) {
        handleError(reason, message);
      } else {
        toast.error(message || "Verification failed. Try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleError = (reason?: string, message?: string) => {
    switch (reason) {
      case "DONT_OWN_NFT":
        toast.error("NFT not found on this wallet. Please check your wallet.");
        break;
      case "ALREADY_VERIFIED":
        toast.info("This wallet has already been verified.");
        break;
      case "SERVER_ERROR":
        toast.error("Server error occurred. Please try again later.");
        break;
      default:
        redirectWithMessage(
          message || "Discord Access has been revoked. Redirecting..."
        );
        break;
    }
  };

  return (
    <>
      <Layout>
        <div className="h-auto w-full flex items-center justify-center pt-[264px] pb-[356px]">
          <div className="w-[600px] h-auto bg-neutral500 border border-neutral400 rounded-[32px] p-10 flex flex-col items-center gap-8">
            <h1 className="text-neutral00 font-bold text-2xl">
              Verify your NFT
            </h1>
            <p className="text-neutral100 text-lg font-normal text-center">
              Authenticate your wallet, verify NFT ownership, and your Discord role will be assigned automatically.
            </p>

            {canVerify ? (
              <Button
                variant="secondary"
                className="w-full md:w-[336px] h-16 cursor-pointer flex gap-4"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                <Image
                  src="/wallets/Metamask.png"
                  alt="Metamask"
                  width={40}
                  height={40}
                />
                <p className="text-neutral50 font-bold text-lg">
                  {isVerifying ? "Verifying..." : "Verify NFT"}
                </p>
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full md:w-[336px] h-16 cursor-pointer flex gap-4"
                onClick={() => setWalletModalOpen(true)}
              >
                <Image
                  src="/wallets/Metamask.png"
                  alt="Metamask"
                  width={40}
                  height={40}
                />
                <p className="text-neutral50 font-bold text-lg">
                  Connect Wallet
                </p>
              </Button>
            )}
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
