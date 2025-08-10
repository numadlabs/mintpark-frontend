"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { CreatorCollection } from "@/lib/validations/collection-validation";
import { createrCollection } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { getCurrencyImage } from "@/lib/service/currencyHelper";
import {
  addPhase,
  submitCollectionForReview,
  whitelistAddresses,
} from "@/lib/service/postRequest";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendTransaction } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmiConfig";

// Phase type constants
const PHASE_TYPES = {
  WHITELIST: 0,
  FCFS_WHITELIST: 1,
  PUBLIC: 2,
} as const;

type PhaseType = (typeof PHASE_TYPES)[keyof typeof PHASE_TYPES];

interface Duration {
  days: number;
  hours: number;
}

interface Phase {
  id: number;
  name: string;
  type: PhaseType; // Use the proper type
  mintPrice: number;
  maxMintPerWallet: number;
  duration: Duration;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  allowlist?: string;
  addresses?: string[]; // Parsed addresses from allowlist
}

interface NewPhase {
  type: PhaseType; // Use the proper type
  mintPrice: string; // Changed to string to handle intermediate values
  maxMintPerWallet: string; // Changed to string
  duration: {
    days: string; // Changed to string
    hours: string; // Changed to string
  };
  allowlist: string;
}

// New interface for editing phase with string values
interface EditingPhaseData {
  id: number;
  name: string;
  type: PhaseType; // Use the proper type
  mintPrice: string;
  maxMintPerWallet: string;
  duration: {
    days: string;
    hours: string;
  };
  startTime: number;
  endTime: number;
  allowlist: string;
  addresses?: string[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const NFTLaunchInterface = () => {
  const params = useParams();
  const router = useRouter();
  const { currentUserLayer, currentLayer } = useAuth();
  const collectionId = params.collectionId as string;
  const [showMintHelpModal, setShowMintHelpModal] = useState(false);

  // State for collection data
  const [collection, setCollection] = useState<CreatorCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Launch start time state
  const [mintStartDate, setMintStartDate] = useState("");
  const [mintStartTime, setMintStartTime] = useState("");

  // Existing state
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [showEditPhaseModal, setShowEditPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<EditingPhaseData | null>(
    null
  );
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 1,
      name: "Public Phase",
      type: PHASE_TYPES.PUBLIC, // Use constant instead of magic number
      mintPrice: 0,
      maxMintPerWallet: 1,
      duration: { days: 1, hours: 0 },
      startTime: 0,
      endTime: 0,
      allowlist: "",
      addresses: [],
    },
  ]);
  const [nextPhaseType, setNextPhaseType] = useState<PhaseType>(
    PHASE_TYPES.WHITELIST
  ); // Start with whitelist

  const [newPhase, setNewPhase] = useState<NewPhase>({
    type: PHASE_TYPES.WHITELIST,
    mintPrice: "100", // Changed to string
    maxMintPerWallet: "1", // Changed to string
    duration: { days: "1", hours: "0" }, // Changed to strings
    allowlist: "",
  });

  const userLayerId = currentUserLayer?.id || "";

