'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface LogoutButtonProps {
  /** Base backend API URL, ideally NEXT_PUBLIC_API_URL from env */
  backendURL?: string;
}

/**
 * LogoutButton
 * ------------
 * A small reusable component that:
 *  - Prompts the user to confirm logout
 *  - Sends logout request to backend
 *  - Clears session cookies
 *  - Redirects user to /login
 *
 * Uses ConfirmModal for consistent UI/UX across the app.
 */
export default function LogoutButton({
  backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
}: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Executes logout request to backend.
   */
  const handleLogout = async () => {
    setLoading(true);

    try {
      await fetch(`${backendURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Force redirect to login page after logout
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Logout button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="
          flex items-center gap-2 text-sm px-4 py-2 rounded font-semibold
          bg-red-600 text-white hover:bg-red-500 transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <LogOut className="w-4 h-4" />
        {loading ? 'Logging out…' : 'Logout'}
      </button>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Logout"
        message="Are you sure you want to end your current session?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
