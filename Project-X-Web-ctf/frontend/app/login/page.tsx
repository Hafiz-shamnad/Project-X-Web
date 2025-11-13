'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

/**
 * LoginPage
 * ---------
 * Handles:
 *  - Secure login request to backend
 *  - JWT cookie automatically stored (httpOnly)
 *  - Error and loading states
 *  - Redirect based on role (admin/user)
 */
export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Submit login request
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.error) {
        setError(response.error);
      } else {
        // Backend returns { user: { role }, ... }
        const role = response.user?.role;

        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unexpected server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
   * Render UI
   * ========================================================== */
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-500 px-4">
      <div className="w-full max-w-sm bg-gray-900 p-8 rounded-xl border border-green-500 shadow-lg shadow-green-500/20">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-300 tracking-wide">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* USERNAME */}
          <div>
            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              required
              className="w-full p-3 rounded bg-black border border-green-700 text-white placeholder-green-700/60 focus:border-green-400 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full p-3 rounded bg-black border border-green-700 text-white placeholder-green-700/60 focus:border-green-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="text-red-400 text-sm font-semibold bg-red-900/20 p-2 rounded border border-red-600/40">
              {error}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded font-bold transition shadow-green-500/20 shadow
              ${loading
                ? 'bg-green-700 cursor-not-allowed text-black'
                : 'bg-green-500 hover:bg-green-400 text-black'}
            `}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="mt-4 text-center text-sm text-green-400">
          Don’t have an account?{' '}
          <a
            href="/register"
            className="text-green-300 underline hover:text-green-200 transition"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
