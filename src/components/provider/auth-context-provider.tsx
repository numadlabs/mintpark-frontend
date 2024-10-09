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
  };
  onLogin: () => Promise<void>;
  onLogout: () => void;
  connect: () => Promise<void>;
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
  const { setConnectedAddress, setConnected } = useWalletStore();

  const [authState, setAuthState] = useState<AuthProps["authState"]>({
    token: null,
    authenticated: false,
    loading: true,
    userId: null,
    address: null,
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
        setAuthState((prev) => ({
          ...prev,
          token: data.data.auth.accessToken,
          authenticated: true,
          userId: data.data.user.id,
          address: data.data.user.address,
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

          if (storedAuth && userProfile) {
            const authData = JSON.parse(storedAuth);
            const profileData = JSON.parse(userProfile);

            const now = moment();
            if (now.isAfter(profileData.expiry) || accounts.length === 0) {
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
            }));

            setConnectedAddress(accounts[0]);
            setConnected(true);
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
    });
    localStorage.removeItem("userProfile");
    localStorage.removeItem("authToken");
    router.push("/");
    clearToken();
    toast.success("Successfully logged out");
  };

  useEffect(() => {
    if (loginParams) {
      handleLogin();
    }
  }, [loginParams]);

  const handleLogin = async () => {
    if (!loginParams) return;

    const { address, message } = loginParams;
    console.log(message);

    try {
      if (!window.unisat) {
        throw new Error("Unisat wallet not found");
      }

      const signResponse = await window.unisat.signMessage(message);

      if (signResponse) {
        const loginResponse = await loginMutation.mutateAsync({
          address,
          signedMessage: signResponse,
        });

        if (loginResponse.success) {
          setWalletAddress(address);
          const item = {
            address,
            signature: signResponse,
            expiry: moment().add(7, "days").format(),
          };
          setConnectedAddress(address);
          setConnected(true);
          localStorage.setItem("userProfile", JSON.stringify(item));
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

  useEffect(() => {
    try {
      window.unisat.on("accountsChanged", () => {
        setConnectedAddress("");
        setConnected(false);
        window.localStorage.removeItem("userProfile");
        window.localStorage.removeItem("authToken");
        setAuthState((prev) => ({
          ...prev,
          token: null,
          authenticated: false,
          userId: null,
          address: null,
        }));
        router.push("/");
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
