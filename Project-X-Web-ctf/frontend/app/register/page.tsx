"use client";

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Shield, UserPlus, AlertCircle } from 'lucide-react';

// API Helper
async function apiFetch(endpoint: string, options?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await fetch(`${baseUrl}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  return res.json();
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [status, setStatus] = useState({
    loading: false,
    error: '',
  });

  const updateForm = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    if (form.username.trim().length < 3) return 'Username must be at least 3 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }, [form]);

  const handleRegister = useCallback(async () => {
    const error = validate();
    if (error) {
      setStatus({ loading: false, error });
      return;
    }

    setStatus({ loading: true, error: '' });

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (response.error) {
        setStatus({ loading: false, error: response.error });
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setStatus({
        loading: false,
        error: 'Server error. Try again later.',
      });
    }
  }, [form, validate, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-blue-200 p-4 relative overflow-hidden">

      {/* Background Glow Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative backdrop-blur-xl bg-slate-900/60 border border-blue-500/30 rounded-3xl shadow-[0_8px_32px_rgba(59,130,246,0.2)] overflow-hidden">

          {/* Decorative Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 border-b border-blue-500/30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/40 rounded-2xl blur-2xl"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-500/80 to-blue-500/80 border-2 border-cyan-400/50 shadow-lg">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pt-16">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-slate-400 mt-2">Join the hacking battlefield</p>
            </div>

            {/* Username */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
                <User className="w-4 h-4" /> Username
              </label>
              <div className="relative">
                <input
                  name="username"
                  value={form.username}
                  onChange={updateForm}
                  placeholder="Choose a username"
                  className="w-full p-4 pl-12 rounded-xl bg-slate-800/50 border border-blue-500/30 text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <div className="relative">
                <input
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="Enter your email"
                  className="w-full p-4 pl-12 rounded-xl bg-slate-800/50 border border-blue-500/30 text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateForm}
                  placeholder="Create a strong password"
                  className="w-full p-4 pl-12 rounded-xl bg-slate-800/50 border border-blue-500/30 text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
              </div>
            </div>

            {/* Error */}
            {status.error && (
              <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-[slideIn_0.3s_ease-out]">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">Registration Failed</p>
                  <p className="text-sm text-red-400/80 mt-0.5">
                    {status.error}
                  </p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleRegister}
              disabled={status.loading}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group ${
                status.loading
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.4)] hover:scale-105'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {status.loading ? (
                <span className="flex items-center justify-center gap-3 text-slate-300">
                  <div className="w-5 h-5 border-3 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-white">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </span>
              )}
            </button>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <p className="text-sm text-slate-400">Already have an account?</p>
                <a
                  href="/login"
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Log in →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            Your data is encrypted & protected
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
