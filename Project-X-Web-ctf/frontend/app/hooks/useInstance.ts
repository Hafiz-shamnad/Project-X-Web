"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Challenge } from "../types/Challenge";
import { formatTime } from "../utils/formatTime";
import toast from "react-hot-toast";

interface InstanceInfo {
  port: number;
  url: string;
  expiresAt: string;
}

export function useInstance(selectedChallenge: Challenge | null) {
  const [instance, setInstance] = useState<InstanceInfo | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [spawnLoading, setSpawnLoading] = useState(false);

  /* ----------------------------------------------------------
   * Restore (load) existing instance
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!selectedChallenge) {
      setInstance(null);
      setRemainingSeconds(null);
      return;
    }

    const fetchInstance = async () => {
      try {
        const data = await apiFetch(
          `/challenges/instance/${selectedChallenge.id}?t=${Date.now()}`
        );

        if (data.status === "running") {
          setInstance({
            port: data.port,
            url: data.url,
            expiresAt: data.expiresAt,
          });

          const diff = Math.max(
            0,
            Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
          );

          setRemainingSeconds(diff);
        } else {
          setInstance(null);
          setRemainingSeconds(null);
        }
      } catch (err) {
        console.error("Error loading instance:", err);
      }
    };

    fetchInstance();
  }, [selectedChallenge]);

  /* ----------------------------------------------------------
   * Countdown timer
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!remainingSeconds) return;

    const interval = setInterval(() => {
      setRemainingSeconds((sec) => {
        if (sec === null || sec <= 0) {
          setInstance(null);
          return null;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  /* ----------------------------------------------------------
   * Spawn environment
   * ---------------------------------------------------------- */
  const spawn = async (challengeId: number) => {
    setSpawnLoading(true);

    try {
      const data = await apiFetch(`/challenges/spawn/${challengeId}`, {
        method: "POST",
      });

      if (data.status === "created" || data.status === "running") {
        setInstance({
          port: data.port,
          url: data.url,
          expiresAt: data.expiresAt,
        });

        const diff = Math.max(
          0,
          Math.floor(
            (new Date(data.expiresAt).getTime() - Date.now()) / 1000
          )
        );
        setRemainingSeconds(diff);

        toast.success("Challenge environment ready!");
      } else {
        toast.error("Failed to start environment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to start container");
    } finally {
      setSpawnLoading(false);
    }
  };

  /* ----------------------------------------------------------
   * Stop environment (Optimistic UI)
   * ---------------------------------------------------------- */
  const stop = async (challengeId: number, opts?: { immediate?: boolean }) => {
    if (opts?.immediate) {
      setInstance(null);
      setRemainingSeconds(null);
      return;
    }

    try {
      const data = await apiFetch(`/challenges/stop/${challengeId}`, {
        method: "POST",
      });

      if (data.status === "destroyed") {
        toast.success("Environment stopped successfully!");
      } else {
        toast("Environment already stopped.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to stop environment");
    } finally {
      setInstance(null);
      setRemainingSeconds(null);
    }
  };

  /* ----------------------------------------------------------
   * Extend expiry by +30 mins
   * ---------------------------------------------------------- */
  const extend = async (challengeId: number): Promise<boolean> => {
    try {
      const data = await apiFetch(`/challenges/extend/${challengeId}`, {
        method: "POST",
      });

      if (data.status === "max_reached") {
        toast.error("Maximum allowed time (60 minutes) reached");
        return false;
      }

      if (data.status === "extended") {
        if (instance) {
          setInstance({
            ...instance,
            expiresAt: data.expiresAt,
          });
        }

        const diff = Math.max(
          0,
          Math.floor(
            (new Date(data.expiresAt).getTime() - Date.now()) / 1000
          )
        );

        setRemainingSeconds(diff);
        return true;
      }
    } catch (err) {
      console.error("Error extending:", err);
    }

    return false;
  };

  return {
    instance,
    spawnLoading,
    remainingSeconds,
    timeDisplay:
      remainingSeconds !== null ? formatTime(remainingSeconds) : "Expired",
    spawn,
    stop,
    extend,
  };
}
