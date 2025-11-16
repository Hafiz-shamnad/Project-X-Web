"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/formatTime";

export function useBanTimer(bannedUntil: Date | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear old interval immediately (fastest possible cleanup)
    const old = intervalRef.current;
    if (old) clearInterval(old);

    if (!bannedUntil) {
      setRemainingSeconds(null);
      intervalRef.current = null;
      return;
    }

    const target = bannedUntil.getTime();

    const update = () => {
      const diff = (target - Date.now()) / 1000;

      // If expired → stop completely
      if (diff <= 0) {
        setRemainingSeconds(0);
        const i = intervalRef.current;
        if (i) clearInterval(i);
        intervalRef.current = null;
        return;
      }

      // Only update when value changes → prevents render spam
      setRemainingSeconds((prev) => {
        const next = Math.floor(diff);
        return prev === next ? prev : next; // avoids unnecessary renders
      });
    };

    update(); // initial execution

    // If already expired → no interval required
    if (target <= Date.now()) {
      intervalRef.current = null;
      return;
    }

    // **1-second interval — optimal cadence**
    intervalRef.current = setInterval(update, 1000);

    return () => {
      const i = intervalRef.current;
      if (i) clearInterval(i);
      intervalRef.current = null;
    };
  }, [bannedUntil]);

  const isActive = remainingSeconds !== null && remainingSeconds > 0;

  return {
    remainingSeconds,
    timerDisplay:
      remainingSeconds !== null ? formatTime(remainingSeconds) : "--:--",
    isActive,
  };
}
