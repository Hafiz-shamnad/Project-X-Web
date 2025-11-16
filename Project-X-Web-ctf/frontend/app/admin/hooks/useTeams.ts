"use client";

import { useCallback, useState, useMemo } from "react";
import { Team } from "../types/Team";
import { TeamService } from "../services/team.service";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  /* ------------------------------------------
     FETCH TEAMS (memoized + safe)
  ------------------------------------------- */
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TeamService.list();
      setTeams(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------
     ACTIONS (memoized, no stale closures)
  ------------------------------------------- */
  const banTeam = useCallback(
    async (id: number, mins: number) => {
      await TeamService.ban(id, mins);
      await fetchTeams();
    },
    [fetchTeams]
  );

  const unbanTeam = useCallback(
    async (id: number) => {
      await TeamService.unban(id);
      await fetchTeams();
    },
    [fetchTeams]
  );

  const applyPenalty = useCallback(
    async (id: number, pts: number) => {
      await TeamService.penalty(id, pts);
      await fetchTeams();
    },
    [fetchTeams]
  );

  /* ------------------------------------------
     Memoized return to prevent re-renders
  ------------------------------------------- */
  return useMemo(
    () => ({
      teams,
      loading,
      fetchTeams,
      banTeam,
      unbanTeam,
      applyPenalty,
    }),
    [teams, loading, fetchTeams, banTeam, unbanTeam, applyPenalty]
  );
}
