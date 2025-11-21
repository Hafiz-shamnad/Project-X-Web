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
    onConfirm: () => Promise<void>,
    variant?: "danger" | "warning" | "success"
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

  const filteredTeams = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(term));
  }, [teams, search]);

  return (
    <section className="space-y-8">
      {/* Title */}
      <h2 className="text-3xl font-black text-cyan-400 tracking-wide drop-shadow-md">
        Team Management
      </h2>

      {/* Search Bar */}
      <div
        className="flex items-center bg-slate-900/70 px-3 py-2 rounded-xl 
                    border border-blue-500/40 w-full md:w-96 shadow-md shadow-blue-500/10"
      >
        <Search className="w-4 h-4 text-blue-300 mr-2 opacity-80" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..."
          className="bg-transparent outline-none text-blue-200 w-full placeholder-blue-500/40"
        />
      </div>

      {/* Loading / Empty */}
      {loading && teams.length === 0 && (
        <p className="text-blue-300/70 animate-pulse">Loading teams...</p>
      )}

      {!loading && filteredTeams.length === 0 && (
        <p className="text-blue-300/70">No teams matched your search.</p>
      )}

      {/* Team Cards */}
      <div className="grid gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="
            bg-gradient-to-br from-slate-900/70 to-slate-900/40 
            border border-blue-600/30 rounded-xl p-5 
            shadow-lg shadow-blue-500/10 hover:border-blue-500/50 
            transition-all duration-200
          "
          >
            {/* Header */}
            <div
              className="flex justify-between items-center cursor-pointer pb-2"
              onClick={() => toggleTeamExpand(team.id)}
            >
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  {team.name}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  <span className="text-cyan-400 font-semibold">
                    {team.totalScore ?? 0}
                  </span>{" "}
                  points •{" "}
                  <span className="text-yellow-400">
                    {team.solvedCount ?? 0}
                  </span>{" "}
                  solves
                </p>
              </div>

              {expandedTeamId === team.id ? (
                <ChevronUp className="w-6 h-6 text-cyan-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-slate-400" />
              )}
            </div>

            {/* Expanded Section */}
            {expandedTeamId === team.id && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
                {/* Members */}
                <div>
                  <p className="text-sm text-slate-400 mb-2">Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {team.members?.length ? (
                      team.members.map((m) => (
                        <span
                          key={m.id}
                          className="px-3 py-1 bg-slate-800/70 text-blue-200 
                                   rounded-lg border border-blue-700/40 text-sm"
                        >
                          {m.username}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">
                        No members assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-3">
                  {/* TEMP BAN (danger) */}
                  <button
                    onClick={() =>
                      openInput(
                        "Temporary Ban",
                        "Enter ban duration in minutes:",
                        "Minutes",
                        (value) => onTemporaryBan(team.id, Number(value) || 0)
                      )
                    }
                    className="
                    px-4 py-2 rounded-lg font-medium
                    bg-red-700/20 text-red-300 border border-red-600/40 
                    hover:bg-red-700/30 hover:border-red-500/60 
                    transition shadow-red-600/20 shadow-sm
                  "
                  >
                    Temporary Ban
                  </button>

                  {/* PERMANENT BAN (danger strong) */}
                  <button
                    onClick={() =>
                      openConfirm(
                        "Permanent Ban",
                        "Permanently ban this team?",
                        () => onPermanentBan(team.id),
                        "danger"
                      )
                    }
                    className="
    px-4 py-2 rounded-lg font-semibold
    bg-gradient-to-br from-red-800/40 to-red-900/60
    text-red-300 border border-red-700/60
    hover:from-red-700/50 hover:to-red-900/70
    hover:text-red-200
    shadow shadow-red-900/30 hover:shadow-red-700/40
    transition-all duration-200
    ring-0 hover:ring-2 hover:ring-red-600/40
  "
                  >
                    Permanent Ban
                  </button>

                  {/* UNBAN (success) */}
                  <button
                    onClick={() =>
                      openConfirm(
                        "Unban Team",
                        "Remove the ban for this team?",
                        () => onUnban(team.id)
                      )
                    }
                    className="
                    px-4 py-2 rounded-lg font-medium
                    bg-emerald-700/20 text-emerald-300 border border-emerald-600/40 
                    hover:bg-emerald-700/30 hover:border-emerald-500/60 
                    transition shadow-emerald-500/20 shadow-sm
                  "
                  >
                    Unban
                  </button>

                  {/* PENALTY (warning) */}
                  <button
                    onClick={() =>
                      openInput(
                        "Apply Penalty",
                        "Enter penalty points:",
                        "Points",
                        (value) => onPenalty(team.id, Number(value) || 0)
                      )
                    }
                    className="
                    px-4 py-2 rounded-lg font-medium
                    bg-yellow-700/20 text-yellow-300 border border-yellow-600/40 
                    hover:bg-yellow-700/30 hover:border-yellow-500/60 
                    transition shadow-yellow-600/20 shadow-sm
                  "
                  >
                    Penalty
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
