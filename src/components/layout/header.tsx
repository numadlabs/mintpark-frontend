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
import ConnectWalletModal from "../modal/connect-wallet-modal";
import {
  Wallet2,
  I3Dcube,
  Logout,
  ArrowRight2,
  Menu,
  MenuBoard,
} from "iconsax-react";
import { Button } from "../ui/button";
import {
  getUserById,
  getAllLayers,
  getLayerById,
} from "@/lib/service/queryHelper";
import { useQuery } from "@tanstack/react-query";
import { LayerType } from "@/lib/types";
import { toast } from "sonner";
import Badge from "../atom/badge";
import { MenuIcon } from "lucide-react";

declare global {
  interface Window {
    unisat: any;
  }
}

export default function Header() {
  const router = useRouter();
  const [walletModal, setWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [defaultLayer, setDefaultLayer] = useState<string>("CITREA-mainnet");

  const { connect, authState, onLogout, selectedLayerId, setSelectedLayerId } =
    useAuth();
  const id = authState?.layerId;

  const { data: user = [] } = useQuery({
    queryKey: ["userData"],
    queryFn: () => getUserById(authState?.userId as string),
    enabled: !!authState?.userId,
  });

  const { data: layers = [] } = useQuery({
    queryKey: ["layerData"],
    queryFn: () => getAllLayers(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: currentLayer = null } = useQuery({
    queryKey: ["currentLayerData", id],
    queryFn: () => getLayerById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (!currentLayer) {
      const citreaLayer = layers.find((l: LayerType) => l.layer === "CITREA");
      if (citreaLayer) {
        setDefaultLayer(`${citreaLayer.layer}-${citreaLayer.network}`);
        setSelectedLayerId(citreaLayer.id);
      }
    } else {
      setDefaultLayer(`${currentLayer.layer}-${currentLayer.network}`);
    }
  }, [currentLayer, layers, setSelectedLayerId]);

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

  const toggleWalletModal = () => {
    setWalletModal(!walletModal);
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getLayerImage = (layer: string) => {
    switch (layer) {
      case "BITCOIN":
        return "/wallets/Bitcoin.png";
      case "FRACTAL":
        return "/wallets/Fractal.png";
      case "CITREA":
        return "/wallets/Citrea.png";
      default:
        return "/wallets/Citrea.png";
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleLayerSelect = (value: string) => {
    const [layer, network] = value.split("-");
    const selectedLayer = layers.find(
      (l: LayerType) => l.layer === layer && l.network === network,
    );

    if (selectedLayer) {
      if (authState.authenticated) {
        onLogout();
        toast.info(
          "Logged out due to layer change. Please reconnect your wallet.",
        );
      }
      localStorage.setItem("layerId", selectedLayer.id);
      setSelectedLayerId(selectedLayer.id);
      setDefaultLayer(value);
    }
  };

  const handleConnect = () => {
    if (selectedLayerId) {
      connect();
    } else {
      toast.error("Please select a layer before connecting");
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
    disabled?: boolean,
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
              {/* Desktop Navigation */}
              <div className="hidden md2:flex flex-row gap-2 text-neutral00">
                {routesData.map((item, index) => (
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

            {/* Desktop Controls */}
            <div className="hidden md2:flex flex-row overflow-hidden items-center gap-4">
              <Select onValueChange={handleLayerSelect} value={defaultLayer}>
                <SelectTrigger className="flex flex-row items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
                  <SelectValue
                    placeholder="Select layer"
                    defaultValue={defaultLayer}
                  >
                    {defaultLayer && (
                      <div className="flex flex-row gap-2 items-center w-max">
                        <Image
                          src={getLayerImage(defaultLayer.split("-")[0])}
                          alt={defaultLayer.split("-")[0]}
                          width={24}
                          height={24}
                        />
                        {defaultLayer
                          .split("-")
                          .map(capitalizeFirstLetter)
                          .join(" ")}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="mt-4 flex flex-col items-center justify-center p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
                  <SelectGroup className="flex flex-col gap-2">
                    {layers.map((layer: LayerType) => (
                      <SelectItem
                        key={layer.id}
                        value={`${layer.layer}-${layer.network}`}
                        className="hover:bg-white8 duration-300 transition-all flex flex-row items-center gap-2 w-[170px] cursor-pointer"
                      >
                        <div className="flex flex-row gap-2 items-center text-md text-neutral50 font-medium">
                          <Image
                            src={getLayerImage(layer.layer)}
                            alt={layer.layer}
                            width={24}
                            height={24}
                          />
                          {`${capitalizeFirstLetter(layer.layer)} ${capitalizeFirstLetter(layer.network)}`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {authState?.authenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex flex-row items-center gap-2 max-w-[128px] w-full bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
                    <Image
                      src={"/Avatar.png"}
                      alt="image"
                      sizes="100%"
                      width={24}
                      height={24}
                      className="object-cover rounded-full" 
                    />
                    <span className="text-neutral50 text-md font-medium">
                      {user?.address ? truncateAddress(user.address) : ""}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex flex-col gap-2 max-w-[215px] w-screen p-2 border border-white4 bg-gray50 mt-4 rounded-2xl backdrop-blur-xl">
                    <Link href="/assets">
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
              ) : (
                <Button
                  variant={"secondary"}
                  size={"lg"}
                  onClick={handleConnect}
                  className="min-w-[170px]"
                >
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md2:hidden p-2 text-neutral50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md2:hidden fixed inset-0 z-50 bg-neutral500 bg-opacity-95 backdrop-blur-lg">
          <div className="flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Link href={"/"}>
                <Image
                  src={"/Logo.svg"}
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

            <div className="flex flex-col pt-8 gap-4">
              {routesData.map((item, index) => (
                <div key={index} className="relative">
                  <button
                    className="text-neutral00 text-lg font-medium w-full text-left py-2"
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

              {/* {authState?.authenticated ? (
                <div className="flex flex-col gap-2">
                  <Link href="/assets" className="text-neutral50 text-lg font-medium py-2">
                    My Assets
                  </Link>
                  <Link href="/orders" className="text-neutral50 text-lg font-medium py-2">
                    Inscribe Orders
                  </Link>
                  <button
                    className="text-neutral50 text-lg font-medium py-2 text-left"
                    onClick={handleLogOut}
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <Button
                  variant={"secondary"}
                  size={"lg"}
                  onClick={handleConnect}
                  className="w-full mt-4"
                >
                  Connect Wallet
                </Button>
              )} */}
            </div>
          </div>
        </div>
      )}

      <ConnectWalletModal open={walletModal} onClose={toggleWalletModal} />
    </>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import HeaderItem from "../ui/headerItem";
// import { useAuth } from "../provider/auth-context-provider";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import ConnectWalletModal from "../modal/connect-wallet-modal";
// import { Wallet2, I3Dcube, Logout, ArrowRight2 } from "iconsax-react";
// import { Button } from "../ui/button";
// import {
//   getUserById,
//   getAllLayers,
//   getLayerById,
// } from "@/lib/service/queryHelper";
// import { useQuery } from "@tanstack/react-query";
// import { LayerType } from "@/lib/types";
// import { toast } from "sonner";
// import Badge from "../atom/badge";

// declare global {
//   interface Window {
//     unisat: any;
//   }
// }

// export default function Header() {
//   const router = useRouter();
//   const [walletModal, setWalletModal] = useState(false);
//   const [defaultLayer, setDefaultLayer] = useState<string>("CITREA-mainnet");
//   console.log(defaultLayer);
//   const { connect, authState, onLogout, selectedLayerId, setSelectedLayerId } =
//     useAuth();
//   const id = authState?.layerId;

//   const { data: user = [] } = useQuery({
//     queryKey: ["userData"],
//     queryFn: () => getUserById(authState?.userId as string),
//     enabled: !!authState?.userId,
//   });
//   const { data: layers = [] } = useQuery({
//     queryKey: ["layerData"],
//     queryFn: () => getAllLayers(),
//     staleTime: Infinity,
//     gcTime: Infinity,
//   });

//   const { data: currentLayer = null } = useQuery({
//     queryKey: ["currentLayerData", id],
//     queryFn: () => getLayerById(id as string),
//     enabled: !!id,
//   });

//   useEffect(() => {
//     // Set CITREA as default if there's no currentLayer
//     if (!currentLayer) {
//       const citreaLayer = layers.find((l: LayerType) => l.layer === "CITREA");
//       if (citreaLayer) {
//         setDefaultLayer(`${citreaLayer.layer}-${citreaLayer.network}`);
//         setSelectedLayerId(citreaLayer.id);
//       }
//     } else {
//       setDefaultLayer(`${currentLayer.layer}-${currentLayer.network}`);
//     }
//   }, [currentLayer, layers, setSelectedLayerId]);

//   const routesData = [
//     { title: "Create", pageUrl: "/create", requiresAuth: true, disabled: true, // Add this
//       badge: "Soon" },
//     { title: "Launchpad", pageUrl: "/launchpad" },
//     { title: "Collections", pageUrl: "/collections" },
//   ];

//   const toggleWalletModal = () => {
//     setWalletModal(!walletModal);
//   };

//   const truncateAddress = (address: string) => {
//     if (address.length <= 10) return address;
//     return `${address.slice(0, 4)}...${address.slice(-4)}`;
//   };

//   const getLayerImage = (layer: string) => {
//     switch (layer) {
//       case "BITCOIN":
//         return "/wallets/Bitcoin.png";
//       case "FRACTAL":
//         return "/wallets/Fractal.png";
//       case "CITREA":
//         return "/wallets/Citrea.png";
//       default:
//         return "/wallets/Citrea.png";
//     }
//   };

//   const capitalizeFirstLetter = (string: string) => {
//     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
//   };

//   const handleLayerSelect = (value: string) => {
//     const [layer, network] = value.split("-");
//     const selectedLayer = layers.find(
//       (l: LayerType) => l.layer === layer && l.network === network,
//     );

//     if (selectedLayer) {
//       if (authState.authenticated) {
//         onLogout();
//         toast.info(
//           "Logged out due to layer change. Please reconnect your wallet.",
//         );
//       }
//       localStorage.setItem("layerId", selectedLayer.id);
//       setSelectedLayerId(selectedLayer.id);
//       setDefaultLayer(value);
//     }
//   };

//   const handleConnect = () => {
//     if (selectedLayerId) {
//       connect();
//     } else {
//       toast.error("Please select a layer before connecting");
//     }
//   };

//   const handleLogOut = () => {
//     if (authState.authenticated) {
//       onLogout();
//       toast.info("Logged out successfully");
//     }
//   };

//   const handleNavigation = (pageUrl: string, requiresAuth?: boolean, disabled?: boolean) => {
//     if (disabled) {
//       toast.info("This feature is coming soon!");
//       return;
//     }
//     if (requiresAuth && !authState.authenticated) {
//       toast.error("Please connect your wallet");
//       return;
//     }
//     router.push(pageUrl);
//   };

//   return (
//     <>
//       <div className="h-[72px] w-full flex justify-center bg-neutral500 bg-opacity-50 backdrop-blur-4xl mt-5 rounded-3xl">
//         <div className="flex flex-row justify-between items-center max-w-[1216px] w-full">
//           <div className="flex flex-row justify-between items-center w-full pl-6 pr-4 h-full">
//             <div className="flex gap-12">
//               <Link href={"/"}>
//                 <Image
//                   src={"/Logo.svg"}
//                   alt="coordinals"
//                   width={40}
//                   height={40}
//                 />
//               </Link>
//               <div className="flex flex-row gap-2 text-neutral00">
//               {routesData.map((item, index) => (
//             <div key={index} className="relative">
//               <HeaderItem
//                 title={item.title}
//                 handleNav={() =>
//                   handleNavigation(item.pageUrl, item.requiresAuth, item.disabled)
//                 }
//               />
//               {item.badge && <Badge label={item.badge} />}
//             </div>
//           ))}
//               </div>
//             </div>
//             <div className="flex flex-row overflow-hidden items-center gap-4">
//               <Select onValueChange={handleLayerSelect} value={defaultLayer}>
//                 <SelectTrigger className="flex flex-row items-center h-10 border border-transparent bg-white8 hover:bg-white16 duration-300 transition-all text-md font-medium text-neutral50 rounded-xl max-w-[190px] w-full">
//                   <SelectValue
//                     placeholder="Select layer"
//                     defaultValue={defaultLayer}
//                   >
//                     {defaultLayer && (
//                       <div className="flex flex-row gap-2 items-center w-max">
//                         <Image
//                           src={getLayerImage(defaultLayer.split("-")[0])}
//                           alt={defaultLayer.split("-")[0]}
//                           width={24}
//                           height={24}
//                         />
//                         {defaultLayer
//                           .split("-")
//                           .map(capitalizeFirstLetter)
//                           .join(" ")}
//                       </div>
//                     )}
//                   </SelectValue>
//                 </SelectTrigger>
//                 <SelectContent className="mt-4 flex flex-col items-center justify-center p-2 gap-2 bg-white4 backdrop-blur-lg border border-white4 rounded-2xl w-[var(--radix-select-trigger-width)]">
//                   <SelectGroup className="flex flex-col gap-2">
//                     {layers.map((layer: LayerType) => (
//                       <SelectItem
//                         key={layer.id}
//                         value={`${layer.layer}-${layer.network}`}
//                         className="hover:bg-white8 duration-300 transition-all flex flex-row items-center gap-2 w-[170px] cursor-pointer"
//                       >
//                         <div className="flex flex-row gap-2 items-center text-md text-neutral50 font-medium">
//                           <Image
//                             src={getLayerImage(layer.layer)}
//                             alt={layer.layer}
//                             width={24}
//                             height={24}
//                           />
//                           {`${capitalizeFirstLetter(layer.layer)} ${capitalizeFirstLetter(layer.network)}`}
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//               {authState?.authenticated ? (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger className="flex flex-row items-center gap-2 max-w-[128px] w-full bg-white8 hover:bg-white16 outline-none duration-300 transition-all p-2 rounded-xl backdrop-blur-xl">
//                     <Image
//                       src={"/Avatar.png"}
//                       alt="image"
//                       sizes="100%"
//                       width={24}
//                       height={24}
//                       className="object-cover rounded-full"
//                     />
//                     <span className="text-neutral50 text-md font-medium">
//                       {user?.address ? truncateAddress(user.address) : ""}
//                     </span>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent className="flex flex-col gap-2 max-w-[215px] w-screen p-2 border border-white4 bg-gray50 mt-4 rounded-2xl backdrop-blur-xl">
//                     <Link href="/assets">
//                       <DropdownMenuItem className="flex flex-row justify-between items-center text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
//                         <div className="flex flex-row items-center gap-2">
//                           <span>
//                             <Wallet2 size={24} color="#D7D8D8" />
//                           </span>
//                           My Assets
//                         </div>
//                         <ArrowRight2 size={16} color="#D7D8D8" />
//                       </DropdownMenuItem>
//                     </Link>
//                     <Link href="/orders">
//                       <DropdownMenuItem className="flex flex-row items-center justify-between text-neutral50 text-md font-medium hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all">
//                         <div className="flex flex-row items-center gap-2">
//                           <span>
//                             <I3Dcube size={24} color="#D7D8D8" />
//                           </span>
//                           <p>Inscribe Orders</p>{" "}
//                         </div>
//                         <ArrowRight2 size={16} color="#D7D8D8" />
//                       </DropdownMenuItem>
//                     </Link>
//                     <DropdownMenuItem
//                       className="text-neutral50 text-md font-medium flex flex-row gap-2 hover:bg-white8 rounded-lg duration-300 cursor-pointer transition-all"
//                       onClick={handleLogOut}
//                     >
//                       <span>
//                         <Logout size={24} color="#D7D8D8" />
//                       </span>
//                       Log Out
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               ) : (
//                 <Button
//                   variant={"secondary"}
//                   size={"lg"}
//                   onClick={handleConnect}
//                   className="min-w-[170px]"
//                 >
//                   Connect Wallet
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//       <ConnectWalletModal open={walletModal} onClose={toggleWalletModal} />
//     </>
//   );
// }
