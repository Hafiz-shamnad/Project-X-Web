"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Challenge } from "../types/Challenge";

interface UseChallengesParams {
  teamId: number | null;
}

export function useChallenges({ teamId }: UseChallengesParams) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /* ----------------------------------------
   * Fetch Public Challenges (no token)
   * ---------------------------------------- */
  const fetchChallenges = useCallback(async () => {
    try {
      const data = await apiFetch<Challenge[]>("/challenges");

      return data.filter((c) => c.released === true);
    } catch (err) {
      console.error("Error loading challenges:", err);
      return [];
    }
  }, []);

  /* ----------------------------------------
   * Fetch Team Solves (protected → needs auth)
   * ---------------------------------------- */
  const fetchSolves = useCallback(async () => {
    if (!teamId) return [];

    try {
      const solvedResponse = await apiFetch(`/team/${teamId}/solves`, {
        auth: true, // IMPORTANT FOR JWT
      });

      return (
        solvedResponse?.solved?.map(
          (s: { challengeId: number }) => s.challengeId
        ) ?? []
      );
    } catch (err) {
      console.error("Error loading solves:", err);
      return [];
    }
  }, [teamId]);

  /* ----------------------------------------
   * Initial load + refresh on teamId change
   * ---------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [challs, solves] = await Promise.all([
        fetchChallenges(),
        fetchSolves(),
      ]);

      if (!cancelled && mounted.current) {
        setChallenges(challs);
        setSolvedIds(solves);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchChallenges, fetchSolves]);

  /* ----------------------------------------
   * Manual Refresh (pull to refresh)
   * ---------------------------------------- */
  const refresh = useCallback(async () => {
    setLoading(true);

    const [c, s] = await Promise.all([fetchChallenges(), fetchSolves()]);

    if (mounted.current) {
      setChallenges(c);
      setSolvedIds(s);
      setLoading(false);
    }
  }, [fetchChallenges, fetchSolves]);

  return { challenges, solvedIds, loading, refresh };
}
