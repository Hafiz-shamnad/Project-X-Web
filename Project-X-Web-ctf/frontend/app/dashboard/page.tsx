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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FlagModal from "../components/FlagModal";
import Leaderboard from "../components/Leaderboard"; // ✅ reusable component

interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
}

interface SolvedChallenge {
  challengeId: number;
  createdAt?: string;
  challenge?: Challenge;
}

export default function ProjectXCTF() {
  const [activeTab, setActiveTab] = useState<"challenges" | "leaderboard">(
    "challenges"
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);
  const [username, setUsername] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);

  const backendURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // ✅ Fetch user info (username + teamId)
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
        console.error("⚠️ Error fetching user info:", err);
      }
    };
    fetchUser();
  }, [backendURL]);

  // ✅ Fetch challenges + solved status (team-level if part of a team)
  const fetchChallengesAndSolves = async () => {
    try {
      const challengeRes = await fetch(`${backendURL}/challenges`, {
        credentials: "include",
      });
      const challengeData: Challenge[] = await challengeRes.json();
      setChallenges(challengeData);

      // If user is in a team → fetch team solves
      const solveRes = teamId
        ? await fetch(`${backendURL}/team/${teamId}/solves`, {
            credentials: "include",
          })
        : await fetch(`${backendURL}/user/${username}`, {
            credentials: "include",
          });

      const solveData = await solveRes.json();
      const solvedList =
        (solveData.solved as SolvedChallenge[] | undefined)?.map(
          (s) => s.challengeId
        ) || [];
      setSolvedChallenges(solvedList);
    } catch (err) {
      console.error("❌ Error fetching challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    fetchChallengesAndSolves();
    const interval = setInterval(fetchChallengesAndSolves, 60000);
    return () => clearInterval(interval);
  }, [username, teamId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
        <Terminal className="w-8 h-8 mr-2 animate-spin" /> Loading CTF data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500">
      <Toaster position="top-right" />

      {/* 🧠 HERO */}
      <div className="bg-black py-16 border-b border-green-500 text-center">
        <Terminal className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-4xl font-bold mb-4">
          <span className="text-white">CAPTURE THE </span>
          <span className="text-green-500">FLAG</span>
        </h2>
        <p className="text-green-300 text-lg max-w-2xl mx-auto">
          Real-time CTF scoreboard — track your team’s dominance and progress!
        </p>
      </div>

      {/* 🧭 TABS */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex space-x-4 border-b border-green-500">
          {["challenges", "leaderboard"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-bold ${
                activeTab === tab
                  ? "border-b-2 border-green-500 text-green-500"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              {tab === "challenges" ? (
                <>
                  <Target className="w-4 h-4 inline-block mr-2" /> CHALLENGES
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 inline-block mr-2" /> LEADERBOARD
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 🧩 CHALLENGES TAB */}
      {activeTab === "challenges" && (
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-gray-900 border border-green-500 rounded-lg p-6 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {solvedChallenges.includes(challenge.id) ? (
                    <Unlock className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-green-500">
                    {challenge.category}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${getDifficultyColor(
                    challenge.difficulty
                  )}`}
                >
                  {challenge.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 text-white">
                {challenge.name}
              </h3>
              <p className="text-green-300 text-sm mb-4">
                {challenge.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">{challenge.points} pts</span>
                </div>
                <button
                  onClick={() => {
                    setActiveChallenge(challenge.id);
                    setFlagModalOpen(true);
                  }}
                  className={`px-4 py-2 rounded font-bold transition-colors ${
                    solvedChallenges.includes(challenge.id)
                      ? "bg-green-500 text-black hover:bg-green-400"
                      : "bg-gray-800 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black"
                  }`}
                >
                  {solvedChallenges.includes(challenge.id) ? "SOLVED" : "HACK"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🏆 TEAM-LEVEL LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <Leaderboard backendUrl={backendURL} teamId={null} />
      )}

      {/* 🚩 FLAG MODAL */}
      <FlagModal
        open={flagModalOpen}
        onClose={() => {
          setFlagModalOpen(false);
          setActiveChallenge(null);
        }}
        onSuccess={async (data) => {
          if (data.status === "correct" && activeChallenge) {
            toast.success(`Challenge #${activeChallenge} solved! 🏆`);
            setSolvedChallenges((prev) =>
              prev.includes(activeChallenge) ? prev : [...prev, activeChallenge]
            );
            await fetchChallengesAndSolves();
          }
        }}
        username={username}
        challengeId={activeChallenge}
        backendUrl={backendURL}
      />

      {/* 🧱 FOOTER */}
      <footer className="border-t border-green-500 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p className="text-sm">
            <span className="text-green-500">&gt;</span> PROJECT_X CTF Platform
            | <span className="text-green-500">root@localhost</span>:~# hack_the_planet
          </p>
        </div>
      </footer>
    </div>
  );
}
