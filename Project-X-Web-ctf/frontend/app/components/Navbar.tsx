"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Lock, User, Menu, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import LogoutButton from "./LogoutButton";
import { BACKEND_URL } from "../utils/constants";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------
   * Fetch Authenticated User
   * ------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
    })();
  }, []);

  /* -------------------------------------------------------
   * Scroll Style
   * ------------------------------------------------------- */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* -------------------------------------------------------
   * Click Outside Dropdown
   * ------------------------------------------------------- */
  useEffect(() => {
    const handler = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -------------------------------------------------------
   * Reusable Item Component
   * ------------------------------------------------------- */
  const NavItem = (href: string, label: string, Icon: any) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setOpenMobile(false)}
        className={`
          group flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
          ${
            active
              ? "bg-blue-500 text-black border border-blue-300 shadow-blue-300/40 shadow-md"
              : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
          }
        `}
      >
        <Icon className={`w-4 h-4 ${!active && "group-hover:scale-110"} transition`} />
        {label}
      </Link>
    );
  };

  /* -------------------------------------------------------
   * UI / JSX
   * ------------------------------------------------------- */
  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all
        bg-slate-950/80 
        ${
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
            {NavItem("/team", "Team", Users)}
            {user?.role === "admin" && NavItem("/admin", "Admin", Lock)}
          </div>

          {/* USER DROPDOWN */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition
                ${
                  openMenu
                    ? "bg-blue-900/40 text-blue-300 border border-blue-500/40"
                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                }
              `}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-black font-bold">
                {user ? user.username[0].toUpperCase() : "?"}
              </div>
              <span>{user?.username || "guest"}</span>
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-lg shadow-xl">
                <Link
                  href="/profile"
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center gap-2 px-4 py-3 text-blue-400 hover:bg-blue-900/30"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                <div className="border-t border-blue-800/40" />
                <div className="p-2">
                  <LogoutButton backendURL={BACKEND_URL} />
                </div>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpenMobile(!openMobile)}
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
                <p className="text-blue-300 font-semibold">{user?.username || "Guest"}</p>
                <p className="text-xs text-blue-500/70">{user?.role}</p>
              </div>
            </div>

            {/* NAV ITEMS */}
            {NavItem("/dashboard", "CTF Arena", Shield)}
            {NavItem("/team", "Team", Users)}

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

            <div className="pt-3">
              <LogoutButton backendURL={BACKEND_URL} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
