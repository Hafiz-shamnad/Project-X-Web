"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

export default function Toast({
  message,
  type,
}: {
  message: string | null;
  type: "success" | "error";
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg border backdrop-blur-md shadow-lg flex items-center gap-3
        ${
          type === "success"
            ? "bg-green-600/10 border-green-500 text-green-300"
            : "bg-red-600/10 border-red-500 text-red-300"
        }`}
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
