"use client";

import { useDashboardFilter } from "./DashboardFilterContext";

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Same filter as the sidebar quick search, for use inside past-session panels.
 */
export default function DashboardSessionSearch({ inputId = "dashboard-past-sessions-search" }) {
  const { sessionSearch, setSessionSearch } = useDashboardFilter();

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-medium text-white/70"
      >
        Quick search
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          <IconSearch className="h-4 w-4" />
        </span>
        <input
          id={inputId}
          type="search"
          placeholder="Filter by technique, notes, coach comments…"
          value={sessionSearch}
          onChange={(e) => setSessionSearch(e.target.value)}
          title="Filter past sessions (same as sidebar search)"
          autoComplete="off"
          className="w-full rounded-2xl border-0 bg-[#152d4a] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
        />
      </div>
    </div>
  );
}
