'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, LogIn, Shield, AlertCircle } from 'lucide-react';

async function apiFetch(endpoint: string, options?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await fetch(`${baseUrl}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ username: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(async () => {
    setStatus({ loading: true, error: '' });

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (response.error) {
        setStatus({ loading: false, error: response.error });
        return;
      }

      const role = response?.user?.role;
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setStatus({
        loading: false,
        error: 'Unexpected server error. Please try again.',
      });
    }
  }, [form, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-blue-200 p-4 relative overflow-hidden">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative backdrop-blur-xl bg-slate-900/60 border border-blue-500/30 rounded-3xl shadow-[0_8px_32px_rgba(59,130,246,0.2)] overflow-hidden">
          
          {/* Header + Shield */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 border-b border-blue-500/30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/40 rounded-2xl blur-2xl"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 border-2 border-blue-400/50 shadow-lg">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-8 pt-16">
            
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">Welcome Back</h1>
              <p className="text-slate-400">Sign in to continue your journey</p>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              
              {/* USERNAME */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your username"
                    className="w-full p-4 pl-12 rounded-xl bg-slate-800/50 border border-blue-500/30 text-slate-200"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    className="w-full p-4 pl-12 rounded-xl bg-slate-800/50 border border-blue-500/30 text-slate-200"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
                </div>
              </div>

              {/* ERROR */}
              {status.error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-300">Login Failed</p>
                    <p className="text-sm text-red-400/80 mt-0.5">{status.error}</p>
                  </div>
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                onClick={handleLogin}
                disabled={status.loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  status.loading
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 shadow-md'
                }`}
              >
                {status.loading ? 'Logging in…' : 'Sign In'}
              </button>
            </div>

            {/* REGISTER LINK */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-400 hover:text-blue-300">Register now →</a>
              </p>
            </div>

          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 flex justify-center gap-2">
            <Lock className="w-3 h-3" /> Your connection is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
