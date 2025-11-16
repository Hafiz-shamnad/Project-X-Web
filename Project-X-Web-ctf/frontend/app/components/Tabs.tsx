"use client";

import { Target, Trophy } from "lucide-react";
import { useCallback, useMemo } from "react";

interface TabsProps {
  activeTab: "challenges" | "leaderboard";
  setActiveTab: (tab: "challenges" | "leaderboard") => void;
}

/* -------------------------------------------------------
   Reusable Tab Button (Fully Memoized & Clean)
-------------------------------------------------------- */
function TabButton({
  active,
  onClick,
  label,
  Icon,
  colors,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: any;
  colors: {
    textActive: string;
    bgActive: string;
    borderActive: string;
    shadowActive: string;
    textInactive: string;
    bgInactive: string;
    glow: string;
    underline: string;
  };
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative px-7 py-3 rounded-2xl font-semibold text-sm tracking-wide
        flex items-center gap-2.5 transition-all duration-300 overflow-hidden
        ${
          active
            ? `${colors.textActive} ${colors.bgActive} ${colors.borderActive} ${colors.shadowActive}`
            : `${colors.textInactive} ${colors.bgInactive}`
        }
      `}
    >
      {/* Active border glow */}
      {active && (
        <>
          <div className="absolute inset-0 rounded-2xl border opacity-70" style={{ borderColor: colors.borderActive.replace("border-", "") }} />
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: colors.underline }}
          />
        </>
      )}

      {/* Hover shimmer */}
      {!active && (
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.glow}`} />
      )}

      <Icon
        className={`
          w-4 h-4 relative z-10 transition-transform duration-300
          ${!active ? "group-hover:scale-110" : ""}
          ${label === "LEADERBOARD" && !active ? "group-hover:rotate-12" : ""}
        `}
      />

      <span className="relative z-10">{label}</span>

      {/* Glow pulse when active */}
      {active && (
        <div
          className="absolute inset-0 blur-xl -z-10 animate-pulse"
          style={{ background: colors.bgActive.replace("/20", "/25") }}
        />
      )}
    </button>
  );
}

/* -------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------- */
export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const onSelectChallenges = useCallback(() => setActiveTab("challenges"), [setActiveTab]);
  const onSelectLeaderboard = useCallback(() => setActiveTab("leaderboard"), [setActiveTab]);

  /* -------------------------------------------------------
     Shared Styles for both Tabs
  -------------------------------------------------------- */
  const styles = useMemo(
    () => ({
      challenges: {
        textActive: "text-blue-300",
        bgActive: "bg-blue-500/20",
        borderActive: "border-blue-400/40",
        shadowActive: "shadow-lg shadow-blue-500/25",
        textInactive: "text-slate-400 hover:text-blue-300",
        bgInactive: "hover:bg-blue-900/20",
        glow: "bg-gradient-to-r from-blue-700/0 via-blue-700/10 to-blue-700/0",
        underline: "linear-gradient(to right, #60a5fa, #22d3ee)",
      },
      leaderboard: {
        textActive: "text-cyan-300",
        bgActive: "bg-cyan-500/20",
        borderActive: "border-cyan-400/40",
        shadowActive: "shadow-lg shadow-cyan-500/25",
        textInactive: "text-slate-400 hover:text-cyan-300",
        bgInactive: "hover:bg-cyan-900/20",
        glow: "bg-gradient-to-r from-cyan-700/0 via-cyan-700/10 to-cyan-700/0",
        underline: "linear-gradient(to right, #22d3ee, #93c5fd)",
      },
    }),
    []
  );

  return (
    <div className="relative bg-slate-950/70 backdrop-blur-xl border-b border-blue-500/20">
      {/* top scanline */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center gap-3 py-4">
          <TabButton
            active={activeTab === "challenges"}
            onClick={onSelectChallenges}
            label="CHALLENGES"
            Icon={Target}
            colors={styles.challenges}
          />

          <TabButton
            active={activeTab === "leaderboard"}
            onClick={onSelectLeaderboard}
            label="LEADERBOARD"
            Icon={Trophy}
            colors={styles.leaderboard}
          />
        </div>
      </div>

      {/* bottom scanline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </div>
  );
}
