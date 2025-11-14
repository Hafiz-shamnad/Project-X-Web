"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Challenge } from "../types/Challenge";

export default function ChallengeCard({
  challenge,
  selected,
  onSelect,
  onToggleRelease,
  onDelete,
}: {
  challenge: Challenge;
  selected: boolean;
  onSelect: () => void;
  onToggleRelease: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`bg-gray-900/70 border ${
        selected ? "border-green-500/70" : "border-green-600/30"
      } p-5 rounded-xl flex justify-between items-center hover:border-green-500/50 transition-all`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mt-1 accent-green-500"
        />

        <div>
          <h3 className="text-white font-bold">{challenge.name}</h3>

          <p className="text-sm text-gray-400">
            {challenge.category} • {challenge.difficulty} •{" "}
            <span className="text-yellow-400">{challenge.points}</span> pts
          </p>

          <p
            className={`text-sm font-semibold mt-1 ${
              challenge.released ? "text-green-400" : "text-red-400"
            }`}
          >
            {challenge.released ? "Released" : "Hidden"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onToggleRelease}
          className={`px-4 py-2 rounded-md font-bold flex items-center gap-1 ${
            challenge.released
              ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
              : "bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30"
          }`}
        >
          {challenge.released ? <EyeOff /> : <Eye />}
          {challenge.released ? "Hide" : "Release"}
        </button>

        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
