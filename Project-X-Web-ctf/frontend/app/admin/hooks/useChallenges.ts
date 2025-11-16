"use client";

import { useCallback, useState, useMemo } from "react";
import { Challenge } from "../types/Challenge";
import { ChallengeService } from "../services/challenge.service";

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------
     FETCH CHALLENGES (Memoized)
  --------------------------------------------- */
  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ChallengeService.list();
      setChallenges(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------------------------
     CRUD Operations (Memoized, no stale closures)
  --------------------------------------------- */

  const createChallenge = useCallback(
    async (fd: FormData) => {
      await ChallengeService.create(fd);
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  const deleteChallenge = useCallback(
    async (id: number) => {
      await ChallengeService.delete(id);
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  const toggleRelease = useCallback(
    async (id: number, released: boolean) => {
      await ChallengeService.toggle(id, released);
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  /* ---------------------------------------------
     Memoized Return Object (Prevents re-renders)
  --------------------------------------------- */
  return useMemo(
    () => ({
      challenges,
      loading,
      fetchChallenges,
      createChallenge,
      deleteChallenge,
      toggleRelease,
    }),
    [
      challenges,
      loading,
      fetchChallenges,
      createChallenge,
      deleteChallenge,
      toggleRelease,
    ]
  );
}
