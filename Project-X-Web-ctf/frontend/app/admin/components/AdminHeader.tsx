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
    <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center border-b border-green-500/40">
      <div className="flex items-center gap-3">
        <div className="bg-green-500/6 border border-green-500/30 p-3 rounded-xl">
          <Shield className="text-green-400 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-green-400">
            Admin Control Center
          </h1>
          <p className="text-sm text-gray-400">
            Manage challenges, leaderboards and teams
          </p>
        </div>
      </div>

      <div className="hidden md:flex gap-4 text-sm">
        <div className="px-3 py-2 bg-gray-800/40 border border-green-600/40 rounded-lg">
          Challenges:{" "}
          <span className="text-green-400 font-bold">{challengeCount}</span>
        </div>
        <div className="px-3 py-2 bg-gray-800/40 border border-blue-600/40 rounded-lg">
          Teams:{" "}
          <span className="text-blue-400 font-bold">{teamCount}</span>
        </div>
      </div>
    </header>
  );
}
