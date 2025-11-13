'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Trophy,
  Users,
  Lock,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import LogoutButton from './LogoutButton';

/**
 * Application navigation bar.
 * Features:
 *  - Dynamic highlight of active route.
 *  - Role-based navigation (admin).
 *  - Desktop dropdown menu and mobile sidebar.
 *  - Scroll-based styling change.
 *  - Fully responsive UI.
 */
export default function Navbar() {
  const PATH = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  /* -----------------------------------------------------------
   *  Fetch authenticated user 
   * ----------------------------------------------------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchUser();
  }, [API_URL]);

  /* -----------------------------------------------------------
   *  Detect scroll for navbar border/shadow effects
   * ----------------------------------------------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* -----------------------------------------------------------
   *  Close user dropdown when clicking outside
   * ----------------------------------------------------------- */
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  /* -----------------------------------------------------------
   *  Helper for nav links (desktop & mobile)
   * ----------------------------------------------------------- */
  const navLink = (href: string, label: string, Icon: any) => {
    const active = PATH === href;

    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
          active
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-green-500/30 shadow-lg'
            : 'text-green-400 hover:text-green-300 hover:bg-green-900/30'
        }`}
      >
        <Icon
          className={`w-4 h-4 transition-transform ${
            active ? '' : 'group-hover:scale-110'
          }`}
        />
        {label}
        {!active && (
          <span className="absolute inset-0 rounded-lg border border-green-500/0 group-hover:border-green-500/50 transition-colors" />
        )}
      </Link>
    );
  };

  /* -----------------------------------------------------------
   *  Rendered UI
   * ----------------------------------------------------------- */
  return (
    <>
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b transition-all ${
          scrolled
            ? 'border-green-500/50 shadow-green-500/10 shadow-lg'
            : 'border-green-500/30'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <div
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <Shield className="w-7 h-7 text-green-500 group-hover:text-green-400 transition group-hover:scale-110 group-hover:rotate-6" />
              <div className="absolute inset-0 blur-md bg-green-500/30 group-hover:bg-green-400/40 transition -z-10" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-400 transition">
              &gt; PROJECT_X
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            {navLink('/dashboard', 'Dashboard', Trophy)}
            {navLink('/team', 'Team', Users)}
            {user?.role === 'admin' && navLink('/admin', 'Admin', Lock)}
          </div>

          {/* Desktop User Dropdown */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition ${
                menuOpen
                  ? 'bg-green-900/40 text-green-300 border border-green-500/50'
                  : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
              }`}
              aria-expanded={menuOpen}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-sm">
                {user ? user.username[0].toUpperCase() : 'G'}
              </div>

              <span className="max-w-[120px] truncate">
                {user?.username || 'guest'}
              </span>

              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-900/95 backdrop-blur-md border border-green-500/50 rounded-lg shadow-2xl shadow-green-500/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="p-3 border-b border-green-700/30 bg-gradient-to-br from-green-900/20 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold">
                      {user ? user.username[0].toUpperCase() : 'G'}
                    </div>
                    <div>
                      <p className="font-semibold text-green-300 text-sm">
                        {user?.username || 'Guest'}
                      </p>
                      <p className="text-xs text-green-500/70">
                        {user?.role || 'visitor'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-900/40 hover:text-green-300 transition group"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  View Profile
                </Link>

                {/* Logout */}
                <div className="border-t border-green-700/30" />

                <div className="p-2">
                  <LogoutButton backendURL={API_URL} />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Overlay + Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-[73px] left-0 right-0 bg-gray-900/98 backdrop-blur-md border-b border-green-500/30 shadow-2xl z-40 md:hidden animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-2 p-4">
              {/* Mobile User Badge */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/30 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-lg">
                    {user ? user.username[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <p className="font-semibold text-green-300">
                      {user?.username || 'Guest'}
                    </p>
                    <p className="text-xs text-green-500/70">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              {navLink('/dashboard', 'Dashboard', Trophy)}
              {navLink('/team', 'Team', Users)}
              {user?.role === 'admin' && navLink('/admin', 'Admin', Lock)}

              {/* Profile */}
              <div className="border-t border-green-700/30 my-2" />

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-400 hover:bg-green-900/30 hover:text-green-300 transition"
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>

              {/* Logout */}
              <div className="pt-2">
                <LogoutButton backendURL={API_URL} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
