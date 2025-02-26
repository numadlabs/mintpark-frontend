"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderItem from "../ui/headerItem";
import { useAuth } from "../provider/auth-context-provider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Wallet2, I3Dcube, Logout, ArrowRight2 } from "iconsax-react";
import { Button } from "../ui/button";
import { getAllLayers, getLayerById } from "@/lib/service/queryHelper";
import {
  truncateAddress,
  capitalizeFirstLetter,
  storePriceData,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ExtendedLayerType, LayerType } from "@/lib/types";
import { toast } from "sonner";
import Badge from "../atom/badge";
import { Check, Loader2, MenuIcon } from "lucide-react";
import { WalletConnectionModal } from "../modal/wallet-connect-modal";

declare global {
  interface Window {
    unisat: any;
  }
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("CITREA");
  const [defaultLayer, setDefaultLayer] = useState<string>("CITREA-mainnet");

  const {
    authState,
    onLogout,
    selectedLayerId,
    setSelectedLayerId,
    getWalletForLayer,
    isWalletConnected,
    connectedWallets,
  } = useAuth();

  const { data: dynamicLayers = [] } = useQuery({
    queryKey: ["layerData"],
    queryFn: () => getAllLayers(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: currentLayer, isLoading: isLayersLoading } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
  });

  // Initialize default layer
  useEffect(() => {
    const initializeDefaultLayer = () => {
      if (currentLayer) {
        const layerString = `${currentLayer.layer}-${currentLayer.network}`;
        setDefaultLayer(layerString);
        if (currentLayer.price) {
          storePriceData(currentLayer.price);
        }
      } else if (dynamicLayers.length > 0) {
        const citreaLayer = dynamicLayers.find(
          (l: LayerType) => l.layer === "CITREA"
        );
        if (citreaLayer) {
          const layerString = `${citreaLayer.layer}-${citreaLayer.network}`;
          setDefaultLayer(layerString);
          setSelectedLayerId(citreaLayer.id);
          setSelectedLayer(citreaLayer.id);
        }
      }
    };

    initializeDefaultLayer();
  }, [currentLayer, dynamicLayers, setSelectedLayerId]);

  // Static layers array is now empty since we removed Nubit
  const staticLayers: (LayerType & { comingSoon?: boolean })[] = [];

  const layers: ExtendedLayerType[] = [...dynamicLayers, ...staticLayers];

  const routesData = [
    {
      title: "Create",
      pageUrl: "/create",
      requiresAuth: true,
      disabled: true,
      badge: "Soon",
    },
    { title: "Launchpad", pageUrl: "/launchpad" },
    { title: "Collections", pageUrl: "/collections" },
  ];

  const getLayerImage = (layer: string) => {
    switch (layer) {
      case "BITCOIN":
        return "/wallets/Bitcoin.png";
      case "FRACTAL":
        return "/wallets/Fractal.png";
      case "CITREA":
        return "/wallets/Citrea.png";
      case "SEPOLIA":
        return "/wallets/hemi.png";
      default:
        return "/wallets/Bitcoin.png"; // Changed default to Bitcoin instead of Nubit
    }
  };

  const handleLayerSelect = (value: string) => {
    const [layer, network] = value.split("-");
    const selectedLayer = layers.find(
      (l: LayerType) => l.layer === layer && l.network === network
    );

    if (selectedLayer) {
      setSelectedLayerId(selectedLayer.id);
      setDefaultLayer(value);
      setSelectedLayer(layer);
    }
  };

  const handleLogOut = () => {
    if (authState.authenticated) {
      onLogout();
      toast.info("Logged out successfully");
    }
  };

  const handleNavigation = (
    pageUrl: string,
    requiresAuth?: boolean,
    disabled?: boolean
  ) => {
    if (disabled) {
      toast.info("This feature is coming soon!");
      return;
    }
    if (requiresAuth && !authState.authenticated) {
      toast.error("Please connect your wallet");
      return;
    }
    router.push(pageUrl);
    setMobileMenuOpen(false);
  };

  const currentWallet = selectedLayerId
    ? getWalletForLayer(selectedLayerId)
    : undefined;

  const isAuthenticated =
    selectedLayerId && !isWalletConnected(selectedLayerId);

  return (
    <>
      <div className="">
        <div className="h-[72px] w-full flex justify-center bg-neutral500 bg-opacity-50 backdrop-blur-4xl mt-5 rounded-3xl">
          <div className="flex flex-row justify-between items-center max-w-[1920px] w-full">
            <div className="flex flex-row justify-between items-center w-full pl-6 pr-4 h-full">
              <div className="flex gap-12">
                <Link href={"/"}>
                  <Image
                    src={"/Logo.svg"}
                    draggable="false"
                    alt="coordinals"
                    width={40}
                    height={40}
                  />
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-row gap-2 text-neutral00">
                  {routesData.map((item, index) => (
                    <div key={index} className="relative">
                      <HeaderItem
                        title={item.title}
                        handleNav={() =>
                          handleNavigation(
                            item.pageUrl,
                            item.requiresAuth,
                            item.disabled
                          )
                        }
                      />
                      {item.badge && <Badge label={item.badge} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Controls */}
              <div className="hidden lg:flex flex-row overflow-hidden items-center gap-4">
                <Select onValueChange={handleLayerSelect} value={defaultLayer}>
                  <SelectTrigger className="flex flex-row items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
                    <SelectValue
                      placeholder="Select layer"
                      defaultValue={defaultLayer}
                    >
                      {isLayersLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral50" />
                          <span>Loading...</span>
                        </div>
                      ) : defaultLayer ? (
                        <div className="flex flex-row gap-2 items-center w-max">
                          <Image
                            src={getLayerImage(defaultLayer.split("-")[0])}
                            alt={defaultLayer.split("-")[0]}
                            draggable="false"
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          {defaultLayer
                            .split("-")
                            .map(capitalizeFirstLetter)
                            .join(" ")}
                        </div>
                      ) : (
                        <span>Select layer</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="mt-4 flex flex-col items-center justify-center p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                    <SelectGroup className="flex flex-col gap-2">
                      {layers.map((layer) => {
                        // Check if this layer is connected
                        const isLayerConnected = connectedWallets?.some(
                          (wallet) => {
                            const foundLayer = layers.find(
                              (l) => l.id === wallet.layerId
                            );
                            return (
                              foundLayer?.layer === layer.layer &&
                              foundLayer?.network === layer.network
                            );
                          }
                        );

                        return (
                          <SelectItem
                            key={layer.id}
                            value={`${layer.layer}-${layer.network}`}
                            className={`flex flex-row items-center gap-2 w-[170px] ${
                              layer.comingSoon
                                ? "opacity-80 cursor-not-allowed"
                                : "hover:bg-white8 duration-300 transition-all cursor-pointer"
                            }`}
                          >
                            <div className="flex justify-between gap-2 items-center text-md text-neutral50 font-medium w-full">
                              <div className="flex gap-2">
                                <Image
                                  src={getLayerImage(layer.layer)}
                                  alt={layer.layer}
                                  width={24}
                                  draggable="false"
                                  height={24}
                                  className="rounded-full"
                                />
                                <div className="flex items-center gap-2 flex-1">
                                  {`${capitalizeFirstLetter(
                                    layer.layer
                                  )} ${capitalizeFirstLetter(layer.network)}`}
                                </div>
                              </div>
                              {/* Show connection status in dropdown */}
                              <div className="">
                                {isLayerConnected && (
                                  // <div className="w-2 h-2 bg-success rounded-full" />
                                  <Check className="w-5 h-5 text-neutral50" />
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {isAuthenticated ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setWalletModalOpen(true)}
                    className="min-w-[170px]"
                  >
                    Connect Wallet
                  </Button>
                ) : authState.authenticated && currentWallet ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex flex-row items-center gap-2 max-w-[136px] w-full bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
                      <Image
                        src="/Avatar.png"
                        alt="avatar"
                        draggable="false"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-neutral50">
                        {truncateAddress(currentWallet.address)}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex flex-col gap-2 max-w-[215px] w-full p-2 border border-white4 bg-gray50 mt-4 rounded-2xl backdrop-blur-xl">
                      <Link href="/my-assets">
                        <DropdownMenuItem className="flex flex-row justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex flex-row items-center gap-2">
                            <Wallet2 size={24} color="#D7D8D8" />
                            My Assets
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/orders">
                        <DropdownMenuItem className="flex flex-row items-center justify-between text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex flex-row items-center gap-2">
                            <I3Dcube size={24} color="#D7D8D8" />
                            <p>Inscribe Orders</p>
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-neutral50 text-md font-medium flex flex-row gap-2 hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all"
                        onClick={handleLogOut}
                      >
                        <Logout size={24} color="#D7D8D8" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-neutral50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <MenuIcon size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-neutral500 bg-opacity-95 backdrop-blur-lg">
          <div className="flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Link href={"/"}>
                <Image
                  src={"/Logo.svg"}
                  alt="coordinals"
                  draggable="false"
                  width={40}
                  height={40}
                />
              </Link>
              <button
                className="p-2 text-neutral50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col pt-8 gap-4">
              {routesData.map((item, index) => (
                <div key={index} className="relative">
                  <button
                    className="text-neutral00 text-lg font-medium w-full text-left py-2"
                    onClick={() =>
                      handleNavigation(
                        item.pageUrl,
                        item.requiresAuth,
                        item.disabled
                      )
                    }
                  >
                    {item.title}
                    {item.badge && <Badge label={item.badge} />}
                  </button>
                </div>
              ))}
              {/* {authState.authenticated && (
                <div className="flex flex-col gap-8 pt-6 border-t border-neutral400">
                  <Link
                    href="/my-assets"
                    className="text-neutral00 text-lg font-medium"
                  >
                    My Assets
                  </Link>
                  <Link
                    href="/orders"
                    className="text-neutral00 text-lg font-medium"
                  >
                    Inscribe Orders
                  </Link>
                </div>
              )}*/}
              <div className="lg:flex flex-row overflow-hidden grid items-center pt-6 border-t border-neutral400 gap-4 ">
                <Select onValueChange={handleLayerSelect} value={defaultLayer}>
                  <SelectTrigger className="flex flex-row items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl w-auto">
                    <SelectValue
                      placeholder="Select layer"
                      defaultValue={defaultLayer}
                    >
                      {isLayersLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral50" />
                          <span>Loading...</span>
                        </div>
                      ) : defaultLayer ? (
                        <div className="flex flex-row gap-2 items-center">
                          <Image
                            src={getLayerImage(defaultLayer.split("-")[0])}
                            alt={defaultLayer.split("-")[0]}
                            width={24}
                            draggable="false"
                            height={24}
                            className="rounded-full"
                          />
                          {defaultLayer
                            .split("-")
                            .map(capitalizeFirstLetter)
                            .join(" ")}
                        </div>
                      ) : (
                        <span>Select layer</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="flex max-w-[210px] flex-col items-center justify-center p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                    <SelectGroup className="flex flex-col gap-2">
                      {layers.map((layer) => {
                        // Check if this layer is connected
                        const isLayerConnected = connectedWallets?.some(
                          (wallet) => {
                            const foundLayer = layers.find(
                              (l) => l.id === wallet.layerId
                            );
                            return (
                              foundLayer?.layer === layer.layer &&
                              foundLayer?.network === layer.network
                            );
                          }
                        );

                        return (
                          <SelectItem
                            key={layer.id}
                            value={`${layer.layer}-${layer.network}`}
                            className={`flex flex-row items-center gap-2 w-[170px] ${
                              layer.comingSoon
                                ? "opacity-80 cursor-not-allowed"
                                : "hover:bg-white8 duration-300 transition-all cursor-pointer"
                            }`}
                          >
                            <div className="flex flex-row gap-2 items-center text-md text-neutral50 font-medium w-full">
                              <Image
                                src={getLayerImage(layer.layer)}
                                alt={layer.layer}
                                width={24}
                                height={24}
                                draggable="false"
                                className="rounded-full"
                              />
                              <div className="flex items-center gap-2 flex-1">
                                {`${capitalizeFirstLetter(
                                  layer.layer
                                )} ${capitalizeFirstLetter(layer.network)}`}
                              </div>
                              {/* Show connection status in dropdown */}
                              {isLayerConnected && (
                                <div className="w-2 h-2 bg-green-400 rounded-full ml-auto" />
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {isAuthenticated ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setWalletModalOpen(true)}
                    className="min-w-[170px]"
                  >
                    Connect Wallet
                  </Button>
                ) : authState.authenticated && currentWallet ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex flex-row items-center gap-2  w-auto bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
                      <Image
                        src="/Avatar.png"
                        alt="avatar"
                        width={24}
                        height={24}
                        draggable="false"
                        className="rounded-full"
                      />
                      <span className="text-neutral50">
                        {truncateAddress(currentWallet.address)}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex flex-col gap-2 w-[210px] absolute p-2 border border-white4 bg-gray50 rounded-2xl backdrop-blur-xl">
                      <Link href="/my-assets">
                        <DropdownMenuItem className="flex flex-row justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex flex-row items-center gap-2">
                            <Wallet2 size={24} color="#D7D8D8" />
                            My Assets
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/orders">
                        <DropdownMenuItem className="flex flex-row items-center justify-between text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex flex-row items-center gap-2">
                            <I3Dcube size={24} color="#D7D8D8" />
                            <p>Inscribe Orders</p>
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-neutral50 text-md font-medium flex flex-row gap-2 hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all"
                        onClick={handleLogOut}
                      >
                        <Logout size={24} color="#D7D8D8" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeTab={selectedLayer}
        onTabChange={(tab) => {
          setSelectedLayer(tab);
          const matchingLayer = layers.find((l: LayerType) => l.layer === tab);
          if (matchingLayer) {
            setDefaultLayer(`${tab}-${matchingLayer.network}`);
            setSelectedLayerId(matchingLayer.id);
          }
        }}
        onLayerSelect={(layer, network) => {
          handleLayerSelect(`${layer}-${network}`);
        }}
      />
    </>
  );
}
