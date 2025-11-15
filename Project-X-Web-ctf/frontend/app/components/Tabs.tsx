"use client";
import { Target, Trophy } from "lucide-react";

interface TabsProps {
  activeTab: "challenges" | "leaderboard";
  setActiveTab: (tab: "challenges" | "leaderboard") => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="relative bg-slate-950/70 backdrop-blur-xl border-b border-blue-500/20">
      {/* Decorative scanline top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center gap-3 py-4">

          {/* -------------------------------------------------------
              CHALLENGES TAB - BLUE THEME
          -------------------------------------------------------- */}
          <button
            onClick={() => setActiveTab("challenges")}
            className={`group relative px-7 py-3 rounded-2xl font-semibold text-sm tracking-wide flex items-center gap-2.5 transition-all duration-300 overflow-hidden
              ${
                activeTab === "challenges"
                  ? "text-blue-300 bg-blue-500/20 shadow-lg shadow-blue-500/25 border border-blue-400/40"
                  : "text-slate-400 hover:text-blue-300 hover:bg-blue-900/20"
              }
            `}
          >
            {/* Active border + underglow */}
            {activeTab === "challenges" && (
              <>
                <div className="absolute inset-0 rounded-2xl border border-blue-500/60" />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400" />
              </>
            )}

            {/* Hover shimmer */}
            {activeTab !== "challenges" && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-700/0 via-blue-700/10 to-blue-700/0 transition-opacity duration-300" />
            )}

            <Target
              className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                activeTab === "challenges" ? "" : "group-hover:scale-110"
              }`}
            />

            <span className="relative z-10">CHALLENGES</span>

            {/* Glow pulse */}
            {activeTab === "challenges" && (
              <div className="absolute inset-0 bg-blue-400/20 blur-xl -z-10 animate-pulse" />
            )}
          </button>

          {/* -------------------------------------------------------
              LEADERBOARD TAB (CYAN / YELLOW BLUE MATCH)
          -------------------------------------------------------- */}
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`group relative px-7 py-3 rounded-2xl font-semibold text-sm tracking-wide flex items-center gap-2.5 transition-all duration-300 overflow-hidden
              ${
                activeTab === "leaderboard"
                  ? "text-cyan-300 bg-cyan-500/20 shadow-lg shadow-cyan-500/25 border border-cyan-400/40"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
              }
            `}
          >
            {activeTab === "leaderboard" && (
              <>
                <div className="absolute inset-0 rounded-2xl border border-cyan-400/60" />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-300" />
              </>
            )}

            {activeTab !== "leaderboard" && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-700/0 via-cyan-700/10 to-cyan-700/0 transition-opacity duration-300" />
            )}

            <Trophy
              className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                activeTab !== "leaderboard"
                  ? "group-hover:scale-110 group-hover:rotate-12"
                  : ""
              }`}
            />

            <span className="relative z-10">LEADERBOARD</span>

            {activeTab === "leaderboard" && (
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl -z-10 animate-pulse" />
            )}
          </button>

        </div>
      </div>

      {/* Bottom scanline */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </div>
  );
}
