"use client";

import { useCallback, useState } from "react";
import { Team } from "../types/Team";
import { TeamService } from "../services/team.service";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TeamService.list();
      setTeams(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const banTeam = async (id: number, mins: number) => {
    await TeamService.ban(id, mins);
    await fetchTeams();
  };

  const unbanTeam = async (id: number) => {
    await TeamService.unban(id);
    await fetchTeams();
  };

  const applyPenalty = async (id: number, pts: number) => {
    await TeamService.penalty(id, pts);
    await fetchTeams();
  };

  return {
    teams,
    loading,
    fetchTeams,
    banTeam,
    unbanTeam,
    applyPenalty,
  };
}
