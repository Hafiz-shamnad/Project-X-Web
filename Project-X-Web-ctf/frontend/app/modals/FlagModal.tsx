"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FileDown,
  Flag,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Target,
  Award,
  Zap,
} from "lucide-react";

interface FlagModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payload: any) => void;

  username: string;
  challengeId: number | null;
  backendUrl: string;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  filePath?: string | null;
}

type MessageType = "success" | "error" | "info";

interface Message {
  text: string;
  type: MessageType;
}

export default function FlagModal({
  open,
  onClose,
  onSuccess,
  username,
  challengeId,
  backendUrl,
}: FlagModalProps) {
  const [flag, setFlag] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const mounted = useRef(true);

  // Prevent async updates after unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** --------------------------------------
   * Load Challenge Details
   * -------------------------------------- */
  const loadChallenge = useCallback(async () => {
    if (!challengeId) return;

    setFetching(true);
    setMessage(null);

    try {
      const res = await fetch(`${backendUrl}/challenges/${challengeId}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (mounted.current && res.ok) setChallenge(data);
    } catch (err) {
      console.error("Error fetching challenge:", err);
    } finally {
      if (mounted.current) setFetching(false);
    }
  }, [challengeId, backendUrl]);

  /** Trigger fetch when modal opens */
  useEffect(() => {
    if (open) {
      loadChallenge();
    } else {
      setFlag("");
      setMessage(null);
      setChallenge(null);
    }
  }, [open, loadChallenge]);

  /** --------------------------------------
   * Submit Flag
   * -------------------------------------- */
  const submitFlag = useCallback(async () => {
    if (!flag.trim() || !challengeId) return;

    setLoading(true);
    setMessage({ text: "Checking flag...", type: "info" });

    try {
      const res = await fetch(`${backendUrl}/flag/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, challengeId, flag }),
      });

      const data = await res.json();
      if (!mounted.current) return;

      if (res.ok) {
        onSuccess(data);
        setFlag("");
        setMessage({ text: data.message || "Flag accepted!", type: "success" });
      } else {
        setMessage({
          text: data.error || data.message || "Incorrect flag.",
          type: "error",
        });
      }
    } catch {
      if (mounted.current) {
        setMessage({
          text: "Network error. Try again later.",
          type: "error",
        });
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [flag, challengeId, backendUrl, username, onSuccess]);

  /** Difficulty color styles */
  const difficultyStyles = useCallback((level: string) => {
    const styles: any = {
      Easy: {
        bg: "from-emerald-500/20 to-green-500/10",
        border: "border-emerald-500/40",
        text: "text-emerald-300",
      },
      Medium: {
        bg: "from-yellow-500/20 to-amber-500/10",
        border: "border-yellow-500/40",
        text: "text-yellow-300",
      },
      Hard: {
        bg: "from-red-500/20 to-orange-500/10",
        border: "border-red-500/40",
        text: "text-red-300",
      },
    };
    return styles[level] || styles.Easy;
  }, []);

  /** --------------------------------------
   * Banned Screen
   * -------------------------------------- */
  if (
    message?.type === "error" &&
    message.text.toLowerCase().includes("banned")
  ) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-red-900/20 to-slate-900/90 border border-red-500/40 shadow-[0_8px_32px_rgba(239,68,68,0.3)] backdrop-blur-xl animate-[scaleIn_0.3s_ease-out]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 mb-4">
              <Lock className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-red-300 mb-3">
              Access Restricted
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  const difficulty = challenge ? difficultyStyles(challenge.difficulty) : null;

  /** --------------------------------------
   * Main Modal
   * -------------------------------------- */
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl border border-blue-500/30 shadow-[0_8px_32px_rgba(59,130,246,0.2)] backdrop-blur-xl animate-[scaleIn_0.3s_ease-out] overflow-hidden">
        
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          {fetching ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-400 text-lg font-mono">Loading challenge...</p>
            </div>
          ) : !challenge ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Challenge not found.</p>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="p-8 pb-6 border-b border-blue-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black bg-gradient-to-r from-blue-200 via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-3">
                      {challenge.name}
                    </h3>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
                        {challenge.category}
                      </span>
                      
                      {difficulty && (
                        <span className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${difficulty.bg} border ${difficulty.border} ${difficulty.text} text-sm font-semibold`}>
                          {challenge.difficulty}
                        </span>
                      )}
                      
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-300 text-sm font-semibold flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        {challenge.points} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">
                    {challenge.description}
                  </p>
                </div>

                {/* File Download */}
                {challenge.filePath && (
                  <a
                    href={`${backendUrl}/download/${challenge.filePath.split("/").pop()}`}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all font-semibold"
                  >
                    <FileDown className="w-5 h-5" />
                    Download Challenge File
                  </a>
                )}
              </div>

              {/* Submit Flag Section */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                    <Flag className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Submit Your Flag</h4>
                </div>

                <div className="relative">
                  <input
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitFlag()}
                    placeholder="FLAG{your_flag_here}"
                    className="w-full bg-slate-800/50 text-slate-200 px-5 py-4 rounded-xl border border-blue-500/30 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-base placeholder:text-slate-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Zap className="w-5 h-5 text-blue-500/40" />
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
                    className={`mt-4 p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                      message.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : message.type === "error"
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                    }`}
                  >
                    {message.type === "success" && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {message.type === "error" && (
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    {message.type === "info" && (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        message.type === "success"
                          ? "text-emerald-300"
                          : message.type === "error"
                          ? "text-red-300"
                          : "text-blue-300"
                      }`}
                    >
                      {message.text}
                    </span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={loading || !flag.trim()}
                    onClick={submitFlag}
                    className={`px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all ${
                      loading || !flag.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validating...
                      </span>
                    ) : (
                      "Submit Flag"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}