"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import LoadingScreen from "../components/LoadingScreen";
import BanScreen from "../components/BanScreen";
import ChallengeList from "../components/ChallengeList";
import ChallengeDetails from "../components/ChallengeDetails";

import { useUser } from "../hooks/useUser";
import { useBanTimer } from "../hooks/useBanTimer";
import { useChallenges } from "../hooks/useChallenges";

import type { Challenge } from "../types/Challenge";

export default function ProjectXCTF() {
  const [selected, setSelected] = useState<Challenge | null>(null);

  const { user, loading, bannedDate, isTempBanned, isPermanentBanned } =
    useUser();
  const { timerDisplay, isActive: tempTimerActive } = useBanTimer(bannedDate);

  const {
    challenges,
    solvedIds,
    loading: challengesLoading,
    refresh,
  } = useChallenges({
    teamId: user?.teamId ?? null,
  });

  // Auto-select first challenge once loaded
  useEffect(() => {
    if (!loading && !challengesLoading && !selected && challenges[0]) {
      setSelected(challenges[0]);
    }
  }, [loading, challengesLoading, challenges, selected]);

  /* -------------------- STATE HANDLING -------------------- */
  if (loading || challengesLoading) return <LoadingScreen />;
  if (isTempBanned && tempTimerActive)
    return <BanScreen type="temp" timer={timerDisplay} />;
  if (isPermanentBanned) return <BanScreen type="perm" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-green-400 font-mono relative overflow-hidden">
      {/* -------- MAIN CONTENT -------- */}
      <div className="relative z-10">
        {/* Toasts */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "#22c55e",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: "12px",
              fontFamily: "monospace",
              boxShadow: "0 8px 32px rgba(34,197,94,0.2)",
              backdropFilter: "blur(10px)",
            },
          }}
        />

        <main className="flex flex-col md:flex-row h-[calc(100vh-70px)]">
          {/* LEFT PANEL — FIXED WIDTH */}
          <div className="w-full md:w-1/3 h-full overflow-y-auto custom-scrollbar bg-slate-900/40 border-r border-green-500/30">
            <ChallengeList
              challenges={challenges}
              selected={selected}
              solvedIds={solvedIds}
              onSelect={setSelected}
            />
          </div>

          {/* RIGHT PANEL — FIXED WIDTH */}
          <div className="w-full md:w-2/3 h-full overflow-y-auto custom-scrollbar bg-slate-900/30">
            {selected ? (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <ChallengeDetails
                  selected={selected}
                  solvedIds={solvedIds}
                  username={user?.username ?? ""}
                  refreshChallenges={refresh}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl mb-4 animate-pulse">🎯</div>
                  <p className="text-green-500/60 text-lg">
                    Select a challenge to begin
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------- ANIMATIONS + SCROLLBAR ---------- */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes grid {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(40px);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scrollbar */
        :global(.custom-scrollbar::-webkit-scrollbar) {
          width: 10px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-track) {
          background: rgba(15, 23, 42, 0.5);
          border-left: 1px solid rgba(34, 197, 94, 0.1);
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
          background: linear-gradient(
            180deg,
            rgba(34, 197, 94, 0.4),
            rgba(34, 197, 94, 0.6)
          );
          border-radius: 5px;
          border: 2px solid rgba(15, 23, 42, 0.5);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
          background: linear-gradient(
            180deg,
            rgba(34, 197, 94, 0.6),
            rgba(34, 197, 94, 0.8)
          );
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
        }

        :global(.custom-scrollbar) {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
