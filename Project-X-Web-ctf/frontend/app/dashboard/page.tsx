// app/projectx/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Tabs from "../components/Tabs";
import LoadingScreen from "../components/LoadingScreen";
import BanScreen from "../components/BanScreen";
import ChallengeList from "../components/ChallengeList";
import ChallengeDetails from "../components/ChallengeDetails";
import LeaderboardPanel from "../components/LeaderboardPanel";
import { useUser } from "../hooks/useUser";
import { useBanTimer } from "../hooks/useBanTimer";
import { useChallenges } from "../hooks/useChallenges";
import type { Challenge } from "../types/Challenge";

export default function ProjectXCTF() {
  const [activeTab, setActiveTab] =
    useState<"challenges" | "leaderboard">("challenges");
  const [selectedChallenge, setSelectedChallenge] =
    useState<Challenge | null>(null);

  const { user, loading, bannedDate, isTempBanned, isPermanentBanned } =
    useUser();
  const { timerDisplay, isActive: tempTimerActive } =
    useBanTimer(bannedDate);
  const {
    challenges,
    solvedIds,
    loading: challengesLoading,
    refresh,
  } = useChallenges({ teamId: user?.teamId ?? null });

  // Initial selection
  useEffect(() => {
    if (!loading && !challengesLoading && !selectedChallenge && challenges[0]) {
      setSelectedChallenge(challenges[0]);
    }
  }, [loading, challengesLoading, challenges, selectedChallenge]);

  if (loading || challengesLoading) {
    return <LoadingScreen />;
  }

  if (isTempBanned && tempTimerActive) {
    return <BanScreen type="temp" timer={timerDisplay} />;
  }

  if (isPermanentBanned) {
    return <BanScreen type="perm" />;
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Scan Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(34,197,94,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              fontFamily: 'monospace',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#000',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#000',
              },
            },
          }}
        />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "challenges" ? (
          <main className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
            <ChallengeList
              challenges={challenges}
              solvedIds={solvedIds}
              selected={selectedChallenge}
              onSelect={setSelectedChallenge}
            />
            <ChallengeDetails
              selected={selectedChallenge}
              solvedIds={solvedIds}
              username={user?.username ?? ""}
              refreshChallenges={refresh}
            />
          </main>
        ) : (
          <div className="h-[calc(100vh-80px)] overflow-hidden">
            <LeaderboardPanel />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Custom Scrollbar */
        :global(.no-scrollbar::-webkit-scrollbar) {
          width: 8px;
        }

        :global(.no-scrollbar::-webkit-scrollbar-track) {
          background: rgba(0, 0, 0, 0.3);
        }

        :global(.no-scrollbar::-webkit-scrollbar-thumb) {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 4px;
        }

        :global(.no-scrollbar::-webkit-scrollbar-thumb:hover) {
          background: rgba(34, 197, 94, 0.5);
        }
      `}</style>
    </div>
  );
}