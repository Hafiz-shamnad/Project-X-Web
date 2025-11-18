"use client";

import React, { useState, useCallback, useMemo } from "react";
import { BACKEND_URL } from "../../utils/constants";

type Props = {
  onSuccess?: (announcement?: { id: number; title: string; message: string }) => void;
  onError?: (err: string) => void;
};

export default function AnnouncementCreate({ onSuccess, onError }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const maxChars = 1000;

  const disabled = useMemo(() => {
    return (
      sending ||
      title.trim().length < 3 ||
      message.trim().length < 5 ||
      message.length > maxChars
    );
  }, [sending, title, message]);

  const reset = useCallback(() => {
    setTitle("");
    setMessage("");
    setCharCount(0);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (disabled) return;

      setSending(true);

      try {
        const payload = { title: title.trim(), message: message.trim() };

        const res = await fetch(`${BACKEND_URL}/announcement`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          const msg = err?.error || "Failed to create announcement";
          onError?.(msg);
          setSending(false);
          return;
        }

        const data = await res.json();
        reset();
        onSuccess?.(data);
      } catch (err: any) {
        console.error("Announcement create error:", err);
        onError?.(err?.message || "Network error");
      } finally {
        setSending(false);
      }
    },
    [title, message, reset, onSuccess, onError, disabled]
  );

  return (
    <div className="bg-slate-900/70 border border-blue-500/30 rounded-2xl p-5 shadow-md">
      <h3 className="text-lg font-bold text-blue-300 mb-3">Create Announcement</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-blue-200 block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Challenge released, Team banned, Maintenance"
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-blue-800 text-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="text-sm text-blue-200 block mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setCharCount(e.target.value.length);
            }}
            placeholder="Write the announcement message. Keep it concise and helpful."
            className="w-full min-h-[100px] px-3 py-2 rounded-md bg-slate-800 border border-blue-800 text-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-vertical"
            maxLength={maxChars}
            required
          />
          <div className="flex justify-between text-xs text-blue-500 mt-1">
            <div>Visible to all currently logged-in users.</div>
            <div>{charCount}/{maxChars}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              disabled
                ? "bg-blue-800/30 text-blue-300 cursor-not-allowed"
                : "bg-blue-500 text-black hover:bg-blue-400"
            }`}
          >
            {sending ? "Sending..." : "Publish Announcement"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="px-3 py-2 rounded-lg border border-blue-700 text-blue-300 hover:bg-blue-900/20"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
