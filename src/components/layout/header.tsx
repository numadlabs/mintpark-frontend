"use client";
import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import HeaderItem from "../ui/headerItem";
import { useAuth } from "../provider/auth-context-provider";
import { useConnector } from "anduro-wallet-connector-react";
// import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
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

  return (
    <div className="h-[72px] w-full flex justify-center bg-neutral500 bg-opacity-[50%] mt-5 rounded-3xl">
      <div className="flex flex-row justify-between items-center max-w-[1216px] w-full">
        <div className="flex flex-row justify-between items-center w-full pl-6 pr-4 h-full">
          <Link href={"/"}>
            <Image src={"/Logo.svg"} alt="coordinals" width={222} height={40} />
          </Link>
          <div className="flex flex-row overflow-hidden items-center gap-4">
            <div className="flex flex-row gap-2 text-neutral00">
              {routesData.map((item, index) => (
                <HeaderItem
                  key={index}
                  title={item.title}
                  handleNav={() => router.push(item.pageUrl)}
                />
              ))}
            </div>
            {walletState.connectionState !== "connected" ? (
              <Button
                variant={"outline"}
                size={"lg"}
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? "Loading..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant={"outline"} size={"lg"} onClick={disconnect}>
                  Disconnect
                </Button>

                <Button variant={"outline"} size={"lg"} onClick={handleLogin}>
                  handleLogin
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
