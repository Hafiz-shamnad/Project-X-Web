"use client";

import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../utils/constants";

/* ----------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------- */
interface Announcement {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

/* ----------------------------------------------------------
 * TIME FORMATTER — “5 minutes ago”
 * ---------------------------------------------------------- */
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  return date.toLocaleString();
}

/* ----------------------------------------------------------
 * CATEGORY DETECTOR
 * ---------------------------------------------------------- */
function classify(title: string) {
  const t = title.toLowerCase();

  if (t.includes("ban"))
    return { icon: "⛔", color: "border-red-500 bg-red-500/20" };
  if (t.includes("release"))
    return { icon: "🚀", color: "border-green-500 bg-green-500/20" };
  if (t.includes("challenge"))
    return { icon: "🏁", color: "border-yellow-400 bg-yellow-500/20" };
  if (t.includes("penalty"))
  return { icon: "⚠️", color: "border-orange-500 bg-orange-500/20" };

  return { icon: "⚡", color: "border-blue-400 bg-blue-500/20" };
}

/* ----------------------------------------------------------
 * TOAST POPUP
 * ---------------------------------------------------------- */
function NotificationToast({ text }: { text: string }) {
  return (
    <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-slate-800 border border-blue-500 text-blue-200 shadow-xl animate-slideInToast">
      {text}
      <style>{`
        @keyframes slideInToast {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInToast {
          animation: slideInToast 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------
 * READ COOKIE
 * ---------------------------------------------------------- */
function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];
}

/* ----------------------------------------------------------
 * MAIN PANEL
 * ---------------------------------------------------------- */
export default function AnnouncementPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  /* ----------------------------------------------------------
   * LOAD announcements when panel opens
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!open) return;

    (async () => {
      const res = await fetch(`${BACKEND_URL}/announcement`, {
        credentials: "include",
      });

      const data = await res.json();
      setAnns(data);

      // mark as read
      for (const a of data) {
        fetch(`${BACKEND_URL}/announcement/${a.id}/read`, {
          method: "POST",
          credentials: "include",
        });
      }
    })();
  }, [open]);

  /* ----------------------------------------------------------
   * WEBSOCKET LIVE LISTENER
   * ---------------------------------------------------------- */
  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      console.warn("❗ WS token missing — WebSocket not connecting.");
      return;
    }

    // Convert http -> ws and remove /api
    const wsURL = BACKEND_URL.replace(/^http/, "ws").replace("/api", "");
    const ws = new WebSocket(`${wsURL}/ws?token=${token}`);

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.title) {
          setToast(`🔔 ${msg.title}`);
          setTimeout(() => setToast(null), 3500);
        }
      } catch {}
    };

    return () => ws.close();
  }, []);

  /* ----------------------------------------------------------
   * Outside click closes panel
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  /* ----------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------- */
  if (!open) return toast ? <NotificationToast text={toast} /> : null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[59]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={ref}
        className={`fixed right-4 top-16 w-80 h-[82vh] p-4 rounded-xl shadow-2xl 
          bg-slate-900/95 border border-blue-500/40 backdrop-blur-xl 
          z-[60] overflow-y-auto 
          transition-all duration-300 
          ${open ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
        `}
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-blue-300 text-lg font-bold">Announcements</h2>
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-200 text-sm"
          >
            Close
          </button>
        </div>

        {/* Empty */}
        {anns.length === 0 && (
          <p className="text-blue-400 text-sm">No announcements yet</p>
        )}

        {/* LIST */}
        {anns.map((a) => {
          const meta = classify(a.title);

          return (
            <div
              key={a.id}
              className={`mb-4 p-4 rounded-xl border ${meta.color} 
                shadow-lg hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{meta.icon}</span>
                <h4 className="text-blue-100 font-bold text-md">{a.title}</h4>
              </div>

              <p className="text-blue-200 text-sm mt-2 leading-relaxed whitespace-pre-line">
                {a.message}
              </p>

              <div className="text-right text-xs text-blue-500 mt-3 italic">
                {timeAgo(a.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && <NotificationToast text={toast} />}
    </>
  );
}
