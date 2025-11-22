"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Toast({
  message,
  type,
  duration = 3000,
}: {
  message: string | null;
  type: "success" | "error";
  duration?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;

    setVisible(true);

    const hideTimer = setTimeout(() => setVisible(false), duration - 300);
    const destroyTimer = setTimeout(() => setVisible(false), duration);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(destroyTimer);
    };
  }, [message, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed top-6 right-6 z-[999999]   /* 🔥 always above navbar */
        px-6 py-4 rounded-lg border backdrop-blur-md shadow-lg
        flex items-center gap-3 transition-all duration-300

        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}

        ${type === "success"
          ? "bg-green-600/10 border-green-500 text-green-300"
          : "bg-red-600/10 border-red-500 text-red-300"}
      `}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
}
