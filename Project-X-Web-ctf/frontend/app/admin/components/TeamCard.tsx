"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Team } from "../types/Team";

export default function TeamCard({
  team,
  expanded,
  onExpand,
  onTemporaryBan,
  onPermanentBan,
  onUnban,
  onPenalty,
}: {
  team: Team;
  expanded: boolean;
  onExpand: () => void;
  onTemporaryBan: () => void;
  onPermanentBan: () => void;
  onUnban: () => void;
  onPenalty: () => void;
}) {
  return (
    <div className="bg-gray-900/60 border border-green-500/30 rounded-xl p-5 hover:border-green-500/50 transition-all">
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={onExpand}
      >
        <div>
          <h3 className="text-white font-bold">{team.name}</h3>

          <p className="text-sm text-gray-400">
            Score:{" "}
            <span className="text-green-400 font-semibold">
              {team.totalScore ?? 0}
            </span>{" "}
            | Solves:{" "}
            <span className="text-yellow-400">
              {team.solvedCount ?? 0}
            </span>
          </p>
        </div>

        {expanded ? (
          <ChevronUp className="w-6 h-6 text-green-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="mt-4 border-t border-gray-800 pt-4 space-y-3">
          {/* Members */}
          <div>
            <p className="text-sm text-gray-400">Members:</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {team.members && team.members.length > 0 ? (
                team.members.map((m) => (
                  <span
                    key={m.id}
                    className="px-3 py-1 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 text-sm"
                  >
                    {m.username}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No members yet
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap mt-3">
            <button
              onClick={onTemporaryBan}
              className="bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-1 rounded-md hover:bg-red-600/30"
            >
              Temporary Ban
            </button>

            <button
              onClick={onPermanentBan}
              className="bg-red-900/30 text-red-400 border border-red-700/30 px-4 py-1 rounded-md hover:bg-red-900/40"
            >
              Permanent Ban
            </button>

            <button
              onClick={onUnban}
              className="bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 px-4 py-1 rounded-md hover:bg-yellow-600/30"
            >
              Unban
            </button>

            <button
              onClick={onPenalty}
              className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1 rounded-md hover:bg-blue-600/30"
            >
              Penalty
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
