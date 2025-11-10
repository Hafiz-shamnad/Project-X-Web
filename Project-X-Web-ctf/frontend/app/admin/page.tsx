"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Shield, Trash2, Plus } from "lucide-react";

export default function AdminPanel() {
  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    difficulty: "Easy",
    points: 100,
    flag: "",
    file: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  const fetchChallenges = async () => {
    const data = await apiFetch("/admin/challenges");
    setChallenges(data);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const addChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🧱 Create FormData (supports files)
      const formData = new FormData();

      // append all text inputs
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("difficulty", form.difficulty);
      formData.append("points", String(form.points));
      formData.append("flag", form.flag);

      // append file if uploaded
      if (form.file) {
        formData.append("file", form.file);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/challenge`,
        {
          method: "POST",
          body: formData,
          credentials: "include", // 🔐 includes cookie auth
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("✅ Challenge created:", data);

      // reset form
      setForm({
        name: "",
        description: "",
        category: "",
        difficulty: "Easy",
        points: 100,
        flag: "",
        file: null,
      });

      await fetchChallenges(); // refresh list
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      setError("Failed to upload challenge");
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (id: number) => {
    try {
      const res = await apiFetch(`/admin/challenge/${id}`, {
        method: "DELETE",
      });
      console.log("✅ Deleted challenge:", res);
      await fetchChallenges();
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-10">
      <div className="flex items-center justify-between border-b border-green-500 pb-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" /> ADMIN PANEL
        </h1>
      </div>

      {/* ADD CHALLENGE FORM */}
      <form
        onSubmit={addChallenge}
        className="space-y-3 mb-10 border border-green-500 p-6 rounded-lg"
      >
        <h2 className="text-xl font-bold">Add New Challenge</h2>

        <input
          type="text"
          placeholder="Challenge Name"
          className="w-full p-2 bg-gray-900 text-white border border-green-600 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 bg-gray-900 text-white border border-green-600 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Category"
            className="flex-1 p-2 bg-gray-900 text-white border border-green-600 rounded"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <select
            className="p-2 bg-gray-900 text-white border border-green-600 rounded"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <input
            type="number"
            placeholder="Points"
            className="w-24 p-2 bg-gray-900 text-white border border-green-600 rounded"
            value={form.points}
            onChange={(e) =>
              setForm({ ...form, points: Number(e.target.value) })
            }
          />
        </div>

        <input
          type="text"
          placeholder="Flag (FLAG{example})"
          className="w-full p-2 bg-gray-900 text-white border border-green-600 rounded"
          value={form.flag}
          onChange={(e) => setForm({ ...form, flag: e.target.value })}
        />

        {/* 📁 File Upload */}
        <input
          type="file"
          className="w-full bg-gray-900 text-white border border-green-600 rounded p-2"
          onChange={(e) =>
            setForm({ ...form, file: e.target.files?.[0] || null })
          }
        />

        <button
          type="submit"
          className="bg-green-500 text-black font-bold px-6 py-2 rounded hover:bg-green-400"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Add Challenge"}
        </button>
      </form>

      {/* EXISTING CHALLENGES */}
      <h2 className="text-2xl font-bold mb-4">Existing Challenges</h2>
      <div className="grid gap-4">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="bg-gray-900 border border-green-500 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="text-white font-bold">{c.name}</h3>
              <p className="text-green-400 text-sm">
                {c.category} • {c.difficulty} • {c.points} pts
              </p>
            </div>
            <button
              onClick={() => deleteChallenge(c.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
