// app/projectx/hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
  username: string;
  teamId: number | null;
  bannedUntil: string | null;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.user?.username) {
          setUser({
            username: data.user.username,
            teamId: data.user.teamId ?? null,
            bannedUntil: data.user.bannedUntil ?? null,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const bannedDate = user?.bannedUntil
    ? new Date(user.bannedUntil)
    : null;

  const isPermanentBanned =
    bannedDate && bannedDate.getFullYear() >= 9999;

  const isTempBanned =
    bannedDate &&
    !isPermanentBanned &&
    bannedDate.getTime() > Date.now();

  return {
    user,
    loading,
    bannedDate,
    isTempBanned,
    isPermanentBanned,
  };
}
