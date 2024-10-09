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


interface AuthContextType {
  walletAddress: string;
  isConnecting: boolean;
  connect: () => Promise<void>;
  handleLogin: () => Promise<void>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

type LoginParams = {
  address: string;
  message: string;
};

// Function to generate a fallback message
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

  const generateMessageMutation = useMutation({
    mutationFn: generateMessageHandler,
    onError: (error) => {
      console.error("Generate message error:", error);
      toast.error("Failed to generate message from server. Using fallback message.");
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
      if(data.success){

        saveToken(data.data.auth);
        toast.success("Successfully logged in");
      }
    },
  });

  useEffect(() => {
    const connectWalletOnLoad = async () => {
      try {
        if (window.unisat) {
          const accounts = await window.unisat.getAccounts();

          const detailsString = window.localStorage.getItem("userProfile");

          if (detailsString !== null) {
            const detailsJson =
              detailsString !== "null" ? JSON.parse(detailsString) : null;
            const now = moment();
            if (now.isAfter(detailsJson.expiry) || accounts.length == 0) {
              handleLogout();
              return;
            }

            setWalletAddress(detailsJson.address);

            setConnectedAddress(accounts[0]);
            setConnected(true);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    connectWalletOnLoad();
  }, []);

  const handleLogout = () => {
    setConnectedAddress("");
    setConnected(false);
    setWalletAddress("");
    window.localStorage.removeItem("userProfile");
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
console.log(message)
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
          localStorage.setItem("userProfile", JSON.stringify( item ));
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
        router.push("/");
      });
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <AuthContext.Provider
      value={{ walletAddress, isConnecting, connect, handleLogin, handleLogout }}
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