  // Helper function to safely convert string to number
  const safeParseNumber = (value: string, fallback: number = 0): number => {
    if (value === "" || value === ".") return fallback;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Helper function to safely convert string to integer
  const safeParseInt = (value: string, fallback: number = 0): number => {
    if (value === "") return fallback;
    const parsed = parseInt(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Helper function to chunk array into smaller arrays
  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // Fetch collection data
  useEffect(() => {
    fetchCollectionData();
    // Set default mint start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMintStartDate(tomorrow.toISOString().split("T")[0]);
    setMintStartTime("13:00");
  }, [collectionId, userLayerId]);

  const fetchCollectionData = async () => {
    if (!collectionId || !userLayerId) return;

    try {
      setLoading(true);
      // Fetch all collections and find the specific one
      const collections = await createrCollection(userLayerId, 1, 100);
      const targetCollection = collections.find(
        (col: CreatorCollection) => col.collectionId === collectionId
      );

      if (targetCollection) {
        setCollection(targetCollection);
        setError(null);
      } else {
        setError("Collection not found");
      }
    } catch (error) {
      console.error("Failed to fetch collection data:", error);
      setError("Failed to load collection data");
    } finally {
      setLoading(false);
    }
  };

  // Convert date and time to Unix timestamp
  const dateTimeToUnix = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return Math.floor(dateTime.getTime() / 1000);
  };

  // Get current time as Unix timestamp
  const getCurrentUnixTime = () => {
    return Math.floor(Date.now() / 1000);
  };

  // Calculate phase times based on mint start time and durations
  const calculatePhaseTimes = () => {
    if (!mintStartDate || !mintStartTime) return [];

    const startUnixTime = dateTimeToUnix(mintStartDate, mintStartTime);
    const calculatedPhases: Phase[] = [];
    let currentStartTime = startUnixTime;

    phases.forEach((phase, index) => {
      const durationInSeconds =
        phase.duration.days * 24 * 60 * 60 + phase.duration.hours * 60 * 60;
      const endTime = currentStartTime + durationInSeconds;

      calculatedPhases.push({
        ...phase,
        startTime: currentStartTime,
        endTime: endTime,
      });

      currentStartTime = endTime; // Next phase starts when current phase ends
    });

    return calculatedPhases;
  };

  // Parse allowlist addresses
  const parseAllowlistAddresses = (allowlist: string): string[] => {
    if (!allowlist.trim()) return [];

    return allowlist
      .split(/[\n,]/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);
  };

  const getPhaseTypeName = (type: PhaseType) => {
    switch (type) {
      case PHASE_TYPES.WHITELIST:
        return "Whitelist Phase";
      case PHASE_TYPES.FCFS_WHITELIST:
        return "FCFS Phase";
      case PHASE_TYPES.PUBLIC:
        return "Public Phase";
      default:
        return "Unknown Phase";
    }
  };

  const handleAddPhase = () => {
    const addresses = parseAllowlistAddresses(newPhase.allowlist);

    const phase: Phase = {
      id: phases.length + 1,
      name: getPhaseTypeName(nextPhaseType),
      type: nextPhaseType,
      mintPrice: safeParseNumber(newPhase.mintPrice),
      maxMintPerWallet: safeParseInt(newPhase.maxMintPerWallet, 1),
      duration: {
        days: safeParseInt(newPhase.duration.days, 1),
        hours: safeParseInt(newPhase.duration.hours, 0),
      },
      startTime: 0, // Will be calculated later
      endTime: 0, // Will be calculated later
      allowlist: newPhase.allowlist,
      addresses: addresses,
    };

    setPhases([...phases, phase]);

    // Update next phase type
    if (nextPhaseType === PHASE_TYPES.WHITELIST) {
      setNextPhaseType(PHASE_TYPES.FCFS_WHITELIST); // Next will be FCFS
    } else if (nextPhaseType === PHASE_TYPES.FCFS_WHITELIST) {
      setNextPhaseType(PHASE_TYPES.PUBLIC); // Will be disabled since public already exists
    }

    // Reset form
    setNewPhase({
      type:
        nextPhaseType === PHASE_TYPES.WHITELIST
          ? PHASE_TYPES.FCFS_WHITELIST
          : PHASE_TYPES.PUBLIC,
      mintPrice: "100",
      maxMintPerWallet: "1",
      duration: { days: "1", hours: "0" },
      allowlist: "",
    });

    setShowAddPhaseModal(false);
  };

  const handleEditPhase = (phase: Phase) => {
    // Convert Phase to EditingPhaseData with string values
    const editingData: EditingPhaseData = {
      id: phase.id,
      name: phase.name,
      type: phase.type,
      mintPrice: phase.mintPrice.toString(),
      maxMintPerWallet: phase.maxMintPerWallet.toString(),
      duration: {
        days: phase.duration.days.toString(),
        hours: phase.duration.hours.toString(),
      },
      startTime: phase.startTime,
      endTime: phase.endTime,
      allowlist: phase.allowlist || "",
      addresses: phase.addresses,
    };

    setEditingPhase(editingData);
    setShowEditPhaseModal(true);
  };

  const handleSaveEdit = () => {
    if (editingPhase) {
      const addresses = parseAllowlistAddresses(editingPhase.allowlist || "");
      const updatedPhase: Phase = {
        id: editingPhase.id,
        name: editingPhase.name,
        type: editingPhase.type,
        mintPrice: safeParseNumber(editingPhase.mintPrice),
        maxMintPerWallet: safeParseInt(editingPhase.maxMintPerWallet, 1),
        duration: {
          days: safeParseInt(editingPhase.duration.days, 1),
          hours: safeParseInt(editingPhase.duration.hours, 0),
        },
        startTime: editingPhase.startTime,
        endTime: editingPhase.endTime,
        allowlist: editingPhase.allowlist,
        addresses: addresses,
      };

      setPhases(
        phases.map((p) => (p.id === editingPhase.id ? updatedPhase : p))
      );
    }
    setShowEditPhaseModal(false);
    setEditingPhase(null);
  };

  const handleRemovePhase = (phaseId: number) => {
    setPhases(phases.filter((p) => p.id !== phaseId));

    // Reset next phase type based on remaining phases
    const remainingPhases = phases.filter((p) => p.id !== phaseId);
    const hasWhitelist = remainingPhases.some(
      (p) => p.type === PHASE_TYPES.WHITELIST
    );
    const hasFcfs = remainingPhases.some(
      (p) => p.type === PHASE_TYPES.FCFS_WHITELIST
    );

    if (!hasWhitelist) {
      setNextPhaseType(PHASE_TYPES.WHITELIST);
    } else if (!hasFcfs) {
      setNextPhaseType(PHASE_TYPES.FCFS_WHITELIST);
    } else {
      setNextPhaseType(PHASE_TYPES.PUBLIC);
    }
  };

  // Modified handleSubmitForPreview function with sendTransaction
  const handleSubmitForPreview = async () => {
    if (!collection || !mintStartDate || !mintStartTime) {
      toast.info("Please set mint start date and time");
      return;
    }

    if (phases.length === 0) {
      toast.info("Please add at least one phase");
      return;
    }

    if (!currentUserLayer?.address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedPhases = calculatePhaseTimes();
      let launchId = collection.launchId;

      console.log("here is collection.launchID", launchId);
      console.log("Calculated phases:", calculatedPhases);

      // Step 1: Add each phase with transaction sending
      for (const phase of calculatedPhases) {
        try {
          console.log(`Processing phase: ${phase.name}`);

          // Prepare phase data
          const phaseData = {
            collectionId: collectionId,
            phaseType: phase.type, // This should now use the correct constants
            price: phase.mintPrice.toString(),
            startTime: phase.startTime,
            endTime: phase.endTime,
            maxSupply: 0,
            maxPerWallet: phase.maxMintPerWallet,
            maxMintPerPhase: 0,
            merkleRoot: "",
            layerId: currentLayer?.id || "",
            userLayerId: userLayerId,
          };

          console.log("Adding phase:", phaseData);
          const phaseResponse = await addPhase(phaseData);
          console.log("Phase response:", phaseResponse);

          // Send transaction if there's transaction data
          if (phaseResponse?.data?.unsignedTx) {
            console.log(`Sending transaction for phase: ${phase.name}`);
            const txHash = await sendTransaction(wagmiConfig, {
              to: phaseResponse.data.unsignedTx.to,
              data: phaseResponse.data.unsignedTx.data,
              value: phaseResponse.data.unsignedTx.value || "0x0",
              gas: phaseResponse.data.unsignedTx.gas,
              gasPrice: phaseResponse.data.unsignedTx.gasPrice,
            });
            console.log(`Transaction hash for ${phase.name}:`, txHash);
          }

          // Store launch ID from first phase response
          if (!launchId && phaseResponse?.launchId) {
            launchId = phaseResponse.launchId;
            console.log("Launch ID found:", launchId);
          }

          // Alternative: If launchId is not in the response, check other properties
          if (!launchId && phaseResponse?.data?.launchId) {
            launchId = phaseResponse.data.launchId;
            console.log("Launch ID found in data:", launchId);
          }

          // Another alternative: If it's returned as 'id'
          if (!launchId && phaseResponse?.id) {
            launchId = phaseResponse.id;
            console.log("Launch ID found as id:", launchId);
          }

          // Add a small delay between phase additions to avoid overwhelming the server
          if (calculatedPhases.indexOf(phase) < calculatedPhases.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
          }
        } catch (phaseError) {
          console.error(`Error adding phase ${phase.name}:`, phaseError);
          throw new Error(`Failed to add phase: ${phase.name}`);
        }
      }

      console.log("Final launch ID:", launchId);

      // Step 2: Handle whitelist addresses for whitelist phase only
      const whitelistPhase = calculatedPhases.find(
        (p) => p.type === PHASE_TYPES.WHITELIST
      );
      console.log("Whitelist phase found:", whitelistPhase);

      if (whitelistPhase) {
        console.log("Whitelist phase addresses:", whitelistPhase.addresses);
        console.log("Addresses length:", whitelistPhase.addresses?.length);
      }

      if (
        whitelistPhase &&
        whitelistPhase.addresses &&
        whitelistPhase.addresses.length > 0 &&
        launchId
      ) {
        console.log("Processing whitelist addresses...");

        // Process whitelist addresses in chunks of 50
        const addressChunks = chunkArray(whitelistPhase.addresses, 50);

        for (let i = 0; i < addressChunks.length; i++) {
          const chunk = addressChunks[i];
          console.log(
            `Processing whitelist chunk ${i + 1}/${addressChunks.length} with ${
              chunk.length
            } addresses`
          );

          try {
            const whitelistResponse = await whitelistAddresses({
              launchId: launchId,
              addresses: chunk,
              phase: "WHITELIST", // Make sure this matches your backend expectation
            });
            console.log(
              `Whitelist chunk ${i + 1} response:`,
              whitelistResponse
            );

            // Add a small delay between chunks to avoid overwhelming the server
            if (i < addressChunks.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
            }
          } catch (error) {
            console.error(`Error processing whitelist chunk ${i + 1}:`, error);
            // Continue with next chunk even if one fails
          }
        }

        console.log(
          `Successfully processed ${addressChunks.length} whitelist chunks`
        );
      } else {
        console.log("Skipping whitelist addresses because:");
        console.log("- Has whitelist phase:", !!whitelistPhase);
        console.log("- Has addresses:", !!whitelistPhase?.addresses);
        console.log(
          "- Addresses length:",
          whitelistPhase?.addresses?.length || 0
        );
        console.log("- Has launch ID:", !!launchId);
      }

      // Step 3: Handle FCFS addresses if there's an FCFS phase
      const fcfsPhase = calculatedPhases.find(
        (p) => p.type === PHASE_TYPES.FCFS_WHITELIST
      );

      if (
        fcfsPhase &&
        fcfsPhase.addresses &&
        fcfsPhase.addresses.length > 0 &&
        launchId
      ) {
        console.log("Processing FCFS addresses...");

        const addressChunks = chunkArray(fcfsPhase.addresses, 50);

        for (let i = 0; i < addressChunks.length; i++) {
          const chunk = addressChunks[i];
          try {
            await whitelistAddresses({
              launchId: launchId,
              addresses: chunk,
              phase: "FCFS_WHITELIST", // Make sure this matches your backend expectation
            });

            if (i < addressChunks.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (error) {
            console.error(`Error processing FCFS chunk ${i + 1}:`, error);
          }
        }
      }

      // Step 4: Submit collection for review
      console.log("Submitting collection for review...");
      await submitCollectionForReview({
        collectionId: collectionId,
        address: currentUserLayer?.address || "",
      });

      toast.success("Collection submitted for preview successfully!");

      // Navigate to /creater-tool after success
      router.push("/creater-tool");
    } catch (error) {
      console.error("Error submitting collection:", error);
      toast.error("Failed to submit collection for preview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-neutral600 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-neutral500">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral200 hover:text-white p-2 rounded-lg hover:bg-neutral500 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral600 via-darkPrimary to-neutral600">
        <div className="max-w-4xl mx-auto px-6 py-12 text-white">
          <div className="text-center">
            <div className="text-lg text-neutral200">
              Loading collection data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral600 via-darkPrimary to-neutral600">
        <div className="max-w-4xl mx-auto px-6 py-12 text-white">
          <div className="text-center">
            <div className="text-lg text-red-400">
              {error || "Collection not found"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral600 via-darkPrimary to-neutral600">
      <div className="max-w-4xl mx-auto px-6 py-12 text-white">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.push("/creater-tool")}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <X size={20} />
          </Button>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-neutral100 bg-clip-text text-transparent">
              Launch your NFT Collection
            </h1>
            <p className="text-neutral200 text-lg max-w-2xl mx-auto leading-relaxed">
              You&apos;ve done the work, now it&apos;s time to go live. Launch
              your NFT collection, make it visible on-chain, and open the door
              to minting and collecting.
            </p>
          </div>
        </div>

        {/* NFT Collection Card */}
        <div className="flex items-center gap-6 mb-12 p-6 bg-gradient-to-r from-neutral500/50 to-neutral600/30 rounded-2xl border border-neutral400 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            {collection.logoKey ? (
              <Image
                src={s3ImageUrlBuilder(collection.logoKey)}
                alt={collection.name}
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-14 h-14 bg-white/20 rounded-lg border-2 border-white/30 backdrop-blur-sm"></div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
            <div className="flex items-center gap-6 text-neutral200">
              <span className="flex items-center gap-4 px-2 py-1 border border-transLight4 rounded-lg bg-darkTertiary">
                <div className="w-[16px] h-[16px]">
                  <Image
                    src={getCurrencyImage(collection.layer)}
                    alt="layer"
                    width={16}
                    height={16}
                    draggable="false"
                    className="w-4 h-4 object-cover"
                  />
                </div>
                <span className="font-medium">{collection.layer}</span>
              </span>
              <span className="flex items-center gap-4 px-2 py-1 border border-transLight4 rounded-lg bg-darkTertiary">
                <div className="w-5 h-5 rounded grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>
                <span className="font-medium">
                  {collection.supply || 0} inscriptions
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Mint Start Date & Time */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            Mint Start Date & Time
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral500/50 rounded-xl p-4 border border-neutral400 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Calendar className="text-brand w-6 h-6" />
                <Input
                  type="date"
                  value={mintStartDate}
                  onChange={(e) => setMintStartDate(e.target.value)}
                  className="bg-transparent text-lg font-medium text-white border-hidden focus:outline-none"
                />
              </div>
            </div>
            <div className="bg-neutral500/50 rounded-xl p-4 border border-neutral400 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Clock className="text-brand w-6 h-6" />
                <Input
                  type="time"
                  value={mintStartTime}
                  onChange={(e) => setMintStartTime(e.target.value)}
                  className="bg-transparent text-lg font-medium text-white border-hidden focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Launch Phases */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6">Launch Phases</h3>

          {/* Only show add buttons for whitelist and FCFS if they don't exist yet */}
          {nextPhaseType < PHASE_TYPES.PUBLIC && (
            <button
              onClick={() => {
                setNewPhase({
                  ...newPhase,
                  type: nextPhaseType,
                });
                setShowAddPhaseModal(true);
              }}
              className="w-full p-6 border-2  border-neutral300 rounded-2xl text-neutral200 hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-300 mb-6 flex items-center justify-center gap-3 group"
            >
              <Plus
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-lg font-medium">
                Add {getPhaseTypeName(nextPhaseType)}
              </span>
            </button>
          )}

          {/* Phases List */}
          <div className="space-y-6">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="bg-neutral500 rounded-xl p-6 border border-neutral400"
              >
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-semibold text-white">
                    {phase.name}
                  </h4>
                  <button
                    onClick={() => handleEditPhase(phase)}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral400 hover:bg-neutral300 rounded-lg text-neutral200 hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-darkSecondary rounded-lg p-4">
                    <div className="text-white  text-sm mb-2">Mint price</div>
                    <div className="text-xl font-semibold text-white">
                      {phase.mintPrice === 0 ? "Free" : `${phase.mintPrice}`}
                    </div>
                  </div>
                  <div className="bg-neutral600 rounded-lg p-4">
                    <div className="text-white text-sm mb-2">
                      Max mint per wallet
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {phase.maxMintPerWallet}
                    </div>
                  </div>
                  <div className="bg-neutral600 rounded-lg p-4">
                    <div className="text-white  text-sm mb-2">Duration</div>
                    <div className="text-xl font-semibold text-white">
                      {phase.duration.days}d {phase.duration.hours}h
                    </div>
                  </div>
                </div>

                {phase.addresses && phase.addresses.length > 0 && (
                  <div className="mb-4">
                    <div className="text-white text-sm mb-2">
                      Allowlisted addresses: {phase.addresses.length}
                    </div>
                  </div>
                )}

                {/* Only show remove button for non-public phases or if there are multiple phases */}
                {(phase.type !== PHASE_TYPES.PUBLIC || phases.length > 1) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemovePhase(phase.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded transition-all"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Remove Phase
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center w-full pt-8">
          <Button
            onClick={handleSubmitForPreview}
            disabled={isSubmitting || phases.length === 0}
            className="px-12 py-4 bg-whit w-full text-black bg-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-brand/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Submitting..." : "Submit for preview"}
          </Button>
        </div>
      </div>

      {/* Add Phase Modal */}
      <Modal
        isOpen={showAddPhaseModal}
        onClose={() => setShowAddPhaseModal(false)}
        title={`Add ${getPhaseTypeName(newPhase.type)}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* Mint Price */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Mint price
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={newPhase.mintPrice}
                  onChange={(e) =>
                    setNewPhase({
                      ...newPhase,
                      mintPrice: e.target.value,
                    })
                  }
                  className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  autoComplete="off"
                />
                <div className="absolute right-4 top-3 text-transLight64 font-semibold">
                  {collection.layer}
                </div>
              </div>
            </div>

            {/* Max Mint Per Wallet */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Max mint per wallet
              </label>
              <Input
                type="number"
                min="1"
                value={newPhase.maxMintPerWallet}
                onChange={(e) =>
                  setNewPhase({
                    ...newPhase,
                    maxMintPerWallet: e.target.value,
                  })
                }
                className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="off"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={newPhase.duration.days}
                    onChange={(e) =>
                      setNewPhase({
                        ...newPhase,
                        duration: {
                          ...newPhase.duration,
                          days: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-4 text-neutral300 font-medium">
                    Days
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={newPhase.duration.hours}
                    onChange={(e) =>
                      setNewPhase({
                        ...newPhase,
                        duration: {
                          ...newPhase.duration,
                          hours: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-4 text-neutral300 font-medium">
                    Hours
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Allowlist - Only show for whitelist and FCFS phases */}
          {(newPhase.type === PHASE_TYPES.WHITELIST ||
            newPhase.type === PHASE_TYPES.FCFS_WHITELIST) && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Allowlist
              </label>
              <textarea
                placeholder="Enter allowlisted wallets separated by new lines or commas"
                value={newPhase.allowlist}
                onChange={(e) =>
                  setNewPhase({ ...newPhase, allowlist: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const value = target.value;
                    const newValue =
                      value.substring(0, start) + "\n" + value.substring(end);
                    setNewPhase({ ...newPhase, allowlist: newValue });

                    // Set cursor position after the new line
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + 1;
                    }, 0);
                  }
                }}
                rows={14}
                className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white placeholder-neutral300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                autoComplete="off"
              />
              <div className="text-md2 text-white bg-neutral600 p-3 rounded-lg">
                Enter allowlisted wallets separated by new lines or commas.
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-neutral400">
          <Button
            onClick={() => setShowAddPhaseModal(false)}
            className="px-8 py-3 border border-transLight8 text-white hover:bg-transparent font-medium rounded-xl bg-transparent transition-all"
          >
            Cancel
          </Button>
          <button
            onClick={handleAddPhase}
            className="px-8 py-3 bg-gradient-to-r from-brand to-yellow-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-brand/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Phase
          </button>
        </div>
      </Modal>

      {/* Edit Phase Modal */}
      <Modal
        isOpen={showEditPhaseModal}
        onClose={() => setShowEditPhaseModal(false)}
        title="Edit Phase Details"
      >
        {editingPhase && (
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Mint Price */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Mint price
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={editingPhase.mintPrice}
                  onChange={(e) => {
                    setEditingPhase({
                      ...editingPhase,
                      mintPrice: e.target.value,
                    });
                  }}
                  className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  autoComplete="off"
                />
                <div className="absolute right-4 top-3 text-transLight64 font-semibold">
                  {collection.layer}
                </div>
              </div>
            </div>

            {/* Max Mint Per Wallet */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Max mint per wallet
              </label>
              <Input
                type="number"
                min="1"
                value={editingPhase.maxMintPerWallet}
                onChange={(e) => {
                  setEditingPhase({
                    ...editingPhase,
                    maxMintPerWallet: e.target.value,
                  });
                }}
                className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="off"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={editingPhase.duration.days}
                    onChange={(e) => {
                      setEditingPhase({
                        ...editingPhase,
                        duration: {
                          ...editingPhase.duration,
                          days: e.target.value,
                        },
                      });
                    }}
                    className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-4 text-neutral300 font-medium">
                    Days
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={editingPhase.duration.hours}
                    onChange={(e) => {
                      setEditingPhase({
                        ...editingPhase,
                        duration: {
                          ...editingPhase.duration,
                          hours: e.target.value,
                        },
                      });
                    }}
                    className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-4 text-neutral300 font-medium">
                    Hours
                  </div>
                </div>
              </div>
            </div>

            {/* Allowlist - Only show for whitelist and FCFS phases */}
            {(editingPhase.type === PHASE_TYPES.WHITELIST ||
              editingPhase.type === PHASE_TYPES.FCFS_WHITELIST) && (
              <div>
                <label className="block text-sm font-semibold mb-3 text-neutral200">
                  Allowlist
                </label>
                <textarea
                  placeholder="Enter allowlisted wallets separated by new lines or commas"
                  value={editingPhase.allowlist}
                  onChange={(e) => {
                    setEditingPhase({
                      ...editingPhase,
                      allowlist: e.target.value,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const value = target.value;
                      const newValue =
                        value.substring(0, start) + "\n" + value.substring(end);
                      setEditingPhase({
                        ...editingPhase,
                        allowlist: newValue,
                      });

                      // Set cursor position after the new line
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = start + 1;
                      }, 0);
                    }
                  }}
                  rows={8}
                  className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white placeholder-neutral300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                  autoComplete="off"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-center pt-6 border-t border-neutral400">
              <button
                onClick={handleSaveEdit}
                className="px-12 py-4 bg-gradient-to-r from-brand to-yellow-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-brand/30 transition-all duration-300 hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NFTLaunchInterface;
