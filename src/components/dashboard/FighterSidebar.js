"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardFilter } from "./DashboardFilterContext";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/dashboard/log-session", label: "Log session", icon: IconPlus },
  { href: "/dashboard/history", label: "Past sessions", icon: IconClock },
  { href: "/insights", label: "Insights", icon: IconChart },
];

const shortcuts = [
  { href: "#", label: "Settings", icon: IconGear, disabled: true },
  { href: "#", label: "Help", icon: IconHelp, disabled: true },
];

export default function FighterSidebar({
  collapsed,
  onToggleCollapse,
  userName,
  userRole,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { sessionSearch, setSessionSearch } = useDashboardFilter();

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
            <p className="truncate text-xs text-white/70">Muay Thai</p>
          </div>
        )}
      </div>

      <div className="px-3 pb-2">
        {collapsed ? (
          <button
            type="button"
            title="Quick search — expand sidebar"
            onClick={onToggleCollapse}
            className="flex h-11 w-full items-center justify-center rounded-2xl bg-[#152d4a] text-white/80 transition hover:bg-[#1a3555]"
          >
            <IconSearch className="h-4 w-4" />
          </button>
        ) : (
          <>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Quick search</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <IconSearch className="h-4 w-4" />
              </span>
              <input
                type="search"
                placeholder="Filter sessions…"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                title="Filter past sessions by type or notes"
                className="w-full rounded-2xl border-0 bg-[#152d4a] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              />
            </div>
          </>
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
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-[#152d4a] text-white shadow-inner" : "text-white/85 hover:bg-white/10"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <item.icon className="h-5 w-5 shrink-0 opacity-90" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <p
          className={`px-2 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-white/45 ${
            collapsed ? "sr-only" : ""
          }`}
        >
          Shortcuts
        </p>
        {shortcuts.map((item) => (
          <span
            key={item.label}
            title={collapsed ? `${item.label} (soon)` : undefined}
            className={`flex cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-white/40 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </span>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
          {!collapsed && (
            <div className="min-w-0 flex-1 rounded-2xl bg-[#152d4a] px-3 py-2">
              <p className="truncate text-sm font-semibold">{userName || "Fighter"}</p>
              <p className="truncate text-xs capitalize text-white/60">{userRole || "—"}</p>
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

function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z" />
    </svg>
  );
}

function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" strokeLinecap="round" />
    </svg>
  );
}

function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 19V5M8 17V9M12 17v-5M16 17V7M20 17v-9" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

function IconGear(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconHelp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 114.2 1.8c-.9.6-1.2 1-1.2 2.2" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
