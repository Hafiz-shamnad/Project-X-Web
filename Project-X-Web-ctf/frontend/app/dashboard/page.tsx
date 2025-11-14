"use client";

import React, { useEffect, useState } from "react";
import {
  Terminal,
  Lock,
  Shield,
  Flag,
  Trophy,
  Target,
  Zap,
  ArrowLeft,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FlagModal from "../components/FlagModal";
import Leaderboard from "../components/Leaderboard";

/**
 * Challenge Interface
 * Defines the shape of challenge objects returned by backend APIs.
 */
interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  released?: boolean;
  hasContainer?: boolean;
}

export default function ProjectXCTF() {
  // ===========================================================================
  // State Management
  // ===========================================================================

  /**
   * UI tab state: challenges list vs leaderboard.
   */
  const [activeTab, setActiveTab] = useState<"challenges" | "leaderboard">(
    "challenges"
  );

  /**
   * Challenge dataset and solved challenge IDs.
   */
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);

  /**
   * Challenge currently selected in the sidebar.
   */
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );

  /**
   * Authenticated user's profile info.
   */
  const [username, setUsername] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);

  /**
   * Flag submission modal state.
   */
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  /**
   * Loading indicators for initial load and environment spawning.
   */
  const [loading, setLoading] = useState(true);
  const [spawnLoading, setSpawnLoading] = useState(false);

  /**
   * Active challenge container instance details.
   */
  const [instance, setInstance] = useState<{
    port: number;
    url: string;
    expiresAt: string;
  } | null>(null);

  /**
   * Live countdown timers for:
   *  - Challenge environment TTL
   *  - Temporary team bans
   */
  const [remainingInstanceSeconds, setRemainingInstanceSeconds] = useState<
    number | null
  >(null);

  const [bannedInfo, setBannedInfo] = useState<{
    bannedUntil: string | null;
  } | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  /**
   * Backend base URL used for all API requests.
   */
  const backendURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // ===========================================================================
  // User Profile Fetch (Includes Ban Status)
  // ===========================================================================

  /**
   * Retrieves authenticated user profile, including ban metadata.
   */
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`${backendURL}/auth/me`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data.user?.username) {
          setUsername(data.user.username);
          setTeamId(data.user.teamId ?? null);

          setBannedInfo({
            bannedUntil: data.user.bannedUntil,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    getUser();
  }, [backendURL]);

  // ===========================================================================
  // Temporary Ban Countdown Logic
  // ===========================================================================

  /**
   * Starts a 1-second interval timer to update temporary ban countdown.
   */
  useEffect(() => {
    if (!bannedInfo?.bannedUntil) return;

    const bannedUntil = new Date(bannedInfo.bannedUntil).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((bannedUntil - now) / 1000));
      setRemainingSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [bannedInfo]);

  /**
   * Formats seconds as mm:ss for countdown displays.
   */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ===========================================================================
  // Challenge Fetch + Team Solve Status
  // ===========================================================================

  /**
   * Loads challenge list + solved challenge IDs for the user's team.
   */
  const fetchChallenges = async () => {
    try {
      const res = await fetch(`${backendURL}/challenges`, {
        credentials: "include",
      });

      const data: Challenge[] = await res.json();

      // Filter to only released challenges
      setChallenges(data.filter((c) => c.released));

      // Load solve status if team exists
      if (teamId) {
        const solvedRes = await fetch(`${backendURL}/team/${teamId}/solves`, {
          credentials: "include",
        });

        const solvedData = await solvedRes.json();

        setSolvedChallenges(
          solvedData?.solved?.map(
            (s: { challengeId: number }) => s.challengeId
          ) || []
        );
      }
    } catch (err) {
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchChallenges();
  }, [username]);

  // ===========================================================================
  // Challenge Instance Loading
  // ===========================================================================

  /**
   * Fetches existing environment instance for the selected challenge.
   * Used to restore state on page refresh.
   */
  useEffect(() => {
    if (!selectedChallenge) return;

    const fetchInstance = async () => {
      try {
        const res = await fetch(
          `${backendURL}/challenges/instance/${selectedChallenge.id}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.status === "running") {
          setInstance({
            port: data.port,
            url: data.url,
            expiresAt: data.expiresAt,
          });

          const diff = Math.max(
            0,
            Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
          );
          setRemainingInstanceSeconds(diff);
        } else {
          setInstance(null);
        }
      } catch (err) {
        console.error("Error loading instance:", err);
      }
    };

    fetchInstance();
  }, [selectedChallenge]);

  // ===========================================================================
  // Challenge Instance Countdown Timer
  // ===========================================================================

  /**
   * Runs a 1-second countdown for the active container TTL.
   */
  useEffect(() => {
    if (!remainingInstanceSeconds) return;

    const interval = setInterval(() => {
      setRemainingInstanceSeconds((sec) => {
        if (sec === null) return null;
        if (sec <= 0) {
          setInstance(null); // environment expired
          return null;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingInstanceSeconds]);

  // ===========================================================================
  // Ban Computation Helpers
  // ===========================================================================

  const bannedUntil = bannedInfo?.bannedUntil
    ? new Date(bannedInfo.bannedUntil)
    : null;

  const isPermanentBanned = bannedUntil && bannedUntil.getFullYear() >= 9999;

  const isTempBanned =
    bannedUntil &&
    !isPermanentBanned &&
    bannedUntil.getTime() > Date.now() &&
    remainingSeconds !== null &&
    remainingSeconds > 0;

  // ===========================================================================
  // Difficulty Badge Styling Helper
  // ===========================================================================

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

  // ===========================================================================
  // Loading Screen
  // ===========================================================================

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
        <Terminal className="w-8 h-8 mr-2 animate-spin" /> Loading CTF Arena...
      </div>
    );

  // ===========================================================================
  // Temporary Ban UI
  // ===========================================================================

  if (isTempBanned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-400 font-mono">
        <Shield className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold mb-2">Team Temporarily Banned</h1>
        <p className="text-lg mb-4">
          You may continue after the following time:
        </p>

        <div className="text-6xl font-bold text-red-300 mb-6">
          {formatTime(remainingSeconds)}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 border border-red-500 rounded-lg hover:bg-red-500 hover:text-black transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  // ===========================================================================
  // Permanent Ban UI
  // ===========================================================================

  if (isPermanentBanned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-400 font-mono">
        <Lock className="w-16 h-16 text-red-600 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold mb-2">Team Permanently Banned</h1>
        <p className="text-lg mb-6">Please contact an administrator.</p>

        <button
          onClick={() => (window.location.href = "/contact-admin")}
          className="px-6 py-2 border border-red-500 rounded-lg hover:bg-red-500 hover:text-black transition"
        >
          Contact Admin
        </button>
      </div>
    );
  }

  // ===========================================================================
  // Main CTF Application Layout
  // ===========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-green-400 font-mono">
      <Toaster position="top-right" />

      {/* Header Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-green-500/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-400" />
          <h1 className="text-2xl font-bold">PROJECT_X CTF ARENA</h1>
        </div>

        <div className="flex gap-3 text-sm">
          {/* Tab: Challenges */}
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

          {/* Tab: Leaderboard */}
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

      {/* Conditional Rendering: Challenges or Leaderboard */}
      {activeTab === "challenges" ? (
        <main className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
          {/* -------------------------------------------------------------------
              Left Sidebar: Challenge List
             ------------------------------------------------------------------- */}
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
                      <span className="text-green-500 text-xs">Solved</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* -------------------------------------------------------------------
              Right Panel: Challenge Details + Environment Controls
             ------------------------------------------------------------------- */}
          <section className="flex-1 p-6 overflow-y-auto backdrop-blur-sm">
            {selectedChallenge ? (
              <div className="bg-gray-900/60 border border-green-500/30 rounded-xl p-8 shadow-lg backdrop-blur-lg h-full">
                {/* Challenge Title + Difficulty */}
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

                {/* Challenge Description */}
                <p className="text-gray-400 text-sm mb-6">
                  {selectedChallenge.description}
                </p>

                {/* Meta: Points + Category */}
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

                {/* 🔥 Show ONLY if challenge uses Docker container */}
                {selectedChallenge.hasContainer && (
                  <>
                    {/* Spawn Instance Button */}
                    <button
                      disabled={spawnLoading || !!instance}
                      onClick={async () => {
                        setSpawnLoading(true);

                        try {
                          const res = await fetch(
                            `${backendURL}/challenges/spawn/${selectedChallenge.id}`,
                            { method: "POST", credentials: "include" }
                          );

                          const data = await res.json();

                          if (
                            data.status === "created" ||
                            data.status === "running"
                          ) {
                            setInstance({
                              port: data.port,
                              url: data.url,
                              expiresAt: data.expiresAt,
                            });

                            const diff = Math.max(
                              0,
                              Math.floor(
                                (new Date(data.expiresAt).getTime() -
                                  Date.now()) /
                                  1000
                              )
                            );

                            setRemainingInstanceSeconds(diff);
                            toast.success("Challenge environment ready!");
                          }
                        } catch (err) {
                          toast.error("Failed to start container");
                        }

                        setSpawnLoading(false);
                      }}
                      className={`px-6 py-3 mt-4 rounded-md font-bold transition-all ${
                        instance
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-500 text-black"
                      }`}
                    >
                      {spawnLoading
                        ? "Spawning..."
                        : instance
                        ? "Environment Active"
                        : "Start Challenge Environment"}
                    </button>

                    {/* Active Environment Display */}
                    {instance && (
                      <div className="mt-6 p-4 bg-black/50 border border-green-500 rounded-lg">
                        <h3 className="text-lg font-bold text-green-300 mb-2">
                          Challenge Instance
                        </h3>

                        <p className="text-gray-300 text-sm">
                          Access URL:{" "}
                          <a
                            href={instance.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 underline"
                          >
                            {instance.url}
                          </a>
                        </p>

                        <p className="text-gray-400 text-sm mt-2">
                          Remaining Time:{" "}
                          <span className="text-green-300 font-bold">
                            {remainingInstanceSeconds !== null
                              ? formatTime(remainingInstanceSeconds)
                              : "Expired"}
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Flag Submit */}
                <button
                  onClick={() => setFlagModalOpen(true)}
                  disabled={solvedChallenges.includes(selectedChallenge.id)}
                  className={`px-6 py-3 mt-6 rounded-md font-bold text-black transition-all ${
                    solvedChallenges.includes(selectedChallenge.id)
                      ? "bg-green-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                  }`}
                >
                  {solvedChallenges.includes(selectedChallenge.id)
                    ? "Already Solved"
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
        // Leaderboard Tab
        <div className="p-6">
          <Leaderboard backendUrl={backendURL} teamId={null} />
        </div>
      )}

      {/* Flag Submission Modal */}
      <FlagModal
        open={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSuccess={async (data) => {
          if (data.status === "correct") {
            toast.success("Correct flag submitted");
            fetchChallenges();
          } else {
            toast.error("Incorrect flag");
          }
        }}
        username={username}
        challengeId={selectedChallenge?.id ?? null}
        backendUrl={backendURL}
      />
    </div>
  );
}
