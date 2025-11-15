// app/projectx/hooks/useChallenges.ts
"use client";

import { useCallback, useEffect, useState } from "react";
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

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/challenges`, {
        credentials: "include",
      });
      const data: Challenge[] = await res.json();
      setChallenges(data.filter((c) => c.released));
    } catch (err) {
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSolves = useCallback(async () => {
    if (!teamId) return;
    try {
      const solvedRes = await fetch(
        `${BACKEND_URL}/team/${teamId}/solves`,
        {
          credentials: "include",
        }
      );
      const solvedData = await solvedRes.json();
      setSolvedIds(
        solvedData?.solved?.map(
          (s: { challengeId: number }) => s.challengeId
        ) || []
      );
    } catch (err) {
      console.error("Error loading solved challenges:", err);
    }
  }, [teamId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    fetchSolves();
  }, [fetchSolves]);

  const refresh = async () => {
    await fetchChallenges();
    await fetchSolves();
  };

  return {
    challenges,
    solvedIds,
    loading,
    refresh,
  };
}
