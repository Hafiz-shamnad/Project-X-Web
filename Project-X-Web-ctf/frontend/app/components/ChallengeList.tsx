// app/projectx/components/ChallengeList.tsx
"use client";
import { Zap, CheckCircle2 } from "lucide-react";
import type { Challenge } from "../types/Challenge";
import { getDifficultyColor } from "../utils/difficultyColor";

interface ChallengeListProps {
  challenges: Challenge[];
  solvedIds: number[];
  selected: Challenge | null;
  onSelect: (c: Challenge) => void;
}

export default function ChallengeList({
  challenges,
  solvedIds,
  selected,
  onSelect,
}: ChallengeListProps) {
  return (
    <aside className="md:w-1/3 lg:w-1/4 bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-2xl border-r border-blue-500/20 overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-blue-500/20 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-10">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400"></span>
          </span>
          CHALLENGES
        </h2>
      </div>

      {/* Challenge List */}
      <div className="divide-y divide-blue-900/10">
        {challenges.map((c) => {
          const isSelected = selected?.id === c.id;
          const isSolved = solvedIds.includes(c.id);

          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`group w-full text-left p-4 transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 border-l-4 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  : "border-l-4 border-transparent hover:bg-blue-500/5 hover:border-l-blue-500/40"
              }`}
            >
              {/* Hover Effect */}
              {!isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              {/* Active Glow */}
              {isSelected && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              )}

              <div className="relative z-10">
                {/* Title & Difficulty */}
                <div className="flex justify-between items-start gap-3 mb-2.5">
                  <h3
                    className={`font-bold truncate flex-1 transition-colors ${
                      isSelected
                        ? "text-blue-300"
                        : isSolved
                        ? "text-slate-300"
                        : "text-slate-200 group-hover:text-blue-400"
                    }`}
                  >
                    {c.name}
                  </h3>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap backdrop-blur-xl ${getDifficultyColor(
                      c.difficulty
                    )}`}
                  >
                    {c.difficulty}
                  </span>
                </div>

                {/* Points & Status */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "text-cyan-400"
                        : isSolved
                        ? "text-slate-500"
                        : "text-slate-400 group-hover:text-blue-400"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{c.points} pts</span>
                  </div>

                  {isSolved && (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-xl">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold tracking-wide">SOLVED</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}