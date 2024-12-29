import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarImage } from "../ui/avatar";
import WalletCard from "../atom/cards/wallet-card";

interface modalProps {
  open: boolean;
  onClose: () => void;
}

const ConnectWalletModal: React.FC<modalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 gap-6 max-w-[384px] w-full items-center">
        <DialogHeader className="flex w-full">
          <div className="text-xl text-neutral00 font-bold text-center">
            Connect Wallet
          </div>
        </DialogHeader>
        <div className="h-[1px] w-full bg-white8" />
        <Tabs defaultValue="Bitcoin">
          <TabsList>
            <div className="grid grid-cols-3 gap-3 items-center">
              <TabsTrigger value="Bitcoin" className="max-w-[104px] w-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/wallets/Bitcoin.png" alt="bitcoin" sizes="100%" />
                </Avatar>
              </TabsTrigger>
              <TabsTrigger value="Citrea" className="max-w-[104px] w-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/wallets/Citrea.png" alt="bitcoin" sizes="100%" />
                </Avatar>
              </TabsTrigger>
              <TabsTrigger value="Fractal" className="max-w-[104px] w-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/wallets/Fractal.png" alt="bitcoin" sizes="100%" />
                </Avatar>
              </TabsTrigger>
            </div>
          </TabsList>
          <div className="h-[1px] w-full bg-white8 my-6" />
          <TabsContent value="Bitcoin" className="flex flex-col gap-4">
            <WalletCard image={"/wallets/Unisat.png"} title={"Unisat Wallet"} />
            <WalletCard image={"/wallets/OKX.png"} title={"OKX Wallet"} />
            <WalletCard image={"/wallets/XVerse.png"} title={"XVerse Wallet"} />
          </TabsContent>
          <TabsContent value="Citrea">
            <WalletCard image={"/wallets/Metamask.png"} title={"MetaMask Wallet"} />
          </TabsContent>
          <TabsContent value="Fractal" className="flex flex-col gap-4">
            <WalletCard image={"/wallets/Unisat.png"} title={"Unisat Wallet"} />
            <WalletCard image={"/wallets/OKX.png"} title={"OKX Wallet"} />
          </TabsContent>
        </Tabs>
        <DialogFooter className="text-md text-neutral100">
          Choose wallet to Log In or Sign Up
        </DialogFooter>
        <button
          className="w-12 h-12 absolute top-3 right-3 flex justify-center items-center"
          onClick={onClose}
        >
          <X size={24} color="#D7D8D8" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
