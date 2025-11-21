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

import { Trophy, Flag, LineChart as ChartIcon } from "lucide-react";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL;

interface Solve {
  challengeId: number;
  points: number;
  createdAt: string;
}


interface TeamData {
  id: number;
  teamName: string;
  score: number;
  solved: number;
  solves: Solve[];
}

interface TimelinePoint {
  time: number;
  score: number;
  label: string;
}

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH LEADERBOARD ---------------- */
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/leaderboard/teams`, {
        credentials: "include",
      });

      const raw = await res.json();
      const entries = Array.isArray(raw) ? raw : raw.teams;

      const mapped = entries.map((e: any) => ({
        id: e.id,
        teamName: e.teamName || e.username,
        score: e.score ?? e.points ?? 0,
        solved: e.solved ?? e.solves?.length ?? 0,
        solves: e.solves ?? [],
      }));

      setLeaderboard(mapped);
    } catch (err) {
      console.error("Admin Leaderboard Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  /* ---------------- TIMELINE PREP (fixed) ---------------- */
const timelineData = useMemo(() => {
  if (!leaderboard.length) return {};

  const result: Record<string, TimelinePoint[]> = {};

  const top = leaderboard.slice(0, 10);

  for (const team of top) {
    const label = team.teamName ?? "Unknown";
    const solves = team.solves ?? [];

    if (solves.length === 0) {
      result[label] = [
        {
          time: Date.now(),
          score: team.score,
          label,
        },
      ];
      continue;
    }

    // Sort once
    const sorted = solves
      .map((s) => ({
        time: new Date(s.createdAt).getTime(),
        points: s.points ?? 0,
      }))
      .sort((a, b) => a.time - b.time);

    let cumulative = 0;

    const points: TimelinePoint[] = sorted.map((s) => {
      cumulative += s.points;
      return {
        time: s.time,
        score: cumulative,
        label,
      };
    });

    // Start with a zero point for smooth graph start
    points.unshift({
      time: points[0].time - 60000,
      score: 0,
      label,
    });

    result[label] = points;
  }

  return result;
}, [leaderboard]);


  /* ---------------- COLORS ---------------- */
  const teamColors = [
    "#3B82F6",
    "#06B6D4",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#6366F1",
    "#14B8A6",
    "#F97316",
    "#A855F7",
  ];

  if (loading)
    return (
      <div className="text-blue-400 text-center py-10">
        Loading admin leaderboard...
      </div>
    );

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* ================= HEADER ================= */}
      <h1 className="text-4xl font-black text-blue-300 flex items-center gap-3 mb-10">
        Leaderboard — Detailed Analytics
      </h1>

      {/* ================= TOP 3 ================= */}
      <div className="grid grid-cols-3 gap-6 mb-14 items-end">
        <PodiumCard rank={2} data={top3[1]} />
        <PodiumCard rank={1} data={top3[0]} large />
        <PodiumCard rank={3} data={top3[2]} />
      </div>

      {/* ================= TIMELINE GRAPH ================= */}
      <div className="bg-slate-950/70 border border-blue-500/30 rounded-3xl p-8 mb-10 shadow-xl">
        <h3 className="text-2xl font-black text-blue-300 flex items-center gap-3 mb-6">
          <ChartIcon className="text-cyan-400" /> Score Timeline (Detailed)
        </h3>

        <ResponsiveContainer width="100%" height={380}>
          <LineChart margin={{ top: 10, right: 30, left: -10, bottom: 10 }}>
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={["auto", "auto"]}
              stroke="#64748b"
              tickFormatter={(t) =>
                new Date(t).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
            <YAxis stroke="#64748b" />
            <Tooltip
              labelFormatter={(v) =>
                new Date(v).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              formatter={(v) => [`${v} pts`, "Score"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #3b82f6",
                borderRadius: "10px",
                color: "#60a5fa",
              }}
            />
            <Legend />

            {Object.entries(timelineData).map(([label, data], idx) => (
              <Line
                key={label}
                data={data}
                type="monotone"
                dataKey="score"
                name={label}
                stroke={teamColors[idx % teamColors.length]}
                strokeWidth={2}
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= FULL LEADERBOARD ================= */}
      <div className="bg-slate-950/70 border border-blue-500/30 rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 py-5 border-b border-blue-500/20 bg-blue-500/10">
          <h3 className="text-2xl font-black text-blue-300 flex items-center gap-2">
            <Trophy className="text-yellow-400" /> Full Leaderboard
          </h3>
        </div>

        {rest.map((t, idx) => (
          <div
            key={t.id}
            className="px-8 py-6 flex justify-between items-center border-b border-blue-500/10 hover:bg-blue-500/10 transition"
          >
            <div className="flex items-center gap-4">
              <span className="text-blue-400 font-bold text-xl">
                #{idx + 4}
              </span>
              <div>
                <div className="text-slate-200 font-semibold">{t.teamName}</div>
                <div className="text-slate-500 text-sm">{t.solved} solved</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-blue-300 font-bold">{t.score} pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- PODIUM CARD ---------------- */
function PodiumCard({
  rank,
  data,
  large = false,
}: {
  rank: number;
  data?: TeamData;
  large?: boolean;
}) {
  if (!data) return <div />;

  const height = large ? "h-64" : "h-48";

  return (
    <div
      className={`flex flex-col items-center justify-end ${height} 
      bg-slate-900/70 border border-blue-400/30 rounded-2xl p-6 shadow-xl`}
    >
      <Flag className="text-cyan-400 w-14 h-14 mb-3" />
      <div
        className={`font-extrabold mb-1 ${
          rank === 1 ? "text-yellow-300 text-3xl" : "text-blue-300 text-2xl"
        }`}
      >
        #{rank}
      </div>

      <div className="text-slate-200 font-semibold text-center">
        {data.teamName}
      </div>

      <div className="text-blue-300 font-bold">{data.score} pts</div>
      <div className="text-slate-500 text-sm">{data.solved} solved</div>
    </div>
  );
}
