'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

/**
 * RegisterPage
 * ------------
 * Handles new user registration.
 * Includes:
 *  - Field validation
 *  - Server-side error reporting
 *  - Strong UI consistency
 *  - Secure request using apiFetch (credentials included)
 */
export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Basic client-side input validation
   */
  const validateInputs = () => {
    if (form.username.trim().length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (!form.email.includes('@')) {
      return 'Please enter a valid email.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };

  /**
   * Handle new user registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      // Backend returns structured error if failed
      if (response.error) {
        setError(response.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Controlled input update handler
   */
  const updateForm = (key: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-500">
      <div className="bg-gray-900 p-8 rounded-xl border border-green-600 w-96 shadow-lg shadow-green-500/10">
        
        {/* HEADER */}
        <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
          Register
        </h2>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => updateForm('username', e.target.value)}
            className="w-full p-3 rounded bg-black border border-green-700 text-white focus:outline-none focus:border-green-400 transition"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className="w-full p-3 rounded bg-black border border-green-700 text-white focus:outline-none focus:border-green-400 transition"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateForm('password', e.target.value)}
            className="w-full p-3 rounded bg-black border border-green-700 text-white focus:outline-none focus:border-green-400 transition"
          />

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold bg-green-500 text-black rounded hover:bg-green-400 transition disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-4 text-center text-sm text-green-300">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-green-400 hover:text-green-300 hover:underline transition"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
