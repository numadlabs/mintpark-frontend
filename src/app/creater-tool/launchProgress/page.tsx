"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Edit2, Trash2, Plus } from "lucide-react";
import CreaterLayout from "@/components/layout/createrLayout";


interface Duration {
  days: number;
  hours: number;
}

interface Phase {
  id: number;
  name: string;
  mintPrice: number;
  maxMintPerWallet: number;
  duration: Duration;
  startDate: string;
  endDate: string;
  allowlist?: string;
}

interface NewPhase {
  name: string;
  mintPrice: number;
  maxMintPerWallet: number;
  duration: Duration;
  allowlist: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const NFTLaunchInterface = () => {
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [showEditPhaseModal, setShowEditPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 1,
      name: "Public Phase",
      mintPrice: 0,
      maxMintPerWallet: 1,
      duration: { days: 1, hours: 0 },
      startDate: "Jul 30 2025, 1:00 PM",
      endDate: "Jul 31 2025, 1:00 PM",
    },
  ]);

  const [newPhase, setNewPhase] = useState<NewPhase>({
    name: "",
    mintPrice: 100,
    maxMintPerWallet: 1,
    duration: { days: 1, hours: 0 },
    allowlist: "",
  });

  const handleAddPhase = () => {
    const phase: Phase = {
      id: phases.length + 1,
      ...newPhase,
      startDate: "Aug 1 2025, 2:00 PM",
      endDate: "Aug 2 2025, 2:00 AM",
    };
    setPhases([...phases, phase]);
    setNewPhase({
      name: "",
      mintPrice: 100,
      maxMintPerWallet: 1,
      duration: { days: 1, hours: 0 },
      allowlist: "",
    });
    setShowAddPhaseModal(false);
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setShowEditPhaseModal(true);
  };

  const handleSaveEdit = () => {
    if (editingPhase) {
      setPhases(
        phases.map((p) => (p.id === editingPhase.id ? editingPhase : p))
      );
    }
    setShowEditPhaseModal(false);
    setEditingPhase(null);
  };

  const handleRemovePhase = (phaseId: number) => {
    setPhases(phases.filter((p) => p.id !== phaseId));
  };

  const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1"
            >
              <X size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <>
      <>
        <CreaterLayout>
          <div className="max-w-4xl mx-auto mt-40 text-white py-8 min-h-screen">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Launch your NFT Collection
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                You've done the work, now it's time to go live. Launch your NFT
                collection, make it visible on-chain, and open the door to
                minting and collecting.
              </p>
            </div>

            {/* NFT Collection Card */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-700 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-300 rounded border-2 border-gray-200"></div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Hemi Bros</h2>
                <div className="flex items-center gap-4 mt-1 text-gray-300">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Hemi
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-400 rounded grid grid-cols-2 gap-px">
                      <div className="bg-white rounded-tl"></div>
                      <div className="bg-white rounded-tr"></div>
                      <div className="bg-white rounded-bl"></div>
                      <div className="bg-white rounded-br"></div>
                    </div>
                    3333 inscriptions
                  </span>
                </div>
              </div>
            </div>

            {/* Mint Start Date & Time */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Mint Start Date & Time
                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">
                  ?
                </div>
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                    <Calendar className="text-gray-300" size={20} />
                    <span>2025 - 07 - 30</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                    <Clock className="text-gray-300" size={20} />
                    <span>13 : 00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Phases */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Launch Phases</h3>

              <button
                onClick={() => setShowAddPhaseModal(true)}
                className="w-full p-4 border border-dashed border-gray-400 rounded-lg text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Phase
              </button>

              {/* Phases List */}
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div key={phase.id} className="bg-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold">{phase.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPhase(phase)}
                          className="text-gray-300 hover:text-white p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        {phases.length > 1 && (
                          <button
                            onClick={() => handleRemovePhase(phase.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-4">
                      <div>
                        <div className="text-gray-300 text-sm mb-1">
                          Mint price
                        </div>
                        <div className="font-semibold">
                          {phase.mintPrice === 0
                            ? "Free"
                            : `${phase.mintPrice} HEMI`}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-sm mb-1">
                          Max mint per wallet
                        </div>
                        <div className="font-semibold">
                          {phase.maxMintPerWallet}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-sm mb-1">
                          Duration
                        </div>
                        <div className="font-semibold">
                          {phase.duration.days}d {phase.duration.hours}h
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-300">Starts: </span>
                        <span className="text-white">{phase.startDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Ends: </span>
                        <span className="text-white">{phase.endDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Phase Modal */}
          <Modal
            isOpen={showAddPhaseModal}
            onClose={() => setShowAddPhaseModal(false)}
            title="Add Phase"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Phase Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phase name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phase name"
                    value={newPhase.name}
                    onChange={(e) =>
                      setNewPhase({ ...newPhase, name: e.target.value })
                    }
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 text-white placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>

                {/* Mint Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mint price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newPhase.mintPrice}
                      onChange={(e) =>
                        setNewPhase({
                          ...newPhase,
                          mintPrice: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-3 text-gray-300">
                      HEMI
                    </div>
                  </div>
                </div>

                {/* Max Mint Per Wallet */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max mint per wallet
                  </label>
                  <input
                    type="number"
                    value={newPhase.maxMintPerWallet}
                    onChange={(e) =>
                      setNewPhase({
                        ...newPhase,
                        maxMintPerWallet: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={newPhase.duration.days}
                        onChange={(e) =>
                          setNewPhase({
                            ...newPhase,
                            duration: {
                              ...newPhase.duration,
                              days: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoComplete="off"
                      />
                      <div className="absolute right-3 top-3 text-gray-300">
                        Days
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={newPhase.duration.hours}
                        onChange={(e) =>
                          setNewPhase({
                            ...newPhase,
                            duration: {
                              ...newPhase.duration,
                              hours: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoComplete="off"
                      />
                      <div className="absolute right-3 top-3 text-gray-300">
                        Hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Allowlist */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Allowlist
                </label>
                <textarea
                  placeholder="Enter allowlisted wallets separated by new lines or commas"
                  value={newPhase.allowlist}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, allowlist: e.target.value })
                  }
                  rows={12}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 text-white placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  autoComplete="off"
                />
                <div className="mt-2 text-xs text-gray-400">
                  0xAbCdEf123456789Abcdef123456789ABCDEF12
                  <br />
                  0x987654321ABCDEFabcdef987654321ABCDEF98
                  <br />
                  0xCaFeBaD0123456789abcdef0123456789CAFEBAD
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowAddPhaseModal(false)}
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPhase}
                disabled={!newPhase.name.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={16} />
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
              <div className="space-y-6">
                {/* Phase Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phase name
                  </label>
                  <input
                    type="text"
                    value={editingPhase.name}
                    onChange={(e) =>
                      setEditingPhase({ ...editingPhase, name: e.target.value })
                    }
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>

                {/* Mint Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mint price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editingPhase.mintPrice}
                      onChange={(e) =>
                        setEditingPhase({
                          ...editingPhase,
                          mintPrice: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-3 text-gray-300">
                      HEMI
                    </div>
                  </div>
                </div>

                {/* Max Mint Per Wallet */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max mint per wallet
                  </label>
                  <input
                    type="number"
                    value={editingPhase.maxMintPerWallet}
                    onChange={(e) =>
                      setEditingPhase({
                        ...editingPhase,
                        maxMintPerWallet: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={editingPhase.duration.days}
                        onChange={(e) =>
                          setEditingPhase({
                            ...editingPhase,
                            duration: {
                              ...editingPhase.duration,
                              days: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoComplete="off"
                      />
                      <div className="absolute right-3 top-3 text-gray-300">
                        Days
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={editingPhase.duration.hours}
                        onChange={(e) =>
                          setEditingPhase({
                            ...editingPhase,
                            duration: {
                              ...editingPhase.duration,
                              hours: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-3 pr-16 text-white focus:border-blue-500 focus:outline-none"
                      />
                      <div className="absolute right-3 top-3 text-gray-300">
                        Hours
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </CreaterLayout>
      </>
    </>
  );
};

export default NFTLaunchInterface;
