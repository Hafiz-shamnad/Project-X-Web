"use client";

import { useState, useCallback, useMemo } from "react";
import { LogOut } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface LogoutButtonProps {
  backendURL?: string;
}

export default function LogoutButton({
  backendURL,
}: LogoutButtonProps) {
  // Memoize backend URL so it never triggers rerenders
  const apiUrl = useMemo(
    () => backendURL || process.env.NEXT_PUBLIC_API_URL,
    [backendURL]
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------
     Handlers (memoized to avoid unnecessary rerenders)
  --------------------------------------------------- */

  const openConfirm = useCallback(() => setShowConfirm(true), []);
  const closeConfirm = useCallback(() => setShowConfirm(false), []);

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Hard redirect is correct for session kill
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [apiUrl]);

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */

  return (
    <>
      <button
        onClick={openConfirm}
        disabled={loading}
        className="
          flex items-center gap-2 text-sm px-4 py-2 rounded font-semibold
          bg-red-600 text-white hover:bg-red-500 transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <LogOut className="w-4 h-4" />
        {loading ? "Logging out…" : "Logout"}
      </button>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Logout"
        message="Are you sure you want to end your current session?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={closeConfirm}
      />
    </>
  );
}
