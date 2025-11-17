"use client";

import { useState, useMemo, useCallback } from "react";
import { Zap, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
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
          className={`group w-full text-left p-4 transition-all border-l-4 relative
            ${
              isSelected
                ? "bg-blue-500/20 via-cyan-500/10 to-blue-500/20 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                : "border-transparent hover:bg-blue-500/5 hover:border-blue-400/40"
            }
          `}
        >
          {/* Top Row */}
          <div className="flex justify-between items-start mb-1.5">
            <h3
              className={`font-bold truncate 
                ${
                  isSelected
                    ? "text-blue-300"
                    : isSolved
                    ? "text-slate-300"
                    : "text-slate-200 group-hover:text-blue-400"
                }
              `}
            >
              {c.name}
            </h3>

            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${getDifficultyColor(
                c.difficulty
              )}`}
            >
              {c.difficulty}
            </span>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold
                ${
                  isSelected
                    ? "text-cyan-400"
                    : isSolved
                    ? "text-slate-500"
                    : "text-slate-400 group-hover:text-blue-400"
                }
              `}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{c.points} pts</span>
            </div>

            {isSolved && (
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold tracking-wide">
                  SOLVED
                </span>
              </div>
            )}
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
    <aside className="w-full h-full bg-slate-900/40 border-r border-blue-500/20 overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-blue-500/20 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-10">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
          </span>
          CHALLENGES
        </h2>
      </div>

      {/* Grouped Challenges */}
      <div className="pb-6">
        {Object.keys(grouped).map((cat) => {
          const isOpen = openGroups[cat] ?? true;
          const list = grouped[cat];

          return (
            <div key={cat} className="border-b border-blue-900/10">
              {/* Category Header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/40 hover:bg-slate-900/60 transition border-b border-blue-500/10"
                onClick={() => toggleGroup(cat)}
              >
                <span className="text-sm font-bold tracking-wide text-blue-300 uppercase">
                  {cat}
                </span>

                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-blue-300" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-blue-300" />
                )}
              </button>

              {/* Challenge Items */}
              {isOpen && (
                <div className="divide-y divide-blue-900/10 animate-fade-in">
                  {list.map((c) => (
                    <ChallengeRow key={c.id} c={c} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
