"use client";

import { useEffect, useState } from "react";
import { Trophy, Flag, Medal, Crown, Award, Zap, TrendingUp } from "lucide-react";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL;

interface TeamData {
  id: number;
  teamName: string;
  score: number;
  solved: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/leaderboard/teams`, {
          credentials: "include",
        });

        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : raw.teams;

        const normalized = list.map((t: any) => ({
          id: t.id,
          teamName: t.teamName || t.username,
          score: t.score ?? t.points ?? 0,
          solved: t.solved ?? t.solves?.length ?? 0,
        }));

        setLeaderboard(normalized);
      } catch (err) {
        console.error("Leaderboard error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-blue-400 text-lg font-mono">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 backdrop-blur-sm animate-pulse">
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent mb-3">
            Leaderboard
          </h1>
          <p className="text-blue-400/70 text-lg font-mono">Top teams competing for glory</p>
        </div>

        {/* ====================================================== */}
        {/*                    TOP 3 PODIUM                       */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-20">
          {/* #2 - Silver */}
          <PodiumCard rank={2} data={top3[1]} size="small" />

          {/* #1 - Gold */}
          <PodiumCard rank={1} data={top3[0]} size="large" />

          {/* #3 - Bronze */}
          <PodiumCard rank={3} data={top3[2]} size="small" />
        </div>

        {/* ====================================================== */}
        {/*                    REST OF TEAMS                       */}
        {/* ====================================================== */}
        {rest.length > 0 && (
          <div className="backdrop-blur-md bg-slate-900/40 border border-blue-500/30 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(59,130,246,0.2)]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-blue-300">All Teams</h2>
                <span className="ml-auto px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-mono">
                  {rest.length} teams
                </span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-blue-500/10">
              {rest.map((t, idx) => (
                <div
                  key={t.id}
                  className="px-8 py-5 flex justify-between items-center hover:bg-blue-500/10 transition-all duration-300 group"
                >
                  {/* Left */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 group-hover:border-blue-500/50 transition-all">
                      <span className="text-blue-400 font-black text-lg">#{idx + 4}</span>
                    </div>
                    <div>
                      <span className="text-slate-100 font-bold text-lg block group-hover:text-blue-200 transition-colors">
                        {t.teamName}
                      </span>
                      <span className="text-slate-500 text-sm font-mono flex items-center gap-2 mt-1">
                        <Flag className="w-3 h-3" />
                        {t.solved} challenges solved
                      </span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
                      <span className="text-emerald-300 font-black text-xl">{t.score}</span>
                      <span className="text-emerald-400/70 text-sm ml-1">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-20 h-20 text-slate-700 mx-auto mb-6" />
            <p className="text-slate-400 text-xl font-mono">No teams yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================
 *                PODIUM CARD COMPONENT
 * ====================================================== */
function PodiumCard({
  rank,
  data,
  size,
}: {
  rank: number;
  data?: TeamData;
  size: "small" | "large";
}) {
  if (!data) {
    return (
      <div className={`${size === "large" ? "h-80" : "h-64"} rounded-3xl border-2 border-dashed border-slate-700/30 flex items-center justify-center`}>
        <p className="text-slate-600 font-mono">No team yet</p>
      </div>
    );
  }

  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const height = size === "large" ? "h-80" : "h-64";
  
  // Color schemes for each rank
  const colorScheme = isFirst
    ? {
        bg: "from-yellow-500/20 via-amber-500/10 to-orange-500/5",
        border: "border-yellow-500/40",
        shadow: "shadow-[0_8px_40px_rgba(234,179,8,0.3)]",
        glow: "bg-yellow-500/20",
        iconBg: "from-yellow-500/30 to-amber-500/20",
        iconBorder: "border-yellow-500/50",
        iconColor: "text-yellow-400",
        rankColor: "text-yellow-300",
        nameColor: "text-yellow-100",
        emoji: "👑",
      }
    : isSecond
    ? {
        bg: "from-slate-400/20 via-slate-500/10 to-slate-600/5",
        border: "border-slate-400/40",
        shadow: "shadow-[0_8px_30px_rgba(148,163,184,0.3)]",
        glow: "bg-slate-400/20",
        iconBg: "from-slate-400/30 to-slate-500/20",
        iconBorder: "border-slate-400/50",
        iconColor: "text-slate-300",
        rankColor: "text-slate-300",
        nameColor: "text-slate-100",
        emoji: "🥈",
      }
    : {
        bg: "from-amber-700/20 via-orange-800/10 to-amber-900/5",
        border: "border-amber-700/40",
        shadow: "shadow-[0_8px_30px_rgba(180,83,9,0.3)]",
        glow: "bg-amber-700/20",
        iconBg: "from-amber-700/30 to-orange-800/20",
        iconBorder: "border-amber-700/50",
        iconColor: "text-amber-600",
        rankColor: "text-amber-600",
        nameColor: "text-amber-100",
        emoji: "🥉",
      };

  return (
    <div
      className={`relative flex flex-col items-center justify-between ${height}
        backdrop-blur-md bg-gradient-to-br ${colorScheme.bg} border-2 ${colorScheme.border} 
        rounded-3xl p-6 ${colorScheme.shadow} hover:scale-105 transition-all duration-300 group overflow-hidden`}
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 ${colorScheme.glow} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
  

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
        {/* Medal/Trophy Icon */}
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorScheme.iconBg} border-2 ${colorScheme.iconBorder} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {isFirst ? (
            <Crown className={`${size === "large" ? "w-16 h-16" : "w-12 h-12"} ${colorScheme.iconColor}`} />
          ) : isSecond ? (
            <Medal className={`${size === "large" ? "w-16 h-16" : "w-12 h-12"} ${colorScheme.iconColor}`} />
          ) : (
            <Award className={`${size === "large" ? "w-16 h-16" : "w-12 h-12"} ${colorScheme.iconColor}`} />
          )}
        </div>

        {/* Rank Badge */}
        <div className={`px-4 py-2 rounded-xl bg-slate-900/50 border ${colorScheme.iconBorder} mb-3`}>
          <span className={`text-3xl font-black ${colorScheme.rankColor}`}>#{rank}</span>
        </div>

        {/* Team Name */}
        <div className={`text-center mb-4 ${size === "large" ? "text-2xl" : "text-xl"} font-black ${colorScheme.nameColor} px-4`}>
          {data.teamName}
        </div>

        {/* Stats */}
        <div className="space-y-2 text-center">
          <div className={`px-6 py-3 rounded-xl bg-slate-900/60 border ${colorScheme.iconBorder} backdrop-blur-sm`}>
            <div className="flex items-center gap-2 justify-center">
              <Zap className={`w-5 h-5 ${colorScheme.iconColor}`} />
              <span className={`${size === "large" ? "text-2xl" : "text-xl"} font-black ${colorScheme.nameColor}`}>
                {data.score}
              </span>
              <span className="text-slate-400 text-sm">points</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Flag className="w-4 h-4" />
            <span>{data.solved} solved</span>
          </div>
        </div>
      </div>

      {/* Rank Emoji at bottom */}
      <div className="text-4xl opacity-20 mt-4">
        {colorScheme.emoji}
      </div>
    </div>
  );
}