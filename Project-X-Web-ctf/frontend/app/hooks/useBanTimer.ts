// app/projectx/hooks/useBanTimer.ts
"use client";

import { useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";

export function useBanTimer(bannedUntil: Date | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!bannedUntil) return;

    const update = () => {
      const now = Date.now();
      const diff = Math.max(
        0,
        Math.floor((bannedUntil.getTime() - now) / 1000)
      );
      setRemainingSeconds(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [bannedUntil]);

  const timerDisplay =
    remainingSeconds !== null ? formatTime(remainingSeconds) : "--:--";

  const isActive = remainingSeconds !== null && remainingSeconds > 0;

  return { remainingSeconds, timerDisplay, isActive };
}
