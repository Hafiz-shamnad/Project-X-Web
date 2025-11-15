"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { LineChart as ChartIcon, Flag, Trophy } from "lucide-react";

/* ---------------------------- Types ---------------------------- */

interface TimelinePoint {
  time: number;
  score: number;
  label: string;
}

interface Solve {
  challenge: { points: number };
  createdAt: string;
}

type TeamData = {
  id?: number;
  username?: string;
  teamName?: string;
  score: number;
  solved: number;
  solves?: Solve[];
};

interface LeaderboardProps {
  backendUrl: string;
  teamId?: number | null;
}

/* ------------------------ MAIN COMPONENT ----------------------- */

export default function Leaderboard({ backendUrl, teamId = null }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  const teamColors = [
    "#3B82F6", "#06B6D4", "#8B5CF6",
    "#EC4899", "#F59E0B", "#10B981",
    "#6366F1", "#14B8A6", "#F97316", "#A855F7",
  ];

  /* ------------------------ Fetch Leaderboard ------------------------ */

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      const url = teamId
        ? `${backendUrl}/leaderboard/team/${teamId}`
        : `${backendUrl}/leaderboard/teams`;

      const res = await fetch(url, { credentials: "include" });
      const raw = await res.json();

      const entries: TeamData[] = Array.isArray(raw)
        ? raw
        : raw.leaderboard || raw.teams || [];

      const normalized = entries.map((e: any) => ({
        id: e.id,
        username: e.username,
        teamName: e.teamName ?? raw.teamName,
        score: e.score ?? e.points ?? 0,
        solved: e.solved ?? e.solves?.length ?? 0,
        solves: e.solves ?? [],
      }));

      setLeaderboard(normalized);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, teamId]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  /* --------------------- Compute Timeline (Memoized) --------------------- */

  const timelineData = useMemo(() => {
    if (!leaderboard.length) return {};

    const top = leaderboard.slice(0, 10);
    const timelines: Record<string, TimelinePoint[]> = {};

    for (const member of top) {
      const label = member.username || member.teamName || "Unknown";

      // Sort solves ONCE
      const solves = [...(member.solves ?? [])].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

      let cumulative = 0;
      const points: TimelinePoint[] = [];

      for (const s of solves) {
        cumulative += s.challenge?.points ?? 0;
        points.push({
          time: new Date(s.createdAt).getTime(),
          score: cumulative,
          label,
        });
      }

      if (points.length) {
        // baseline
        points.unshift({
          time: points[0].time - 60000,
          score: 0,
          label,
        });
      } else {
        // fallback
        points.push({
          time: Date.now(),
          score: member.score,
          label,
        });
      }

      timelines[label] = points;
    }

    return timelines;
  }, [leaderboard]);

  /* ------------------------- Loading State ------------------------- */

  if (loading) {
    return (
      <div className="text-center py-10 text-blue-400">
        <ChartIcon className="w-6 h-6 mx-auto mb-2 animate-pulse" />
        Loading leaderboard...
      </div>
    );
  }

  /* ------------------------- Render UI ------------------------- */

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 select-none">

      {/* ----------------------- SCORE TIMELINE ----------------------- */}

      <div className="bg-slate-950/70 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-8 mb-8 shadow-xl shadow-blue-500/10">
        <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-blue-300">
          <ChartIcon className="w-6 h-6 text-cyan-400" />
          {teamId ? "Team Progress" : "Score Timeline"}
        </h3>

        <ResponsiveContainer width="100%" height={380}>
          <LineChart margin={{ top: 10, right: 30, left: -10, bottom: 10 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="time"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(t) =>
                new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
              stroke="#64748b"
              fontSize={12}
            />

            <YAxis stroke="#64748b" fontSize={12} />

            <Tooltip
              labelFormatter={(v) =>
                new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
              formatter={(v) => [`${v} pts`, "Score"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #3b82f6",
                borderRadius: "10px",
                color: "#60a5fa",
              }}
            />

            <Legend wrapperStyle={{ fontSize: 12 }} />

            {/* Lines */}
            {Object.entries(timelineData).map(([label, data], idx) => (
              <Line
                key={label}
                data={data}
                type="monotone"
                dataKey="score"
                name={label}
                stroke={teamColors[idx % teamColors.length]}
                strokeWidth={2}
                isAnimationActive={false}  // <-- huge performance boost
                dot={false}               // <-- optional performance boost
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ----------------------- LEADERBOARD LIST ----------------------- */}

      <div className="bg-slate-950/70 backdrop-blur-2xl border border-blue-500/30 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
        <div className="px-8 py-6 border-b border-blue-500/30 bg-blue-500/10">
          <h3 className="text-2xl font-black text-blue-300 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard
          </h3>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-center py-10 text-slate-400">No scores yet.</p>
        ) : (
          leaderboard.slice(0, 10).map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="px-8 py-6 flex items-center justify-between hover:bg-blue-500/10 transition"
            >
              {/* Rank + Name */}
              <div className="flex items-center gap-6">
                <span
                  className={`text-3xl font-black w-12 text-center ${
                    idx === 0
                      ? "text-yellow-400"
                      : idx === 1
                      ? "text-slate-300"
                      : idx === 2
                      ? "text-amber-600"
                      : "text-blue-400"
                  }`}
                >
                  #{idx + 1}
                </span>

                <div>
                  <div className="font-bold text-slate-100 text-xl">
                    {item.username || item.teamName}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5 text-blue-400" />
                    {item.solved} solved
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-3xl font-black text-blue-300">
                  {item.score}
                </div>
                <div className="text-xs text-slate-500">POINTS</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
