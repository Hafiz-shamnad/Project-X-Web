"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Shield,
  Trash2,
  Target,
  Trophy,
  Rocket,
  Users,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Leaderboard from "../components/Leaderboard";
import ConfirmModal from "../components/ConfirmModal";
import InputModal from "../components/InputModal";
import { apiFetch } from "@/lib/api";

/**
 * AdminPanel - Admin Control Center
 *
 * Responsibilities:
 *  - Manage challenges (create, delete, toggle release, bulk actions)
 *  - Manage teams (view, ban/unban, apply penalty)
 *  - View leaderboards
 *
 * Implementation notes:
 *  - Use `apiFetch` for JSON endpoints (handles credentials + base URL)
 *  - Use direct fetch() for FormData multipart uploads (file upload)
 *  - Environment: NEXT_PUBLIC_API_URL should point to the base API (e.g. https://example.com/api)
 */

/* ----------------------------- Types ----------------------------- */

type Challenge = {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  points: number;
  released: boolean;
  filePath?: string | null;
  createdAt?: string;
};

type Team = {
  id: number;
  name: string;
  totalScore?: number;
  solvedCount?: number;
  members?: { id: number; username: string }[];
  joinCode?: string;
  bannedUntil?: string | null;
  penaltyPoints?: number | null;
};

/* -------------------------- Component ----------------------------- */

