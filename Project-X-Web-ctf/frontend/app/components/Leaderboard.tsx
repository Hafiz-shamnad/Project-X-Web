"use client";

/**
 * Leaderboard Component
 * ----------------------
 * Displays a real-time leaderboard and score progression timeline chart.
 *
 * Features:
 * - Fetches team or global leaderboard depending on teamId.
 * - Builds cumulative score timeline for the top 10 entries.
 * - Renders a Recharts LineChart with responsive design.
 * - Auto-refreshes every 60 seconds.
 *
 * Environment:
 * - Client-side React component (Next.js “use client”)
 * - Uses Recharts for visualization
 */

import React, { useEffect, useState } from "react";
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
import { LineChart as ChartIcon, Flag } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                               */
/* -------------------------------------------------------------------------- */

/**
 * Represents a point on the cumulative score timeline.
 */
interface TimelinePoint {
  time: number;
  score: number;
  label: string;
}

/**
 * Represents a challenge solve event.
 */
interface Solve {
  challenge: { points: number };
  createdAt: string;
}

/**
 * Represents a single leaderboard entry (team or member).
 */
type TeamData = {
  id?: number;
  username?: string;
  teamName?: string;
  score: number;
  solved: number;
  solves?: Solve[];
};

/**
 * Props accepted by Leaderboard component.
 */
interface LeaderboardProps {
  backendUrl: string;
  teamId?: number | null;
}

/* -------------------------------------------------------------------------- */
/*                             Component Definition                            */
/* -------------------------------------------------------------------------- */

export default function Leaderboard({
  backendUrl,
  teamId = null,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<TeamData[]>([]);
  const [timelineData, setTimelineData] = useState<
    Record<string, TimelinePoint[]>
  >({});
  const [loading, setLoading] = useState(true);

  /**
   * Fixed color palette used to differentiate chart lines.
   * Cycling ensures more than 10 entries won’t break styling.
   */
  const teamColors = [
    "#00FF88",
    "#00FFFF",
    "#FF00FF",
    "#FFAA00",
    "#FF4444",
    "#AA00FF",
    "#00AAFF",
    "#66FF33",
    "#FF77FF",
    "#33FFAA",
  ];

  /* -------------------------------------------------------------------------- */
  /*                         Leaderboard Fetching Logic                         */
  /* -------------------------------------------------------------------------- */

  /**
   * Fetches leaderboard data from backend.
   * Normalizes API differences and extracts relevant fields.
   */

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const url = teamId
        ? `${backendUrl}/leaderboard/team/${teamId}`
        : `${backendUrl}/leaderboard/teams`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      // Determine correct structure (backend may send leaderboard[], teams[], or raw [])
      const entries: TeamData[] = Array.isArray(data)
        ? data
        : Array.isArray(data.leaderboard)
        ? data.leaderboard
        : Array.isArray(data.teams)
        ? data.teams
        : [];

      // Normalize data shape
      const normalized = entries.map((item: any) => ({
        id: item.id,
        username: item.username ?? undefined,
        teamName: item.teamName ?? data.teamName ?? "Unknown Team",
        score: item.score ?? item.points ?? 0,
        solved: item.solved ?? item.solves?.length ?? 0,
        solves: item.solves ?? [],
      }));

      setLeaderboard(normalized);

      /* ---------------------------------------------------------------------- */
      /*                         Timeline Data Processing                       */
      /* ---------------------------------------------------------------------- */

      const top = normalized.slice(0, 10);
      const timelines: Record<string, TimelinePoint[]> = {};

      for (const member of top) {
        const label = member.username || member.teamName || "Unknown";

        /**
         * Sorts solve entries by timestamp (oldest → newest).
         */
        const sortByCreatedAt = (a: Solve, b: Solve): number =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        const sortedSolves = (member.solves ?? []).sort(sortByCreatedAt);

        let cumulative = 0;
        const points: TimelinePoint[] = [];

        // Build cumulative score points
        for (const solve of sortedSolves) {
          cumulative += solve.challenge?.points || 0;
          points.push({
            time: new Date(solve.createdAt).getTime(),
            score: cumulative,
            label,
          });
        }

        // Add baseline or fallback point
        if (points.length) {
          points.unshift({
            time: points[0].time - 60000, // start slightly earlier
            score: 0,
            label,
          });
        } else {
          points.push({
            time: Date.now(),
            score: member.score,
            label,
          });
        }

        timelines[label] = points;
      }

      setTimelineData(timelines);
    } catch (err) {
      console.error("❌ Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                          Auto-Refresh & Initial Load                       */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [teamId]);

  /* -------------------------------------------------------------------------- */
  /*                             Loading Placeholder                            */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="text-center py-10 text-green-400">
        <ChartIcon className="w-6 h-6 mx-auto mb-2 animate-pulse" />
        Loading leaderboard...
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              Component Markup                               */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ----------------------------- SCORE TIMELINE ----------------------------- */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-green-500/40 rounded-xl p-6 mb-8 shadow-lg shadow-green-500/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-green-400" />
            {teamId ? "Team Member Progress" : "Top Teams – Score Timeline"}
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />

            <XAxis
              dataKey="time"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(t) =>
                new Date(t).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              stroke="#888"
            />

            <YAxis stroke="#888" />

            <Tooltip
              labelFormatter={(v) =>
                new Date(v).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              formatter={(v) => [`${v} pts`, "Score"]}
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #0f0",
                borderRadius: "6px",
                color: "#0f0",
              }}
            />

            <Legend />

            {/* Render timeline lines */}
            {Object.entries(timelineData).map(([label, data], idx) => (
              <Line
                key={label}
                data={data}
                type="monotone"
                dataKey="score"
                name={label}
                stroke={teamColors[idx % teamColors.length]}
                strokeWidth={2}
                isAnimationActive
                dot={{
                  r: 4,
                  stroke: teamColors[idx % teamColors.length],
                  strokeWidth: 2,
                  fill: "#000",
                }}
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: teamColors[idx % teamColors.length],
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <p className="text-center text-sm text-green-400 mt-2">
          📊 Real-time cumulative scores
        </p>
      </div>

      {/* ----------------------------- LEADERBOARD LIST ----------------------------- */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-green-500/40 rounded-xl overflow-hidden">
        <div className="bg-green-950/30 px-6 py-4 border-b border-green-500/30">
          <h3 className="text-xl font-bold text-green-300">
            {teamId ? "Team Members" : "Top Teams"}
          </h3>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-center py-6 text-green-400">No scores yet.</p>
        ) : (
          leaderboard.slice(0, 10).map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="px-6 py-4 flex items-center justify-between border-b border-gray-800 hover:bg-green-950/10 transition-all duration-200"
            >
              {/* Rank + Team Name */}
              <div className="flex items-center space-x-6">
                <span
                  className={`text-2xl font-bold w-8 ${
                    idx === 0
                      ? "text-yellow-400"
                      : idx === 1
                      ? "text-gray-300"
                      : idx === 2
                      ? "text-amber-600"
                      : "text-green-400"
                  }`}
                >
                  #{idx + 1}
                </span>

                <div>
                  <div className="font-bold text-white text-lg">
                    {item.username || item.teamName}
                  </div>

                  <div className="text-sm text-green-300 flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    {item.solved} challenges solved
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">
                  {item.score}
                </div>
                <div className="text-xs text-gray-500">POINTS</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
