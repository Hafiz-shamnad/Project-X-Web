"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export interface UserProfile {
  id?: number;
  username: string;
  teamId: number | null;
  bannedUntil: string | null;
  role?: string;
}

interface UserState {
  user: UserProfile | null;
  bannedDate: Date | null;
  isTempBanned: boolean;
  isPermanentBanned: boolean;
}

export function useUser() {
  const [state, setState] = useState<UserState>({
    user: null,
    bannedDate: null,
    isTempBanned: false,
    isPermanentBanned: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await apiFetch("/auth/me", { auth: true });

        if (!data?.user) {
          if (!cancelled) setLoading(false);
          return;
        }

        const bannedUntil = data.user.bannedUntil ?? null;
        const bannedDate = bannedUntil ? new Date(bannedUntil) : null;

        const isPermanentBanned =
          bannedDate !== null && bannedDate.getFullYear() >= 9999;

        const isTempBanned =
          bannedDate !== null &&
          !isPermanentBanned &&
          bannedDate.getTime() > Date.now();

        if (!cancelled) {
          setState({
            user: {
              id: data.user.id,
              username: data.user.username,
              teamId: data.user.teamId ?? null,
              bannedUntil,
              role: data.user.role,
            },
            bannedDate,
            isTempBanned,
            isPermanentBanned,
          });
        }
      } catch (err) {
        console.error("useUser /auth/me failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    loading,
  };
}
