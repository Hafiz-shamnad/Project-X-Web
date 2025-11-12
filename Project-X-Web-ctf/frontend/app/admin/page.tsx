"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<
    "create" | "deploy" | "leaderboard" | "teams"
  >("create");

  const backendURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<number[]>([]);

const handleSelect = (id: number) => {
  setSelectedChallenges((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
};

const bulkRelease = async (release: boolean) => {
  for (const id of selectedChallenges) {
    await toggleRelease(id, !release);
  }
  setSelectedChallenges([]);
};


  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [inputModal, setInputModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    label: "",
    onConfirm: (value: string) => {},
  });

  const [loading, setLoading] = useState(false);

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

  // 🧩 Fetch data
  const fetchChallenges = async () => {
    const data = await apiFetch("/admin/challenges");
    setChallenges(data);
  };
  const fetchTeams = async () => {
    const data = await apiFetch("/admin/teams");
    setTeams(data);
  };
  useEffect(() => {
    fetchChallenges();
    fetchTeams();
  }, []);

  // 🧱 Create Challenge
  const addChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null) formData.append(key, String(val));
      });
      const res = await fetch(`${backendURL}/admin/challenge`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchChallenges();
      setSuccess("✅ Challenge created successfully!");
      setTimeout(() => setSuccess(null), 3000);
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
      console.error(err);
      setError("Failed to upload challenge");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (id: number) => {
    try {
      await apiFetch(`/admin/challenge/${id}`, { method: "DELETE" });
      await fetchChallenges();
      setSuccess("🗑️ Challenge deleted");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to delete challenge");
    }
  };

  const toggleRelease = async (id: number, current: boolean) => {
    try {
      await apiFetch(`/admin/challenge/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ released: !current }),
        headers: { "Content-Type": "application/json" },
      });
      await fetchChallenges();
      setSuccess(current ? "🛑 Challenge hidden" : "🚀 Challenge released!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to toggle release status");
    }
  };

  const toggleTeamExpand = (teamId: number) =>
    setExpandedTeam(expandedTeam === teamId ? null : teamId);

  const openModal = (title: string, message: string, onConfirm: () => void) =>
    setModal({ isOpen: true, title, message, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const openInputModal = (
    title: string,
    message: string,
    label: string,
    onConfirm: (value: string) => void
  ) => setInputModal({ isOpen: true, title, message, label, onConfirm });
  const closeInputModal = () => setInputModal({ ...inputModal, isOpen: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-gray-100">
      {/* ✅ Notification Toast */}
      {(error || success) && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg border backdrop-blur-md shadow-lg flex items-center gap-3 transition-all ${
            success
              ? "bg-green-500/20 border-green-400 text-green-400"
              : "bg-red-500/20 border-red-400 text-red-400"
          }`}
        >
          {success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold tracking-wide">
            {success || error}
          </span>
        </div>
      )}

      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center border-b border-green-500/40">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 border border-green-500/40 p-3 rounded-xl">
            <Shield className="text-green-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-green-400">
              Admin Control Center
            </h1>
            <p className="text-sm text-gray-400">
              Manage challenges, leaderboard & teams
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-sm">
          <div className="px-3 py-2 bg-gray-800/40 border border-green-600/40 rounded-lg">
            Challenges:{" "}
            <span className="text-green-400 font-bold">
              {challenges.length}
            </span>
          </div>
          <div className="px-3 py-2 bg-gray-800/40 border border-blue-600/40 rounded-lg">
            Teams:{" "}
            <span className="text-blue-400 font-bold">{teams.length}</span>
          </div>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="flex flex-wrap justify-center gap-3 py-6 border-b border-green-500/30 bg-gray-900/20 backdrop-blur-md">
        {[
          { id: "create", label: "Create Challenge", icon: <PlusCircle /> },
          { id: "deploy", label: "Manage Challenges", icon: <Rocket /> },
          { id: "leaderboard", label: "Leaderboard", icon: <Trophy /> },
          { id: "teams", label: "Teams", icon: <Users /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? "bg-green-500/20 text-green-400 border border-green-400/50 shadow-md"
                : "bg-gray-800/40 text-gray-400 hover:text-green-300 hover:bg-gray-800/60"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto p-8 space-y-10">
        {/* CREATE TAB */}
        {activeTab === "create" && (
          <form
            onSubmit={addChallenge}
            className="p-8 bg-gray-900/60 rounded-2xl border border-green-600/30 backdrop-blur-md shadow-lg space-y-5"
          >
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <Target /> Create a New Challenge
            </h2>

            <input
              type="text"
              placeholder="Challenge Name"
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Category"
                className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <select
                className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <input
                type="number"
                placeholder="Points"
                className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                value={form.points}
                onChange={(e) =>
                  setForm({ ...form, points: Number(e.target.value) })
                }
              />
            </div>

            <input
              type="text"
              placeholder="Flag (FLAG{example_flag_here})"
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              value={form.flag}
              onChange={(e) => setForm({ ...form, flag: e.target.value })}
            />

            <div className="flex items-center justify-between">
              <input
                type="file"
                className="text-sm text-gray-300 bg-gray-800 p-2 rounded-lg border border-gray-700"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] || null })
                }
              />
              <label className="flex items-center gap-2 text-green-400">
                <input
                  type="checkbox"
                  checked={form.released}
                  onChange={(e) =>
                    setForm({ ...form, released: e.target.checked })
                  }
                />
                Release immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 py-3 rounded-xl text-black font-bold hover:from-green-500 hover:to-green-400 transition-all"
            >
              {loading ? "Creating..." : "Create Challenge"}
            </button>
          </form>
        )}

        {/* DEPLOY TAB */}
{activeTab === "deploy" && (
  <section className="space-y-6">
    <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
      <Rocket /> Manage Challenges
    </h2>

    {/* Bulk Action Buttons */}
    {selectedChallenges.length > 0 && (
      <div className="flex items-center gap-3 bg-gray-900/60 border border-green-600/30 p-3 rounded-lg">
        <p className="text-gray-300">
          {selectedChallenges.length} selected
        </p>
        <button
          onClick={() => bulkRelease(true)}
          className="bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-md hover:bg-green-500/30 font-bold"
        >
          🚀 Release Selected
        </button>
        <button
          onClick={() => bulkRelease(false)}
          className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-md hover:bg-red-500/30 font-bold"
        >
          🕶 Hide Selected
        </button>
        <button
          onClick={() => setSelectedChallenges([])}
          className="text-gray-400 hover:text-gray-200"
        >
          Clear
        </button>
      </div>
    )}

    <div className="grid gap-4">
      {challenges.length === 0 && (
        <div className="text-center text-gray-400 py-12 border border-green-500/20 rounded-xl bg-gray-900/40">
          No challenges available yet
        </div>
      )}

      {challenges.map((c) => (
        <div
          key={c.id}
          className={`bg-gray-900/70 border ${
            selectedChallenges.includes(c.id)
              ? "border-green-500/70"
              : "border-green-600/30"
          } p-5 rounded-xl flex justify-between items-center hover:border-green-500/50 transition-all`}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedChallenges.includes(c.id)}
              onChange={() => handleSelect(c.id)}
              className="mt-1 accent-green-500"
            />
            <div>
              <h3 className="text-white font-bold">{c.name}</h3>
              <p className="text-sm text-gray-400">
                {c.category} • {c.difficulty} •{" "}
                <span className="text-yellow-400">{c.points}</span> pts
              </p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  c.released ? "text-green-400" : "text-red-400"
                }`}
              >
                {c.released ? "🟢 Released" : "🔴 Hidden"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleRelease(c.id, c.released)}
              className={`px-4 py-2 rounded-md font-bold flex items-center gap-1 ${
                c.released
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30"
              }`}
            >
              {c.released ? <EyeOff /> : <Eye />}
              {c.released ? "Hide" : "Release"}
            </button>
            <button
              onClick={() => deleteChallenge(c.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div className="border border-yellow-500/30 rounded-xl bg-gray-900/50 p-6 backdrop-blur-md">
            <Leaderboard backendUrl={backendURL} teamId={null} />
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === "teams" && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <Users /> Team Management
            </h2>
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-gray-900/60 border border-green-500/30 rounded-xl p-5 hover:border-green-500/50 transition-all"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleTeamExpand(team.id)}
                >
                  <div>
                    <h3 className="text-white font-bold">{team.name}</h3>
                    <p className="text-sm text-gray-400">
                      🏆 Score:{" "}
                      <span className="text-green-400 font-semibold">
                        {team.totalScore || 0}
                      </span>{" "}
                      | Solves:{" "}
                      <span className="text-yellow-400">
                        {team.solvedCount || 0}
                      </span>
                    </p>
                  </div>
                  {expandedTeam === team.id ? (
                    <ChevronUp className="w-6 h-6 text-green-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {expandedTeam === team.id && (
                  <div className="mt-4 border-t border-gray-800 pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Members:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {team.members?.length ? (
                          team.members.map((m: any) => (
                            <span
                              key={m.id}
                              className="px-3 py-1 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 text-sm"
                            >
                              {m.username}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No members yet
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      <button
                        onClick={() =>
                          openInputModal(
                            "Ban Team",
                            "Enter ban duration in minutes (0 = permanent):",
                            "Duration (minutes)",
                            async (minutes) => {
                              const res = await fetch(
                                `${backendURL}/admin/team/${team.id}/ban`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  credentials: "include",
                                  body: JSON.stringify({
                                    durationMinutes: Number(minutes),
                                  }),
                                }
                              );
                              closeInputModal();
                              res.ok
                                ? fetchTeams()
                                : alert("Failed to ban team");
                            }
                          )
                        }
                        className="bg-red-600/30 text-red-400 border border-red-500/40 px-4 py-1 rounded-md hover:bg-red-600/40"
                      >
                        🚫 Ban
                      </button>
                      <button
                        onClick={() =>
                          openModal(
                            "Unban Team",
                            "Are you sure you want to unban this team?",
                            async () => {
                              const res = await fetch(
                                `${backendURL}/admin/team/${team.id}/unban`,
                                { method: "POST" }
                              );
                              closeModal();
                              res.ok
                                ? fetchTeams()
                                : alert("Failed to unban team");
                            }
                          )
                        }
                        className="bg-yellow-600/30 text-yellow-400 border border-yellow-500/40 px-4 py-1 rounded-md hover:bg-yellow-600/40"
                      >
                        ♻️ Unban
                      </button>
                      <button
                        onClick={() =>
                          openInputModal(
                            "Apply Penalty",
                            "Enter penalty points to deduct:",
                            "Points",
                            async (penalty) => {
                              const res = await fetch(
                                `${backendURL}/admin/team/${team.id}/penalty`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  credentials: "include",
                                  body: JSON.stringify({
                                    penalty: Number(penalty),
                                  }),
                                }
                              );
                              closeInputModal();
                              if (res.ok) {
                                alert("⚖️ Penalty applied successfully!");
                                fetchTeams();
                              } else {
                                const data = await res.json().catch(() => ({}));
                                alert(data.error || "Failed to apply penalty");
                              }
                            }
                          )
                        }
                        className="bg-blue-600/30 text-blue-400 border border-blue-500/40 px-4 py-1 rounded-md hover:bg-blue-600/40"
                      >
                        ⚖️ Penalty
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* MODALS */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        message={inputModal.message}
        label={inputModal.label}
        onConfirm={inputModal.onConfirm}
        onCancel={closeInputModal}
      />
    </div>
  );
}
