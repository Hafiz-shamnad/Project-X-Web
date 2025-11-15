// app/projectx/hooks/useInstance.ts
"use client";

import { useEffect, useState } from "react";
import type { Challenge } from "../types/Challenge";
import { formatTime } from "../utils/formatTime";
import toast from "react-hot-toast";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface InstanceInfo {
  port: number;
  url: string;
  expiresAt: string;
}

export function useInstance(selectedChallenge: Challenge | null) {
  const [instance, setInstance] = useState<InstanceInfo | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    null
  );
  const [spawnLoading, setSpawnLoading] = useState(false);

  // Restore existing instance for selected challenge
  useEffect(() => {
    if (!selectedChallenge) {
      setInstance(null);
      setRemainingSeconds(null);
      return;
    }

    const fetchInstance = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/challenges/instance/${selectedChallenge.id}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.status === "running") {
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

  // Countdown
  useEffect(() => {
    if (!remainingSeconds) return;

    const interval = setInterval(() => {
      setRemainingSeconds((sec) => {
        if (sec === null) return null;
        if (sec <= 0) {
          setInstance(null);
          return null;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const spawn = async (challengeId: number) => {
    setSpawnLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/challenges/spawn/${challengeId}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();

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

  const stop = async (challengeId: number) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/challenges/stop/${challengeId}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();

      if (data.status === "destroyed") {
        toast.success("Environment stopped successfully!");
      } else {
        toast("Environment already stopped.");
      }

      setInstance(null);
      setRemainingSeconds(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to stop environment");
    }
  };

  return {
    instance,
    spawnLoading,
    remainingSeconds,
    timeDisplay:
      remainingSeconds !== null ? formatTime(remainingSeconds) : "Expired",
    spawn,
    stop,
  };
}