export default function AdminPanel() {
  // Configuration
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // UI Tabs
  const [activeTab, setActiveTab] = useState<"create" | "manage" | "leaderboard" | "teams">("create");

  // Data state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Selection (for bulk actions)
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<number[]>([]);

  // Form state for creating challenges
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    difficulty: "Easy",
    points: 100,
    flag: "",
    released: false,
    file: null as File | null,
  });

  // UI state
  const [loading, setLoading] = useState(false); // generic loading for create
  const [fetching, setFetching] = useState(false); // fetching lists
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  // Modals
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => Promise<void> | void;
  }>({ open: false });

  const [inputModal, setInputModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    label?: string;
    onConfirm?: (value: string) => Promise<void> | void;
  }>({ open: false });

  // Success / error toast helper (auto-clear after a timeout)
  const showSuccess = useCallback((text: string) => {
    setSuccessMsg(text);
    window.setTimeout(() => setSuccessMsg(null), 3500);
  }, []);

  const showError = useCallback((text: string) => {
    setErrorMsg(text);
    window.setTimeout(() => setErrorMsg(null), 5000);
  }, []);

  /* ------------------------- Data Fetching ------------------------- */

  const fetchChallenges = useCallback(async () => {
    try {
      setFetching(true);
      const data = await apiFetch("/admin/challenges");
      if (Array.isArray(data)) setChallenges(data);
      else setChallenges([]);
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
      showError("Failed to load challenges.");
    } finally {
      setFetching(false);
    }
  }, [showError]);

  const fetchTeams = useCallback(async () => {
    try {
      setFetching(true);
      const data = await apiFetch("/admin/teams");
      if (Array.isArray(data)) setTeams(data);
      else setTeams([]);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      showError("Failed to load teams.");
    } finally {
      setFetching(false);
    }
  }, [showError]);

  useEffect(() => {
    // load both lists at mount
    fetchChallenges();
    fetchTeams();
  }, [fetchChallenges, fetchTeams]);

  /* ------------------------ Selection Helpers ---------------------- */

  const toggleSelectChallenge = (id: number) => {
    setSelectedChallengeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedChallengeIds([]);

  /* ------------------------ Challenge Actions --------------------- */

  // Create challenge (multipart/form-data for optional file)
  const createChallenge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Basic validation
    if (!form.name.trim()) {
      showError("Challenge name is required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description || "");
      formData.append("category", form.category || "");
      formData.append("difficulty", form.difficulty);
      formData.append("points", String(Number(form.points) || 0));
      formData.append("flag", form.flag || "");
      formData.append("released", String(Boolean(form.released)));
      if (form.file) formData.append("file", form.file);

      const res = await fetch(`${BACKEND_URL}/admin/challenge`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText || "Failed to create challenge");
        throw new Error(text);
      }

      // refresh challenge list
      await fetchChallenges();
      showSuccess("Challenge created successfully.");
      // clear form
      setForm({
        name: "",
        description: "",
        category: "",
        difficulty: "Easy",
        points: 100,
        flag: "",
        released: false,
        file: null,
      });
    } catch (err) {
      console.error("Create challenge error:", err);
      showError("Failed to create challenge.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a challenge
  const deleteChallenge = useCallback(
    async (id: number) => {
      try {
        await apiFetch(`/admin/challenge/${id}`, { method: "DELETE" });
        await fetchChallenges();
        showSuccess("Challenge deleted.");
      } catch (err) {
        console.error("Delete challenge failed:", err);
        showError("Failed to delete challenge.");
      }
    },
    [fetchChallenges, showError, showSuccess]
  );

  // Toggle release / hide a challenge (boolean)
  const toggleChallengeRelease = useCallback(
    async (id: number, currentState: boolean) => {
      try {
        await apiFetch(`/admin/challenge/${id}/toggle`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ released: !currentState }),
        });
        await fetchChallenges();
        showSuccess(currentState ? "Challenge hidden." : "Challenge released.");
      } catch (err) {
        console.error("Toggle release failed:", err);
        showError("Failed to update release status.");
      }
    },
    [fetchChallenges, showError, showSuccess]
  );

  // Bulk release/hide based on selectedChallengeIds
  const bulkToggleRelease = useCallback(
    async (targetState: boolean) => {
      if (selectedChallengeIds.length === 0) return;
      try {
        for (const id of selectedChallengeIds) {
          await apiFetch(`/admin/challenge/${id}/toggle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ released: targetState }),
          });
        }
        await fetchChallenges();
        clearSelection();
        showSuccess(targetState ? "Selected challenges released." : "Selected challenges hidden.");
      } catch (err) {
        console.error("Bulk toggle failed:", err);
        showError("Bulk update failed.");
      }
    },
    [selectedChallengeIds, fetchChallenges, showError, showSuccess]
  );

  /* --------------------------- Team Actions ----------------------- */

  const refreshTeams = useCallback(async () => {
    await fetchTeams();
  }, [fetchTeams]);

  const toggleTeamExpand = (teamId: number) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  const banTeam = useCallback(
    async (teamId: number, durationMinutes: number) => {
      try {
        await apiFetch(`/admin/team/${teamId}/ban`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durationMinutes }),
        });
        await fetchTeams();
        showSuccess(durationMinutes === 0 ? "Team permanently banned." : "Team temporarily banned.");
      } catch (err) {
        console.error("Ban team failed:", err);
        showError("Failed to ban team.");
      }
    },
    [fetchTeams, showError, showSuccess]
  );

  const unbanTeam = useCallback(
    async (teamId: number) => {
      try {
        await apiFetch(`/admin/team/${teamId}/unban`, {
          method: "POST",
        });
        await fetchTeams();
        showSuccess("Team unbanned.");
      } catch (err) {
        console.error("Unban team failed:", err);
        showError("Failed to unban team.");
      }
    },
    [fetchTeams, showError, showSuccess]
  );

  const applyTeamPenalty = useCallback(
    async (teamId: number, penaltyPoints: number) => {
      try {
        await apiFetch(`/admin/team/${teamId}/penalty`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ penalty: penaltyPoints }),
        });
        await fetchTeams();
        showSuccess("Penalty applied.");
      } catch (err) {
        console.error("Apply penalty failed:", err);
        showError("Failed to apply penalty.");
      }
    },
    [fetchTeams, showError, showSuccess]
  );

  /* ------------------------ Modal Helpers ------------------------- */

  function openConfirm(title: string, message: string, onConfirm: () => Promise<void> | void) {
    setConfirmModal({ open: true, title, message, onConfirm });
  }

  function closeConfirm() {
    setConfirmModal({ open: false });
  }

  function openInput(title: string, message: string, label: string, onConfirm: (value: string) => Promise<void> | void) {
    setInputModal({ open: true, title, message, label, onConfirm });
  }

  function closeInput() {
    setInputModal({ open: false });
  }

  /* -------------------------- Memo values ------------------------- */

  const anySelected = selectedChallengeIds.length > 0;

  /* ---------------------------- Render --------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-gray-100">
      {/* Toast notifications */}
      {(errorMsg || successMsg) && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg border backdrop-blur-md shadow-lg flex items-center gap-3 ${
            successMsg ? "bg-green-600/10 border-green-500 text-green-300" : "bg-red-600/10 border-red-500 text-red-300"
          }`}
        >
          {successMsg ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{successMsg || errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center border-b border-green-500/40">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/6 border border-green-500/30 p-3 rounded-xl">
            <Shield className="text-green-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-green-400">Admin Control Center</h1>
            <p className="text-sm text-gray-400">Manage challenges, leaderboards and teams</p>
          </div>
        </div>

        <div className="hidden md:flex gap-4 text-sm">
          <div className="px-3 py-2 bg-gray-800/40 border border-green-600/40 rounded-lg">
            Challenges: <span className="text-green-400 font-bold">{challenges.length}</span>
          </div>
          <div className="px-3 py-2 bg-gray-800/40 border border-blue-600/40 rounded-lg">
            Teams: <span className="text-blue-400 font-bold">{teams.length}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap justify-center gap-3 py-6 border-b border-green-500/30 bg-gray-900/10 backdrop-blur-md">
        {[
          { id: "create", label: "Create Challenge", icon: <PlusCircle /> },
          { id: "manage", label: "Manage Challenges", icon: <Rocket /> },
          { id: "leaderboard", label: "Leaderboard", icon: <Trophy /> },
          { id: "teams", label: "Teams", icon: <Users /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${
              activeTab === t.id ? "bg-green-500/20 text-green-400 border border-green-400/50 shadow-md" : "bg-gray-800/40 text-gray-400 hover:text-green-300 hover:bg-gray-800/60"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto p-8 space-y-10">
        {/* Create Tab */}
        {activeTab === "create" && (
          <form onSubmit={createChallenge} className="p-8 bg-gray-900/60 rounded-2xl border border-green-600/30 backdrop-blur-md shadow-lg space-y-5">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <Target /> Create a New Challenge
            </h2>

            <input
              type="text"
              placeholder="Challenge Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              />

              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              <input
                type="number"
                placeholder="Points"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                min={0}
              />
            </div>

            <input
              type="text"
              placeholder="Flag (e.g. FLAG{...})"
              value={form.flag}
              onChange={(e) => setForm({ ...form, flag: e.target.value })}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <div className="flex items-center justify-between">
              <input
                type="file"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                className="text-sm text-gray-300 bg-gray-800 p-2 rounded-lg border border-gray-700"
              />
              <label className="flex items-center gap-2 text-green-400">
                <input type="checkbox" checked={form.released} onChange={(e) => setForm({ ...form, released: e.target.checked })} />
                Release immediately
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-green-500 py-3 rounded-xl text-black font-bold hover:from-green-500 hover:to-green-400 transition-all">
              {loading ? "Creating..." : "Create Challenge"}
            </button>
          </form>
        )}

        {/* Manage Challenges Tab */}
        {activeTab === "manage" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2"><Rocket /> Manage Challenges</h2>

            {anySelected && (
              <div className="flex items-center gap-3 bg-gray-900/60 border border-green-600/30 p-3 rounded-lg">
                <p className="text-gray-300">{selectedChallengeIds.length} selected</p>
                <button onClick={() => bulkToggleRelease(true)} className="bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-md font-bold">Release Selected</button>
                <button onClick={() => bulkToggleRelease(false)} className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-md font-bold">Hide Selected</button>
                <button onClick={clearSelection} className="text-gray-400 hover:text-gray-200">Clear</button>
              </div>
            )}

            <div className="grid gap-4">
              {fetching && challenges.length === 0 && (
                <div className="text-center text-gray-400 py-12 border border-green-500/20 rounded-xl bg-gray-900/40">Loading challenges...</div>
              )}

              {!fetching && challenges.length === 0 && (
                <div className="text-center text-gray-400 py-12 border border-green-500/20 rounded-xl bg-gray-900/40">No challenges available</div>
              )}

              {challenges.map((c) => (
                <div key={c.id} className={`bg-gray-900/70 border ${selectedChallengeIds.includes(c.id) ? "border-green-500/70" : "border-green-600/30"} p-5 rounded-xl flex justify-between items-center hover:border-green-500/50 transition-all`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selectedChallengeIds.includes(c.id)} onChange={() => toggleSelectChallenge(c.id)} className="mt-1 accent-green-500" />
                    <div>
                      <h3 className="text-white font-bold">{c.name}</h3>
                      <p className="text-sm text-gray-400">{c.category} • {c.difficulty} • <span className="text-yellow-400">{c.points}</span> pts</p>
                      <p className={`text-sm font-semibold mt-1 ${c.released ? "text-green-400" : "text-red-400"}`}>{c.released ? "Released" : "Hidden"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => toggleChallengeRelease(c.id, c.released)} className={`px-4 py-2 rounded-md font-bold flex items-center gap-1 ${c.released ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30"}`}>
                      {c.released ? <EyeOff /> : <Eye />}
                      {c.released ? "Hide" : "Release"}
                    </button>
                    <button onClick={() => openConfirm("Delete Challenge", `Delete "${c.name}"? This action cannot be undone.`, async () => { await deleteChallenge(c.id); closeConfirm(); })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="border border-yellow-500/30 rounded-xl bg-gray-900/50 p-6 backdrop-blur-md">
            <Leaderboard backendUrl={BACKEND_URL} teamId={null} />
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2"><Users /> Team Management</h2>

            {teams.length === 0 && <div className="text-gray-400">No teams found.</div>}

            {teams.map((team) => (
              <div key={team.id} className="bg-gray-900/60 border border-green-500/30 rounded-xl p-5 hover:border-green-500/50 transition-all">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleTeamExpand(team.id)}>
                  <div>
                    <h3 className="text-white font-bold">{team.name}</h3>
                    <p className="text-sm text-gray-400">Score: <span className="text-green-400 font-semibold">{team.totalScore ?? 0}</span> | Solves: <span className="text-yellow-400">{team.solvedCount ?? 0}</span></p>
                  </div>
                  {expandedTeamId === team.id ? <ChevronUp className="w-6 h-6 text-green-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                </div>

                {expandedTeamId === team.id && (
                  <div className="mt-4 border-t border-gray-800 pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Members:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {team.members && team.members.length > 0 ? team.members.map((m) => (
                          <span key={m.id} className="px-3 py-1 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 text-sm">{m.username}</span>
                        )) : <span className="text-gray-500 text-sm">No members yet</span>}
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap mt-3">
                      <button onClick={() => openInput("Temporary Ban", "Enter ban duration in minutes", "Minutes", async (value) => { await banTeam(team.id, Number(value)); closeInput(); })} className="bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-1 rounded-md hover:bg-red-600/30">Temporary Ban</button>

                      <button onClick={() => openConfirm("Permanent Ban", "Permanently ban this team?", async () => { await banTeam(team.id, 0); closeConfirm(); })} className="bg-red-900/30 text-red-400 border border-red-700/30 px-4 py-1 rounded-md hover:bg-red-900/40">Permanent Ban</button>

                      <button onClick={() => openConfirm("Unban Team", "Unban this team?", async () => { await unbanTeam(team.id); closeConfirm(); })} className="bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 px-4 py-1 rounded-md hover:bg-yellow-600/30">Unban</button>

                      <button onClick={() => openInput("Apply Penalty", "Enter penalty points to deduct", "Points", async (value) => { await applyTeamPenalty(team.id, Number(value)); closeInput(); })} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1 rounded-md hover:bg-blue-600/30">Penalty</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title || ""}
        message={confirmModal.message || ""}
        onConfirm={async () => {
          if (confirmModal.onConfirm) await confirmModal.onConfirm();
        }}
        onCancel={() => closeConfirm()}
      />

      <InputModal
        isOpen={inputModal.open}
        title={inputModal.title || ""}
        message={inputModal.message || ""}
        label={inputModal.label || ""}
        onConfirm={async (value: string) => {
          if (inputModal.onConfirm) await inputModal.onConfirm(value);
        }}
        onCancel={() => closeInput()}
      />
    </div>
  );
}
