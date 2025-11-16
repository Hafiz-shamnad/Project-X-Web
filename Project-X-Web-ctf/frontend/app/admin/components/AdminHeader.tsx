"use client";

import { memo, useMemo } from "react";
import { Shield } from "lucide-react";

interface AdminHeaderProps {
  challengeCount: number;
  teamCount: number;
}

function AdminHeaderComponent({ challengeCount, teamCount }: AdminHeaderProps) {
  // Memoized stats configuration
  const stats = useMemo(
    () => [
      {
        label: "Challenges",
        count: challengeCount,
        border: "border-blue-500/30",
        bg: "bg-blue-900/20",
        text: "text-blue-300",
        countColor: "text-blue-400",
      },
      {
        label: "Teams",
        count: teamCount,
        border: "border-blue-400/30",
        bg: "bg-blue-800/20",
        text: "text-blue-200",
        countColor: "text-blue-300",
      },
    ],
    [challengeCount, teamCount]
  );

  return (
    <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center select-none">

      {/* LEFT — ICON + TITLE */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* Neon glow */}
          <div className="absolute inset-0 blur-xl bg-blue-500/30 rounded-xl" />

          {/* Icon container */}
          <div className="relative bg-[#0b1428]/80 rounded-xl p-3 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)] backdrop-blur-md">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-widest text-blue-300">
            ADMIN PANEL
          </h1>
          <p className="text-xs text-blue-400/60 tracking-[0.15em]">
            SYSTEM CONTROL CENTER
          </p>
        </div>
      </div>

      {/* RIGHT — STATS */}
      <div className="hidden md:flex items-center gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`px-4 py-2 rounded-lg border ${s.border} ${s.bg} ${s.text} font-semibold text-sm backdrop-blur-md`}
          >
            <span className="opacity-60">{s.label}:</span>
            <span className={`${s.countColor} font-bold ml-1`}>
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

export default memo(AdminHeaderComponent);
