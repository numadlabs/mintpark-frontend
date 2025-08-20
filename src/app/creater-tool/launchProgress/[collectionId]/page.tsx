"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Edit2, Trash2, Plus } from "lucide-react";
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
import { PHASE_TYPES } from "@/lib/constants";

type PhaseType = (typeof PHASE_TYPES)[keyof typeof PHASE_TYPES];

interface Duration {
  days: number;
  hours: number;
}

interface Phase {
  id: number;
  name: string;
  type: PhaseType;
  mintPrice: number;
  maxMintPerWallet: number;
  duration: Duration;
  startTime: number; // unix seconds
  endTime: number; // unix seconds
  allowlist?: string;
  addresses?: string[];
}

interface NewPhase {
  type: PhaseType;
  mintPrice: string;
  maxMintPerWallet: string;
  duration: { days: string; hours: string };
  allowlist: string;
}

interface EditingPhaseData {
  id: number;
  name: string;
  type: PhaseType;
  mintPrice: string;
  maxMintPerWallet: string;
  duration: { days: string; hours: string };
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

  // Collection
  const [collection, setCollection] = useState<CreatorCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global start
  const [mintStartDate, setMintStartDate] = useState("");
  const [mintStartTime, setMintStartTime] = useState("");

  // Modals / edit
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [showEditPhaseModal, setShowEditPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<EditingPhaseData | null>(
    null
  );

  // Phases local state (public exists by default)
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 1,
      name: "Public",
      type: PHASE_TYPES.PUBLIC,
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
  );

  const [newPhase, setNewPhase] = useState<NewPhase>({
    type: PHASE_TYPES.WHITELIST,
    mintPrice: "0.0003",
    maxMintPerWallet: "1",
    duration: { days: "0", hours: "3" },
    allowlist: "",
  });

  const userLayerId = currentUserLayer?.id || "";

  const safeParseNumber = (value: string, fallback = 0): number => {
    if (value === "" || value === ".") return fallback;
    const n = parseFloat(value);
    return Number.isNaN(n) ? fallback : n;
  };
  const safeParseInt = (value: string, fallback = 0): number => {
    if (value === "") return fallback;
    const n = parseInt(value);
    return Number.isNaN(n) ? fallback : n;
  };

  const chunkArray = <T,>(arr: T[], size: number) => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const dateTimeToUnix = (date: string, time: string) => {
    const d = new Date(`${date}T${time}`);
    return Math.floor(d.getTime() / 1000);
  };

