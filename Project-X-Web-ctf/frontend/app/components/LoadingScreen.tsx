// app/projectx/components/LoadingScreen.tsx
"use client";

import { Terminal } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <div className="flex items-center gap-3">
        <Terminal className="w-8 h-8 animate-spin" />
        <span className="text-lg tracking-widest">
          INITIALIZING CTF ARENA...
        </span>
      </div>
    </div>
  );
}
