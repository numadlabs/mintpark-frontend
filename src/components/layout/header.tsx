"use client";
import React, { useState, useCallback, useMemo } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Wallet2, Logout, ArrowRight2, ArrowDown2 } from "iconsax-react";
import { Button } from "../ui/button";
import { truncateAddress, capitalizeFirstLetter } from "@/lib/utils";
import { LayerType } from "@/lib/types";
import { toast } from "sonner";
import Badge from "../atom/badge";
import {
  ArrowDown,
  Check,
  Loader2,
  MenuIcon,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { WalletConnectionModal } from "../modal/wallet-connect-modal";
import { getChainIcon } from "@/lib/service/currencyHelper";
import { useLoyaltyPoints } from "@/lib/hooks/useLoyaltyPoint";

const LoyaltyPoints = ({
  points,
  isConnected,
}: {
  points: number;
  isConnected: boolean;
}) => {
  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 backdrop-blur-lg">
      <div className="relative">
        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-neutral-300 font-medium leading-tight">
          Points
        </span>
        <span className="text-sm text-white font-semibold leading-tight">
          {points.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// Mobile Loyalty Points Component
const MobileLoyaltyPoints = ({
  points,
  isConnected,
}: {
  points: number;
  isConnected: boolean;
}) => {
  if (!isConnected) return null;

  return (
    <div className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-neutral-200 font-medium">
            Loyalty Points
          </span>
          <span className="text-lg text-white font-bold">
            {points.toLocaleString()}
          </span>
        </div>
      </div>
      <Trophy className="h-5 w-5 text-yellow-400" />
    </div>
  );
};

// Type definitions
interface RouteItem {
  title: string;
  pageUrl: string;
  requiresAuth?: boolean;
  disabled?: boolean;
  badge?: string;
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const {
    isConnected,
    currentLayer,
    currentUserLayer,
    user,
    isLoading,
    error,
    availableLayers,
    selectedLayerId,
    connectWallet,
    switchLayer,
    disconnectWallet,
    setSelectedLayerId,
  } = useAuth();
  // Navigation routes - memoized to prevent re-creation
  const routes = useMemo<RouteItem[]>(
    () => [
      // {
      //   title: "Create",
      //   pageUrl: "/create",
      //   requiresAuth: true,
      //   disabled: true,
      //   badge: "Soon",
      // },
      { title: "Create", pageUrl: "/creater-tool" },
      { title: "Launchpad", pageUrl: "/launchpad" },
      { title: "Collections", pageUrl: "/collections" },
      // { title: "Verify", pageUrl: "/discord/verify" },
    ],
    [],
  );

  const loyaltyPoints = useLoyaltyPoints();
  //modalOpenHandle...
  // Handle layer selection from header dropdown
  const handleLayerSelect = useCallback(
    async (layerId: string): Promise<void> => {
      if (!layerId || layerId === selectedLayerId) return;

      const selectedLayerObj = availableLayers.find((l) => l.id === layerId);
      if (!selectedLayerObj) return;

      // Update selected layer immediately for UI responsiveness
      setSelectedLayerId(layerId);

      try {
        if (isConnected && user) {
          // User is already connected - switch layer without signing
          console.log(
            "Switching layer from header (no signing required):",
            selectedLayerObj.name,
          );
          await switchLayer(selectedLayerObj);
          toast.success(`Switched to ${selectedLayerObj.name}`);
        } else {
          // User not connected - just update the selection for when they connect
          console.log(
            "Layer selected for future connection:",
            selectedLayerObj.name,
          );
          localStorage.setItem("selectedLayer", selectedLayerObj.layer);
          localStorage.setItem("selectedNetwork", selectedLayerObj.network);
        }
      } catch (error) {
        console.error("Failed to switch layer:", error);
        toast.error("Failed to switch layer");
        // Revert the UI change on error
        setSelectedLayerId(currentLayer?.id || null);
      }
    },
    [
      selectedLayerId,
      availableLayers,
      switchLayer,
      setSelectedLayerId,
      isConnected,
      user,
      currentLayer,
    ],
  );

  // Handle logout
  const handleLogout = useCallback((): void => {
    if (isConnected) {
      disconnectWallet();
      toast.info("Logged out successfully!");
    }
  }, [isConnected, disconnectWallet]);

  // Handle navigation
  const handleNavigation = useCallback(
    (pageUrl: string, requiresAuth?: boolean, disabled?: boolean): void => {
      if (disabled) {
        toast.info("This feature is coming soon!");
        return;
      }

      if (requiresAuth && !isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      router.push(pageUrl);
      setMobileMenuOpen(false);
    },
    [isConnected, router],
  );

  // Filtered layers for display
  const displayLayers = useMemo(() => {
    // if (process.env.NODE_ENV == "development") {
    //   return availableLayers;
    // }
    return availableLayers.filter(
      (layer) =>
        layer.layer !== "BITCOIN" &&
        layer.name !== "Hemi Testnet" &&
        layer.name !== "EDU Chain Testnet" &&
        layer.name !== "EDU Chain" &&
        layer.name !== "CORE Testnet",
    );
  }, [availableLayers]);

  // Current wallet info
  const currentWallet = useMemo(() => {
    if (!currentUserLayer || !isConnected) return null;
    return {
      address: currentUserLayer.address || "",
      layerId: currentLayer?.id || "",
    };
  }, [currentUserLayer, currentLayer, isConnected]);

  // Render layer item for select dropdown
  const renderLayerItem = useCallback(
    (layer: LayerType) => {
      const isLayerConnected = currentLayer?.id === layer.id && isConnected;

      return (
        <SelectItem
          key={layer.id}
          value={layer.id}
          className="flex items-center rounded-lg gap-2 w-[180px]"
        >
          <div className="flex justify-between gap-2 items-center text-md text-neutral50 font-medium w-full">
            <div className="flex gap-2">
              <div className="relative">
                <Image
                  src={getChainIcon(layer.layer)}
                  alt={layer.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                {`${capitalizeFirstLetter(layer.layer)} ${capitalizeFirstLetter(
                  layer.network,
                )}`}
              </div>
            </div>
            {isLayerConnected && (
              <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
            )}
          </div>
        </SelectItem>
      );
    },
    [currentLayer?.id, isConnected],
  );

  // Render current layer value in select trigger
  const renderCurrentLayerValue = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-neutral50" />
          <span>Loading...</span>
        </div>
      );
    }

    if (availableLayers.length === 0) {
      return <span>No layers available</span>;
    }

    // Show the selected layer (or current layer if connected)
    const displayLayer =
      currentLayer || availableLayers.find((l) => l.id === selectedLayerId);

    if (displayLayer) {
      return (
        <div className="flex flex-row gap-2 items-center w-max">
          <div className="relative">
            <Image
              src={getChainIcon(displayLayer.layer)}
              alt={displayLayer.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <span>
            {`${capitalizeFirstLetter(
              displayLayer.layer,
            )} ${capitalizeFirstLetter(displayLayer.network)}`}
          </span>
        </div>
      );
    }

    return <span>Select layer</span>;
  }, [isLoading, currentLayer, availableLayers, selectedLayerId]);

  return (
    <>
      <div className="">
        <div className="h-[72px] w-full flex justify-center bg-gray500op50 backdrop-blur-[60px] mt-5 rounded-3xl sticky top-5 left-0 right-0 z-30 max-w-[1920px] mx-auto">
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-between items-center w-full pl-6 pr-4 h-full">
              {/* Logo and Navigation */}
              <div className="flex gap-6">
                <Link href="/">
                  <Image
                    src="/newLogo.png"
                    alt="Mintpark Logo"
                    width={54}
                    height={36}
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
                            item.disabled,
                          )
                        }
                      />
                      {item.badge && <Badge label={item.badge} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Controls - Loyalty points, Layer selector and wallet */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Loyalty Points */}
                {loyaltyPoints && loyaltyPoints.pointsData && (
                  <LoyaltyPoints
                    points={loyaltyPoints.pointsData.balance}
                    isConnected={isConnected}
                  />
                )}

                {/* Layer Selector */}
                <Select
                  onValueChange={handleLayerSelect}
                  value={selectedLayerId || currentLayer?.id || ""}
                  disabled={isLoading}
                >
                  <SelectTrigger className="flex items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
                    <SelectValue placeholder="Select layer">
                      {renderCurrentLayerValue()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="mt-4 flex flex-col p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                    <SelectGroup className="flex flex-col gap-2">
                      {displayLayers.map(renderLayerItem)}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Wallet Connection */}
                {!isConnected ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setWalletModalOpen(true)}
                    className="min-w-[170px]"
                  >
                    Connect Wallet
                  </Button>
                ) : currentWallet ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 min-w-[170px] w-full bg-white8 hover:bg-white16 outline-none duration-300 transition-all py-2 px-6 rounded-xl backdrop-blur-xl">
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

              {/* Mobile Menu Button - Now uses Sheet from shadcn/ui */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="outline"
                    className="p-2 text-neutral50 border-hidden"
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    <MenuIcon size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="lg:hidden pt-4 pb-6 h-auto min-h-screen w-full bg-neutral500 bg-opacity-95 backdrop-blur-lg overflow-y-auto"
                >
                  <div className="flex justify-between items-center w-full px-4 py-6">
                    <div>
                      {/* <Link href="/#" className="flex ml-4"> */}
                      <Image
                        src="/newLogo.png"
                        alt="Mintpark logo"
                        width={40}
                        height={40}
                      />
                      {/* </Link> */}
                    </div>
                    <div>
                      <X
                        size={24}
                        className="text-neutral50 cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    </div>
                  </div>

                  {/* Mobile navigation */}
                  <div className="flex flex-col pt-8 gap-5 px-6">
                    {routes.map((item, index) => (
                      <div key={index} className="relative">
                        <button
                          className="text-neutral00 text-lg font-medium w-full text-left py-2 flex items-center"
                          onClick={() =>
                            handleNavigation(
                              item.pageUrl,
                              item.requiresAuth,
                              item.disabled,
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
                      {/* Mobile Loyalty Points */}
                      {loyaltyPoints && loyaltyPoints.pointsData && (
                        <MobileLoyaltyPoints
                          points={loyaltyPoints.pointsData.balance}
                          isConnected={isConnected}
                        />
                      )}

                      {/* Same layer selector as desktop but with mobile styling */}
                      <Select
                        onValueChange={handleLayerSelect}
                        value={selectedLayerId as string}
                      >
                        <SelectTrigger className="flex items-center h-12 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl w-full">
                          <SelectValue placeholder="Select layer">
                            {renderCurrentLayerValue()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="flex max-w-[210px] flex-col p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                          <SelectGroup className="flex flex-col gap-2">
                            {displayLayers.map(renderLayerItem)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {/* Mobile wallet buttons */}
                      {!isConnected ? (
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={() => setWalletModalOpen(true)}
                          className="w-full"
                        >
                          Connect Wallet
                        </Button>
                      ) : currentWallet ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center justify-between gap-2 w-full bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-3 rounded-xl backdrop-blur-xl">
                            <div className="flex items-center gap-2">
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
                            </div>
                            <div className="text-neutral50">
                              <ArrowDown2 size={16} color="#D7D8D8" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="flex flex-col gap-2 w-full p-2 border border-white4 bg-gray50 rounded-2xl backdrop-blur-xl">
                            <Link href="/my-assets">
                              <DropdownMenuItem className="flex justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                                <div className="flex items-center gap-2">
                                  <Wallet2 size={24} color="#D7D8D8" />
                                  My Assets
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
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet connection modal */}
      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}
