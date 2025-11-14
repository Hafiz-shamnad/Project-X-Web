"use client";

import { PlusCircle, Rocket, Trophy, Users } from "lucide-react";

export default function AdminTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: "create" | "manage" | "leaderboard" | "teams";
  setActiveTab: (tab: "create" | "manage" | "leaderboard" | "teams") => void;
}) {
  const tabs = [
    { id: "create", label: "Create Challenge", icon: <PlusCircle /> },
    { id: "manage", label: "Manage Challenges", icon: <Rocket /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy /> },
    { id: "teams", label: "Teams", icon: <Users /> },
  ] as const;

  return (
    <nav className="flex flex-wrap justify-center gap-3 py-6 border-b border-green-500/30 bg-gray-900/10 backdrop-blur-md">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${
            activeTab === t.id
              ? "bg-green-500/20 text-green-400 border border-green-400/50 shadow-md"
              : "bg-gray-800/40 text-gray-400 hover:text-green-300 hover:bg-gray-800/60"
          }`}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
