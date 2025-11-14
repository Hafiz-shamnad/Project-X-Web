"use client";

import { useState } from "react";
import { Target } from "lucide-react";

interface Props {
  onCreate: (fd: FormData) => Promise<void>;
}

export default function ChallengeCreate({ onCreate }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    difficulty: "Easy",
    points: 100,
    flag: "",
    imageName: "",
    released: false,
    file: null as File | null,
  });

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("category", form.category || "");
      fd.append("difficulty", form.difficulty);
      fd.append("points", String(Number(form.points) || 0));
      fd.append("flag", form.flag || "");
      fd.append("imageName", form.imageName || "");
      fd.append("released", String(Boolean(form.released)));
      if (form.file) fd.append("file", form.file);

      // You can either:
      //  - call service via onCreate(fd)
      //  - or directly POST to BACKEND_URL
      await onCreate(fd);

      setForm({
        name: "",
        description: "",
        category: "",
        difficulty: "Easy",
        points: 100,
        flag: "",
        imageName: "",
        released: false,
        file: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-gray-900/60 rounded-2xl border border-green-600/30 backdrop-blur-md shadow-lg space-y-5"
    >
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        <Target /> Create a New Challenge
      </h2>

      <input
        type="text"
        placeholder="Challenge Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
        required
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
        rows={4}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
        />

        <select
          value={form.difficulty}
          onChange={(e) =>
            setForm({ ...form, difficulty: e.target.value })
          }
          className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <input
          type="number"
          placeholder="Points"
          value={form.points}
          onChange={(e) =>
            setForm({ ...form, points: Number(e.target.value) })
          }
          className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
          min={0}
        />
      </div>

      <input
        type="text"
        placeholder="Flag (e.g. FLAG{...})"
        value={form.flag}
        onChange={(e) => setForm({ ...form, flag: e.target.value })}
        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
      />

      <input
        type="text"
        placeholder="Docker Image Name (optional)"
        value={form.imageName}
        onChange={(e) => setForm({ ...form, imageName: e.target.value })}
        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
      />

      <div className="flex items-center justify-between">
        <input
          type="file"
          onChange={(e) =>
            setForm({ ...form, file: e.target.files?.[0] || null })
          }
          className="text-sm text-gray-300 bg-gray-800 p-2 rounded-lg border border-gray-700"
        />
        <label className="flex items-center gap-2 text-green-400">
          <input
            type="checkbox"
            checked={form.released}
            onChange={(e) =>
              setForm({ ...form, released: e.target.checked })
            }
          />
          Release immediately
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-green-500 py-3 rounded-xl text-black font-bold hover:from-green-500 hover:to-green-400 transition-all"
      >
        {loading ? "Creating..." : "Create Challenge"}
      </button>
    </form>
  );
}
