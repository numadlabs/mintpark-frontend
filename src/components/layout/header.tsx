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
import { truncateAddress, capitalizeFirstLetter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { LayerType } from "@/lib/types";
import { toast } from "sonner";
import Badge from "../atom/badge";
import { Check, Loader2, MenuIcon } from "lucide-react";
import { WalletConnectionModal } from "../modal/wallet-connect-modal";

// Type definitions
interface RouteItem {
  title: string;
  pageUrl: string;
  requiresAuth?: boolean;
  disabled?: boolean;
  badge?: string;
}

interface WalletInfo {
  address: string;
  layerId: string;
}

interface LayerImageMap {
  [key: string]: string;
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("CITREA");
  const [defaultLayer, setDefaultLayer] = useState("CITREA-mainnet");

  const {
    authState,
    onLogout,
    selectedLayerId,
    setSelectedLayerId,
    getWalletForLayer,
    isWalletConnected,
    connectedWallets,
  } = useAuth();

  // Fetch all available layers
  const { data: dynamicLayers = [] } = useQuery({
    queryKey: ["layerData"],
    queryFn: getAllLayers,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Fetch current selected layer data
  const { data: currentLayer, isLoading: isLayersLoading } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
  });

  // Set default layer on initial load
  useEffect(() => {
    if (!selectedLayerId && dynamicLayers.length > 0) {
      const citreaLayer = dynamicLayers.find((l) => l.layer === "CITREA");
      if (citreaLayer) {
        setDefaultLayer(`${citreaLayer.layer}-${citreaLayer.network}`);
        setSelectedLayerId(citreaLayer.id);
        setSelectedLayer(citreaLayer.layer);
      }
    } else if (currentLayer) {
      setDefaultLayer(`${currentLayer.layer}-${currentLayer.network}`);
    }
  }, [currentLayer, dynamicLayers, selectedLayerId, setSelectedLayerId]);

  // Combine dynamic and static layers
  const layers = [...dynamicLayers];

  // Define navigation routes
  const routes: RouteItem[] = [
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

  // Get layer image based on layer name
  const getLayerImage = (layer: string): string => {
    const imageMap: LayerImageMap = {
      BITCOIN: "/wallets/Bitcoin.png",
      FRACTAL: "/wallets/Fractal.png",
      CITREA: "/wallets/Citrea.png",
      SEPOLIA: "/wallets/hemi.png",
      HEMI: "/wallets/hemi.png",
      POLYGON_ZK: "",
    };

    return imageMap[layer] || "/wallets/Bitcoin.png";
  };

  // Handle layer selection
  const handleLayerSelect = (value: string): void => {
    const [layer, network] = value.split("-");
    const matchingLayer = layers.find(
      (l) => l.layer === layer && l.network === network
    );

    if (matchingLayer && selectedLayerId !== matchingLayer.id) {
      setSelectedLayerId(matchingLayer.id);
      setDefaultLayer(value);
      setSelectedLayer(layer);
    }
  };

  // Handle logout
  const handleLogout = (): void => {
    if (authState.authenticated) {
      onLogout();
      toast.info("Logged out successfully");
    }
  };

  // Handle navigation
  const handleNavigation = (
    pageUrl: string,
    requiresAuth?: boolean,
    disabled?: boolean
  ): void => {
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
  const isWalletDisconnected =
    selectedLayerId && !isWalletConnected(selectedLayerId);

  // Render dropdown layer item
  const renderLayerItem = (layer: LayerType) => {
    const isLayerConnected = connectedWallets?.some((wallet: WalletInfo) => {
      const foundLayer = layers.find((l) => l.id === wallet.layerId);
      return (
        foundLayer?.layer === layer.layer &&
        foundLayer?.network === layer.network
      );
    });

    return (
      <SelectItem
        key={layer.id}
        value={`${layer.layer}-${layer.network}`}
        className={`flex items-center gap-2 w-[170px]`}
      >
        <div className="flex justify-between gap-2 items-center text-md text-neutral50 font-medium w-full">
          <div className="flex gap-2">
            <Image
              src={getLayerImage(layer.layer)}
              alt={layer.layer}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="flex items-center gap-2 flex-1">
              {`${capitalizeFirstLetter(layer.layer)} ${capitalizeFirstLetter(
                layer.network
              )}`}
            </div>
          </div>
          {isLayerConnected && <Check className="w-5 h-5 text-neutral50" />}
        </div>
      </SelectItem>
    );
  };

  // Render current layer value
  const renderCurrentLayerValue = () => {
    if (isLayersLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-neutral50" />
          <span>Loading...</span>
        </div>
      );
    }

    if (defaultLayer) {
      return (
        <div className="flex flex-row gap-2 items-center w-max">
          <Image
            src={getLayerImage(defaultLayer.split("-")[0])}
            alt={defaultLayer.split("-")[0]}
            width={24}
            height={24}
            className="rounded-full"
          />
          {defaultLayer.split("-").map(capitalizeFirstLetter).join(" ")}
        </div>
      );
    }

    return <span>Select layer</span>;
  };

  return (
    <>
      <div className="">
        <div className="h-[72px] w-full flex justify-center bg-neutral500 bg-opacity-50 backdrop-blur-4xl mt-5 rounded-3xl">
          <div className="flex justify-between items-center max-w-[1920px] w-full">
            <div className="flex justify-between items-center w-full pl-6 pr-4 h-full">
              {/* Logo and Navigation */}
              <div className="flex gap-12">
                <Link href="/">
                  <Image
                    src="/Logo.svg"
                    alt="coordinals"
                    width={40}
                    height={40}
                  />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-row gap-2 text-neutral00">
                  {routes.map((item, index) => (
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

              {/* Desktop Controls - Layer selector and wallet */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Layer Selector */}
                <Select onValueChange={handleLayerSelect} value={defaultLayer}>
                  <SelectTrigger className="flex items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
                    <SelectValue
                      placeholder="Select layer"
                      defaultValue={defaultLayer}
                    >
                      {renderCurrentLayerValue()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="mt-4 flex flex-col p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                    <SelectGroup className="flex flex-col gap-2">
                      {layers.map(renderLayerItem)}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Wallet Connection */}
                {isWalletDisconnected ? (
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
                    <DropdownMenuTrigger className="flex items-center gap-2 max-w-[136px] w-full bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
                      <Image
                        src="/Avatar.png"
                        alt="avatar"
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
                        <DropdownMenuItem className="flex justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex items-center gap-2">
                            <Wallet2 size={24} color="#D7D8D8" />
                            My Assets
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/orders">
                        <DropdownMenuItem className="flex justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex items-center gap-2">
                            <I3Dcube size={24} color="#D7D8D8" />
                            <p>Inscribe Orders</p>
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-neutral50 text-md font-medium flex gap-2 hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all"
                        onClick={handleLogout}
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

      {/* Mobile Menu - Only renders when open */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-neutral500 bg-opacity-95 backdrop-blur-lg">
          <div className="flex flex-col p-4 space-y-4">
            {/* Mobile header */}
            <div className="flex justify-between items-center">
              <Link href="/">
                <Image
                  src="/Logo.svg"
                  alt="coordinals"
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

            {/* Mobile navigation */}
            <div className="flex flex-col pt-8 gap-4">
              {routes.map((item, index) => (
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

              {/* Mobile layer and wallet controls */}
              <div className="grid items-center pt-6 border-t border-neutral400 gap-4">
                {/* Same layer selector as desktop but with mobile styling */}
                <Select onValueChange={handleLayerSelect} value={defaultLayer}>
                  <SelectTrigger className="flex items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl w-auto">
                    <SelectValue
                      placeholder="Select layer"
                      defaultValue={defaultLayer}
                    >
                      {renderCurrentLayerValue()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="flex max-w-[210px] flex-col p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                    <SelectGroup className="flex flex-col gap-2">
                      {layers.map(renderLayerItem)}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Mobile wallet buttons */}
                {isWalletDisconnected ? (
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
                    <DropdownMenuTrigger className="flex items-center gap-2 w-auto bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
                      <Image
                        src="/Avatar.png"
                        alt="avatar"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-neutral50">
                        {truncateAddress(currentWallet.address)}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex flex-col gap-2 w-[210px] absolute p-2 border border-white4 bg-gray50 rounded-2xl backdrop-blur-xl">
                      <Link href="/my-assets">
                        <DropdownMenuItem className="flex justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex items-center gap-2">
                            <Wallet2 size={24} color="#D7D8D8" />
                            My Assets
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/orders">
                        <DropdownMenuItem className="flex justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                          <div className="flex items-center gap-2">
                            <I3Dcube size={24} color="#D7D8D8" />
                            <p>Inscribe Orders</p>
                          </div>
                          <ArrowRight2 size={16} color="#D7D8D8" />
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-neutral50 text-md font-medium flex gap-2 hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all"
                        onClick={handleLogout}
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

      {/* Wallet connection modal */}
      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeTab={selectedLayer}
        onTabChange={(tab) => {
          setSelectedLayer(tab);
          const matchingLayer = layers.find((l) => l.layer === tab);
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
