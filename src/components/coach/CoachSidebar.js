"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  );
}

function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 19V5M8 17V9M12 17v-5M16 17V7M20 17V3" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        strokeLinecap="round"
      />
      <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CoachSidebar({ collapsed, onToggleCollapse, userName, userRole }) {
  const pathname = usePathname();
  const router = useRouter();

  const nav = useMemo(
    () => [
      { href: "/coach", label: "Coach Dashboard", icon: IconDashboard },
      { href: "/coach/students", label: "Fighters", icon: IconUsers },
      { href: "/insights", label: "AI Insights", icon: IconChart },
    ],
    [],
  );

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#1e3a5f] text-white transition-[width] duration-300 ease-out ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <div className={`flex items-center gap-2 px-3 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg font-bold"
          aria-hidden
        >
          N
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight">NakPath</p>
            <p className="truncate text-xs text-white/70">Muay Thai Coach</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4">
        <p
          className={`px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/45 ${
            collapsed ? "sr-only" : ""
          }`}
        >
          Menu
        </p>
        {nav.map((item) => {
          const active =
            item.href === "/coach"
              ? pathname === "/coach" || pathname.startsWith("/coach/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-[#152d4a] text-white shadow-inner" : "text-white/85 hover:bg-white/10"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
          {!collapsed && (
            <div className="min-w-0 flex-1 rounded-2xl bg-[#152d4a] px-3 py-2">
              <p className="truncate text-sm font-semibold">{userName || "Coach"}</p>
              <p className="truncate text-xs capitalize text-white/60">
                {userRole || ""}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <IconLogout className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`mt-2 w-full rounded-xl py-2 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white ${
            collapsed ? "px-0" : ""
          }`}
        >
          {collapsed ? "»" : "« Collapse"}
        </button>
      </div>
    </aside>
  );
}

