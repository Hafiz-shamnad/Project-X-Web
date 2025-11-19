"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Lock, User, Menu, X, Trophy, Bell } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import LogoutButton from "./LogoutButton";
import AnnouncementPanel from "./AnnouncementPanel";
import { BACKEND_URL } from "../utils/constants";

/* -------------------------------------------------------
 * Announcement Bell (stateless)
 * ------------------------------------------------------- */
function AnnouncementBell({
  onClick,
  unread,
}: {
  onClick: () => void;
  unread: number;
}) {
  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <Bell className="w-5 h-5 text-blue-300" />
      {unread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-1 rounded-full text-white font-semibold">
          {unread}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------
 * Memoized Nav Item
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

  const [user, setUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [openAnnouncements, setOpenAnnouncements] = useState(false);
  const [unread, setUnread] = useState(0);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------
   * Load Authenticated User
   * ------------------------------------------------------- */
  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "omit",
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
   * Unread Announcements + WebSocket
   * ------------------------------------------------------- */
  useEffect(() => {
    // Load unread count
    fetch(`${BACKEND_URL}/announcement/unread`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((d) => setUnread(d.unread || 0))
      .catch(() => {});

    // WebSocket listener
    const wsUrl = BACKEND_URL.replace(/^http/, "ws") // http → ws
      .replace(/^https/, "wss") // https → wss
      .replace(/\/api$/, ""); // remove /api only at end

    const ws = new WebSocket(`${wsUrl}/ws`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "announcement") {
          setUnread((u) => u + 1);
        }
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    return () => ws.close();
  }, []);

  // Reset unread when user opens panel
  useEffect(() => {
    if (openAnnouncements) {
      setUnread(0);
    }
  }, [openAnnouncements]);

  /* -------------------------------------------------------
   * Scroll Listener
   * ------------------------------------------------------- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------------------------------------------------------
   * Outside click for dropdown
   * ------------------------------------------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, []);

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

  const toggleMobile = useCallback(() => setOpenMobile((p) => !p), []);
  const toggleDropdown = useCallback(() => setOpenMenu((p) => !p), []);

  /* -------------------------------------------------------
   * UI Render
   * ------------------------------------------------------- */
  return (
    <>
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
          <div className="hidden md:flex items-center gap-4 text-sm">
            {NavItem("/dashboard", "CTF Arena", Shield)}
            {NavItem("/leaderboard", "Leaderboard", Trophy)}

            {/* Announcement Bell */}
            <AnnouncementBell
              unread={unread}
              onClick={() => setOpenAnnouncements((p) => !p)}
            />
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-black font-semibold shadow-md">
                {user ? user.username[0].toUpperCase() : "?"}
              </div>

              <span className="font-semibold text-blue-300">
                {user?.username || "guest"}
              </span>
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-60 bg-slate-900/95 border border-blue-500/30 rounded-xl shadow-2xl py-2">
                <Link
                  href="/profile"
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-blue-300 hover:bg-blue-900/40 rounded-md"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                <Link
                  href="/team"
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-blue-300 hover:bg-blue-900/40 rounded-md"
                >
                  <Users className="w-4 h-4" />
                  My Teams
                </Link>

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

      {/* Announcement Panel */}
      <AnnouncementPanel
        open={openAnnouncements}
        onClose={() => setOpenAnnouncements(false)}
      />

      {/* MOBILE MENU */}
      {openMobile && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpenMobile(false)}
          />

          <div className="fixed top-[70px] left-0 right-0 bg-slate-900/95 z-50 p-6 border-b border-blue-500/40 shadow-xl">
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

            <div className="pt-3">
              <LogoutButton backendURL={BACKEND_URL} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
