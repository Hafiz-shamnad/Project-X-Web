// src/app/admin/hooks/useChallenges.ts

"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/app/lib/api";
import type { Challenge } from "../types/Challenge";

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------------------
   * LOAD ALL (GET /api/admin/challenges)
   * ---------------------------------------------------------- */
  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Challenge[]>("/admin/challenges");
      setChallenges(data);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ----------------------------------------------------------
   * CREATE (POST /api/admin/challenge)
   * FormData upload
   * ---------------------------------------------------------- */
  const createChallenge = useCallback(
    async (form: FormData) => {
      await apiFetch("/admin/challenge", {
        method: "POST",
        body: form,
      });
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  /* ----------------------------------------------------------
   * DELETE (DELETE /api/admin/challenge/:id)
   * ---------------------------------------------------------- */
  const deleteChallenge = useCallback(
    async (id: number) => {
      await apiFetch(`/admin/challenge/${id}`, {
        method: "DELETE",
      });
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  /* ----------------------------------------------------------
   * TOGGLE RELEASE (PATCH /api/admin/challenge/:id/toggle)
   * ---------------------------------------------------------- */
  const toggleRelease = useCallback(
    async (id: number, newState: boolean) => {
      await apiFetch(`/admin/challenge/${id}/toggle`, {
        method: "PATCH",
        json: { released: newState },
      });
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  /* ----------------------------------------------------------
   * BULK RELEASE (PATCH /api/admin/challenges/bulk/release)
   * ---------------------------------------------------------- */
  const bulkRelease = useCallback(
    async (ids: number[]) => {
      await apiFetch("/admin/challenges/bulk/release", {
        method: "PATCH",
        json: { ids },
      });
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  /* ----------------------------------------------------------
   * BULK HIDE (PATCH /api/admin/challenges/bulk/hide)
   * ---------------------------------------------------------- */
  const bulkHide = useCallback(
    async (ids: number[]) => {
      await apiFetch("/admin/challenges/bulk/hide", {
        method: "PATCH",
        json: { ids },
      });
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  /* ----------------------------------------------------------
   * BULK DELETE (DELETE /api/admin/challenges/bulk/delete)
   * ---------------------------------------------------------- */
  const bulkDelete = useCallback(
    async (ids: number[]) => {
      await apiFetch("/admin/challenges/bulk/delete", {
        method: "DELETE",
        json: { ids },
      });
      await fetchChallenges();
    },
    [fetchChallenges]
  );

  return {
    challenges,
    loading,
    fetchChallenges,
    createChallenge,
    deleteChallenge,
    toggleRelease,
    bulkRelease,
    bulkHide,
    bulkDelete,
  };
}
