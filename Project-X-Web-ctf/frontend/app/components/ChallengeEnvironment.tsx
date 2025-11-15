// app/projectx/components/ChallengeEnvironment.tsx
"use client";
import { Play, Square, CheckCircle2 } from "lucide-react";
import type { Challenge } from "../types/Challenge";
import { useInstance } from "../hooks/useInstance";

interface ChallengeEnvironmentProps {
  challenge: Challenge;
}

export default function ChallengeEnvironment({
  challenge,
}: ChallengeEnvironmentProps) {
  const { instance, spawnLoading, timeDisplay, spawn, stop } =
    useInstance(challenge);

  if (!challenge.hasContainer) return null;

  return (
    <div className="mb-6">
      <button
        disabled={spawnLoading || !!instance}
        onClick={() => spawn(challenge.id)}
        className={`w-full px-8 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
          instance
            ? "bg-slate-800/50 text-slate-400 cursor-not-allowed border border-slate-700/50"
            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-blue-500/30 border border-blue-400/30"
        }`}
      >
        {spawnLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            SPAWNING ENVIRONMENT...
          </>
        ) : instance ? (
          <>
            <CheckCircle2 className="w-6 h-6" />
            ENVIRONMENT ACTIVE
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            START ENVIRONMENT
          </>
        )}
      </button>

      {instance && (
        <div className="mt-6 p-6 bg-slate-950/60 border border-emerald-500/30 rounded-2xl backdrop-blur-xl space-y-4 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
            <h3 className="text-xl font-bold text-emerald-300">Instance Running</h3>
          </div>
          
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-blue-500/20">
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
            <div className="flex items-center justify-between pt-3 border-t border-blue-500/20">
              <span className="text-sm text-slate-400">Remaining Time</span>
              <span className="text-emerald-400 font-bold text-xl font-mono">{timeDisplay}</span>
            </div>
          </div>
          
          <button
            onClick={() => stop(challenge.id)}
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