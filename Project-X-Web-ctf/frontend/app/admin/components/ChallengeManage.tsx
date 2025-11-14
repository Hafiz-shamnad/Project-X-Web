"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Challenge } from "../types/Challenge";

interface Props {
  challenges: Challenge[];
  loading: boolean;
  onToggleRelease: (id: number, currentState: boolean) => Promise<void>;
  onDelete: (id: number, name: string) => void; // wraps confirm modal
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function ChallengeManage({
  challenges,
  loading,
  onToggleRelease,
  onDelete,
  showSuccess,
  showError,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);

  const anySelected = selected.length > 0;

  const toggleSelected = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  const bulkToggle = async (targetState: boolean) => {
    if (!selected.length) return;
    try {
      for (const id of selected) {
        const current = challenges.find((c) => c.id === id)?.released ?? false;
        if (current !== targetState) {
          await onToggleRelease(id, current);
        }
      }
      clearSelection();
      showSuccess(
        targetState
          ? "Selected challenges released."
          : "Selected challenges hidden."
      );
    } catch (e) {
      console.error(e);
      showError("Bulk update failed.");
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        Manage Challenges
      </h2>

      {anySelected && (
        <div className="flex items-center gap-3 bg-gray-900/60 border border-green-600/30 p-3 rounded-lg">
          <p className="text-gray-300">{selected.length} selected</p>
          <button
            onClick={() => bulkToggle(true)}
            className="bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-md font-bold"
          >
            Release Selected
          </button>
          <button
            onClick={() => bulkToggle(false)}
            className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-md font-bold"
          >
            Hide Selected
          </button>
          <button
            onClick={clearSelection}
            className="text-gray-400 hover:text-gray-200"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {loading && challenges.length === 0 && (
          <div className="text-center text-gray-400 py-12 border border-green-500/20 rounded-xl bg-gray-900/40">
            Loading challenges...
          </div>
        )}

        {!loading && challenges.length === 0 && (
          <div className="text-center text-gray-400 py-12 border border-green-500/20 rounded-xl bg-gray-900/40">
            No challenges available
          </div>
        )}

        {challenges.map((c) => (
          <div
            key={c.id}
            className={`bg-gray-900/70 border ${
              selected.includes(c.id)
                ? "border-green-500/70"
                : "border-green-600/30"
            } p-5 rounded-xl flex justify-between items-center hover:border-green-500/50 transition-all`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggleSelected(c.id)}
                className="mt-1 accent-green-500"
              />
              <div>
                <h3 className="text-white font-bold">{c.name}</h3>
                <p className="text-sm text-gray-400">
                  {c.category} • {c.difficulty} •{" "}
                  <span className="text-yellow-400">{c.points}</span> pts
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    c.released ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {c.released ? "Released" : "Hidden"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onToggleRelease(c.id, c.released)}
                className={`px-4 py-2 rounded-md font-bold flex items-center gap-1 ${
                  c.released
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30"
                }`}
              >
                {c.released ? <EyeOff /> : <Eye />}
                {c.released ? "Hide" : "Release"}
              </button>
              <button
                onClick={() => onDelete(c.id, c.name)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
