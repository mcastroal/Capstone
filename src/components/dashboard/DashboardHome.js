"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardFilter } from "./DashboardFilterContext";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardHome({ welcomeName }) {
  const { sessionSearch } = useDashboardFilter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not load sessions.");
        setSessions([]);
        return;
      }
      setSessions(data.sessions ?? []);
    } catch {
      setError("Network error.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayISO();
  const todaySessions = useMemo(
    () => sessions.filter((s) => s.session_date === today),
    [sessions, today]
  );

  const pastSessions = useMemo(
    () => sessions.filter((s) => s.session_date !== today),
    [sessions, today]
  );

  const displayPastSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return pastSessions;
    return pastSessions.filter((s) => {
      const hay = `${s.session_type} ${s.intensity ?? ""} ${s.notes ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [pastSessions, sessionSearch]);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
        Welcome{welcomeName ? ` ${welcomeName}` : ""}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <section>
          <h2 className="text-lg font-semibold text-[var(--storm-blue)]">Your activity today</h2>
          <div className="mt-4 rounded-3xl bg-[var(--rain)]/90 p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
            {loading ? (
              <p className="text-[var(--storm-blue)]/80">Loading…</p>
            ) : error ? (
              <p className="text-sm font-medium text-red-800">{error}</p>
            ) : todaySessions.length === 0 ? (
              <p className="text-center text-[var(--storm-blue)]/85">Nothing to show…</p>
            ) : (
              <ul className="space-y-3">
                {todaySessions.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-2xl bg-white/60 px-4 py-3 text-[var(--storm-blue)] shadow-sm"
                  >
                    <p className="font-semibold">{s.session_type}</p>
                    <p className="text-sm opacity-80">
                      {s.duration_minutes} min
                      {s.intensity ? ` · ${s.intensity}` : ""}
                    </p>
                    {s.notes ? (
                      <p className="mt-1 line-clamp-2 text-sm opacity-75">{s.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/dashboard/log-session"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--stone)] px-6 py-3.5 text-center text-base font-semibold text-[var(--storm-blue)] shadow-md ring-1 ring-[var(--storm-blue)]/15 transition hover:bg-white sm:w-auto"
          >
            Log a new session
          </Link>
        </section>

        <section>
          <h2 className="text-center text-lg font-semibold text-[var(--storm-blue)] lg:text-left">
            Past sessions
          </h2>
          <div className="mt-4 min-h-[280px] rounded-3xl bg-[var(--storm-blue)] p-4 shadow-inner sm:p-5">
            {loading ? (
              <p className="p-4 text-center text-white/80">Loading…</p>
            ) : displayPastSessions.length === 0 ? (
              <p className="p-8 text-center text-sm text-white/70">
                {pastSessions.length === 0
                  ? "No past sessions yet. Log a session to build your history."
                  : "No sessions match your search."}
              </p>
            ) : (
              <ul className="flex max-h-[min(420px,55vh)] flex-col gap-3 overflow-y-auto pr-1">
                {displayPastSessions.map((s) => (
                  <li
                    key={s.id}
                    className="shrink-0 rounded-2xl bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{s.session_type}</p>
                      <span className="shrink-0 text-xs font-medium opacity-70">
                        {formatDisplayDate(s.session_date)}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">
                      {s.duration_minutes} min
                      {s.intensity ? ` · ${s.intensity}` : ""}
                    </p>
                    {s.notes ? (
                      <p className="mt-1 line-clamp-2 text-sm opacity-75">{s.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
