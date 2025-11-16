"use client";

import { useMemo } from "react";
import Leaderboard from "../../components/Leaderboard";

export default function LeaderboardPanel() {
  // Memoize so it never recomputes on each render
  const BACKEND_URL = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    []
  );

  return (
    <section className="border border-yellow-500/30 rounded-xl bg-slate-900/50 p-6 backdrop-blur-xl shadow-[0_0_25px_rgba(234,179,8,0.3)]">
      <Leaderboard backendUrl={BACKEND_URL} teamId={null} />
    </section>
  );
}
