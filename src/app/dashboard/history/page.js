"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useDashboardFilter } from "@/components/dashboard/DashboardFilterContext";

function formatDisplayDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HistoryPage() {
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

  const q = sessionSearch.trim().toLowerCase();
  const filtered = q
    ? sessions.filter((s) => {
        const hay = `${s.session_type} ${s.intensity ?? ""} ${s.notes ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
    : sessions;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--storm-blue)] sm:text-3xl">Past sessions</h1>
          <p className="mt-1 text-sm text-[var(--slate)]">
            Full history of logged training. Use quick search in the sidebar to filter.
          </p>
        </div>
        <Link
          href="/dashboard/log-session"
          className="inline-flex items-center justify-center rounded-full bg-[var(--clay)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Log a new session
        </Link>
      </div>

      <div className="mt-8 rounded-3xl bg-[var(--storm-blue)] p-4 sm:p-6">
        {loading ? (
          <p className="py-12 text-center text-white/80">Loading…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm font-medium text-red-200">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/75">
            {sessions.length === 0
              ? "You have not logged any sessions yet."
              : "No sessions match your search."}
          </p>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-3">
            {filtered.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl bg-[var(--stone)] px-5 py-4 text-[var(--storm-blue)] shadow-md"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">{s.session_type}</h2>
                  <time className="text-sm font-medium opacity-75">{formatDisplayDate(s.session_date)}</time>
                </div>
                <p className="mt-1 text-sm opacity-80">
                  {s.duration_minutes} minutes
                  {s.intensity ? ` · ${s.intensity}` : ""}
                </p>
                {s.notes ? <p className="mt-2 text-sm leading-relaxed opacity-90">{s.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
