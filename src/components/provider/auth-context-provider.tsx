import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateMessageHandler,
  loginHandler,
} from "@/lib/service/postRequest";
import { clearToken, saveToken } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/store/walletStore";
import moment from "moment";
import { getLayerById } from "@/lib/service/queryHelper";

// Add MetaMask types
declare global {
  interface Window {
    unisat: any;
    ethereum: any;
  }
}

interface AuthProps {
  authState: {
    token: string | null;
    authenticated: boolean;
    loading: boolean;
    userId: string | null;
    address: string | null;
    layerId: string | null;
    walletType: "unisat" | "metamask" | null;
  };
  onLogin: () => Promise<void>;
  onLogout: () => void;
  connect: () => Promise<void>;
  selectedLayerId: string | null;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AuthContextType extends AuthProps {
  isConnecting: boolean;
  walletAddress: string;
}

const CITREA_CHAIN_CONFIG = {
  chainId: "0x13FB", // 5115 in hex
  chainName: "Citrea Testnet",
  rpcUrls: ["https://rpc.testnet.citrea.xyz"],
  blockExplorerUrls: ["https://explorer.testnet.citrea.xyz"],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  connector?: any;
}

type LoginParams = {
  address: string;
  message: string;
  walletType: "unisat" | "metamask";
};

const generateFallbackMessage = (address: string) => {
  const timestamp = Date.now();
  return `Sign this message to verify your ownership of the address ${address}. Timestamp: ${timestamp}`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, connector }) => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loginParams, setLoginParams] = useState<LoginParams | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const { setConnectedAddress, setConnected } = useWalletStore();

  const [authState, setAuthState] = useState<AuthProps["authState"]>({
    token: null,
    authenticated: false,
    loading: true,
    userId: null,
    address: null,
    layerId: null,
    walletType: null,
  });

  const { data: currentLayer } = useQuery({
    queryKey: ["currentLayerData", selectedLayerId],
    queryFn: () => getLayerById(selectedLayerId as string),
    enabled: !!selectedLayerId,
  });

  const generateMessageMutation = useMutation({
    mutationFn: generateMessageHandler,
    onError: (error) => {
      console.error("Generate message error:", error);
      toast.error(
        "Failed to generate message from server. Using fallback message.",
      );
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginHandler,
    onError: (error) => {
      console.error("Login error:", error);
      toast.error("Failed to login");
    },
    onSuccess: (data) => {
      if (data.success) {
        saveToken(data.data.auth);
        const authData = {
          accessToken: data.data.auth.accessToken,
          userId: data.data.user.id,
          walletType: loginParams?.walletType,
        };
        localStorage.setItem("authToken", JSON.stringify(authData));
        localStorage.setItem("layerId", data.data.user.layerId);

        setAuthState((prev) => ({
          ...prev,
          token: data.data.auth.accessToken,
          authenticated: true,
          userId: data.data.user.id,
          address: data.data.user.address,
          layerId: data.data.user.layerId,
          walletType: loginParams?.walletType || null,
        }));
        toast.success("Successfully logged in");
      }
    },
  });

  const handleLogout = () => {
    setConnectedAddress("");
    setConnected(false);
    setWalletAddress("");
    setAuthState({
      token: null,
      authenticated: false,
      loading: false,
      userId: null,
      address: null,
      layerId: null,
      walletType: null,
    });
    localStorage.removeItem("userProfile");
    localStorage.removeItem("authToken");
    localStorage.removeItem("layerId");
    localStorage.removeItem("logoutTime");
    // router.push("/");
    clearToken();
  };

  const setupMetaMaskListeners = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          if (
            accounts.length === 0 ||
            accounts[0].toLowerCase() !== profileData.address.toLowerCase()
          ) {
            handleLogout();
          }
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  };

  const setupUnisatListeners = () => {
    if (window.unisat) {
      window.unisat.on("accountsChanged", (accounts: string[]) => {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          if (accounts.length === 0 || accounts[0] !== profileData.address) {
            handleLogout();
          }
        }
      });
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found. Please install MetaMask.");
      throw new Error("MetaMask not found");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CITREA_CHAIN_CONFIG],
        });
      } catch (error) {
        console.log("Chain may already be added or user rejected");
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CITREA_CHAIN_CONFIG.chainId }],
        });
      } catch (error) {
        console.error("Failed to switch network:", error);
        toast.error("Please switch to Citrea Testnet network");
        throw error;
      }

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        let message: string;

        try {
          const messageData = await generateMessageMutation.mutateAsync({
            address,
          });
          message = messageData.data.message;
        } catch (error) {
          message = generateFallbackMessage(address);
        }

        return { address, message };
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      toast.error("Failed to connect to MetaMask");
      throw error;
    }
  };

  const connectUnisat = async () => {
    if (!window.unisat) {
      toast.error("Unisat wallet not found. Please install Unisat.");
      throw new Error("Unisat wallet not found");
    }

    try {
      const accounts = await window.unisat.requestAccounts();

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        let message: string;

        try {
          const messageData = await generateMessageMutation.mutateAsync({
            address,
          });
          message = messageData.data.message;
        } catch (error) {
          message = generateFallbackMessage(address);
        }

        return { address, message };
      }
    } catch (error) {
      console.error("Unisat connection error:", error);
      toast.error("Failed to connect to Unisat");
      throw error;
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);

      if (!currentLayer) {
        toast.error("Please select a layer first");
        return;
      }

      const layerType = currentLayer.layer;
      let connectionResult;
      let walletType: "unisat" | "metamask";

      if (layerType === "FRACTAL") {
        connectionResult = await connectUnisat();
        walletType = "unisat";
      } else if (layerType === "CITREA") {
        connectionResult = await connectMetaMask();
        walletType = "metamask";
      } else {
        throw new Error("Unsupported layer type");
      }

      if (connectionResult) {
        setLoginParams({
          address: connectionResult.address,
          message: connectionResult.message,
          walletType,
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = async () => {
    if (!loginParams || !selectedLayerId) {
      toast.error("Please select a layer before logging in");
      return;
    }

    const { address, message, walletType } = loginParams;

    try {
      let signedMessage: string;
      let pubkey: string | undefined;

      if (walletType === "unisat") {
        signedMessage = await window.unisat.signMessage(message);
        pubkey = await window.unisat.getPublicKey();
      } else {
        signedMessage = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
      }

      if (signedMessage) {
        const loginResponse = await loginMutation.mutateAsync({
          address,
          signedMessage,
          layerId: selectedLayerId,
          pubkey,
        });

        if (loginResponse.success) {
          setWalletAddress(address);
          const item = {
            address,
            signature: signedMessage,
            expiry: moment().add(7, "days").format(),
            walletType,
          };
          setConnectedAddress(address);
          setConnected(true);
          localStorage.setItem("userProfile", JSON.stringify(item));
        } else {
          throw new Error("Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error during login process");
    } finally {
      setLoginParams(null);
    }
  };

  // Modified connectWalletOnLoad
  const connectWalletOnLoad = async () => {
    try {
      const storedAuth = localStorage.getItem("authToken");
      const userProfile = localStorage.getItem("userProfile");
      const storedLayerId = localStorage.getItem("layerId");

      if (storedAuth && userProfile && storedLayerId) {
        const authData = JSON.parse(storedAuth);
        const profileData = JSON.parse(userProfile);

        if (moment().isAfter(moment(profileData.expiry))) {
          handleLogout();
          return;
        }

        // Verify correct wallet is connected
        if (profileData.walletType === "unisat" && window.unisat) {
          const accounts = await window.unisat.getAccounts();
          if (!accounts.includes(profileData.address)) {
            handleLogout();
            return;
          }
        } else if (profileData.walletType === "metamask" && window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (!accounts.includes(profileData.address.toLowerCase())) {
            handleLogout();
            return;
          }
        }

        setWalletAddress(profileData.address);
        setAuthState({
          token: authData.accessToken,
          authenticated: true,
          loading: false,
          userId: authData.userId,
          address: profileData.address,
          layerId: storedLayerId,
          walletType: profileData.walletType,
        });
        setConnectedAddress(profileData.address);
        setConnected(true);
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    setupMetaMaskListeners();
    setupUnisatListeners();
    connectWalletOnLoad();
  }, []);

  useEffect(() => {
    if (loginParams) {
      handleLogin();
    }
  }, [loginParams]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        onLogin: handleLogin,
        onLogout: handleLogout,
        connect,
        isConnecting,
        walletAddress,
        selectedLayerId,
        setSelectedLayerId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
