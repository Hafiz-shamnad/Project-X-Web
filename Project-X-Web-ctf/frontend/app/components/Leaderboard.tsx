"use client";

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

interface TimelinePoint {
  time: number; // ✅ numeric timestamp for proper chart scaling
  score: number;
  label: string;
}

type TeamData =
  | {
      id?: number;
      teamName: string;
      score: number;
      solved: number;
      solves?: { challenge: { points: number }; createdAt: string }[];
    }
  | {
      id?: number;
      username: string;
      score: number;
      solved: number;
      solves?: { challenge: { points: number }; createdAt: string }[];
    };

interface LeaderboardProps {
  backendUrl: string;
  teamId: number | null; // null for global, teamId for member leaderboard
}

export default function Leaderboard({ backendUrl, teamId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<TeamData[]>([]);
  const [timelineData, setTimelineData] = useState<
    Record<string, TimelinePoint[]>
  >({});
  const [loading, setLoading] = useState(true);

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

  // ✅ Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const url = teamId
        ? `${backendUrl}/team/${teamId}/members`
        : `${backendUrl}/leaderboard/teams`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      const entries: TeamData[] = Array.isArray(data)
        ? data
        : Array.isArray(data.teams)
        ? data.teams
        : [];

      setLeaderboard(entries);

      // ✅ Build timeline data
      const topTeams = entries.slice(0, 10);
      const timelines: Record<string, TimelinePoint[]> = {};

      for (const team of topTeams) {
        const solves = (Array.isArray(team.solves) ? team.solves : []).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

        let cumulative = 0;

        // ✅ Use dynamic label (teamName or username)
        const label =
          "teamName" in team
            ? team.teamName
            : "username" in team
            ? team.username
            : "Unknown";

        timelines[label] = solves.map((s) => {
          cumulative += s.challenge?.points || 0;
          return {
            time: new Date(s.createdAt).getTime(), // ✅ numeric timestamp
            score: cumulative,
            label,
          };
        });

        // ✅ Add base zero point so all start from 0
        if (timelines[label]?.length) {
          timelines[label].unshift({
            time: timelines[label][0].time - 60000,
            score: 0,
            label,
          });
        }
      }

      setTimelineData(timelines);
    } catch (err) {
      console.error("❌ Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [teamId]);

  if (loading) {
    return (
      <div className="text-center py-10 text-green-400">
        <ChartIcon className="w-6 h-6 mx-auto mb-2 animate-pulse" />
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 🟩 SCORE GROWTH CHART */}
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-green-400" />
            {teamId ? "Team Member Progress" : "Top Teams – Score Progress"}
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(time) =>
                new Date(time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              }
              stroke="#888"
            />
            <YAxis stroke="#888" />
            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              }
              formatter={(value) => [`${value} pts`, "Score"]}
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #0f0",
                borderRadius: "6px",
                color: "#0f0",
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
                dot={false}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <p className="text-center text-sm text-green-400 mt-2">
          📊 Real-time cumulative scores — time-based and accurate.
        </p>
      </div>

      {/* 🏆 LEADERBOARD TABLE */}
      <div className="bg-gray-900 border border-green-500 rounded-lg">
        <div className="bg-gray-800 px-6 py-4 border-b border-green-500">
          <h3 className="text-xl font-bold text-white">
            {teamId ? "Team Members" : "Top Teams"}
          </h3>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-center py-6 text-green-400">
            No teams have scored yet.
          </p>
        ) : (
          leaderboard.slice(0, 10).map((team, idx) => (
            <div
              key={`${
                "teamName" in team
                  ? team.teamName
                  : "username" in team
                  ? team.username
                  : "team"
              }-${idx}`}
              className="px-6 py-4 flex items-center justify-between border-b border-gray-800 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-6">
                <span
                  className="text-2xl font-bold w-8"
                  style={{ color: teamColors[idx % teamColors.length] }}
                >
                  #{idx + 1}
                </span>
                <div>
                  <div className="font-bold text-white text-lg">
                    {"teamName" in team
                      ? team.teamName
                      : "username" in team
                      ? team.username
                      : "Unknown"}
                  </div>
                  <div className="text-sm text-green-300">
                    <Flag className="w-3 h-3 inline-block mr-1" />
                    {team.solved || 0} challenges solved
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">
                  {team.score}
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
