'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/provider/auth-context-provider';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { WalletConnectionModal } from '@/components/modal/wallet-connect-modal';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const {
    authState,
    selectedLayerId,
    getWalletForLayer,
    isWalletConnected,
  } = useAuth();

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

  const handleVerify = async () => {
    if (!address || !code) {
      toast.error('Missing address or code');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await axiosClient.post(`/api/v1/discord/verify`, {
        address,
        code,
      });
      toast.success('Verification successful!');
      console.log(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Verification failed. Try again.'
      );
    } finally {
      setIsVerifying(false);
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
              Connect your wallet and verify your NFT to join our Discord community.
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
                  {isVerifying ? 'Verifying...' : 'Verify NFT'}
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
                <p className="text-neutral50 font-bold text-lg">Connect Wallet</p>
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
