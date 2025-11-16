"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Eye, EyeOff, Trash2, Search } from "lucide-react";
import type { Challenge } from "../types/Challenge";

/**
 * Props:
 * - challenges: full list (client-side filtering)
 * - loading: boolean
 * - onToggleRelease(id, currentState): Promise<void>
 * - onDelete(id, name): void (should open confirm, then call backend)
 * - onBulkRelease(ids), onBulkHide(ids), onBulkDelete(ids): Promise<void>
 * - showSuccess, showError: notifications
 */
export default function AdminChallengeManager({
  challenges,
  loading,
  onToggleRelease,
  onDelete,
  onBulkRelease,
  onBulkHide,
  onBulkDelete,
  showSuccess,
  showError,
}: {
  challenges: Challenge[];
  loading: boolean;
  onToggleRelease: (id: number, currentState: boolean) => Promise<void>;
  onDelete: (id: number, name: string) => void;
  onBulkRelease: (ids: number[]) => Promise<void>;
  onBulkHide: (ids: number[]) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}) {
  /* ----------------------- Local UI state ----------------------- */
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD" | "INSANE">("ALL");
  const [releaseFilter, setReleaseFilter] = useState<"ALL" | "RELEASED" | "HIDDEN">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  /* ----------------------- Helpers ----------------------- */
  const toggleSelected = useCallback((id: number) => {
    setSelectedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedSet(new Set()), []);

  const bulkIds = useMemo(() => Array.from(selectedSet), [selectedSet]);
  const anySelected = bulkIds.length > 0;

  /* ----------------------- Derived category list ----------------------- */
  const categoryOptions = useMemo(() => {
    const set = new Set<string>(challenges.map(c => c.category || "Uncategorized"));
    return ["ALL", ...Array.from(set)];
  }, [challenges]);

  /* ----------------------- Filtering (expensive) -----------------------
     Steps:
     1. filter by search/difficulty/release/category
     2. group by category
     3. sort inside each group (difficulty order, then points descending)
     4. produce paginated subset
  ---------------------------------------------------------------------- */
  const diffOrder = useMemo(() => ["EASY","MEDIUM","HARD","INSANE"], []);

  const filteredAndGrouped = useMemo(() => {
    // 1) Filter
    const filtered = challenges.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (difficultyFilter !== "ALL" && c.difficulty.toUpperCase() !== difficultyFilter) return false;
      if (releaseFilter === "RELEASED" && !c.released) return false;
      if (releaseFilter === "HIDDEN" && c.released) return false;
      if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;
      return true;
    });

    // 2) Group
    const groups: Record<string, Challenge[]> = {};
    for (const c of filtered) {
      const key = c.category || "Uncategorized";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }

    // 3) Sort inside groups
    for (const k of Object.keys(groups)) {
      groups[k].sort((a,b) => {
        const da = diffOrder.indexOf(a.difficulty.toUpperCase());
        const db = diffOrder.indexOf(b.difficulty.toUpperCase());
        if (da !== db) return da - db;
        return b.points - a.points;
      });
    }

    return { groups, total: filtered.length };
  }, [challenges, search, difficultyFilter, releaseFilter, categoryFilter, diffOrder]);

  /* ----------------------- Pagination over grouped result -----------------------
     We'll iterate groups in stable order and pick items for current page.
  ----------------------------------------------------------------------------- */
  const paginatedGroups = useMemo(() => {
    const entries = Object.entries(filteredAndGrouped.groups);
    const result: Record<string, Challenge[]> = {};
    let counter = 0;
    const start = (page - 1) * PAGE_SIZE;
    const end = page * PAGE_SIZE - 1;

    // stable iteration of categories (alphabetical)
    entries.sort((a,b) => a[0].localeCompare(b[0]));

    for (const [cat, list] of entries) {
      for (const item of list) {
        if (counter >= start && counter <= end) {
          if (!result[cat]) result[cat] = [];
          result[cat].push(item);
        }
        counter++;
        if (counter > end) break;
      }
      if (counter > end) break;
    }

    const totalPages = Math.max(1, Math.ceil(filteredAndGrouped.total / PAGE_SIZE));
    return { groups: result, totalPages, totalItems: filteredAndGrouped.total };
  }, [filteredAndGrouped, page]);

  /* ----------------------- Action Handlers ----------------------- */
  const handleToggleRelease = useCallback(async (id: number, currentState: boolean) => {
    try {
      await onToggleRelease(id, currentState);
      showSuccess(currentState ? "Hidden" : "Released");
    } catch (e) {
      console.error(e);
      showError("Failed to toggle release.");
    }
  }, [onToggleRelease, showError, showSuccess]);

  const handleDelete = useCallback((id: number, name: string) => {
    onDelete(id, name);
  }, [onDelete]);

  const handleBulkRelease = useCallback(async () => {
    if (!bulkIds.length) return;
    try {
      await onBulkRelease(bulkIds);
      clearSelection();
      showSuccess("Selected challenges released.");
    } catch (e) {
      console.error(e);
      showError("Bulk release failed.");
    }
  }, [bulkIds, onBulkRelease, clearSelection, showSuccess, showError]);

  const handleBulkHide = useCallback(async () => {
    if (!bulkIds.length) return;
    try {
      await onBulkHide(bulkIds);
      clearSelection();
      showSuccess("Selected challenges hidden.");
    } catch (e) {
      console.error(e);
      showError("Bulk hide failed.");
    }
  }, [bulkIds, onBulkHide, clearSelection, showSuccess, showError]);

  const handleBulkDelete = useCallback(async () => {
    if (!bulkIds.length) return;
    try {
      await onBulkDelete(bulkIds);
      clearSelection();
      showSuccess("Selected challenges deleted.");
    } catch (e) {
      console.error(e);
      showError("Bulk delete failed.");
    }
  }, [bulkIds, onBulkDelete, clearSelection, showSuccess, showError]);

  /* ----------------------- Small memoized card component ----------------------- */
  const ChallengeCard = useMemo(() => React.memo(function ChallengeCardComponent({
    c,
    isSelected,
    onToggle,
    onRelease,
    onDel,
  }: {
    c: Challenge;
    isSelected: boolean;
    onToggle: (id:number) => void;
    onRelease: (id:number, current: boolean) => void;
    onDel: (id:number, name:string) => void;
  }) {
    return (
      <div
        className={`bg-slate-900/70 border ${isSelected ? "border-blue-500" : "border-blue-700/30"} p-5 rounded-xl flex justify-between items-center hover:border-blue-500/60 transition-all`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(c.id)}
            className="mt-1 accent-blue-500"
            aria-label={`Select ${c.name}`}
          />
          <div>
            <h4 className="text-white font-bold">{c.name}</h4>
            <p className="text-sm text-slate-400">
              {c.category} • {c.difficulty} • <span className="text-cyan-400">{c.points}</span> pts
            </p>
            <p className={`text-sm font-semibold mt-1 ${c.released ? "text-emerald-400" : "text-red-400"}`}>
              {c.released ? "Released" : "Hidden"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onRelease(c.id, c.released)}
            className={`px-4 py-2 rounded-md font-bold flex items-center gap-1 ${c.released ? "bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600/20" : "bg-blue-600/10 text-blue-300 border border-blue-500/30 hover:bg-blue-600/20"}`}
            aria-label={c.released ? "Hide challenge" : "Release challenge"}
          >
            {c.released ? <EyeOff/> : <Eye/>}
            <span>{c.released ? "Hide" : "Release"}</span>
          </button>

          <button
            onClick={() => onDel(c.id, c.name)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg"
            aria-label="Delete challenge"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }), []);

  /* ----------------------- Render ----------------------- */
  return (
    <div className="space-y-6">
      {/* Header / Search / Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-blue-300">Manage Challenges</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search challenges..."
              className="bg-transparent outline-none text-slate-200"
            />
          </div>

          <select value={difficultyFilter} onChange={(e) => { setDifficultyFilter(e.target.value as any); setPage(1); }} className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-slate-200">
            <option value="ALL">All Difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="INSANE">Insane</option>
          </select>

          <select value={releaseFilter} onChange={(e) => { setReleaseFilter(e.target.value as any); setPage(1); }} className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-slate-200">
            <option value="ALL">Show All</option>
            <option value="RELEASED">Released</option>
            <option value="HIDDEN">Hidden</option>
          </select>

          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-slate-200">
            {categoryOptions.map(c => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk toolbar */}
      {anySelected && (
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-blue-500/30 p-3 rounded-md">
          <div className="text-slate-200">{bulkIds.length} selected</div>

          <button onClick={handleBulkRelease} className="px-3 py-1 rounded-md bg-blue-600/10 text-blue-300 border border-blue-500/30">Release Selected</button>
          <button onClick={handleBulkHide} className="px-3 py-1 rounded-md bg-red-600/10 text-red-400 border border-red-500/30">Hide Selected</button>
          <button onClick={handleBulkDelete} className="px-3 py-1 rounded-md bg-red-600 text-white">Delete Selected</button>
          <button onClick={clearSelection} className="px-3 py-1 rounded-md text-slate-300">Clear</button>
        </div>
      )}

      {/* Empty / Loading */}
      {loading && filteredAndGrouped.total === 0 && (
        <div className="text-center text-slate-400 py-12 border border-blue-500/20 rounded-xl bg-slate-900/40">Loading challenges...</div>
      )}
      {!loading && filteredAndGrouped.total === 0 && (
        <div className="text-center text-slate-400 py-12 border border-blue-500/20 rounded-xl bg-slate-900/40">No challenges match your filters</div>
      )}

      {/* Grouped list paginated */}
      <div className="space-y-6">
        {Object.entries(paginatedGroups.groups).map(([cat, list]) => (
          <section key={cat} className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-300">{cat}</h3>
            <div className="space-y-3">
              {list.map(item => (
                <ChallengeCard
                  key={item.id}
                  c={item}
                  isSelected={selectedSet.has(item.id)}
                  onToggle={toggleSelected}
                  onRelease={handleToggleRelease}
                  onDel={handleDelete}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 bg-slate-800 rounded-md border border-slate-700 text-slate-200 disabled:opacity-50">Prev</button>
        <div className="text-slate-300 px-3">Page {page} / {paginatedGroups.totalPages}</div>
        <button disabled={page === paginatedGroups.totalPages} onClick={() => setPage(p => Math.min(paginatedGroups.totalPages, p + 1))} className="px-4 py-2 bg-slate-800 rounded-md border border-slate-700 text-slate-200 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
