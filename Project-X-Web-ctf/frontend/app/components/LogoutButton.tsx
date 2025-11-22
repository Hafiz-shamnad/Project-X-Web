"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation(); // important for dropdown
    setLoading(true);

    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-500 transition"
    >
      <LogOut className="w-4 h-4" />
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