  const parseAllowlistAddresses = (s: string): string[] =>
    s
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);

  const getPhaseTypeName = (type: PhaseType) => {
    switch (type) {
      case PHASE_TYPES.WHITELIST:
        return "Whitelist";
      case PHASE_TYPES.FCFS_WHITELIST:
        return "FCFS Whitelist";
      case PHASE_TYPES.PUBLIC:
        return "Public";
      default:
        return "Phase";
    }
  };

  const PHASE_ORDER: Record<PhaseType, number> = {
    [PHASE_TYPES.WHITELIST]: 0,
    [PHASE_TYPES.FCFS_WHITELIST]: 1,
    [PHASE_TYPES.PUBLIC]: 2,
  };

  const sortPhasesByType = (list: Phase[]) =>
    [...list].sort((a, b) => PHASE_ORDER[a.type] - PHASE_ORDER[b.type]);

  const computePhaseTimes = (
    baseDate: string,
    baseTime: string,
    sorted: Phase[]
  ) => {
    if (!baseDate || !baseTime)
      return sorted.map((p) => ({ ...p, startTime: 0, endTime: 0 }));
    const start = dateTimeToUnix(baseDate, baseTime);
    let cursor = start;
    return sorted.map((p) => {
      const secs = p.duration.days * 24 * 3600 + p.duration.hours * 3600;
      const end = cursor + secs;
      const out = { ...p, startTime: cursor, endTime: end };
      cursor = end;
      return out;
    });
  };

  const formatUnix = (unix: number) => {
    if (!unix) return "-";
    const d = new Date(unix * 1000);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  useEffect(() => {
    fetchCollectionData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMintStartDate(tomorrow.toISOString().split("T")[0]);
    setMintStartTime("13:00");
  }, [collectionId, userLayerId]);

  const fetchCollectionData = async () => {
    if (!collectionId || !userLayerId) return;
    try {
      setLoading(true);
      const list = await createrCollection(userLayerId, 1, 100);
      const target = list.find(
        (c: CreatorCollection) => c.collectionId === collectionId
      );
      if (!target) {
        setError("Collection not found");
      } else {
        setCollection(target);
        setError(null);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load collection data");
    } finally {
      setLoading(false);
    }
  };

  // Derived: ordered + times
  const sortedPhases = React.useMemo(() => sortPhasesByType(phases), [phases]);
  const computedPhases = React.useMemo(
    () => computePhaseTimes(mintStartDate, mintStartTime, sortedPhases),
    [mintStartDate, mintStartTime, sortedPhases]
  );

  const handleAddPhase = () => {
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
      startTime: 0,
      endTime: 0,
      allowlist: newPhase.allowlist,
      addresses: parseAllowlistAddresses(newPhase.allowlist),
    };

    setPhases((p) => [...p, phase]);

    if (nextPhaseType === PHASE_TYPES.WHITELIST)
      setNextPhaseType(PHASE_TYPES.FCFS_WHITELIST);
    else if (nextPhaseType === PHASE_TYPES.FCFS_WHITELIST)
      setNextPhaseType(PHASE_TYPES.PUBLIC);

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
    setEditingPhase({
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
    });
    setShowEditPhaseModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingPhase) return;
    const updated: Phase = {
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
      addresses: parseAllowlistAddresses(editingPhase.allowlist || ""),
    };
    setPhases((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    setShowEditPhaseModal(false);
    setEditingPhase(null);
  };

  const handleRemovePhase = (phaseId: number) => {
    const remaining = phases.filter((p) => p.id !== phaseId);
    setPhases(remaining);

    const hasWhitelist = remaining.some(
      (p) => p.type === PHASE_TYPES.WHITELIST
    );
    const hasFcfs = remaining.some(
      (p) => p.type === PHASE_TYPES.FCFS_WHITELIST
    );

    if (!hasWhitelist) setNextPhaseType(PHASE_TYPES.WHITELIST);
    else if (!hasFcfs) setNextPhaseType(PHASE_TYPES.FCFS_WHITELIST);
    else setNextPhaseType(PHASE_TYPES.PUBLIC);
  };

  // Submit flow with overlap-skip + allowlist gating
  const handleSubmitForPreview = async () => {
    if (!collection || !mintStartDate || !mintStartTime) {
      toast.info("Please set mint start date and time");
      return;
    }
    if (computedPhases.length === 0) {
      toast.info("Please add at least one phase");
      return;
    }
    if (!currentUserLayer?.address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsSubmitting(true);
    const createdPhaseTypes = new Set<PhaseType>();

    try {
      const calculatedPhases = computedPhases;
      let launchId = collection.launchId;

      // Step 1: Add phases
      for (const phase of calculatedPhases) {
        try {
          const req = {
            collectionId,
            phaseType: phase.type,
            price: phase.mintPrice.toString(),
            startTime: phase.startTime,
            endTime: phase.endTime,
            maxSupply: 0,
            maxPerWallet: phase.maxMintPerWallet,
            maxMintPerPhase: 0,
            merkleRoot: "",
            layerId: currentLayer?.id || "",
            userLayerId,
          };

          const res = await addPhase(req);

          if (res?.data?.unsignedTx) {
            await sendTransaction(wagmiConfig, {
              to: res.data.unsignedTx.to,
              data: res.data.unsignedTx.data,
              value: res.data.unsignedTx.value || "0x0",
              gas: res.data.unsignedTx.gas,
              gasPrice: res.data.unsignedTx.gasPrice,
            });
          }

          createdPhaseTypes.add(phase.type);

          if (!launchId && res?.launchId) launchId = res.launchId;
          if (!launchId && res?.data?.launchId) launchId = res.data.launchId;
          if (!launchId && res?.id) launchId = res.id;

          if (calculatedPhases.indexOf(phase) < calculatedPhases.length - 1) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (err: any) {
          const msg =
            err?.error ||
            err?.response?.data?.error ||
            err?.message ||
            String(err);
          console.error(`Add phase failed (${phase.name}):`, err);

          if (msg.toLowerCase().includes("overlap")) {
            toast.error(
              `Skipping ${phase.name}: overlaps an existing phase on server.`
            );
          } else {
            toast.error(`Failed to add ${phase.name}.`);
          }
          // do not mark created; continue to next phase
          continue;
        }
      }

      // Step 2: Whitelist allowlist (only if WL actually created)
      const whitelistPhase = calculatedPhases.find(
        (p) => p.type === PHASE_TYPES.WHITELIST
      );
      if (
        whitelistPhase &&
        createdPhaseTypes.has(PHASE_TYPES.WHITELIST) &&
        whitelistPhase.addresses?.length &&
        launchId
      ) {
        const chunks = chunkArray(whitelistPhase.addresses, 50);
        for (let i = 0; i < chunks.length; i++) {
          try {
            await whitelistAddresses({
              launchId,
              addresses: chunks[i],
              phase: "WHITELIST",
            });
            if (i < chunks.length - 1)
              await new Promise((r) => setTimeout(r, 500));
          } catch (e) {
            console.error(`Whitelist chunk error ${i + 1}`, e);
          }
        }
      }

      // Step 3: FCFS allowlist (only if FCFS actually created)
      const fcfsPhase = calculatedPhases.find(
        (p) => p.type === PHASE_TYPES.FCFS_WHITELIST
      );
      if (
        fcfsPhase &&
        createdPhaseTypes.has(PHASE_TYPES.FCFS_WHITELIST) &&
        fcfsPhase.addresses?.length &&
        launchId
      ) {
        const chunks = chunkArray(fcfsPhase.addresses, 50);
        for (let i = 0; i < chunks.length; i++) {
          try {
            await whitelistAddresses({
              launchId,
              addresses: chunks[i],
              phase: "FCFS_WHITELIST",
            });
            if (i < chunks.length - 1)
              await new Promise((r) => setTimeout(r, 500));
          } catch (e) {
            console.error(`FCFS chunk error ${i + 1}`, e);
          }
        }
      }

      // Step 4: submit for review
      await submitCollectionForReview({
        collectionId,
        address: currentUserLayer?.address || "",
      });

      toast.success("Collection submitted for review successfully!");
      router.push("/creater-tool");
    } catch (e) {
      console.error("Submit error", e);
      toast.error("Failed to submit collection for preview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex justify-center items-center from-neutral600 via-darkPrimary to-neutral600">
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
        <div className="flex items-start gap-3">
          <Button
            onClick={() => router.push("/creater-tool")}
            variant="outline"
            size="lg"
            className="p-2 border-hidden"
          >
            <X size={20} />
          </Button>
          <div className="text-start mb-12 grid gap-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-neutral100 bg-clip-text text-transparent">
              Launch your NFT Collection
            </h1>
            <p className="text-neutral200 text-lg max-w-2xl mx-auto leading-relaxed">
              You&apos;ve done the work, now it&apos;s time to go live. Launch
              your NFT collection, make it visible on-chain, and open the door
              to minting and collecting.
            </p>
          </div>
        </div>

        {/* Collection Card */}
        <div className="flex items-center gap-6 mb-12 p-6 bg-darkSecondary rounded-xl border border-transLight4">
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
              <div className="w-14 h-14 text-lightPrimary  bg-white/20 rounded-lg border-2 border-white/30 backdrop-blur-sm" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
            <div className="flex items-center gap-6 text-lightPrimary">
              <span className="flex items-center gap-4 px-2 py-1 border border-transLight4 rounded-lg bg-darkTertiary">
                <div className="w-[16px] h-[16px]">
                  <Image
                    src={getCurrencyImage(collection.layer)}
                    alt="layer"
                    width={16}
                    height={16}
                    draggable="false"
                    className="w-4 h-4 object-cover rounded-xl"
                  />
                </div>
                <span className="font-medium text-lightPrimary">
                  {collection.layer}
                </span>
              </span>
              <span className="flex items-center gap-4 px-2 py-1 border border-transLight4 rounded-lg bg-darkTertiary">
                <div className="w-5 h-5 rounded grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="border border-white rounded-sm" />
                  <div className="border border-white rounded-sm" />
                  <div className="border border-white rounded-sm" />
                  <div className="border border-white rounded-sm" />
                </div>
                <span className="font-medium">
                  {collection.supply || 0} inscriptions
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Mint Start */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            Mint Start Date & Time
          </h3>
          <div className="grid grid-cols-2 h-12 gap-6">
            <div className="bg-transLight2 h-12 rounded-xl flex items-center p-4 border border-transLight4">
              <div className="flex items-center h-12 gap-4">
                <Calendar className="text-transLight64 w-5 h-5" />
                <Input
                  type="date"
                  value={mintStartDate}
                  onChange={(e) => setMintStartDate(e.target.value)}
                  className="bg-transparent text-lg font-medium text-white border-hidden focus:outline-none 
                  [&::-webkit-calendar-picker-indicator]:hidden 
                  [&::-webkit-inner-spin-button]:hidden"
                />
              </div>
            </div>
            <div className="bg-transLight2 rounded-xl h-12 flex items-center p-4 border border-transLight4">
              <div className="flex items-center h-12 gap-4">
                <Clock className="text-transLight64 w-5 h-5" />
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

        {/* Phases */}
        <div className="mb-8">
          <h3 className="text-2xl font-medium mb-6">Launch Phases</h3>
          {nextPhaseType < PHASE_TYPES.PUBLIC && (
            <Button
              onClick={() => {
                setNewPhase({ ...newPhase, type: nextPhaseType });
                setShowAddPhaseModal(true);
              }}
              className="w-full p-6 border-2 h-12 bg-transparent hover:bg-hidden border-transLight8 rounded-lg cursor-pointer text-neutral200 mb-6 flex items-center justify-center gap-3 group"
            >
              <Plus
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-lg text-lightPrimary font-medium">
                Add {getPhaseTypeName(nextPhaseType)}
              </span>
            </Button>
          )}

          <div className="space-y-6">
            {computedPhases.map((phase) => (
              <div
                key={phase.id}
                className="bg-transparent rounded-xl border border-transLight4"
              >
                <div className="flex justify-between bg-darkSecondary items-center p-4">
                  <h4 className="text-xl font-semibold text-white">
                    {phase.name}
                  </h4>
                  <button
                    onClick={() => handleEditPhase(phase)}
                    className="flex items-center gap-2 px-4 py-2 bg-transLight4 border border-transLight4 rounded-lg text-white hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-3">
                  <div className="bg-transparent py-4 px-5 border border-transLight4">
                    <div className="font-medium text-md text-transLight48 mb-2">
                      Mint price
                    </div>
                    <div className="text-lg  font-medium text-lightPrimary">
                      {phase.mintPrice === 0 ? "Free" : `${phase.mintPrice}`}
                    </div>
                  </div>
                  <div className="bg-transparent py-4 px-5 border border-transLight4">
                    <div className="font-medium text-md text-transLight48 mb-2">
                      Max mint per wallet
                    </div>
                    <div className="text-lg font-medium text-lightPrimary">
                      {phase.maxMintPerWallet}
                    </div>
                  </div>
                  <div className="bg-transparent py-4 px-5 border border-transLight4">
                    <div className="font-medium text-md text-transLight48 mb-2">
                      Duration
                    </div>
                    <div className="text-lg font-medium text-lightPrimary">
                      {phase.duration.days}d {phase.duration.hours}h
                    </div>
                  </div>
                </div>

                {/* Starts / Ends */}
                <div className="grid grid-cols-2  w-full p-3 gap-6">
                  <div className="bg-transparent flex gap-2 items-center justify-start p-4 w-full">
                    <div className="text-lightSecondary font-medium text-md">
                      Starts:
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {formatUnix(phase.startTime)}
                    </div>
                  </div>
                  <div className="bg-transparent flex gap-2 items-center justify-end p-4 w-full">
                    <div className="text-lightSecondary font-medium text-md">
                      Ends:
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {formatUnix(phase.endTime)}
                    </div>
                  </div>
                </div>

                {phase.addresses && phase.addresses.length > 0 && (
                  <div className="">
                    <div className="text-white text-sm pl-4">
                      Allowlisted addresses: {phase.addresses.length}
                    </div>
                  </div>
                )}
                {/* old */}
                {/* {(phase.type !== PHASE_TYPES.PUBLIC || phases.length > 1) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemovePhase(phase.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 relative bottom-4 rounded transition-all"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Remove Phase
                    </button>
                  </div>
                )} */}

                {/* only public hidden to remove phase button */}
                {/* {(phase.type === PHASE_TYPES.WHITELIST ||
                  phase.type === PHASE_TYPES.FCFS_WHITELIST) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemovePhase(phase.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 relative bottom-4 rounded transition-all"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Remove Phase
                    </button>
                  </div>
                )} */}

                {/* {(() => {
                  const hasFcfsWhitelist = phases.some(
                    (p) => p.type === PHASE_TYPES.FCFS_WHITELIST
                  );
                  if (phase.type === PHASE_TYPES.WHITELIST) {
                    return !hasFcfsWhitelist;
                  }
                  if (phase.type === PHASE_TYPES.FCFS_WHITELIST) {
                    return true;
                  }
                  return false;
                })() && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemovePhase(phase.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 relative bottom-4 rounded transition-all"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Remove Phase
                    </button>
                  </div>
                )} */}
                {((phase.type === PHASE_TYPES.WHITELIST &&
                  !phases.some((p) => p.type === PHASE_TYPES.FCFS_WHITELIST)) ||
                  phase.type === PHASE_TYPES.FCFS_WHITELIST) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemovePhase(phase.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 relative bottom-4 rounded transition-all"
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

        {/* Submit */}
        <div className="flex justify-center w-full pt-8">
          <Button
            onClick={handleSubmitForPreview}
            disabled={isSubmitting || phases.length === 0}
            className="px-12 py-4 w-full text-black bg-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-brand/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Submitting..." : "Submit for review"}
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
                    setNewPhase({ ...newPhase, mintPrice: e.target.value })
                  }
                  className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  autoComplete="off"
                />
                <div className="absolute right-4 top-3 text-transLight64 font-semibold">
                  {collection.layer}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Max mint per wallet
              </label>
              <Input
                type="number"
                min="1"
                value={newPhase.maxMintPerWallet}
                onChange={(e) =>
                  setNewPhase({ ...newPhase, maxMintPerWallet: e.target.value })
                }
                className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="off"
              />
            </div>

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
                    const v = target.value;
                    const nv = v.substring(0, start) + "\n" + v.substring(end);
                    setNewPhase({ ...newPhase, allowlist: nv });
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
          <div className="space-y-8 max-w-xl mx-auto">
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Mint price
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={editingPhase.mintPrice}
                  onChange={(e) =>
                    setEditingPhase({
                      ...editingPhase,
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

            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral200">
                Max mint per wallet
              </label>
              <Input
                type="number"
                min="1"
                value={editingPhase.maxMintPerWallet}
                onChange={(e) =>
                  setEditingPhase({
                    ...editingPhase,
                    maxMintPerWallet: e.target.value,
                  })
                }
                className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="off"
              />
            </div>

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
                    onChange={(e) =>
                      setEditingPhase({
                        ...editingPhase,
                        duration: {
                          ...editingPhase.duration,
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
                    value={editingPhase.duration.hours}
                    onChange={(e) =>
                      setEditingPhase({
                        ...editingPhase,
                        duration: {
                          ...editingPhase.duration,
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

            {(editingPhase.type === PHASE_TYPES.WHITELIST ||
              editingPhase.type === PHASE_TYPES.FCFS_WHITELIST) && (
              <div>
                <label className="block text-sm font-semibold mb-3 text-neutral200">
                  Allowlist
                </label>
                <textarea
                  placeholder="Enter allowlisted wallets separated by new lines or commas"
                  value={editingPhase.allowlist}
                  onChange={(e) =>
                    setEditingPhase({
                      ...editingPhase,
                      allowlist: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const t = e.target as HTMLTextAreaElement;
                      const start = t.selectionStart;
                      const end = t.selectionEnd;
                      const v = t.value;
                      const nv =
                        v.substring(0, start) + "\n" + v.substring(end);
                      setEditingPhase({ ...editingPhase, allowlist: nv });
                      setTimeout(() => {
                        t.selectionStart = t.selectionEnd = start + 1;
                      }, 0);
                    }
                  }}
                  rows={8}
                  className="w-full bg-neutral600 border border-neutral400 rounded-lg px-3 py-3 text-white placeholder-neutral300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                  autoComplete="off"
                />
              </div>
            )}

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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
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
