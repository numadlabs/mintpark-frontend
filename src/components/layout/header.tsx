"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderItem from "../ui/headerItem";
import { useAuth } from "../provider/auth-context-provider";
import { useConnector } from "anduro-wallet-connector-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ConnectWalletModal from "../modal/connect-wallet-modal";
import { Wallet2, I3Dcube, Logout, ArrowRight2 } from "iconsax-react";
import { Avatar, AvatarImage } from "../ui/avatar";

export default function Header() {
  const router = useRouter();
  const [walletModal, setWalletModal] = useState(false);
  const {
    networkState,
    walletState,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useContext<any>(useConnector);
  const { walletAddress, isConnecting, connect, disconnect, handleLogin } =
    useAuth();

  const routesData = [
    { title: "Create", pageUrl: "/create" },
    { title: "Launchpad", pageUrl: "/launchpad" },
    { title: "Collections", pageUrl: "/collections" },
  ];

  const toggleWalletModal = () => {
    setWalletModal(!walletModal);
  };

  return (
    <>
      <div className="h-[72px] w-full flex justify-center bg-neutral500 bg-opacity-50 backdrop-blur-4xl mt-5 rounded-3xl">
        <div className="flex flex-row justify-between items-center max-w-[1216px] w-full">
          <div className="flex flex-row justify-between items-center w-full pl-6 pr-4 h-full">
            <div className="flex gap-12">
              <Link href={"/"}>
                <Image
                  src={"/Logo.svg"}
                  alt="coordinals"
                  width={40}
                  height={40}
                />
              </Link>
              <div className="flex flex-row gap-2 text-neutral00">
                {routesData.map((item, index) => (
                  <HeaderItem
                    key={index}
                    title={item.title}
                    handleNav={() => router.push(item.pageUrl)}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-row overflow-hidden items-center gap-4">
              <div>
                <Select defaultValue="bitcoin">
                  <SelectTrigger className="max-w-[144px] flex flex-row items-center w-screen h-10 border-0 bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl">
                    {/* <Avatar><AvatarImage src="/wallets/Bitcoin.png" alt="bitcoin" sizes="100%" width={24} height={24} className="w-6 h-6"/></Avatar>   */}
                    <SelectValue defaultValue={"bitcoin"} />
                  </SelectTrigger>
                  <SelectContent className="max-w-[160px] w-screen mt-4 flex flex-col items-center justify-center p-2 gap-2 bg-white4 backdrop-blur-lg border-white4 rounded-2xl">
                    <SelectItem
                      value="bitcoin"
                      className="w-[144px] hover:bg-white8 duration-300 transition-all flex flex-row items-center gap-2"
                    >
                      <div className="flex flex-row gap-2 items-center text-md text-neutral50 font-medium">
                        <span>
                          <Image
                            src={"/wallets/Bitcoin.png"}
                            alt="bitcoin"
                            width={24}
                            height={24}
                          />
                        </span>
                        Bitcoin
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="citrea"
                      className="w-full hover:bg-white8 duration-300 transition-all"
                    >
                      <div className="flex flex-row gap-2 items-center text-md text-neutral50 font-medium">
                        <span>
                          <Image
                            src={"/wallets/Citrea.png"}
                            alt="citrea"
                            width={24}
                            height={24}
                          />
                        </span>
                        Citrea
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="fractal"
                      className="w-full hover:bg-white8 duration-300 transition-all"
                    >
                      <div className="flex flex-row gap-2 items-center text-md text-neutral50 font-medium">
                        <span>
                          <Image
                            src={"/wallets/Fractal.png"}
                            alt="fractal"
                            width={24}
                            height={24}
                          />
                        </span>
                        Bitcoin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* {walletState.connectionState !== "connected" ? (
              <Button
                variant={"outline"}
                size={"lg"}
                onClick={connect}
                disabled={isConnecting}
                className="bg-opacity-[8%]"
              >
                {isConnecting ? "Loading..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant={"outline"} size={"lg"} onClick={disconnect}>
                  Disconnect
                </Button> */}

              {/* <Button variant={"outline"} size={"lg"} onClick={toggleWalletModal}>
                Connect Wallet
              </Button> */}
              {/* </div>
            )} */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex flex-row items-center gap-2 max-w-[128px] w-full bg-white8 hover:bg-white16 duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
                  <Image
                    src={"/Avatar.png"}
                    alt="image"
                    sizes="100%"
                    width={24}
                    height={24}
                    className="object-cover rounded-full"
                  />
                  <span className="text-neutral50 text-md font-medium">
                    bc1p...79t2
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex flex-col gap-2 max-w-[215px] w-screen p-2 border border-white4 bg-gray50 mt-4 rounded-2xl backdrop-blur-xl">
                  <DropdownMenuItem className="flex flex-row justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                    <div className="flex flex-row items-center gap-2">
                      <span>
                        <Wallet2 size={24} color="#D7D8D8" />
                      </span>
                      My Assets
                    </div>
                    <ArrowRight2 size={16} color="#D7D8D8" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-row items-center justify-between text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                    <div className="flex flex-row items-center gap-2">
                      <span>
                        <I3Dcube size={24} color="#D7D8D8" />
                      </span>
                      Inscribe Orders
                    </div>
                    <ArrowRight2 size={16} color="#D7D8D8" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-neutral50 text-md font-medium flex flex-row gap-2 hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                    <span>
                      <Logout size={24} color="#D7D8D8" />
                    </span>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <ConnectWalletModal open={walletModal} onClose={toggleWalletModal} />
    </>
  );
}
