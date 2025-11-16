"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FileDown,
  Flag,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
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
      mounted.current = false; // ✔ returns void → VALID
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
  const difficultyColor = useCallback((level: string) => {
    const map: any = {
      Easy: "text-blue-300",
      Medium: "text-blue-400",
      Hard: "text-blue-500",
    };
    return map[level] || "text-blue-300";
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
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative w-full max-w-md p-6 rounded-xl bg-[#0a1020]/80 border border-blue-500/40 shadow-lg shadow-blue-900/50 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-300 hover:text-blue-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center flex flex-col items-center">
            <AlertTriangle className="w-10 h-10 text-blue-400 mb-3" />
            <h2 className="text-xl font-bold text-blue-300 mb-2">
              Access Restricted
            </h2>
            <p className="text-blue-200 text-sm">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  /** --------------------------------------
   * Main Modal
   * -------------------------------------- */
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-[#0b1428]/80 rounded-xl border border-blue-500/30 shadow-xl shadow-blue-900/40 p-6 backdrop-blur-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-300 hover:text-blue-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {fetching ? (
          <div className="text-center py-10 text-blue-300">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            Loading challenge...
          </div>
        ) : !challenge ? (
          <p className="text-center text-blue-300">Challenge not found.</p>
        ) : (
          <>
            {/* Header */}
            <div className="pb-3 mb-4 border-b border-blue-500/20">
              <h3 className="text-xl font-semibold text-white">
                {challenge.name}
              </h3>
              <p className="text-sm text-blue-300 mt-1">
                {challenge.category} •{" "}
                <span className={difficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </span>{" "}
                • {challenge.points} pts
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-blue-200/80 whitespace-pre-line mb-4">
              {challenge.description}
            </p>

            {/* File Download */}
            {challenge.filePath && (
              <a
                href={`${backendUrl}/download/${challenge.filePath
                  .split("/")
                  .pop()}`}
                className="flex items-center gap-2 text-blue-300 text-sm hover:text-blue-200 mb-4"
              >
                <FileDown className="w-4 h-4" /> Download File
              </a>
            )}

            {/* Submit Flag */}
            <div className="border-t border-blue-500/20 pt-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4 text-blue-300" /> Submit Flag
              </h4>

              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFlag()}
                placeholder="FLAG{example}"
                className="w-full bg-[#0a1222]/70 text-blue-200 px-4 py-3 rounded-md border border-blue-600/30 focus:border-blue-400 outline-none text-sm transition"
              />

              {/* Message */}
              {message && (
                <div
                  className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                    message.type === "success"
                      ? "text-blue-300"
                      : message.type === "error"
                      ? "text-blue-400"
                      : "text-blue-200"
                  }`}
                >
                  {message.type === "success" && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {message.type === "error" && (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-blue-500 text-blue-300 hover:text-white hover:border-blue-300 transition"
                >
                  Cancel
                </button>

                <button
                  disabled={loading || !flag.trim()}
                  onClick={submitFlag}
                  className={`px-6 py-2 rounded-md font-semibold bg-blue-500 text-black hover:bg-blue-400 transition ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
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
        )}
      </div>
    </div>
  );
}
