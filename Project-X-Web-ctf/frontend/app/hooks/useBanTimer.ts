"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/formatTime";

export function useBanTimer(bannedUntil: Date | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Browser-safe timeout type
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear previous interval immediately
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!bannedUntil) {
      setRemainingSeconds(null);
      return;
    }

    const target = bannedUntil.getTime();

    const update = () => {
      const diff = (target - Date.now()) / 1000;

      if (diff <= 0) {
        setRemainingSeconds(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      setRemainingSeconds((prev) => {
        const next = Math.floor(diff);
        return prev === next ? prev : next; // prevent unnecessary renders
      });
    };

    update(); // initial run

    if (target <= Date.now()) {
      return; // already expired
    }

    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [bannedUntil]);

  const isActive =
    remainingSeconds !== null && remainingSeconds > 0;

  return {
    remainingSeconds,
    timerDisplay:
      remainingSeconds !== null ? formatTime(remainingSeconds) : "--:--",
    isActive,
  };
}
