'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Trophy, Users, Lock, ChevronDown, LogOut, User, Menu, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navLink = (href: string, label: string, Icon: any) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/30'
            : 'text-green-400 hover:text-green-300 hover:bg-green-900/30'
        }`}
      >
        <Icon className={`w-4 h-4 transition-transform duration-300 ${
          isActive ? '' : 'group-hover:scale-110'
        }`} />
        <span>{label}</span>
        {!isActive && (
          <span className="absolute inset-0 rounded-lg border border-green-500/0 group-hover:border-green-500/50 transition-colors duration-300"></span>
        )}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={`border-b bg-black/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'border-green-500/50 shadow-lg shadow-green-500/10' 
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
              <Shield className="w-7 h-7 text-green-500 group-hover:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="absolute inset-0 blur-md bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300 -z-10"></div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300">
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
          <div className="hidden md:block relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                menuOpen
                  ? 'bg-green-900/40 text-green-300 border border-green-500/50'
                  : 'text-green-400 hover:text-green-300 hover:bg-green-900/20 border border-transparent'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-sm">
                {user ? user.username[0].toUpperCase() : 'G'}
              </div>
              <span className="max-w-[120px] truncate">
                {user ? user.username : 'guest'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-900/95 backdrop-blur-md border border-green-500/50 rounded-lg shadow-2xl shadow-green-500/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-900/40 hover:text-green-300 transition-all duration-200 group"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>View Profile</span>
                </Link>

                <div className="border-t border-green-700/30"></div>

                <div className="p-2">
                  <LogoutButton backendURL="http://localhost:4000/api" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-all duration-200"
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div className="fixed top-[73px] left-0 right-0 bg-gray-900/98 backdrop-blur-md border-b border-green-500/30 shadow-2xl z-40 md:hidden animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-2 p-4">
              {/* Mobile User Info */}
              <div className="p-4 mb-2 rounded-lg bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-lg">
                    {user ? user.username[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <p className="font-semibold text-green-300">
                      {user?.username || 'Guest'}
                    </p>
                    <p className="text-xs text-green-500/70">
                      {user?.role || 'visitor'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Nav Links */}
              {navLink('/dashboard', 'Dashboard', Trophy)}
              {navLink('/team', 'Team', Users)}
              {user?.role === 'admin' && navLink('/admin', 'Admin', Lock)}

              <div className="border-t border-green-700/30 my-2"></div>

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-400 hover:bg-green-900/30 hover:text-green-300 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span className="font-semibold">View Profile</span>
              </Link>

              <div className="pt-2">
                <LogoutButton backendURL="http://localhost:4000/api" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}