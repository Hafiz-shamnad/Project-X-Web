"use client";

import { ArrowLeft, Flag, Zap, CheckCircle2, Trophy } from "lucide-react";
import { useState, useCallback } from "react";

import type { Challenge } from "../types/Challenge";
import { getDifficultyColor } from "../utils/difficultyColor";
import ChallengeEnvironment from "./ChallengeEnvironment";
import FlagButton from "./FlagButton";
import FlagModal from "../modals/FlagModal";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/constants";

interface ChallengeDetailsProps {
  selected: Challenge | null;
  solvedIds: number[];
  username: string;
  refreshChallenges: () => Promise<void>;
}

export default function ChallengeDetails({
  selected,
  solvedIds,
  username,
  refreshChallenges,
}: ChallengeDetailsProps) {
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  /* -------------------------------------------
     FLAG SUBMIT HANDLER (Correct / Incorrect)
  -------------------------------------------- */
  const handleFlagSuccess = useCallback(
    async (data: any) => {
      if (data.status === "correct") {
        toast.success("Correct flag submitted!");
        await refreshChallenges();
      } else {
        toast.error("Incorrect flag");
      }
    },
    [refreshChallenges]
  );

  /* -------------------------------------------
     EMPTY STATE (NO CHALLENGE SELECTED)
  -------------------------------------------- */
  if (!selected) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-blue-500/10 animate-pulse" />

          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-12 text-center shadow-2xl shadow-blue-500/10">
            <div className="mb-4 inline-flex p-4 rounded-full bg-blue-500/10 border border-blue-500/30">
              <ArrowLeft className="w-8 h-8 text-blue-400" />
            </div>

            <p className="text-lg text-slate-300 font-semibold">
              Select a challenge to begin
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Choose one from the list to view details
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* -------------------------------------------
     SELECTED CHALLENGE DATA
  -------------------------------------------- */
  const { id, name, description, difficulty, category, points, hasContainer } =
    selected;

  const isSolved = solvedIds.includes(id);

  /* -------------------------------------------
     REUSABLE SEPARATOR
  -------------------------------------------- */
  const Separator = () => (
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
  );

  return (
    <section className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 relative">

      {/* Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* HEADER */}
      <header className="relative border-b border-blue-500/20 bg-slate-950/60 backdrop-blur-xl">

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between gap-6">

            {/* Title + Description */}
            <div className="flex-1">
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 mb-3">
                {name}
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
                {description}
              </p>
            </div>

            {/* Solved Badge */}
            {isSolved && (
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 blur-xl bg-emerald-400/30 animate-pulse" />
                <div className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>COMPLETED</span>
                </div>
              </div>
            )}

          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-6 mt-6 p-5 bg-slate-900/40 border border-blue-500/20 rounded-2xl backdrop-blur-xl">

            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Difficulty:</span>
              <span
                className={`text-sm font-bold px-4 py-2 rounded-xl border backdrop-blur-xl ${getDifficultyColor(
                  difficulty
                )}`}
              >
                {difficulty}
              </span>
            </div>

            <div className="w-px h-8 bg-blue-500/20" />

            {/* Points */}
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-lg font-bold text-slate-200">{points}</span>
              <span className="text-sm text-slate-500">points</span>
            </div>

            <div className="w-px h-8 bg-blue-500/20" />

            {/* Category */}
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-blue-400" />
              <span className="text-base text-slate-300">{category}</span>
            </div>

            {/* Solved Label */}
            {isSolved && (
              <>
                <div className="w-px h-8 bg-blue-500/20" />
                <div className="flex items-center gap-2 text-emerald-400">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-bold">SOLVED</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

        {/* Challenge Environment */}
        {hasContainer && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Separator />
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Challenge Environment
              </h2>
              <Separator />
            </div>

            <div className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-xl rounded-2xl p-6">
              <ChallengeEnvironment challenge={selected} />
            </div>
          </div>
        )}

        {/* Flag Submit */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Separator />
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Submit Your Flag
            </h2>
            <Separator />
          </div>

          <div className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            {isSolved && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
                <span>You have already completed this challenge</span>
              </div>
            )}

            <FlagButton
              disabled={isSolved}
              onClick={() => setFlagModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      <FlagModal
        open={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSuccess={handleFlagSuccess}
        username={username}
        challengeId={id}
        backendUrl={BACKEND_URL}
      />
    </section>
  );
}
