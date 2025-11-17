"use client";

import { useEffect, useState, useMemo } from "react";
import { Trophy, Flag, Timer, Shield, Sparkles, Users, TrendingUp, Award, Zap } from "lucide-react";

interface Solve {
  challengeId: number;
  challengeName?: string;
  category?: string;
  difficulty?: string;
  points?: number;
  solvedAt: string;
}

export interface Member {
  id: number;
  username: string;
  points: number;
  solveCount: number;
  solves: {
    challengeId: number;
    challengeName: string;
    points: number;
    solvedAt: string;
    category: string;
    difficulty: string;
  }[];
}

export default function TeamInsights({ members }: { members: Member[] }) {
  /* ------------------------------------------------------------------
   * SANITIZED MEMBERS (prevents undefined errors)
   * ------------------------------------------------------------------ */
  const safeMembers = useMemo(
    () =>
      (members || []).map((m) => ({
        ...m,
        points: m.points ?? 0,
        solves: Array.isArray(m.solves) ? m.solves : [],
        solveCount: m.solveCount ?? (Array.isArray(m.solves) ? m.solves.length : 0),
      })),
    [members]
  );

  /* ------------------------------------------------------------------
   * TOP SCORER
   * ------------------------------------------------------------------ */
  const topScorer = useMemo(() => {
    return [...safeMembers].sort((a, b) => b.points - a.points)[0];
  }, [safeMembers]);

  /* ------------------------------------------------------------------
   * AGGREGATE ALL SOLVES — sorted newest first
   * ------------------------------------------------------------------ */
  const allSolves = useMemo(() => {
    return safeMembers
      .flatMap((m) =>
        m.solves.map((s) => ({
          ...s,
          username: m.username,
          points: s.points ?? 0,
          challengeName: s.challengeName || "Unknown Challenge",
          category: s.category || "Unknown",
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.solvedAt).getTime() -
          new Date(a.solvedAt).getTime()
      );
  }, [safeMembers]);

  /* ------------------------------------------------------------------
   * CHALLENGE CATEGORY BREAKDOWN
   * ------------------------------------------------------------------ */
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    safeMembers.forEach((m) =>
      m.solves.forEach((s) => {
        const cat = s.category || "Unknown";
        stats[cat] = (stats[cat] || 0) + 1;
      })
    );
    return Object.entries(stats);
  }, [safeMembers]);

  /* ------------------------------------------------------------------
   * TOTAL TEAM STATS
   * ------------------------------------------------------------------ */
  const totalPoints = useMemo(() => safeMembers.reduce((sum, m) => sum + m.points, 0), [safeMembers]);
  const totalSolves = useMemo(() => safeMembers.reduce((sum, m) => sum + m.solveCount, 0), [safeMembers]);

  /* =====================================
   *               RENDER
   * ===================================== */
  return (
    <div className="space-y-8 p-6">
      {/* -------------------------------------------------- */}
      {/* TEAM OVERVIEW STATS */}
      {/* -------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border border-blue-500/30 p-6 backdrop-blur-sm shadow-[0_8px_32px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
          <div className="relative">
            <Users className="w-10 h-10 text-blue-400 mb-3" />
            <p className="text-sm text-blue-300/70 font-medium">Team Members</p>
            <p className="text-4xl font-bold text-blue-200 mt-1">{safeMembers.length}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/30 p-6 backdrop-blur-sm shadow-[0_8px_32px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.2)] transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
          <div className="relative">
            <TrendingUp className="w-10 h-10 text-emerald-400 mb-3" />
            <p className="text-sm text-emerald-300/70 font-medium">Total Points</p>
            <p className="text-4xl font-bold text-emerald-200 mt-1">{totalPoints}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border border-purple-500/30 p-6 backdrop-blur-sm shadow-[0_8px_32px_rgba(168,85,247,0.1)] hover:shadow-[0_8px_32px_rgba(168,85,247,0.2)] transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-300"></div>
          <div className="relative">
            <Flag className="w-10 h-10 text-purple-400 mb-3" />
            <p className="text-sm text-purple-300/70 font-medium">Total Solves</p>
            <p className="text-4xl font-bold text-purple-200 mt-1">{totalSolves}</p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* TOP SCORER CARD */}
      {/* -------------------------------------------------- */}
      {topScorer && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/5 via-amber-500/10 to-orange-500/5 border border-yellow-500/30 p-8 backdrop-blur-sm shadow-[0_8px_32px_rgba(234,179,8,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                <Trophy className="text-yellow-400 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Top Scorer
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-yellow-100">{topScorer.username}</p>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold text-lg">
                    {topScorer.points} points
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {topScorer.solveCount} solves
                  </span>
                </div>
              </div>

              <div className="hidden sm:block text-8xl opacity-20">🏆</div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MEMBER CARDS */}
      {/* -------------------------------------------------- */}
      <div>
        <h2 className="text-3xl font-bold text-blue-200 mb-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
          Team Members
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMembers.map((m, idx) => (
            <div
              key={m.id}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-blue-900/20 border border-blue-500/20 p-6 backdrop-blur-sm shadow-lg hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:border-blue-500/40 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <Shield className="text-blue-400 w-5 h-5" />
                    </div>
                    <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-blue-100 mb-3">{m.username}</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Points</span>
                    <span className="text-lg font-bold text-emerald-400">{m.points}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Solves</span>
                    <span className="text-lg font-bold text-blue-300">{m.solveCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* RECENT SOLVES */}
      {/* -------------------------------------------------- */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <Sparkles className="text-cyan-300 w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold text-blue-200">Recent Solves</h2>
        </div>

        {allSolves.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <Flag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No solves yet. Time to start hacking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allSolves.slice(0, 10).map((s, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/40 via-slate-900/40 to-slate-800/40 border border-blue-500/20 p-5 backdrop-blur-sm hover:border-blue-500/40 hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] transition-all duration-300 group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <p className="text-blue-100 font-bold text-lg">{s.challengeName}</p>
                    </div>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      {s.username}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                      +{s.points}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-700/50">
                  <span className="flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    {s.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {new Date(s.solvedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* CATEGORY SUMMARY */}
      {/* -------------------------------------------------- */}
      <div>
        <h2 className="text-3xl font-bold text-blue-200 mb-6">Category Breakdown</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(([cat, count]) => {
            const colors = [
              { bg: 'from-red-500/10 to-orange-500/5', border: 'border-red-500/30', text: 'text-red-300' },
              { bg: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/30', text: 'text-blue-300' },
              { bg: 'from-green-500/10 to-emerald-500/5', border: 'border-green-500/30', text: 'text-green-300' },
              { bg: 'from-purple-500/10 to-pink-500/5', border: 'border-purple-500/30', text: 'text-purple-300' },
              { bg: 'from-yellow-500/10 to-amber-500/5', border: 'border-yellow-500/30', text: 'text-yellow-300' },
            ];
            const colorScheme = colors[cat.length % colors.length];
            
            return (
              <div
                key={cat}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} p-5 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-300"></div>
                
                <div className="relative flex justify-between items-center">
                  <div>
                    <p className={`${colorScheme.text} font-bold text-lg mb-1`}>{cat}</p>
                    <p className="text-slate-400 text-sm">challenges</p>
                  </div>
                  <span className={`text-4xl font-bold ${colorScheme.text}`}>{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}