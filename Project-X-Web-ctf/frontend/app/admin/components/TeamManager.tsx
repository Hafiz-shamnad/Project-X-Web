"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Team } from "../types/Team";

interface Props {
  teams: Team[];
  loading: boolean;
  openConfirm: (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => void;
  openInput: (
    title: string,
    message: string,
    label: string,
    onConfirm: (value: string) => Promise<void>
  ) => void;
  onTemporaryBan: (id: number, minutes: number) => Promise<void>;
  onPermanentBan: (id: number) => Promise<void>;
  onUnban: (id: number) => Promise<void>;
  onPenalty: (id: number, points: number) => Promise<void>;
}

export default function TeamManager({
  teams,
  loading,
  openConfirm,
  openInput,
  onTemporaryBan,
  onPermanentBan,
  onUnban,
  onPenalty,
}: Props) {
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  const toggleTeamExpand = (teamId: number) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        Team Management
      </h2>

      {loading && teams.length === 0 && (
        <div className="text-gray-400">Loading teams...</div>
      )}

      {!loading && teams.length === 0 && (
        <div className="text-gray-400">No teams found.</div>
      )}

      {teams.map((team) => (
        <div
          key={team.id}
          className="bg-gray-900/60 border border-green-500/30 rounded-xl p-5 hover:border-green-500/50 transition-all"
        >
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleTeamExpand(team.id)}
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
            {expandedTeamId === team.id ? (
              <ChevronUp className="w-6 h-6 text-green-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {expandedTeamId === team.id && (
            <div className="mt-4 border-t border-gray-800 pt-4 space-y-3">
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

              <div className="flex gap-3 flex-wrap mt-3">
                <button
                  onClick={() =>
                    openInput(
                      "Temporary Ban",
                      "Enter ban duration in minutes",
                      "Minutes",
                      async (value) => {
                        const mins = Number(value) || 0;
                        await onTemporaryBan(team.id, mins);
                      }
                    )
                  }
                  className="bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-1 rounded-md hover:bg-red-600/30"
                >
                  Temporary Ban
                </button>

                <button
                  onClick={() =>
                    openConfirm(
                      "Permanent Ban",
                      "Permanently ban this team?",
                      async () => {
                        await onPermanentBan(team.id);
                      }
                    )
                  }
                  className="bg-red-900/30 text-red-400 border border-red-700/30 px-4 py-1 rounded-md hover:bg-red-900/40"
                >
                  Permanent Ban
                </button>

                <button
                  onClick={() =>
                    openConfirm(
                      "Unban Team",
                      "Unban this team?",
                      async () => {
                        await onUnban(team.id);
                      }
                    )
                  }
                  className="bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 px-4 py-1 rounded-md hover:bg-yellow-600/30"
                >
                  Unban
                </button>

                <button
                  onClick={() =>
                    openInput(
                      "Apply Penalty",
                      "Enter penalty points to deduct",
                      "Points",
                      async (value) => {
                        const pts = Number(value) || 0;
                        await onPenalty(team.id, pts);
                      }
                    )
                  }
                  className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1 rounded-md hover:bg-blue-600/30"
                >
                  Penalty
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
