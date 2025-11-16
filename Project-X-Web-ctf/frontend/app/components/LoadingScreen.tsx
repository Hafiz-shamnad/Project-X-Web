"use client";

import { memo } from "react";
import { Terminal } from "lucide-react";

function LoadingScreenComponent() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Terminal
          className="w-8 h-8 animate-spin will-change-transform"
          aria-hidden="true"
        />
        <span className="text-lg tracking-widest select-none">
          INITIALIZING CTF ARENA...
        </span>
      </div>
    </div>
  );
}

export default memo(LoadingScreenComponent);
