"use client";

import { useCallback, useState } from "react";
import { Target } from "lucide-react";

/* --------------------------------------------------------
   Reusable Form Field Component (Memoized)
--------------------------------------------------------- */
const Field = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="w-full">{children}</div>
);

export default function ChallengeCreate({
  onCreate,
}: {
  onCreate: (fd: FormData) => Promise<void>;
}) {
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

  /* --------------------------------------------------------
     SAFE FORM UPDATER
  --------------------------------------------------------- */
  const update = useCallback(
    (key: string, value: any) => {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  /* --------------------------------------------------------
     SUBMIT HANDLER (Memoized)
  --------------------------------------------------------- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name.trim()) return;

      setLoading(true);

      try {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("category", form.category);
        fd.append("difficulty", form.difficulty);
        fd.append("points", String(form.points));
        fd.append("flag", form.flag);
        fd.append("imageName", form.imageName);
        fd.append("released", String(form.released));

        if (form.file) fd.append("file", form.file);

        await onCreate(fd);

        // Reset form
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
    },
    [form, onCreate]
  );

  /* --------------------------------------------------------
     JSX
  --------------------------------------------------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-slate-900/60 rounded-2xl border border-blue-500/30 backdrop-blur-md shadow-xl space-y-5"
    >
      {/* TITLE */}
      <h2 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
        <Target className="text-cyan-400" /> Create a New Challenge
      </h2>

      {/* NAME */}
      <Field>
        <input
          type="text"
          placeholder="Challenge Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full p-3 bg-slate-800 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </Field>

      {/* DESCRIPTION */}
      <Field>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full p-3 bg-slate-800 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
          rows={4}
        />
      </Field>

      {/* ROW OF 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CATEGORY */}
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="p-3 bg-slate-800 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* DIFFICULTY */}
        <select
          value={form.difficulty}
          onChange={(e) => update("difficulty", e.target.value)}
          className="p-3 bg-slate-800 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        {/* POINTS */}
        <input
          type="number"
          placeholder="Points"
          value={form.points}
          onChange={(e) => update("points", Number(e.target.value))}
          className="p-3 bg-slate-800 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
          min={0}
        />
      </div>

      {/* FLAG */}
      <Field>
        <input
          type="text"
          placeholder="Flag (e.g. FLAG{...})"
          value={form.flag}
          onChange={(e) => update("flag", e.target.value)}
          className="w-full p-3 bg-slate-800 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </Field>

      {/* IMAGE NAME */}
      <Field>
        <input
          type="text"
          placeholder="Docker Image Name (optional)"
          value={form.imageName}
          onChange={(e) => update("imageName", e.target.value)}
          className="w-full p-3 bg-slate-800 text-white rounded-lg border border-blue-700"
        />
      </Field>

      {/* FILE + RELEASE */}
      <div className="flex items-center justify-between">
        <input
          type="file"
          onChange={(e) => update("file", e.target.files?.[0] || null)}
          className="text-sm text-gray-300 bg-slate-800 p-2 rounded-lg border border-blue-700 hover:border-blue-500 transition"
        />

        <label className="flex items-center gap-2 text-blue-400">
          <input
            type="checkbox"
            checked={form.released}
            onChange={(e) => update("released", e.target.checked)}
            className="accent-blue-500"
          />
          Release immediately
        </label>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3 rounded-xl text-white font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-600/20"
      >
        {loading ? "Creating..." : "Create Challenge"}
      </button>
    </form>
  );
}
