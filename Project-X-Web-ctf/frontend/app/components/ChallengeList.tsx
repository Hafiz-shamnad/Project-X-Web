"use client";

import { useState, useMemo, useCallback } from "react";
import { Zap, CheckCircle2, ChevronDown, ChevronRight, Target, Award, Trophy } from "lucide-react";
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
  // ----------------------------------------
  // MEMO: Grouped & Sorted Challenges
  // ----------------------------------------
  const grouped = useMemo(() => {
    const diffOrder = ["EASY", "MEDIUM", "HARD", "INSANE"];

    const groups: Record<string, Challenge[]> = {};

    for (const ch of challenges) {
      (groups[ch.category] ||= []).push(ch);
    }

    for (const cat of Object.keys(groups)) {
      groups[cat].sort((a, b) => {
        const aDiff = diffOrder.indexOf(a.difficulty.toUpperCase());
        const bDiff = diffOrder.indexOf(b.difficulty.toUpperCase());
        return aDiff !== bDiff ? aDiff - bDiff : b.points - a.points;
      });
    }

    return groups;
  }, [challenges]);

  // Calculate stats per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; solved: number }> = {};
    Object.entries(grouped).forEach(([cat, list]) => {
      stats[cat] = {
        total: list.length,
        solved: list.filter(c => solvedIds.includes(c.id)).length,
      };
    });
    return stats;
  }, [grouped, solvedIds]);

  // ----------------------------------------
  // Open / Close Category Groups
  // ----------------------------------------
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = useCallback((cat: string) => {
    setOpenGroups((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const handleSelect = useCallback(onSelect, []);

  // ----------------------------------------
  // Challenge Row Component (Memoized)
  // ----------------------------------------
  const ChallengeRow = useCallback(
    ({ c }: { c: Challenge }) => {
      const isSelected = selected?.id === c.id;
      const isSolved = solvedIds?.includes(c.id);

      return (
        <button
          key={c.id}
          onClick={() => handleSelect(c)}
          className={`group w-full text-left p-4 transition-all duration-300 border-l-4 relative overflow-hidden
            ${
              isSelected
                ? "bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-transparent border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                : "border-transparent hover:bg-gradient-to-r hover:from-blue-500/5 hover:via-cyan-500/5 hover:to-transparent hover:border-blue-400/50"
            }
          `}
        >
          {/* Glow Effect on Hover/Select */}
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isSelected ? 'opacity-100' : ''}`}></div>
          
          <div className="relative">
            {/* Top Row */}
            <div className="flex justify-between items-start mb-2 gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isSolved && (
                  <div className="flex-shrink-0 p-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                <h3
                  className={`font-bold text-base truncate transition-colors
                    ${
                      isSelected
                        ? "text-blue-200"
                        : isSolved
                        ? "text-slate-300"
                        : "text-slate-200 group-hover:text-blue-300"
                    }
                  `}
                >
                  {c.name}
                </h3>
              </div>

              <span
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm ${getDifficultyColor(
                  c.difficulty
                )}`}
              >
                {c.difficulty}
              </span>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between gap-3">
              <div
                className={`flex items-center gap-2 text-sm font-semibold
                  ${
                    isSelected
                      ? "text-cyan-400"
                      : isSolved
                      ? "text-slate-500"
                      : "text-slate-400 group-hover:text-blue-400"
                  }
                `}
              >
                <Zap className="w-4 h-4" />
                <span>{c.points} pts</span>
              </div>

              {isSolved && (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <Trophy className="w-3 h-3" />
                  <span className="text-[10px] font-bold tracking-wider">
                    SOLVED
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      );
    },
    [selected, solvedIds, handleSelect]
  );

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <aside className="w-full h-full bg-gradient-to-b from-slate-900/60 to-slate-950/60 border-r border-blue-500/20 overflow-y-auto backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-blue-500/20 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300">
            Challenges
          </h2>
        </div>
        
        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Award className="w-4 h-4" />
            <span className="font-semibold">{challenges.length} Total</span>
          </div>
          <div className="w-px h-4 bg-blue-500/20"></div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">{solvedIds.length} Solved</span>
          </div>
        </div>
      </div>

      {/* Grouped Challenges */}
      <div className="pb-6">
        {Object.keys(grouped).map((cat) => {
          const isOpen = openGroups[cat] ?? true;
          const list = grouped[cat];
          const stats = categoryStats[cat];
          const completionPercent = stats ? Math.round((stats.solved / stats.total) * 100) : 0;

          return (
            <div key={cat} className="border-b border-blue-900/10">
              {/* Category Header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900/60 to-transparent hover:from-slate-800/60 hover:to-transparent transition-all duration-300 border-b border-blue-500/10 group"
                onClick={() => toggleGroup(cat)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 transition-all group-hover:scale-110`}>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-blue-200 uppercase tracking-wide">
                        {cat}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
                        {stats.solved}/{stats.total}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {completionPercent === 100 && (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-blue-400 transition-transform group-hover:scale-110" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-blue-400 transition-transform group-hover:scale-110" />
                  )}
                </div>
              </button>

              {/* Challenge Items */}
              {isOpen && (
                <div className="divide-y divide-blue-900/10 animate-[fadeIn_0.3s_ease-out]">
                  {list.map((c) => (
                    <ChallengeRow key={c.id} c={c} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </aside>
  );
}