"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function CoachStudentsPage() {
  const [coachCode, setCoachCode] = useState(null);
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coach/fighters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not load fighters.");
        setCoachCode(null);
        setFighters([]);
        return;
      }

      setCoachCode(data.coachCode ?? null);
      setFighters(data.fighters ?? []);
    } catch {
      setError("Network error.");
      setCoachCode(null);
      setFighters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
            Fighters
          </h1>
          <p className="mt-1 text-sm text-[var(--slate)]">
            Select a fighter to view sessions and send coach notes.
          </p>
          {coachCode ? (
            <p className="mt-2 text-sm text-[var(--storm-blue)]">
              Your coach code:{" "}
              <span className="rounded-lg bg-[var(--rain)]/40 px-2 py-0.5 font-mono font-semibold">
                {coachCode}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-[var(--rain)]/90 p-4 shadow-sm ring-1 ring-[var(--storm-blue)]/10 sm:p-6">
        {loading ? (
          <p className="py-10 text-center text-sm text-[var(--storm-blue)]/80">Loading…</p>
        ) : error ? (
          <p className="py-10 text-center text-sm font-medium text-red-800">{error}</p>
        ) : fighters.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--storm-blue)]/85">
            No fighters found yet. Share your coach code during registration.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fighters.map((f) => {
              const label = `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email;
              return (
                <li key={f.id} className="rounded-2xl bg-white/60 p-4 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
                  <p className="font-semibold text-[var(--storm-blue)]">{label}</p>
                  <p className="mt-1 text-xs opacity-80 text-[var(--storm-blue)]">{f.email}</p>
                  <Link
                    href={`/coach?fighterId=${encodeURIComponent(String(f.id))}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--clay)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    View dashboard
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
