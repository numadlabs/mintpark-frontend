"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
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
import { Wallet2, I3Dcube, Logout, ArrowRight2 } from "iconsax-react";
import { Button } from "../ui/button";
import { getAllLayers, getLayerById } from "@/lib/service/queryHelper";
import { truncateAddress, capitalizeFirstLetter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { LayerType } from "@/lib/types";
import { toast } from "sonner";
import Badge from "../atom/badge";
import { Check, Loader2, MenuIcon, X } from "lucide-react";
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

interface LayerImageMap {
  [key: string]: string;
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("");
  const [defaultLayer, setDefaultLayer] = useState("");

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
  // State to track scroll position when menu opens
  // Handle mobile menu open/close
  useEffect(() => {
    const handleOpen = () => {
      // First, scroll to top when opening menu
      window.scrollTo(0, 0);
      // Then disable scrolling
      document.body.style.overflow = "hidden";
    };

    const handleClose = () => {
      // Re-enable scrolling when closing menu
      document.body.style.overflow = "";
    };

    if (mobileMenuOpen) {
      handleOpen();
    } else {
      handleClose();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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

  useEffect(() => {
    const savedLayer = localStorage.getItem("selectedLayer");
    const savedNetwork = localStorage.getItem("selectedNetwork") || "mainnet";
    
    if (savedLayer && dynamicLayers.length > 0) {
      // Look for the specific layer+network combination
      const matchingLayer = dynamicLayers.find(
        (l) => l.layer === savedLayer && l.network === savedNetwork
      );
      
      // If found specific network match
      if (matchingLayer) {
        setSelectedLayer(savedLayer);
        setSelectedLayerId(matchingLayer.id);
        setDefaultLayer(matchingLayer.id); // Also update defaultLayer
        return;
      }
      
      // Fallback: find any layer with matching name if network doesn't match
      const anyMatchingLayer = dynamicLayers.find((l) => l.layer === savedLayer);
      if (anyMatchingLayer) {
        setSelectedLayer(savedLayer);
        setSelectedLayerId(anyMatchingLayer.id);
        setDefaultLayer(anyMatchingLayer.id); // Also update defaultLayer
        localStorage.setItem("selectedNetwork", anyMatchingLayer.network);
        return;
      }
    }
  
    // Fall back to default behavior if no saved layer or match found
    if (!selectedLayerId && dynamicLayers.length > 0) {
      const hemiLayer = dynamicLayers.find((l) => l.layer === "HEMI");
      if (hemiLayer) {
        setSelectedLayerId(hemiLayer.id);
        setSelectedLayer(hemiLayer.layer);
        setDefaultLayer(hemiLayer.id); // Also update defaultLayer
        localStorage.setItem("selectedLayer", hemiLayer.layer);
        localStorage.setItem("selectedNetwork", hemiLayer.network);
      } else {
        // If no Hemi layer, use the first available layer
        const firstLayer = dynamicLayers[0];
        setSelectedLayerId(firstLayer.id);
        setSelectedLayer(firstLayer.layer);
        setDefaultLayer(firstLayer.id); // Also update defaultLayer
        localStorage.setItem("selectedLayer", firstLayer.layer);
        localStorage.setItem("selectedNetwork", firstLayer.network);
      }
    } else if (currentLayer) {
      localStorage.setItem("selectedLayer", currentLayer.layer);
      localStorage.setItem("selectedNetwork", currentLayer.network);
      setDefaultLayer(currentLayer.id); // Also update defaultLayer
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

  // Handle layer selection
 
  const switchOrAddChain = async (chainId: string, layer: string, network: string): Promise<boolean> => {
    if (!chainId || typeof window === 'undefined' || !window.ethereum) return false;
    
    try {
      const chainIdHex = `0x${parseInt(chainId).toString(16)}`;

       await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
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
            method: 'wallet_addEthereumChain',
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
            method: 'wallet_switchEthereumChain',
            params: [{  chainId: `0x${parseInt(chainId).toString(16)}` }],
          });
          
          return true;
        } catch (addError: any) {
          console.error("Failed to add chain:", addError);
          return false;
        }
      } else if (error.code === 4001) {
        // User rejected request
        console.log("User rejected chain switch");
        return false;
      } else {
        console.error("Error switching chain:", error);
        return false;
      }
    }
  };
  // Update your handleLayerSelect function to also switch chain:

  const handleLayerSelect = async (layerId: string): Promise<void> => {
    const selectedLayerObj = layers.find((l) => l.id === layerId);

    if (selectedLayerObj && selectedLayerId !== selectedLayerObj.id) {
      // Update app state
      setSelectedLayerId(selectedLayerObj.id);
      setSelectedLayer(selectedLayerObj.layer);
      setDefaultLayer(layerId); // Ensure defaultLayer is updated too
      
      // Store in localStorage
      localStorage.setItem("selectedLayer", selectedLayerObj.layer);
      localStorage.setItem("selectedNetwork", selectedLayerObj.network);

      // If this is a Metamask layer and we have access to the ethereum object, switch chain
      if (
        selectedLayerObj.chainId && 
        window.ethereum && 
        WALLET_CONFIGS[selectedLayerObj.layer]?.type === "metamask"
      ) {
        // Try to switch to the chain in Metamask
        await switchOrAddChain(selectedLayerObj.chainId, selectedLayerObj.layer, selectedLayerObj.network);
      }
    }
  };
  
  
  // Handle logout
  const handleLogout = (): void => {
    if (authState.authenticated) {
      onLogout();
      toast.info("Logged out successfully!");
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
    if (layer.layer === "BITCOIN") {
      return null;
    }
    const isLayerConnected = connectedWallets?.some((wallet: WalletInfo) => {
      const foundLayer = layers.find((l) => l.chainId === wallet.layerId);
      return (
        foundLayer?.layer === layer.layer &&
        foundLayer?.network === layer.network
      );
    });
  

    return (
      <SelectItem
      key={layer.id}
      value={layer.id} // Use the full layer ID instead of constructed string
      className={`flex items-center rounded-lg gap-2 w-[180px]`}
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
            {/* Add testnet indicator */}
            {/* {layer.network !== "MAINNET" && (
              <div className="absolute -top-3 -right-28 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded-full">
                Testnet
              </div>
            )} */}
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
  
    const currentLayerObj = selectedLayerId 
      ? layers.find(l => l.id === selectedLayerId) 
      : null;
  
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
          {`${capitalizeFirstLetter(currentLayerObj.layer)} ${capitalizeFirstLetter(currentLayerObj.network)}`}
        </div>
      );
    }
  
    return <span>Select layer</span>;
  };

  // Animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        y: { stiffness: 1000 },
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
  };

  // Listen for window resize to close mobile menu on desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  const menuItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i: any) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

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
                <Select onValueChange={handleLayerSelect} value={selectedLayerId as string}>
                  <SelectTrigger className="flex items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
                    <SelectValue
                      placeholder="Select layer"
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
              <motion.button
                className="lg:hidden p-2 text-neutral50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                <MenuIcon size={24} />
              </motion.button>
            </div>
          </div>
        </div>
        {/* No spacer needed for sticky header */}
      </div>

      {/* Mobile Menu - Using AnimatePresence for animations */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 z-40 bg-neutral500 bg-opacity-40"
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel - Always at the top of page */}
            <motion.div
              className="lg:hidden fixed inset-x-0 top-0 z-50 bg-neutral500 bg-opacity-95 backdrop-blur-lg pt-4 pb-6 h-auto min-h-screen overflow-y-auto"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="flex flex-col px-6 space-y-4">
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
                  <motion.button
                    className="p-2 text-neutral50"
                    onClick={() => setMobileMenuOpen(false)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* Mobile navigation */}
                <div className="flex flex-col pt-8 gap-5">
                  {routes.map((item, index) => (
                    <motion.div
                      key={index}
                      className="relative"
                      custom={index}
                      variants={menuItemVariants}
                    >
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
                    </motion.div>
                  ))}

                  {/* Mobile layer and wallet controls */}
                  <motion.div
                    className="grid items-center pt-6 border-t border-neutral400 gap-4"
                    custom={routes.length}
                    variants={menuItemVariants}
                  >
                    {/* Same layer selector as desktop but with mobile styling */}
                    <Select
                      onValueChange={handleLayerSelect}
                      value={selectedLayerId as string}
                    >
                      <SelectTrigger className="flex items-center h-12 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl w-full">
                        <SelectValue
                          placeholder="Select layer"
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
                          <div className="text-neutral50">▼</div>
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
                          {/* <Link href="/orders">
                            <DropdownMenuItem className="flex justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
                              <div className="flex items-center gap-2">
                                <I3Dcube size={24} color="#D7D8D8" />
                                <p>Inscribe Orders</p>
                              </div>
                              <ArrowRight2 size={16} color="#D7D8D8" />
                            </DropdownMenuItem>
                          </Link> */}
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
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wallet connection modal */}
      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeTab={selectedLayer}
        selectedLayerId={selectedLayerId as string}
        onTabChange={(tab) => {
          setSelectedLayer(tab);
          localStorage.setItem("selectedLayer", tab);
        }}
        onLayerSelect={(layer, network) => {
          // Find the layer object with matching layer and network
          const matchingLayer = layers.find(
            (l) => l.layer === layer && l.network === network
          );
          
          if (matchingLayer) {
            // Update all relevant state variables
            setSelectedLayerId(matchingLayer.id);
            setSelectedLayer(matchingLayer.layer);
            setDefaultLayer(matchingLayer.id);
            
            // Store in localStorage
            localStorage.setItem("selectedLayer", matchingLayer.layer);
            localStorage.setItem("selectedNetwork", matchingLayer.network);
          }
        }}
      />
    </>
  );
}
