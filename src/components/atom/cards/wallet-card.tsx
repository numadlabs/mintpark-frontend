import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export type ExtendedLayerType = {
  id: string;
  name: string;
  layer: string;
  network: string;
  currencyId: string;
  comingSoon?: boolean;
};

interface WalletCardProps {
  layer: ExtendedLayerType;
  isWalletConnected: (id: string) => boolean;
  loading: boolean;
  onConnect: (layer: ExtendedLayerType) => void;
}

const getWalletImage = (layer: string) => {
  switch (layer) {
    case "BITCOIN":
      return "/wallets/Unisat.png";
    case "CITREA":
      return "/wallets/Metamask.png";
    default:
      return "/wallets/Unisat.png";
  }
};

const getWalletName = (layer: string) => {
  switch (layer) {
    case "BITCOIN":
      return "Unisat Wallet";
    case "CITREA":
      return "MetaMask Wallet";
    default:
      return "Wallet";
  }
};

export const WalletCard = ({
  layer,
  isWalletConnected,
  loading,
  onConnect,
}: WalletCardProps) => {
  const connected = isWalletConnected(layer.id);

  return (
    <button
      className="flex items-center justify-between w-full p-4 rounded-xl border border-white8 hover:bg-white8 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => !layer.comingSoon && onConnect(layer)}
      disabled={layer.comingSoon || loading}
    >
      <div className="flex items-center gap-3">
        <Image
          src={getWalletImage(layer.layer)}
          alt={layer.layer}
          width={32}
          height={32}
        />
        <span className="font-medium text-neutral00">
          {getWalletName(layer.layer)}
        </span>
      </div>
      {layer.comingSoon ? (
        <span className="text-xs bg-white8 px-2 py-1 rounded-full">Soon</span>
      ) : loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : connected ? (
        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
          Connected
        </span>
      ) : null}
    </button>
  );
};
