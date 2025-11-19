"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
  username: string;
  teamId: number | null;
  bannedUntil: string | null;
}

interface UserState {
  user: UserProfile | null;
  bannedDate: Date | null;
  isTempBanned: boolean;
  isPermanentBanned: boolean;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL;

export function useUser() {
  const [state, setState] = useState<UserState>({
    user: null,
    bannedDate: null,
    isTempBanned: false,
    isPermanentBanned: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.user?.username) {
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
              username: data.user.username,
              teamId: data.user.teamId ?? null,
              bannedUntil,
            },
            bannedDate,
            isTempBanned,
            isPermanentBanned,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
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
