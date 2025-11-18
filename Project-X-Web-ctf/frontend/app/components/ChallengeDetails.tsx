"use client";

import { ArrowLeft, Flag, Zap, CheckCircle2, Trophy, Award, Target, Sparkles, Lock } from "lucide-react";
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
      <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative text-center space-y-6 max-w-md">
          <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/30 backdrop-blur-sm">
            <Target className="w-20 h-20 text-blue-400" />
          </div>

          <div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent mb-3">
              Select a Challenge
            </h3>
            <p className="text-slate-400 text-lg">
              Choose a challenge from the list to begin your hacking journey
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Browse challenges on the left</span>
            </div>
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
    <section className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="relative border-b border-blue-500/20 bg-slate-900/40 backdrop-blur-xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between gap-8 mb-8">
            {/* Challenge Icon & Title */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent border border-blue-500/30 backdrop-blur-sm">
                  <Flag className="w-8 h-8 text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent leading-tight">
                    {name}
                  </h1>
                </div>
              </div>

              <p className="text-slate-300 text-lg leading-relaxed pl-20">
                {description}
              </p>
            </div>

            {/* Solved Badge */}
            {isSolved && (
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 blur-2xl bg-emerald-400/40 animate-pulse"></div>
                <div className="relative flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.4)] border border-emerald-400/50">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-lg">COMPLETED</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Difficulty Card */}
            <div className={`relative overflow-hidden backdrop-blur-sm rounded-xl border p-5 group hover:scale-105 transition-all duration-300 ${getDifficultyColor(difficulty)}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
              <div className="relative">
                <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Difficulty</p>
                <p className="text-2xl font-black text-white">{difficulty}</p>
              </div>
            </div>

            {/* Points Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent backdrop-blur-sm border border-yellow-500/30 rounded-xl p-5 group hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
              <div className="relative">
                <p className="text-xs font-semibold text-yellow-300/60 mb-2 uppercase tracking-wider">Points</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <p className="text-2xl font-black text-yellow-300">{points}</p>
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-sm border border-purple-500/30 rounded-xl p-5 group hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="relative">
                <p className="text-xs font-semibold text-purple-300/60 mb-2 uppercase tracking-wider">Category</p>
                <p className="text-xl font-black text-purple-300">{category}</p>
              </div>
            </div>

            {/* Status Card */}
            <div className={`relative overflow-hidden backdrop-blur-sm rounded-xl border p-5 group hover:scale-105 transition-all duration-300 ${
              isSolved 
                ? "bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border-emerald-500/30" 
                : "bg-gradient-to-br from-slate-500/10 via-slate-600/5 to-transparent border-slate-500/30"
            }`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-all ${
                isSolved ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-slate-500/10 group-hover:bg-slate-500/20"
              }`}></div>
              <div className="relative">
                <p className={`text-xs font-semibold mb-2 uppercase tracking-wider ${
                  isSolved ? "text-emerald-300/60" : "text-slate-400/60"
                }`}>Status</p>
                <div className="flex items-center gap-2">
                  {isSolved ? (
                    <>
                      <Trophy className="w-6 h-6 text-emerald-400" />
                      <p className="text-xl font-black text-emerald-300">Solved</p>
                    </>
                  ) : (
                    <>
                      <Lock className="w-6 h-6 text-slate-400" />
                      <p className="text-xl font-black text-slate-300">Unsolved</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative max-w-6xl mx-auto px-8 py-10 space-y-10">
        {/* Challenge Environment */}
        {hasContainer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-200">Challenge Environment</h2>
              <Separator />
            </div>

            <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <ChallengeEnvironment challenge={selected} />
              </div>
            </div>
          </div>
        )}

        {/* Flag Submit */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-blue-200">Submit Your Flag</h2>
            <Separator />
          </div>

          <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <div className="absolute top-0 left-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative space-y-6">
              {isSolved && (
                <div className="flex items-center gap-3 text-emerald-300 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-500/30 px-6 py-4 rounded-xl backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Challenge Completed!</p>
                    <p className="text-sm text-emerald-400/70">You've already solved this challenge</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <FlagButton
                  disabled={isSolved}
                  onClick={() => setFlagModalOpen(true)}
                />
                
                {!isSolved && (
                  <p className="text-slate-400 text-sm">
                    Click the button above to submit your flag and earn <span className="text-yellow-400 font-bold">{points} points</span>
                  </p>
                )}
              </div>
            </div>
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