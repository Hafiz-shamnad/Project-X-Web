"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Lock, User, Menu, X, Trophy } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import LogoutButton from "./LogoutButton";
import { BACKEND_URL } from "../utils/constants";

/* -------------------------------------------------------
 * Memoized Nav Item Component
 * ------------------------------------------------------- */
const NavItemComponent = ({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  Icon: any;
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
      active
        ? "bg-blue-500 text-black border border-blue-300 shadow-blue-300/40 shadow-md"
        : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
    }`}
  >
    <Icon
      className={`w-4 h-4 transition ${!active ? "group-hover:scale-110" : ""}`}
    />
    {label}
  </Link>
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  /* -------------------------------------------------------
   * STATE
   * ------------------------------------------------------- */
  const [user, setUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------
   * Fetch Authenticated User (one-time, optimized)
   * ------------------------------------------------------- */
  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        if (!active) return;

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
    };

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  /* -------------------------------------------------------
   * Scroll Listener (optimized throttle)
   * ------------------------------------------------------- */
  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------------------------------------------------------
   * Click Outside Dropdown
   * ------------------------------------------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };

    // using capture to ensure correct firing
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, []);

  /* -------------------------------------------------------
   * Memoized NavItem callback
   * ------------------------------------------------------- */
  const NavItem = useCallback(
    (href: string, label: string, Icon: any) => (
      <NavItemComponent
        href={href}
        label={label}
        Icon={Icon}
        active={pathname === href}
        onClick={() => setOpenMobile(false)}
      />
    ),
    [pathname]
  );

  /* -------------------------------------------------------
   * Handlers (memoized)
   * ------------------------------------------------------- */
  const toggleMobile = useCallback(() => setOpenMobile((p) => !p), []);
  const toggleDropdown = useCallback(() => setOpenMenu((p) => !p), []);

  /* -------------------------------------------------------
   * UI RENDER
   * ------------------------------------------------------- */
  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all bg-slate-950/80 ${
          scrolled
            ? "border-blue-500/40 shadow-lg shadow-blue-500/20"
            : "border-blue-500/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => router.push("/dashboard")}
          >
            <div className="relative">
              <Shield className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition group-hover:rotate-6" />
              <div className="absolute inset-0 blur-md bg-blue-500/20 group-hover:bg-blue-400/30 -z-10" />
            </div>

            <h1 className="text-xl font-bold text-blue-300 tracking-wider group-hover:text-blue-200">
              PROJECT_X
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            {NavItem("/dashboard", "CTF Arena", Shield)}
            {NavItem("/leaderboard", "Leaderboard", Trophy)}
          </div>

          {/* USER DROPDOWN */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all
      ${
        openMenu
          ? "bg-blue-900/40 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10"
          : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
      }`}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 
        flex items-center justify-center text-black font-semibold shadow-md"
              >
                {user ? user.username[0].toUpperCase() : "?"}
              </div>

              {/* Username */}
              <span className="font-semibold text-blue-300">
                {user?.username || "guest"}
              </span>
            </button>

            {/* DROPDOWN MENU */}
            {openMenu && (
              <div
                className="absolute right-0 mt-3 w-60 bg-slate-900/95 backdrop-blur-xl 
        border border-blue-500/30 rounded-xl shadow-2xl py-2 animate-in fade-in-0 zoom-in-95"
              >
                {/* Profile */}
                <Link
                  href="/profile"
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-blue-300 hover:bg-blue-900/40 rounded-md"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                {/* My Teams (NEW) */}
                <Link
                  href="/team"
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-blue-300 hover:bg-blue-900/40 rounded-md"
                >
                  <Users className="w-4 h-4" />
                  My Teams
                </Link>

                {/* Admin (conditional) */}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-blue-300 hover:bg-blue-900/40 rounded-md"
                  >
                    <Lock className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}

                <div className="border-t border-blue-800/40 my-2" />

                {/* Logout */}
                <div className="px-3 py-1.5">
                  <LogoutButton backendURL={BACKEND_URL} />
                </div>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg"
          >
            {openMobile ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {openMobile && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpenMobile(false)}
          />

          <div className="fixed top-[70px] left-0 right-0 bg-slate-900/95 z-50 p-6 border-b border-blue-500/40 shadow-xl">
            {/* USER INFO */}
            <div className="flex items-center gap-3 mb-5 p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-black font-bold">
                {user ? user.username[0].toUpperCase() : "?"}
              </div>
              <div>
                <p className="text-blue-300 font-semibold">
                  {user?.username || "Guest"}
                </p>
                <p className="text-xs text-blue-500/70">{user?.role}</p>
              </div>
            </div>

            {/* NAV ITEMS */}
            {NavItem("/dashboard", "CTF Arena", Shield)}
            {NavItem("/leaderboard", "Leaderboard", Trophy)}
            {user?.role === "admin" && NavItem("/admin", "Admin", Lock)}

            <div className="border-t border-blue-800/40 my-4" />

            <Link
              href="/profile"
              onClick={() => setOpenMobile(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-400 hover:bg-blue-900/40"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => setOpenMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-cyan-300 hover:bg-cyan-900/40 rounded-md"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>

            <div className="pt-3">
              <LogoutButton backendURL={BACKEND_URL} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
