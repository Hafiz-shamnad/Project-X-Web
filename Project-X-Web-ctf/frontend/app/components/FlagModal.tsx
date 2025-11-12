"use client";
import React, { useEffect, useState } from "react";
import {
  FileDown,
  Zap,
  Flag,
  Loader2,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  username: string;
  challengeId: number | null;
  backendUrl: string;
};

type Challenge = {
  id: number;
  name: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  file?: string | null;
  filePath?: string | null;
};

export default function FlagModal({
  open,
  onClose,
  onSuccess,
  username,
  challengeId,
  backendUrl,
}: Props) {
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [fetching, setFetching] = useState(false);

  // 🧠 Fetch challenge details
  useEffect(() => {
    if (!open || !challengeId) return;
    const fetchChallenge = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${backendUrl}/challenges/${challengeId}`);
        const data = await res.json();
        if (res.ok) setChallenge(data);
      } catch (err) {
        console.error("Error loading challenge:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchChallenge();
  }, [open, challengeId, backendUrl]);

  // 🚩 Submit flag
  const submitFlag = async () => {
    if (!flag.trim()) return;
    setLoading(true);
    setMessage({ text: "Checking flag...", type: "info" });
    try {
      const res = await fetch(`${backendUrl}/flag/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, challengeId, flag }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
        setMessage({ text: data.message || "✅ Correct flag!", type: "success" });
        setFlag("");
      } else {
        setMessage({ text: data.message || "❌ Wrong flag!", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  if (!open || !challengeId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
          relative w-full max-w-lg p-6 rounded-2xl border border-green-500/40
          bg-gradient-to-br from-black via-gray-950/90 to-green-950/10
          backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,100,0.2)]
          animate-fadeIn transition-all duration-300
        "
      >
        {/* ✖ Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-green-400 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-8 text-green-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading challenge...</p>
          </div>
        ) : challenge ? (
          <>
            {/* HEADER */}
            <div className="mb-4 border-b border-green-500/30 pb-3">
              <h3 className="text-2xl font-bold text-white tracking-wide drop-shadow-[0_0_8px_rgba(0,255,100,0.3)]">
                {challenge.name}
              </h3>
              <p className="text-sm text-green-400 mt-1">
                {challenge.category} •{" "}
                <span className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </span>{" "}
                • <Zap className="inline w-4 h-4 ml-1 text-yellow-400" />{" "}
                {challenge.points} pts
              </p>
            </div>

            {/* DESCRIPTION */}
            <p className="text-green-300/90 text-sm leading-relaxed mb-4 whitespace-pre-line">
              {challenge.description}
            </p>

            {/* FILE DOWNLOAD */}
            {(challenge?.filePath || challenge?.file) && (
              <a
                href={`${backendUrl}/download/${(challenge.filePath || challenge.file)?.split("/").pop()}`}
                className="flex items-center gap-2 text-green-300 hover:text-green-200 text-sm mb-5 transition-all hover:drop-shadow-[0_0_6px_#00ff99]"
              >
                <FileDown className="w-4 h-4" /> Download Challenge File
              </a>
            )}

            {/* FLAG SECTION */}
            <div className="border-t border-green-700/40 pt-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4 text-green-400" /> Submit Flag
              </h4>

              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFlag()}
                placeholder="FLAG{example_flag_here}"
                className="
                  w-full px-4 py-3 text-green-200 bg-gray-900/50 rounded-lg border border-green-600/50
                  placeholder-gray-500 outline-none focus:border-green-400
                  transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,255,100,0.3)]
                "
              />

              {/* Message */}
              {message && (
                <div
                  className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
                    message.type === "success"
                      ? "text-green-400"
                      : message.type === "error"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {message.type === "success" && (
                    <CheckCircle2 className="w-4 h-4 animate-pulse" />
                  )}
                  {message.type === "error" && (
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                  )}
                  {message.text}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="
                    px-4 py-2 rounded-md border border-green-700/40 text-gray-300
                    hover:text-white hover:border-green-400 transition-all
                    hover:shadow-[0_0_10px_rgba(0,255,100,0.3)]
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={submitFlag}
                  disabled={loading || !flag.trim()}
                  className={`
                    px-6 py-2 rounded-md font-bold text-black
                    bg-gradient-to-r from-green-600 to-green-500
                    hover:from-green-500 hover:to-green-400
                    shadow-[0_0_15px_rgba(0,255,120,0.4)]
                    hover:shadow-[0_0_20px_rgba(0,255,140,0.6)]
                    transition-all active:scale-[0.97]
                    ${loading ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-green-400 text-center">Challenge not found.</p>
        )}
      </div>
    </div>
  );
}
