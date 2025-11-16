"use client";

import { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Team } from "../types/Team";

interface TeamCardProps {
  team: Team;
  expanded: boolean;
  onExpand: () => void;
  onTemporaryBan: () => void;
  onPermanentBan: () => void;
  onUnban: () => void;
  onPenalty: () => void;
}

function TeamCardComponent({
  team,
  expanded,
  onExpand,
  onTemporaryBan,
  onPermanentBan,
  onUnban,
  onPenalty,
}: TeamCardProps) {
  return (
    <div
      className="
        bg-slate-900/60 
        border border-blue-600/30 
        rounded-2xl 
        p-5 
        shadow-lg 
        hover:border-blue-500/60 
        transition-all
      "
    >
      {/* Header */}
      <button
        onClick={onExpand}
        className="flex justify-between items-center w-full text-left"
      >
        <div>
          <h3 className="text-white font-bold">{team.name}</h3>

          <p className="text-sm text-slate-400">
            Score:{" "}
            <span className="text-blue-400 font-semibold">
              {team.totalScore ?? 0}
            </span>{" "}
            | Solves:{" "}
            <span className="text-cyan-400 font-semibold">
              {team.solvedCount ?? 0}
            </span>
          </p>
        </div>

        {expanded ? (
          <ChevronUp className="w-6 h-6 text-blue-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-slate-400" />
        )}
      </button>

      {/* Expanded Section */}
      {expanded && (
        <div className="mt-4 border-t border-slate-800 pt-4 space-y-4 animate-fade-in">
          {/* Members */}
          <div>
            <p className="text-sm text-slate-400">Members:</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {team.members?.length ? (
                team.members.map((m) => (
                  <span
                    key={m.id}
                    className="
                      px-3 py-1 
                      bg-slate-800 
                      text-slate-200 
                      rounded-lg 
                      border border-slate-700 
                      text-sm
                    "
                  >
                    {m.username}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">
                  No members yet
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap mt-3">

            <button
              onClick={onTemporaryBan}
              className="
                bg-rose-600/20 
                text-rose-400 
                border border-rose-500/30 
                px-4 py-1 
                rounded-md 
                hover:bg-rose-600/30 
                transition
              "
            >
              Temporary Ban
            </button>

            <button
              onClick={onPermanentBan}
              className="
                bg-red-900/20 
                text-red-400 
                border border-red-700/30 
                px-4 py-1 
                rounded-md 
                hover:bg-red-900/30 
                transition
              "
            >
              Permanent Ban
            </button>

            <button
              onClick={onUnban}
              className="
                bg-yellow-600/20 
                text-yellow-400 
                border border-yellow-500/30 
                px-4 py-1 
                rounded-md 
                hover:bg-yellow-600/30 
                transition
              "
            >
              Unban
            </button>

            <button
              onClick={onPenalty}
              className="
                bg-blue-600/20 
                text-blue-400 
                border border-blue-500/30 
                px-4 py-1 
                rounded-md 
                hover:bg-blue-600/30 
                transition
              "
            >
              Penalty
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TeamCardComponent);
