import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  generateMessageHandler,
  loginHandler,
} from "@/lib/service/postRequest";
import { clearToken, saveToken } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/store/walletStore";
import moment from "moment";

interface AuthProps {
  authState: {
    token: string | null;
    authenticated: boolean;
    loading: boolean;
    userId: string | null;
    address: string | null;
    layerId: string | null;
  };
  onLogin: () => Promise<void>;
  onLogout: () => void;
  connect: () => Promise<void>;
  selectedLayerId: string | null;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
}

declare global {
  interface Window {
    unisat: any;
  }
}

interface AuthContextType extends AuthProps {
  isConnecting: boolean;
  walletAddress: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

type LoginParams = {
  address: string;
  message: string;
};

const generateFallbackMessage = (address: string) => {
  const timestamp = Date.now();
  return `Sign this message to verify your ownership of the address ${address}. Timestamp: ${timestamp}`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
      console.log("Login response:", data);
      if (data.success) {
        saveToken(data.data.auth);
        const authData = {
          accessToken: data.data.auth.accessToken,
          userId: data.data.user.id,
        };
        localStorage.setItem("authToken", JSON.stringify(authData));

        // Store layerId separately
        localStorage.setItem("layerId", data.data.user.layerId);

        setAuthState((prev) => ({
          ...prev,
          token: data.data.auth.accessToken,
          authenticated: true,
          userId: data.data.user.id,
          address: data.data.user.address,
          layerId: data.data.user.layerId,
        }));
        toast.success("Successfully logged in");
      }
    },
  });

  useEffect(() => {
    const connectWalletOnLoad = async () => {
      try {
        if (window.unisat) {
          const accounts = await window.unisat.getAccounts();

          const storedAuth = localStorage.getItem("authToken");
          const userProfile = localStorage.getItem("userProfile");
          const storedLayerId = localStorage.getItem("layerId");
          const logoutTime = localStorage.getItem("logoutTime");
          const now = moment();

          if (logoutTime && now.isAfter(moment(logoutTime))) {
            handleLogout();
            return;
          }

          if (storedAuth && userProfile && storedLayerId) {
            const authData = JSON.parse(storedAuth);
            const profileData = JSON.parse(userProfile);

            if (now.isAfter(moment(profileData.expiry))) {
              handleLogout();
              return;
            }

            setWalletAddress(profileData.address);
            setAuthState((prev) => ({
              ...prev,
              token: authData.accessToken,
              address: profileData.address,
              authenticated: true,
              loading: false,
              userId: authData.userId,
              layerId: storedLayerId,
            }));
            setSelectedLayerId(storedLayerId);

            if (accounts.length > 0 && accounts[0] === profileData.address) {
              setConnectedAddress(accounts[0]);
              setConnected(true);
            } else {
              // If the connected account doesn't match the stored profile, clear the stored data
              handleLogout();
            }
          } else {
            setAuthState((prev) => ({ ...prev, loading: false }));
          }
        }
      } catch (error) {
        console.log(error);
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    connectWalletOnLoad();
  }, []);


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
    });
    localStorage.removeItem("userProfile");
    localStorage.removeItem("authToken");
    localStorage.removeItem("layerId");
    localStorage.removeItem("logoutTime");
    router.push("/");
    clearToken();
  };

  useEffect(() => {
    if (loginParams) {
      handleLogin();
    }
  }, [loginParams]);

  const connect = async () => {
    try {
      setIsConnecting(true);
      if (!window.unisat) {
        throw new Error("Unisat wallet not found");
      }

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
          console.error("Failed to generate message from server:", error);
          message = generateFallbackMessage(address);
        }

        setLoginParams({
          address: address,
          message: message,
        });
      } else {
        throw new Error("No accounts found");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Error when connecting wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = async () => {
    if (!loginParams || !selectedLayerId) {
      toast.error("Please select a layer before logging in");
      return;
    }

    const { address, message } = loginParams;
    console.log(message);

    try {
      if (!window.unisat) {
        throw new Error("Unisat wallet not found");
      }

      const signedMessage = await window.unisat.signMessage(message);

      if (signedMessage) {
        const loginResponse = await loginMutation.mutateAsync({
          address,
          signedMessage,
          layerId: selectedLayerId,
        });

        if (loginResponse.success) {
          setWalletAddress(address);
          const item = {
            address,
            signature: signedMessage,
            expiry: moment().add(7, "days").format(),
           };
          setConnectedAddress(address);
          setConnected(true);
          localStorage.setItem("userProfile", JSON.stringify(item));

          // Store layerId in localStorage
          localStorage.setItem("layerId", selectedLayerId);

          // Update authState with the selected layerId
          setAuthState((prev) => ({
            ...prev,
            token: loginResponse.data.auth.accessToken,
            authenticated: true,
            userId: loginResponse.data.user.id,
            address: loginResponse.data.user.address,
            layerId: selectedLayerId,
          }));
        } else {
          throw new Error("Login failed");
        }
      } else {
        throw new Error("Failed to sign message");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error during login process");
    } finally {
      setLoginParams(null);
    }
  };

  useEffect(() => {
    if (selectedLayerId) {
      localStorage.setItem("selectedLayerId", selectedLayerId);
      // Update authState whenever selectedLayerId changes
      setAuthState((prev) => ({
        ...prev,
        layerId: selectedLayerId,
      }));
    }
  }, [selectedLayerId]);

  useEffect(() => {
    try {
      window.unisat.on("accountsChanged", (accounts: string[]) => {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          if (accounts.length === 0 || accounts[0] !== profileData.address) {
            handleLogout();
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

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
