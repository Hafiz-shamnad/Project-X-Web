"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Challenge } from "../types/Challenge";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface UseChallengesParams {
  teamId: number | null;
}

export function useChallenges({ teamId }: UseChallengesParams) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Avoid setting state after unmount → fastest safe pattern
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** ------------------------------
   * Fetch Challenges (released only)
   * ------------------------------ */
  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/challenges`, {
        credentials: "include",
      });
      if (!res.ok) return [];

      const data: Challenge[] = await res.json();
      return data.filter((c) => c.released);
    } catch (err) {
      console.error("Error loading challenges:", err);
      return [];
    }
  }, []);

  /** ------------------------------
   * Fetch Team Solves
   * ------------------------------ */
  const fetchSolves = useCallback(async () => {
    if (!teamId) return [];

    try {
      const res = await fetch(`${BACKEND_URL}/team/${teamId}/solves`, {
        credentials: "include",
      });
      if (!res.ok) return [];

      const solvedData = await res.json();
      return (
        solvedData?.solved?.map(
          (s: { challengeId: number }) => s.challengeId
        ) ?? []
      );
    } catch (err) {
      console.error("Error loading solved challenges:", err);
      return [];
    }
  }, [teamId]);

  /** ------------------------------
   * Initial + dependency refresh
   * MOST OPTIMIZED LOADING
   * ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    (async () => {
      const [challs, solves] = await Promise.all([
        fetchChallenges(),
        fetchSolves(),
      ]);

      if (cancelled || !mounted.current) return;

      // Single atomic state update → minimal UI rerenders
      setChallenges(challs);
      setSolvedIds(solves);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchChallenges, fetchSolves]);

  /** ------------------------------
   * Manual Refresh
   * Most efficient version
   * ------------------------------ */
  const refresh = useCallback(async () => {
    setLoading(true);
    const [c, s] = await Promise.all([fetchChallenges(), fetchSolves()]);
    if (!mounted.current) return;
    setChallenges(c);
    setSolvedIds(s);
    setLoading(false);
  }, [fetchChallenges, fetchSolves]);

  return { challenges, solvedIds, loading, refresh };
}
