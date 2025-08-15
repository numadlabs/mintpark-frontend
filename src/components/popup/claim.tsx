import React, { useState } from "react";
import { X, Wallet } from "lucide-react";
import { withdrawFromCollection } from "@/lib/service/postRequest"; // Add this import
import { toast } from "sonner"; // Add toast for user feedback

interface ClaimFeePopupProps {
  isOpen: boolean;
  onClose: () => void;
  amountToClaim: number; // Amount in satoshis (will be converted to BTC)
  collectionId: string; // Add collectionId prop
  onClaim?: (walletAddress: string) => void; // Make onClaim optional
}

const ClaimFeePopup: React.FC<ClaimFeePopupProps> = ({
  isOpen,
  onClose,
  amountToClaim,
  collectionId, // Add collectionId prop
  onClaim,
}) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState("");

  // Convert satoshis to BTC
  const btcAmount = (amountToClaim / 1e8).toFixed(8);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
      setError("");
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      setError("Failed to paste from clipboard");
    }
  };

  const handleClaim = async () => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    // Basic validation for Bitcoin address
    if (walletAddress.length < 26 || walletAddress.length > 62) {
      setError("Invalid wallet address format");
      return;
    }

    setIsClaiming(true);
    setError("");

    try {
      console.log(`Claiming ${amountToClaim} satoshis to ${walletAddress}`);
      
      // Call the withdraw API directly
      const result = await withdrawFromCollection({
        collectionId: collectionId,
        address: walletAddress,
      });

      console.log("API Response:", result);
      
      // Check if the API response indicates success
      if (result.success === false) {
        throw new Error(result.error || "Withdrawal failed");
      }
      
      // Only show success if the API actually succeeded
      if (result.success === true && result.data?.txid) {
        console.log("Withdrawal successful:", result);
        
        // Show success message
        toast.success(
          `Successfully claimed ${btcAmount} BTC`,
          {
            // description: `Transaction ID: ${result.data.txid}`,
            duration: 5000,
          }
        );

        // Call the optional onClaim callback if provided
        if (onClaim) {
          onClaim(walletAddress);
        }

        // Close popup and reset form
        onClose();
        setWalletAddress("");
        setError("");
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (err: any) {
      console.error("Withdrawal failed:", err);
      
      // Show error message to user
      const errorMessage = err?.message || err?.error || "Failed to claim remaining fee. Please try again.";
      
      toast.error("Claim failed", {
        description: errorMessage,
        duration: 5000,
      });
      
      setError(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
    if (error) setError("");
  };

  const handleClose = () => {
    if (!isClaiming) {
      onClose();
      setWalletAddress("");
      setError("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-darkSecondary border h-auto border-transLight4 rounded-2xl p-8 mx-4 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-lightPrimary">
            Claim Remaining Fee
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-transLight4 rounded-lg transition-colors"
            disabled={isClaiming}
          >
            <X
              size={20}
              className="text-lightSecondary hover:text-lightPrimary"
            />
          </button>
        </div>

        {/* Description */}
        <p className="text-lightSecondary mb-8 leading-relaxed">
          Actual total inscription fee was lower than estimated. Claim your
          unused amount now.
        </p>

        {/* Amount to claim */}
        <div className="bg-darkPrimary border border-transLight4 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lightSecondary text-sm">Amount to claim</span>
            <span className="text-lightPrimary text-lg font-medium">
              {btcAmount} BTC
            </span>
          </div>
        </div>

        {/* Wallet Address Input */}
        <div className="mb-6">
          <label className="block text-lightPrimary text-sm font-medium mb-3">
            Wallet address to receive
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Wallet size={16} className="text-lightTertiary" />
            </div>
            <input
              type="text"
              value={walletAddress}
              onChange={handleInputChange}
              placeholder="Address to receive"
              className="w-full bg-darkPrimary border border-transLight4 rounded-lg pl-12 pr-20 py-4 text-lightPrimary placeholder-lightTertiary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              disabled={isClaiming}
            />
            <button
              onClick={handlePaste}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transLight4 hover:bg-transLight3 text-lightSecondary hover:text-lightPrimary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              disabled={isClaiming}
            >
              Paste
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={isClaiming || !walletAddress.trim()}
          className="w-full bg-white hover:bg-gray-100 disabled:bg-transLight4 disabled:text-lightTertiary text-black font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          {isClaiming ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-lightTertiary border-t-transparent rounded-full animate-spin" />
              <span>Claiming...</span>
            </div>
          ) : (
            "Claim"
          )}
        </button>
      </div>
    </div>
  );
};

export default ClaimFeePopup;