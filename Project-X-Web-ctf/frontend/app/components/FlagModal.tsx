"use client";
import React, { useEffect, useState } from "react";
import { FileDown, Zap, Flag, Loader2 } from "lucide-react";

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
  // ✅ All hooks at the top — no conditional returns before these
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [fetching, setFetching] = useState(false);

  // 🧠 Fetch challenge details (guard inside, not outside)
  useEffect(() => {
    if (!open || !challengeId) return; // ✅ safe guard inside effect
    const fetchChallenge = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${backendUrl}/challenges/${challengeId}`);
        const data = await res.json();
        if (res.ok) setChallenge(data);
      } catch (err) {
        console.error("Error loading challenge details:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchChallenge();
  }, [open, challengeId, backendUrl]);

  // 🚩 Submit flag
  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${backendUrl}/flag/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, challengeId, flag }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
        setMessage(data.message || "Correct flag!");
      } else {
        setMessage(data.error || data.message || "Wrong flag, try again!");
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // ✅ Conditional rendering now safe (after hooks)
  if (!open || !challengeId) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 w-full max-w-md relative">
        {fetching ? (
          <div className="flex flex-col items-center justify-center text-green-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            Loading challenge...
          </div>
        ) : challenge ? (
          <>
            <h3 className="text-2xl font-bold mb-1 text-white">
              {challenge.name}
            </h3>
            <p className="text-sm text-green-400 mb-2">
              {challenge.category} •{" "}
              <span className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </span>{" "}
              •{" "}
              <span className="ml-1 font-semibold">
                <Zap className="inline-block w-4 h-4 mr-1" />
                {challenge.points} pts
              </span>
            </p>
            <p className="text-green-300 mb-4 text-sm whitespace-pre-line">
              {challenge.description}
            </p>

            {(challenge?.filePath || challenge?.file) && (
              <a
                href={`${backendUrl}/download/${(
                  challenge?.filePath || challenge?.file
                )
                  ?.split("/")
                  .pop()}`}
                className="text-green-400 hover:text-green-300 text-sm flex items-center mb-4"
              >
                📂 Download Challenge File
              </a>
            )}

            {/* 🚩 Flag submission */}
            <div className="border-t border-green-800 pt-4 mt-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Flag className="w-4 h-4 mr-2" /> Submit Flag
              </h4>
              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="FLAG{...}"
                className="w-full p-2 rounded bg-black border border-gray-700 mb-3 text-white"
              />
              {message && (
                <div
                  className={`mb-3 text-sm ${
                    message.includes("Correct")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:text-white"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-green-500 text-black font-bold hover:bg-green-400"
                  onClick={submit}
                  disabled={loading || !flag.trim()}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-green-400">Challenge not found.</p>
        )}
      </div>
    </div>
  );
}
