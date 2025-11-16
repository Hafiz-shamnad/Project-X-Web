"use client";

import { Play, Square, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import type { Challenge } from "../types/Challenge";
import { useInstance } from "../hooks/useInstance";

interface ChallengeEnvironmentProps {
  challenge: Challenge;
}

export default function ChallengeEnvironment({ challenge }: ChallengeEnvironmentProps) {
  const {
    instance,
    spawnLoading,
    timeDisplay,
    spawn,
    stop,
    extend,
    remainingSeconds,
  } = useInstance(challenge);

  if (!challenge.hasContainer) return null;

  const disabledExtend = remainingSeconds !== null && remainingSeconds >= 3600;

  // ------------------------------
  // Handlers (Avoid inline rerenders)
  // ------------------------------

  const handleSpawn = () => {
    if (!spawnLoading && !instance) spawn(challenge.id);
  };

  const handleExtend = async () => {
    const ok = await extend(challenge.id);
    toast[ok ? "success" : "error"](ok ? "Extended (max 60 min reached)" : "Cannot extend further");
  };

  const handleStop = () => stop(challenge.id);

  // ------------------------------
  // Button States
  // ------------------------------

  const StartButtonContent = () => {
    if (spawnLoading)
      return (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          SPAWNING ENVIRONMENT...
        </>
      );

    if (instance)
      return (
        <>
          <CheckCircle2 className="w-6 h-6" />
          ENVIRONMENT ACTIVE
        </>
      );

    return (
      <>
        <Play className="w-6 h-6" />
        START ENVIRONMENT
      </>
    );
  };

  const startButtonClasses = instance
    ? "bg-slate-800/50 text-slate-400 cursor-not-allowed border border-slate-700/50"
    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-blue-500/30 border border-blue-400/30";

  const extendButtonClasses = disabledExtend
    ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20";

  return (
    <div className="mb-6">
      {/* ------------------------------ */}
      {/* Start Button */}
      {/* ------------------------------ */}
      <button
        onClick={handleSpawn}
        disabled={spawnLoading || !!instance}
        className={`w-full px-8 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${startButtonClasses}`}
      >
        <StartButtonContent />
      </button>

      {/* ------------------------------ */}
      {/* Instance Active Panel */}
      {/* ------------------------------ */}
      {instance && (
        <div className="mt-6 p-6 bg-slate-950/60 border border-emerald-500/30 rounded-2xl backdrop-blur-xl space-y-4 shadow-lg shadow-emerald-500/10">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
            <h3 className="text-xl font-bold text-emerald-300">Instance Running</h3>
          </div>

          {/* Info Panel */}
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-blue-500/20">

            {/* URL */}
            <div>
              <span className="text-sm text-slate-500 block mb-1">Access URL</span>
              <a
                href={instance.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-lg font-mono transition-colors break-all"
              >
                {instance.url} →
              </a>
            </div>

            {/* Remaining Time */}
            <div className="flex items-center justify-between pt-3 border-t border-blue-500/20">
              <span className="text-sm text-slate-400">Remaining Time</span>
              <span className="text-emerald-400 font-bold text-xl font-mono">{timeDisplay}</span>
            </div>
          </div>

          {/* ------------------------------ */}
          {/* EXTEND BUTTON */}
          {/* ------------------------------ */}
          <button
            disabled={disabledExtend}
            onClick={handleExtend}
            className={`w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg transition-all ${extendButtonClasses}`}
          >
            <Clock className="w-5 h-5" />
            {disabledExtend ? "MAX 60 MIN REACHED" : "EXTEND INSTANCE"}
          </button>

          {/* ------------------------------ */}
          {/* STOP BUTTON */}
          {/* ------------------------------ */}
          <button
            onClick={handleStop}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 text-lg"
          >
            <Square className="w-5 h-5" />
            STOP ENVIRONMENT
          </button>
        </div>
      )}
    </div>
  );
}
