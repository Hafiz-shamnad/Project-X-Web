"use client";

import { memo, useMemo } from "react";
import {
  PlusCircle,
  Rocket,
  Trophy,
  Users,
  Megaphone,
} from "lucide-react";

export type TabId =
  | "create"
  | "manage"
  | "leaderboard"
  | "teams"
  | "announcement";

interface AdminTabsProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

function AdminTabsComponent({ activeTab, setActiveTab }: AdminTabsProps) {
  const tabs = useMemo(
    () => [
      { id: "create" as const, label: "Create Challenge", Icon: PlusCircle },
      { id: "manage" as const, label: "Manage Challenges", Icon: Rocket },
      { id: "leaderboard" as const, label: "Leaderboard", Icon: Trophy },
      { id: "teams" as const, label: "Teams", Icon: Users },
      { id: "announcement" as const, label: "Announcements", Icon: Megaphone },
    ],
    []
  );

  return (
    <nav
      className="flex flex-wrap justify-center gap-3 py-6 
                 border-b border-blue-500/30 
                 bg-gray-900/10 backdrop-blur-md"
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all
            ${
              isActive
                ? "bg-blue-500/20 text-cyan-300 border border-blue-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                : "bg-gray-800/40 text-gray-400 hover:text-cyan-300 hover:bg-gray-800/60 hover:shadow-[0_0_8px_rgba(56,189,248,0.2)]"
            }`}
          >
            <t.Icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default memo(AdminTabsComponent);
