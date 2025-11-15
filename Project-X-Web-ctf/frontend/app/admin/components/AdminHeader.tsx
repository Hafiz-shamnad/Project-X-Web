"use client";

import { Shield } from "lucide-react";

export default function AdminHeader({
  challengeCount,
  teamCount,
}: {
  challengeCount: number;
  teamCount: number;
}) {
  return (
    <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
      {/* Left Side — Logo + Title */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 blur-md bg-green-500/40" />
          <div className="relative bg-black/80 rounded-xl p-3 border border-green-500/40 backdrop-blur">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-widest text-green-300">
            ADMIN PANEL
          </h1>
          <p className="text-xs text-green-500/60 tracking-[0.15em]">
            SYSTEM CONTROL CENTER
          </p>
        </div>
      </div>

      {/* Right Side — Stats */}
      <div className="hidden md:flex items-center gap-4">
        <div className="px-4 py-2 rounded-lg border border-green-500/30 bg-green-900/10 text-green-300 font-semibold text-sm">
          <span className="opacity-70">Challenges:</span>{" "}
          <span className="text-green-400 font-bold">{challengeCount}</span>
        </div>

        <div className="px-4 py-2 rounded-lg border border-blue-500/30 bg-blue-900/10 text-blue-300 font-semibold text-sm">
          <span className="opacity-70">Teams:</span>{" "}
          <span className="text-blue-400 font-bold">{teamCount}</span>
        </div>
      </div>
    </header>
  );
}
