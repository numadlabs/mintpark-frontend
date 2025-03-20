"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderItem from "../ui/headerItem";
import { useAuth } from "../provider/auth-context-provider";
import { useMetamaskEvents } from "@/lib/hooks/useWalletAuth";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Wallet2, Logout, ArrowRight2, ArrowDown2 } from "iconsax-react";
import { Button } from "../ui/button";
import { getAllLayers, getLayerById } from "@/lib/service/queryHelper";
import { truncateAddress, capitalizeFirstLetter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { LayerType } from "@/lib/types";
import { toast } from "sonner";
import Badge from "../atom/badge";
import { ArrowDown, Check, Loader2, MenuIcon, X } from "lucide-react";
import { WalletConnectionModal } from "../modal/wallet-connect-modal";
import { WALLET_CONFIGS } from "@/lib/constants";
import { getCurrencyImage } from "@/lib/service/currencyHelper";

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

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("");
  const [defaultLayer, setDefaultLayer] = useState("HEMI-MAINNET");
  const prevLayerIdRef = useRef(null);
  const initialSetupDone = useRef(false);

  const {
    authState,
    onLogout,
    selectedLayerId,
    setSelectedLayerId,
    getWalletForLayer,
    isWalletConnected,
    connectedWallets,
  } = useAuth();

  useMetamaskEvents();

  // Define navigation routes
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
    ],
    []
  );

  // Handle mobile menu open/close
  useEffect(() => {
    if (mobileMenuOpen) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Listen for window resize to close mobile menu on desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Fetch all available layers
  const { data: dynamicLayers = [] } = useQuery({
    queryKey: ["layerData"],
    queryFn: getAllLayers,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Memoized layers
  const layers = useMemo(() => [...dynamicLayers], [dynamicLayers]);

  // Fetch current selected layer data
  const { data: currentLayer, isLoading: isLayersLoading } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
  });

  // Initialize from localStorage and handle initial layer selection
  useEffect(() => {
    if (dynamicLayers.length === 0 || initialSetupDone.current) return;

    const savedLayer = localStorage.getItem("selectedLayer");
    const savedNetwork = localStorage.getItem("selectedNetwork") || "MAINNET";

    if (!selectedLayerId) {
      let targetLayer = null;

      // Priority 1: Find exact match for saved layer+network
      if (savedLayer) {
        const matchingLayer = dynamicLayers.find(
          (l) => l.layer === savedLayer && l.network === savedNetwork
        );

        if (matchingLayer) {
          targetLayer = matchingLayer;
        } else {
          // Priority 2: Find any layer with matching name
          const anyMatchingLayer = dynamicLayers.find(
            (l) => l.layer === savedLayer
          );
          if (anyMatchingLayer) {
            targetLayer = anyMatchingLayer;
          }
        }
      }

      // Priority 3: Find HEMI layer
      if (!targetLayer) {
        const hemiLayer = dynamicLayers.find((l) => l.layer === "HEMI");
        if (hemiLayer) {
          targetLayer = hemiLayer;
        } else if (dynamicLayers.length > 0) {
          // Priority 4: Use first available layer
          targetLayer = dynamicLayers[0];
        }
      }

      // Apply the selected layer
      if (targetLayer) {
        setSelectedLayerId(targetLayer.id);
        setSelectedLayer(targetLayer.layer);
        setDefaultLayer(targetLayer.id);
        localStorage.setItem("selectedLayer", targetLayer.layer);
        localStorage.setItem("selectedNetwork", targetLayer.network);
      }
    }

    initialSetupDone.current = true;
  }, [dynamicLayers, selectedLayerId, setSelectedLayerId]);

  // Update localStorage when current layer changes
  useEffect(() => {
    if (currentLayer && prevLayerIdRef.current !== currentLayer.id) {
      localStorage.setItem("selectedLayer", currentLayer.layer);
      localStorage.setItem("selectedNetwork", currentLayer.network);
      prevLayerIdRef.current = currentLayer.id;
    }
  }, [currentLayer]);

  // Force re-render when auth state or connected wallets change
  useEffect(() => {
    // This effect forces a re-evaluation of isWalletDisconnected and currentWallet
    // when the authentication state or connected wallets change
  }, [authState, connectedWallets]);

  // Chain switching functionality
  const switchOrAddChain = useCallback(
    async (
      chainId: string,
      layer: string,
      network: string
    ): Promise<boolean> => {
      if (!chainId || typeof window === "undefined" || !window.ethereum)
        return false;

      try {
        const chainIdHex = `0x${parseInt(chainId).toString(16)}`;

        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });

        return true;
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            const walletConfig = WALLET_CONFIGS[layer];
            if (!walletConfig) return false;

            const networkType = network.toUpperCase();
            const networkConfig = walletConfig.networks[networkType];
            if (!networkConfig) return false;

            // Add the chain to Metamask
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${parseInt(chainId).toString(16)}`,
                  chainName: networkConfig.chainName || `${layer} ${network}`,
                  rpcUrls: networkConfig.rpcUrls,
                  blockExplorerUrls: networkConfig.blockExplorerUrls,
                  nativeCurrency: networkConfig.nativeCurrency || {
                    name: layer,
                    symbol: layer.substring(0, 5),
                    decimals: 18,
                  },
                },
              ],
            });

            // Try switching again after adding
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
            });

            return true;
          } catch (addError: any) {
            console.error("Failed to add chain:", addError);
            return false;
          }
        } else if (error.code === 4001) {
          console.log("User rejected chain switch");
          return false;
        } else {
          console.error("Error switching chain:", error);
          return false;
        }
      }
    },
    []
  );

  // Handle layer selection
  const handleLayerSelect = useCallback(
    async (layerId: string): Promise<void> => {
      if (!layerId || layerId === selectedLayerId) return;

      const selectedLayerObj = layers.find((l) => l.id === layerId);
      if (!selectedLayerObj) return;

      // Update app state
      setSelectedLayerId(selectedLayerObj.id);
      setSelectedLayer(selectedLayerObj.layer);
      setDefaultLayer(layerId);

      // Store in localStorage
      localStorage.setItem("selectedLayer", selectedLayerObj.layer);
      localStorage.setItem("selectedNetwork", selectedLayerObj.network);

      // If this is a Metamask layer and we have access to the ethereum object, switch chain
      if (
        selectedLayerObj.chainId &&
        window.ethereum &&
        WALLET_CONFIGS[selectedLayerObj.layer]?.type === "metamask"
      ) {
        await switchOrAddChain(
          selectedLayerObj.chainId,
          selectedLayerObj.layer,
          selectedLayerObj.network
        );
      }
    },
    [layers, selectedLayerId, setSelectedLayerId, switchOrAddChain]
  );

  // Handle logout
  const handleLogout = useCallback((): void => {
    if (authState.authenticated) {
      onLogout();
      toast.info("Logged out successfully!");
    }
  }, [authState.authenticated, onLogout]);

  // Handle navigation
  const handleNavigation = useCallback(
    (pageUrl: string, requiresAuth?: boolean, disabled?: boolean): void => {
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
    },
    [authState.authenticated, router]
  );

  // Handle wallet modal toggle
  const toggleWalletModal = useCallback(
    (isOpen: boolean) => {
      setWalletModalOpen(isOpen);
      // If we're closing the modal, force a refresh of wallet connection state
      if (!isOpen && selectedLayerId) {
        // This causes a re-render and re-evaluation of isWalletConnected
        const dummyState = {};
        setState({ ...dummyState });
      }
    },
    [selectedLayerId]
  );

  // Small state object to force re-renders when needed
  const [state, setState] = useState({});

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback((isOpen: boolean) => {
    setMobileMenuOpen(isOpen);
  }, []);

  // Calculate current wallet - recalculate whenever connected wallets change
  const currentWallet = useMemo(
    () => (selectedLayerId ? getWalletForLayer(selectedLayerId) : undefined),
    [selectedLayerId, getWalletForLayer, connectedWallets, authState]
  );

  // Calculate wallet connection status - recalculate whenever connected wallets change
  const isWalletDisconnected = useMemo(() => {
    const connected = selectedLayerId && isWalletConnected(selectedLayerId);
    return !connected;
  }, [selectedLayerId, isWalletConnected, connectedWallets, authState, state]);

  // Render dropdown layer item - memoized for performance
  const renderLayerItem = useCallback(
    (layer: LayerType) => {
      if (layer.layer === "BITCOIN") {
        return null;
      }
      // if (layer.layer === "CITREA") {
      //   return null;
      // }

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
                {`${capitalizeFirstLetter(layer.layer)} ${capitalizeFirstLetter(
                  layer.network
                )}`}
              </div>
            </div>
            {isLayerConnected && <Check className="w-5 h-5 text-neutral50" />}
          </div>
        </SelectItem>
      );
    },
    [connectedWallets, layers]
  );

  // Render current layer value - memoized for performance
  const renderCurrentLayerValue = useCallback(() => {
    if (isLayersLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-neutral50" />
          <span>Loading...</span>
        </div>
      );
    }

    const currentLayerObj = selectedLayerId
      ? layers.find((l) => l.id === selectedLayerId)
      : layers.find((l) => l.id === defaultLayer);

    if (currentLayerObj) {
      return (
        <div className="flex flex-row gap-2 items-center w-max">
          <div className="relative">
            <Image
              src={getCurrencyImage(currentLayerObj.layer)}
              alt={currentLayerObj.layer}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          {`${capitalizeFirstLetter(
            currentLayerObj.layer
          )} ${capitalizeFirstLetter(currentLayerObj.network)}`}
        </div>
      );
    }

    return <span>Select layer</span>;
  }, [isLayersLoading, selectedLayerId, layers]);

  // Handle layer selection for the wallet modal
  const handleModalLayerSelect = useCallback(
    (layer: string, network: string) => {
      const matchingLayer = layers.find(
        (l) => l.layer === layer && l.network === network
      );

      if (matchingLayer) {
        setSelectedLayerId(matchingLayer.id);
        setSelectedLayer(matchingLayer.layer);
        setDefaultLayer(matchingLayer.id);

        localStorage.setItem("selectedLayer", matchingLayer.layer);
        localStorage.setItem("selectedNetwork", matchingLayer.network);
      }
    },
    [layers, setSelectedLayerId]
  );

  // Handle wallet connection/disconnection events
  const onWalletModalClose = useCallback(() => {
    // Force a re-render to update the wallet connection state
    setState({});
    setWalletModalOpen(false);
  }, []);

  return (
    <>
      <div className="">
        <div className="h-[72px] w-full flex justify-center bg-gray500op50 backdrop-blur-[60px] mt-5 rounded-3xl sticky top-5 left-0 right-0 z-30 max-w-[1920px] mx-auto">
          <div className="flex justify-between items-center w-full">
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
                <Select
                  onValueChange={handleLayerSelect}
                  value={selectedLayerId as string}
                >
                  <SelectTrigger className="flex items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
                    <SelectValue placeholder="Select layer">
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
              <Sheet open={mobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="outline"
                    className="p-2 text-neutral50 border-hidden"
                    onClick={() => toggleMobileMenu(true)}
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
                        src="/Logo.svg"
                        alt="Mintpark"
                        width={40}
                        height={40}
                      />
                      {/* </Link> */}
                    </div>
                    <div>
                      <X
                        size={24}
                        className="text-neutral50 cursor-pointer"
                        onClick={() => toggleMobileMenu(false)}
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
                          className="w-full"
                        >
                          Connect Wallet
                        </Button>
                      ) : authState.authenticated && currentWallet ? (
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
        onClose={onWalletModalClose}
        activeTab={selectedLayer}
        selectedLayerId={selectedLayerId as string}
        onTabChange={(tab) => {
          setSelectedLayer(tab);
          localStorage.setItem("selectedLayer", tab);
        }}
        onLayerSelect={handleModalLayerSelect}
      />
    </>
  );
}
