"use client";

import { useMemo } from "react";
import Leaderboard from "../components/Leaderboard";

export default function LeaderboardPanel() {
  // Memoized backend URL to avoid re-render triggers
  const BACKEND_URL = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    []
  );

  return (
    <div className="p-6">
      <div className="border border-yellow-500/30 rounded-2xl bg-gray-900/60 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(234,179,8,0.3)]">
        <Leaderboard backendUrl={BACKEND_URL} teamId={null} />
      </div>
    </div>
  );
}
