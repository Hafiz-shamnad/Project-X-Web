"use client";

import React, { useEffect, useState } from "react";
import {
  Terminal,
  Lock,
  Unlock,
  Flag,
  Trophy,
  Target,
  Zap,
  Shield,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FlagModal from "../components/FlagModal";
import Leaderboard from "../components/Leaderboard";

interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  released?: boolean;
}

export default function ProjectXCTF() {
  const [activeTab, setActiveTab] = useState<"challenges" | "leaderboard">(
    "challenges"
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [username, setUsername] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // 🧠 Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${backendURL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user?.username) {
          setUsername(data.user.username);
          setTeamId(data.user.teamId ?? null);
        }
      } catch (err) {
        console.error("⚠️ Error fetching user:", err);
      }
    };
    fetchUser();
  }, [backendURL]);

  // 🧩 Fetch Challenges
  const fetchChallenges = async () => {
    try {
      const challengeRes = await fetch(`${backendURL}/challenges`, {
        credentials: "include",
      });
      const challengeData: Challenge[] = await challengeRes.json();
      setChallenges(challengeData.filter((c) => c.released));

      const solveRes = await fetch(`${backendURL}/team/${teamId}/solves`, {
        credentials: "include",
      });
      const solveData = await solveRes.json();
      const solvedIds =
        solveData?.solved?.map((s: { challengeId: number }) => s.challengeId) ||
        [];
      setSolvedChallenges(solvedIds);
    } catch (err) {
      console.error("❌ Error fetching challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchChallenges();
  }, [username]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
        <Terminal className="w-8 h-8 mr-2 animate-spin" /> Loading CTF Arena...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-green-400 font-mono">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-green-500/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-400" />
          <h1 className="text-2xl font-bold text-green-400">
            PROJECT_X CTF ARENA
          </h1>
        </div>
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-5 py-2 rounded-md font-semibold transition-all ${
              activeTab === "challenges"
                ? "bg-green-500/20 border border-green-500 text-green-400"
                : "text-gray-400 hover:text-green-400"
            }`}
          >
            <Target className="inline w-4 h-4 mr-1" /> Challenges
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-5 py-2 rounded-md font-semibold transition-all ${
              activeTab === "leaderboard"
                ? "bg-yellow-500/20 border border-yellow-500 text-yellow-400"
                : "text-gray-400 hover:text-yellow-400"
            }`}
          >
            <Trophy className="inline w-4 h-4 mr-1" /> Leaderboard
          </button>
        </div>
      </header>

      {/* 💻 LAYOUT */}
      {activeTab === "challenges" ? (
        <main className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
          {/* LEFT: Challenge List */}
          <aside className="md:w-1/3 lg:w-1/4 bg-gray-950 border-r border-green-500/20 overflow-y-auto no-scrollbar">
            <div className="p-4 border-b border-green-500/20">
              <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
                <Target className="w-5 h-5" /> Challenges
              </h2>
            </div>

            <div className="divide-y divide-green-900/40">
              {challenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChallenge(c)}
                  className={`w-full text-left p-4 hover:bg-green-500/10 transition-all ${
                    selectedChallenge?.id === c.id
                      ? "bg-green-500/20 border-l-4 border-green-500"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-200">{c.name}</span>
                    <span
                      className={`text-xs font-bold ${getDifficultyColor(
                        c.difficulty
                      )}`}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Zap className="w-3 h-3" /> {c.points} pts
                    {solvedChallenges.includes(c.id) && (
                      <span className="text-green-500 text-xs">✓ Solved</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT: Challenge Detail */}
          <section className="flex-1 p-6 overflow-y-auto backdrop-blur-sm">
            {selectedChallenge ? (
              <div className="bg-gray-900/60 border border-green-500/30 rounded-xl p-8 shadow-lg backdrop-blur-lg h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedChallenge.name}
                  </h2>
                  <span
                    className={`text-sm font-semibold ${getDifficultyColor(
                      selectedChallenge.difficulty
                    )}`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                </div>

                <div className="text-gray-400 text-sm mb-6">
                  <p>{selectedChallenge.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {selectedChallenge.points} Points
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-green-400" />
                    {selectedChallenge.category}
                  </div>
                </div>

                <button
                  onClick={() => setFlagModalOpen(true)}
                  className={`px-6 py-3 rounded-md font-bold text-black transition-all ${
                    solvedChallenges.includes(selectedChallenge.id)
                      ? "bg-green-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                  }`}
                  disabled={solvedChallenges.includes(selectedChallenge.id)}
                >
                  {solvedChallenges.includes(selectedChallenge.id)
                    ? "✔ Already Solved"
                    : "Submit Flag"}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <ArrowLeft className="w-8 h-8 mb-3 text-green-500" />
                <p>Select a challenge from the list to view details</p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <div className="p-6">
          <Leaderboard backendUrl={backendURL} teamId={null} />
        </div>
      )}

      {/* FLAG MODAL */}
      <FlagModal
        open={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSuccess={async (data) => {
          if (data.status === "correct") {
            toast.success("Correct Flag! 🏆");
            fetchChallenges();
          } else {
            toast.error("Wrong flag. Try again.");
          }
        }}
        username={username}
        challengeId={selectedChallenge?.id ?? null}
        backendUrl={backendURL}
      />
    </div>
  );
}
