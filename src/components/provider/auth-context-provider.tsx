import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  generateMessageHandler,
  loginHandler,
} from "@/lib/service/postRequest";
import { clearToken, saveToken } from "@/lib/auth";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";

interface AuthContextType {
  walletAddress: string;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  handleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  connector: any;
}

type LoginParams = {
  address: string;
  xpubKey: string;
  message: string;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  connector,
}) => {
  const {
    sign,
    networkState,
    walletState,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useContext<any>(useConnector);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loginParams, setLoginParams] = useState<LoginParams | null>(null);

  const generateMessageMutation = useMutation({
    mutationFn: generateMessageHandler,
    onError: (error) => {
      console.error("Generate message error:", error);
      toast.error("Failed to generate message");
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginHandler,
    onError: (error) => {
      console.error("Login error:", error);
      toast.error("Failed to login");
    },
    onSuccess: (data) => {
      console.log("🚀 ~ data:", data);
      saveToken(data.data.auth);
      toast.success("Successfully logged in");
    },
  });

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem("userProfile");
    if (storedWalletAddress) {
      setWalletAddress(JSON.parse(storedWalletAddress));
    }
  }, []);

  useEffect(() => {
    if (loginParams) {
      handleLogin();
    }
  }, [loginParams]);

  const handleLogin = async () => {
    if (!loginParams) return;

    const { address, xpubKey, message } = loginParams;

    try {
      // Sign the message
      const signResponse = await sign({ message });
      console.log("🚀 ~ handleLogin ~ signResponse:", signResponse);

      if (signResponse.status) {
        const loginResponse = await loginMutation.mutateAsync({
          address,
          signedMessage: signResponse.result,
          xpub: xpubKey,
        });
        console.log("🚀 ~ handleLogin ~ loginResponse:", loginResponse);
        if (loginResponse.success) {
          setWalletAddress(address);
          localStorage.setItem("userProfile", JSON.stringify(address));
        } else {
          throw new Error("Login failed");
        }
      } else {
        throw new Error("Cannot sign");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error during login process");
    } finally {
      // Clear login params after attempt
      setLoginParams(null);
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);
      // await disconnectWallet();
      const response = await connectWallet({ chainId: 5 });
      console.log("🚀 ~ connect ~ response:", response);
      if (response.status) {
        const address = response.result.address;

        // Generate message to sign
        const messageData = await generateMessageMutation.mutateAsync({
          address,
        });
        console.log("🚀 ~ connect ~ messageData:", messageData);

        // Add a 2-second timeout
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Set login parameters
        setLoginParams({
          address,
          xpubKey: response.result.xpubKey,
          message: messageData.data.message,
        });
      } else {
        throw new Error("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Error when connecting wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      setWalletAddress("");
      clearToken();
      localStorage.removeItem("userProfile");
      toast.success("Successfully disconnected");
    } catch (error) {
      console.error("Disconnection error:", error);
      toast.error("Error when disconnecting wallet");
    }
  };

  return (
    <AuthContext.Provider
      value={{ walletAddress, isConnecting, connect, disconnect, handleLogin }}
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
