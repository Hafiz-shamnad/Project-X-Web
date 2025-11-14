"use client";

import { useCallback, useState } from "react";
import { Challenge } from "../types/Challenge";
import { ChallengeService } from "../services/challenge.service";

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ChallengeService.list();
      setChallenges(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChallenge = async (fd: FormData) => {
    await ChallengeService.create(fd);
    await fetchChallenges();
  };

  const deleteChallenge = async (id: number) => {
    await ChallengeService.delete(id);
    await fetchChallenges();
  };

  const toggleRelease = async (id: number, released: boolean) => {
    await ChallengeService.toggle(id, released);
    await fetchChallenges();
  };

  return {
    challenges,
    loading,
    fetchChallenges,
    createChallenge,
    deleteChallenge,
    toggleRelease,
  };
}
