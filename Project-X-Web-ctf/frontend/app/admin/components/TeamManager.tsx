"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import type { Team } from "../types/Team";

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
  const [search, setSearch] = useState("");

  const toggleTeamExpand = (teamId: number) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  /* ---------------- OPTIMIZED FILTER ---------------- */
  const filteredTeams = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(term));
  }, [teams, search]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400 drop-shadow-md">
        Team Management
      </h2>

      {/* Search Bar */}
      <div className="flex items-center bg-slate-900/70 px-3 py-2 rounded-lg border border-blue-500/40 shadow-md shadow-blue-500/10 w-full md:w-96 backdrop-blur-sm">
        <Search className="w-4 h-4 text-blue-300 mr-2 opacity-80" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..."
          className="bg-transparent outline-none text-blue-200 w-full placeholder-slate-500"
        />
      </div>

      {/* Loading / Empty */}
      {loading && teams.length === 0 && (
        <div className="text-blue-300/70">Loading teams...</div>
      )}

      {!loading && filteredTeams.length === 0 && (
        <div className="text-blue-300/70">No matching teams.</div>
      )}

      {/* Teams List */}
      {filteredTeams.map((team) => (
        <div
          key={team.id}
          className="bg-slate-900/60 border border-blue-600/30 rounded-xl p-5 hover:border-blue-500 transition-all shadow-lg shadow-blue-500/5"
        >
          {/* Header */}
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleTeamExpand(team.id)}
          >
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                {team.name}
              </h3>

              <p className="text-sm text-slate-400">
                Score:{" "}
                <span className="text-cyan-400 font-semibold">
                  {team.totalScore ?? 0}
                </span>{" "}
                • Solves:{" "}
                <span className="text-yellow-400">
                  {team.solvedCount ?? 0}
                </span>
              </p>
            </div>

            {expandedTeamId === team.id ? (
              <ChevronUp className="w-6 h-6 text-cyan-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-400" />
            )}
          </div>

          {/* Expanded Body */}
          {expandedTeamId === team.id && (
            <div className="mt-4 border-t border-slate-800 pt-4 space-y-3 animate-fadeIn">
              <div>
                <p className="text-sm text-slate-400">Members:</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {team.members?.length ? (
                    team.members.map((m) => (
                      <span
                        key={m.id}
                        className="px-3 py-1 bg-slate-800 text-blue-200 rounded-lg border border-blue-700/40 text-sm"
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
                  onClick={() =>
                    openInput(
                      "Temporary Ban",
                      "Enter ban duration in minutes",
                      "Minutes",
                      (value) => onTemporaryBan(team.id, Number(value) || 0)
                    )
                  }
                  className="bg-red-700/20 text-red-300 border border-red-600/30 px-4 py-1 rounded-md hover:bg-red-700/30 transition"
                >
                  Temporary Ban
                </button>

                <button
                  onClick={() =>
                    openConfirm(
                      "Permanent Ban",
                      "Permanently ban this team?",
                      () => onPermanentBan(team.id)
                    )
                  }
                  className="bg-red-900/40 text-red-400 border border-red-800/40 px-4 py-1 rounded-md hover:bg-red-900/50 transition"
                >
                  Permanent Ban
                </button>

                <button
                  onClick={() =>
                    openConfirm("Unban Team", "Unban this team?", () =>
                      onUnban(team.id)
                    )
                  }
                  className="bg-yellow-700/20 text-yellow-300 border border-yellow-600/30 px-4 py-1 rounded-md hover:bg-yellow-700/30 transition"
                >
                  Unban
                </button>

                <button
                  onClick={() =>
                    openInput(
                      "Apply Penalty",
                      "Enter penalty points",
                      "Points",
                      (value) => onPenalty(team.id, Number(value) || 0)
                    )
                  }
                  className="bg-blue-700/20 text-blue-300 border border-blue-500/30 px-4 py-1 rounded-md hover:bg-blue-700/30 transition"
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
