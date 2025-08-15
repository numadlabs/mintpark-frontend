"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Check, Loader2, MenuIcon, X } from "lucide-react";
import { WalletConnectionModal } from "../modal/wallet-connect-modal";
import { getCurrencyImage } from "@/lib/service/currencyHelper";

interface RouteItem {
  title: string;
  pageUrl: string;
  requiresAuth?: boolean;
  disabled?: boolean;
  badge?: string;
}

export default function CreaterHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Check if current page is creator tool
  const isCreatorToolPage = pathname === "/creater-tool";

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
      {
        title: "Create",
        pageUrl: "/create",
        requiresAuth: true,
        disabled: true,
        badge: "Soon",
      },
      { title: "Launchpad", pageUrl: "/launchpad" },
      { title: "Collections", pageUrl: "/collections" },
      { title: "Creator-tool", pageUrl: "/creater-tool" },
    ],
    []
  );

  // Handle mobile menu - prevent scroll when open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileMenuOpen]);

  // Handle window resize - close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

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
            selectedLayerObj.name
          );
          await switchLayer(selectedLayerObj);
          toast.success(`Switched to ${selectedLayerObj.name}`);
        } else {
          // User not connected - just update the selection for when they connect
          console.log(
            "Layer selected for future connection:",
            selectedLayerObj.name
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
    ]
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
    [isConnected, router]
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
        layer.name !== "EDU Chain"
        && layer.name !== "CORE Testnet"
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
                  src={getCurrencyImage(layer.layer)}
                  alt={layer.layer}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                {layer.name ||
                  `${capitalizeFirstLetter(
                    layer.layer
                  )} ${capitalizeFirstLetter(layer.network)}`}
              </div>
            </div>
            {isLayerConnected && <Check className="w-5 h-5 text-neutral50" />}
          </div>
        </SelectItem>
      );
    },
    [currentLayer?.id, isConnected]
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
              src={getCurrencyImage(displayLayer.layer)}
              alt={displayLayer.layer}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <span>{displayLayer.name || displayLayer.layer}</span>
        </div>
      );
    }

    return <span>Select layer</span>;
  }, [isLoading, currentLayer, availableLayers, selectedLayerId]);

  if (isCreatorToolPage) {
    return (
      <>
        <div className="h-[72px] w-full flex justify-center bg-gray500op50 backdrop-blur-[60px] mt-5 rounded-3xl sticky top-5 left-0 right-0 z-30 max-w-[1920px] mx-auto">
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-between items-center w-full pl-6 pr-4 h-full">
              {/* Logo */}
              <Link href="/">
                <Image
                  src="/newLogo.png"
                  alt="Mintpark Logo"
                  width={54}
                  height={36}
                />
              </Link>

              {/* Desktop Controls - Only wallet connection */}
              <div className="hidden lg:flex items-center gap-4">
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
                  <div className="flex items-center gap-4">
                    {/* Layer Selector for connected users */}
                    {/* User Dropdown */}
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

                    {/* Start Creating Button */}
                    <Button
                      variant="primary"
                      size="lg"
                      className="min-w-[150px] bg-primary text-white hover:bg-primary/90"
                      onClick={() => router.push("/creater-tool/inscribe")}
                    >
                      Start Creating
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="outline"
                    className="p-2 text-neutral50 border-hidden"
                  >
                    <MenuIcon size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="lg:hidden pt-4 pb-6 h-auto min-h-screen w-full bg-neutral500 bg-opacity-95 backdrop-blur-lg overflow-y-auto"
                >
                  <div className="flex justify-between items-center w-full px-4 py-6">
                    <Image
                      src="/newLogo.png"
                      alt="Mintpark logo"
                      width={40}
                      height={40}
                    />
                    <X
                      size={24}
                      className="text-neutral50 cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  </div>

                  {/* Mobile controls */}
                  <div className="grid items-center pt-6 border-t border-neutral400 gap-4 px-6">
                    {isConnected && (
                      <Select
                        onValueChange={handleLayerSelect}
                        value={selectedLayerId as string}
                        disabled={isLoading}
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
                    )}

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
                      <>
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
                            <ArrowDown2 size={16} color="#D7D8D8" />
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
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full bg-primary text-white hover:bg-primary/90"
                          onClick={() => router.push("/creater-tool/inscribe")}
                        >
                          Start Creating
                        </Button>
                      </>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
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
}
