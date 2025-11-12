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
} from "lucide-react";
import Leaderboard from "../components/Leaderboard";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<
    "create" | "deploy" | "leaderboard" | "teams"
  >("create");

  const backendURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
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

  // 🧩 Fetch Challenges
  const fetchChallenges = async () => {
    const data = await apiFetch("/admin/challenges");
    setChallenges(data);
  };

  // 🧩 Fetch Teams
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
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("difficulty", form.difficulty);
      formData.append("points", String(form.points));
      formData.append("flag", form.flag);
      formData.append("released", String(form.released));
      if (form.file) formData.append("file", form.file);

      const res = await fetch(`${backendURL}/admin/challenge`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchChallenges();

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
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (id: number) => {
    try {
      await apiFetch(`/admin/challenge/${id}`, { method: "DELETE" });
      await fetchChallenges();
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  // 🟢 Toggle release / stop
  const toggleRelease = async (id: number, current: boolean) => {
    try {
      await apiFetch(`/admin/challenge/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ released: !current }),
        headers: { "Content-Type": "application/json" },
      });
      await fetchChallenges();
    } catch (err) {
      console.error("❌ Toggle failed:", err);
    }
  };

  // 🧩 Toggle Team Expansion
  const toggleTeamExpand = async (teamId: number) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      // Optionally fetch team details if not cached
      setExpandedTeam(teamId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-10">
      <div className="flex items-center justify-between border-b border-green-500 pb-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" /> ADMIN PANEL
        </h1>
      </div>

      {/* 🧭 NAVIGATION */}
      <div className="flex border-b border-green-500 mb-8">
        {[
          {
            id: "create",
            icon: <Target className="w-4 h-4 mr-2" />,
            label: "Create",
          },
          {
            id: "deploy",
            icon: <Rocket className="w-4 h-4 mr-2" />,
            label: "Deploy",
          },
          {
            id: "leaderboard",
            icon: <Trophy className="w-4 h-4 mr-2" />,
            label: "Leaderboard",
          },
          {
            id: "teams",
            icon: <Users className="w-4 h-4 mr-2" />,
            label: "Teams",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-bold uppercase flex items-center ${
              activeTab === tab.id
                ? "border-b-2 border-green-500 text-green-500"
                : "text-gray-500 hover:text-green-400"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🧱 TAB 1: CREATE */}
      {activeTab === "create" && (
        <form
          onSubmit={addChallenge}
          className="space-y-3 mb-10 border border-green-500 p-6 rounded-lg"
        >
          <h2 className="text-xl font-bold">Add New Challenge</h2>

          <input
            type="text"
            placeholder="Challenge Name"
            className="w-full p-2 bg-gray-900 text-white border border-green-600 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            placeholder="Description"
            className="w-full p-2 bg-gray-900 text-white border border-green-600 rounded"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Category"
              className="flex-1 p-2 bg-gray-900 text-white border border-green-600 rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <select
              className="p-2 bg-gray-900 text-white border border-green-600 rounded"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input
              type="number"
              placeholder="Points"
              className="w-24 p-2 bg-gray-900 text-white border border-green-600 rounded"
              value={form.points}
              onChange={(e) =>
                setForm({ ...form, points: Number(e.target.value) })
              }
            />
          </div>

          <input
            type="text"
            placeholder="Flag (FLAG{example})"
            className="w-full p-2 bg-gray-900 text-white border border-green-600 rounded"
            value={form.flag}
            onChange={(e) => setForm({ ...form, flag: e.target.value })}
          />

          <input
            type="file"
            className="w-full bg-gray-900 text-white border border-green-600 rounded p-2"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files?.[0] || null })
            }
          />

          <label className="flex items-center gap-2 text-green-400">
            <input
              type="checkbox"
              checked={form.released}
              onChange={(e) => setForm({ ...form, released: e.target.checked })}
            />
            Release now?
          </label>

          <button
            type="submit"
            className="bg-green-500 text-black font-bold px-6 py-2 rounded hover:bg-green-400"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Add Challenge"}
          </button>
        </form>
      )}

      {/* 🚀 TAB 2: DEPLOY */}
      {activeTab === "deploy" && (
        <>
          <h2 className="text-2xl font-bold mb-4">Manage Challenges</h2>
          <div className="grid gap-4">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="bg-gray-900 border border-green-500 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-white font-bold">{c.name}</h3>
                  <p className="text-green-400 text-sm">
                    {c.category} • {c.difficulty} • {c.points} pts
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      c.released ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {c.released ? "🟢 Released" : "🔴 Hidden"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleRelease(c.id, c.released)}
                    className={`px-4 py-1 rounded font-bold ${
                      c.released
                        ? "bg-red-500 text-black hover:bg-red-400"
                        : "bg-green-500 text-black hover:bg-green-400"
                    }`}
                  >
                    {c.released ? "Stop" : "Release"}
                  </button>
                  <button
                    onClick={() => deleteChallenge(c.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🏆 TAB 3: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="border border-green-500 rounded-lg p-6">
          <Leaderboard backendUrl={backendURL} teamId={null} />
        </div>
      )}

      {/* 👥 TAB 4: TEAMS */}
      {activeTab === "teams" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Team Management</h2>

          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-gray-900 border border-green-500 rounded-lg p-4"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleTeamExpand(team.id)}
                >
                  <div>
                    <h3 className="text-white font-bold">{team.name}</h3>
                    <p className="text-green-400 text-sm">
                      🏆 Score: {team.totalScore || 0}
                    </p>
                  </div>
                  {expandedTeam === team.id ? (
                    <ChevronUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-green-400" />
                  )}
                </div>

                {expandedTeam === team.id && (
                  <div className="mt-4 border-t border-green-700 pt-3">
                    <p className="text-sm text-gray-400 mb-2">Members:</p>
                    <ul className="list-disc list-inside text-green-300">
                      {team.members?.length ? (
                        team.members.map((m: any) => (
                          <li key={m.id}>{m.username}</li>
                        ))
                      ) : (
                        <li>No members</li>
                      )}
                    </ul>
                    <p className="text-sm mt-3 text-gray-400">
                      Challenges Solved:{" "}
                      <span className="text-green-400">
                        {team.solvedCount || 0}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
