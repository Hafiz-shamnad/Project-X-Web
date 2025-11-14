"use client";

import Leaderboard from "../../components/Leaderboard";

export default function LeaderboardPanel() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  return (
    <div className="border border-yellow-500/30 rounded-xl bg-gray-900/50 p-6 backdrop-blur-md">
      <Leaderboard backendUrl={BACKEND_URL} teamId={null} />
    </div>
  );
}
