"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CoachAiInsightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fighterIdFromQuery = searchParams?.get("fighterId");

  const [fighters, setFighters] = useState([]);
  const [fightersLoading, setFightersLoading] = useState(true);
  const [filterFighterId, setFilterFighterId] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [fightersError, setFightersError] = useState("");
  const [sessionsError, setSessionsError] = useState("");

  const [coachGoal, setCoachGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiInsights, setAiInsights] = useState("");

  const filteredFighter = useMemo(
    () =>
      filterFighterId != null
        ? fighters.find((f) => String(f.id) === String(filterFighterId))
        : null,
    [fighters, filterFighterId],
  );

  const displaySessions = useMemo(() => {
    if (filterFighterId == null) return allSessions;
    return allSessions.filter((s) => String(s.user_id) === String(filterFighterId));
  }, [allSessions, filterFighterId]);

  const loadFighters = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setFightersLoading(true);
    setFightersError("");
    try {
      const res = await fetch("/api/coach/fighters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setFightersError(data.message || "Could not load fighters.");
        setFighters([]);
        return;
      }
      setFighters(data.fighters ?? []);
    } catch {
      setFightersError("Network error.");
      setFighters([]);
    } finally {
      setFightersLoading(false);
    }
  }, []);

  const loadAllSessions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAllSessions([]);
      setSessionsLoading(false);
      return;
    }

    setSessionsLoading(true);
    setSessionsError("");
    try {
      const res = await fetch("/api/coach/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.message || "Could not load sessions.");
        setAllSessions([]);
        return;
      }
      setAllSessions(data.sessions ?? []);
    } catch {
      setSessionsError("Network error.");
      setAllSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFighters();
  }, [loadFighters]);

  useEffect(() => {
    loadAllSessions();
  }, [loadAllSessions]);

  useEffect(() => {
    if (!fighters.length) return;
    if (fighterIdFromQuery && fighters.some((f) => String(f.id) === String(fighterIdFromQuery))) {
      setFilterFighterId(Number(fighterIdFromQuery));
    } else if (!fighterIdFromQuery) {
      setFilterFighterId(null);
    }
  }, [fighterIdFromQuery, fighters]);

  function setFilterAndUrl(nextId) {
    setFilterFighterId(nextId);
    if (nextId == null) {
      router.replace("/coach/insights");
    } else {
      router.replace(`/coach/insights?fighterId=${encodeURIComponent(String(nextId))}`);
    }
  }

  async function generatePlan() {
    setAiError("");
    setAiInsights("");

    if (displaySessions.length === 0) return;

    setAiLoading(true);
    try {
      const capped = displaySessions.slice(0, 40);
      const sessionsForAi = capped.map((s) => ({
        ...s,
        fighter_name:
          `${s.fighter?.first_name ?? ""} ${s.fighter?.last_name ?? ""}`.trim() ||
          s.fighter?.email ||
          "Fighter",
      }));
      const traineeName = filteredFighter
        ? `${filteredFighter.first_name ?? ""} ${filteredFighter.last_name ?? ""}`.trim() ||
          filteredFighter.email
        : "All linked fighters (see fighter_name on each session below)";

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: sessionsForAi,
          traineeName: traineeName || undefined,
          coachGoal: coachGoal.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data.message || "Could not generate plan.");
        return;
      }
      setAiInsights(data.insights || "");
    } catch {
      setAiError("Network error.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
            AI training plans
          </h1>
          <p className="mt-1 text-sm text-[var(--slate)]">
            Generate structured coaching ideas from your fighters&apos; logged sessions (up to 40 sessions
            for the view you select below).
          </p>
        </div>
        <Link
          href={filterFighterId != null ? `/coach?fighterId=${encodeURIComponent(String(filterFighterId))}` : "/coach"}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-[var(--storm-blue)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.42fr)_1fr] lg:gap-10">
        <section className="h-fit rounded-3xl bg-[var(--rain)]/90 p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
          <h2 className="text-lg font-semibold text-[var(--storm-blue)]">Which fighter?</h2>
          <p className="mt-1 text-xs text-[var(--storm-blue)]/80">
            Choose one fighter or all — the plan uses sessions that match your filter.
          </p>

          {fightersLoading ? (
            <p className="mt-4 text-sm text-[var(--storm-blue)]/80">Loading…</p>
          ) : fightersError ? (
            <p className="mt-4 text-sm font-medium text-red-800">{fightersError}</p>
          ) : fighters.length === 0 ? (
            <p className="mt-4 text-center text-sm text-[var(--storm-blue)]/85">
              No fighters linked yet. Share your coach code from the dashboard.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => setFilterAndUrl(null)}
                  className={`w-full rounded-2xl px-4 py-3 text-left shadow-sm transition ${
                    filterFighterId == null
                      ? "bg-white/80 text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20"
                      : "bg-white/60 text-[var(--storm-blue)] hover:bg-white/70"
                  }`}
                >
                  <p className="font-semibold">All fighters</p>
                  <p className="text-xs opacity-80">Combined session history</p>
                </button>
              </li>
              {fighters.map((f) => {
                const active = String(f.id) === String(filterFighterId);
                const label = `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setFilterAndUrl(f.id)}
                      className={`w-full rounded-2xl px-4 py-3 text-left shadow-sm transition ${
                        active
                          ? "bg-white/80 text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20"
                          : "bg-white/60 text-[var(--storm-blue)] hover:bg-white/70"
                      }`}
                    >
                      <p className="font-semibold">{label}</p>
                      <p className="text-xs opacity-80">{f.email}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-4 text-xs text-[var(--storm-blue)]/80">
            {sessionsLoading
              ? "Loading sessions…"
              : `${displaySessions.length} session${displaySessions.length === 1 ? "" : "s"} in this view.`}
          </p>
        </section>

        <section className="rounded-3xl bg-[var(--stone)] p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
          <h2 className="text-lg font-semibold text-[var(--storm-blue)]">Generate plan</h2>
          <p className="mt-2 text-sm text-[var(--slate)]">
            Optional: add a goal so the model emphasizes what you care about (clinch, cardio, technique mix,
            etc.).
          </p>

          <label className="mt-4 block text-sm font-semibold text-[var(--storm-blue)]">
            Coaching goal (optional)
          </label>
          <textarea
            value={coachGoal}
            onChange={(e) => setCoachGoal(e.target.value)}
            placeholder="Example: Improve clinch control and conditioning..."
            className="mt-2 w-full resize-y rounded-2xl bg-[var(--rain)]/60 px-4 py-3 text-sm text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
            rows={3}
          />

          <button
            type="button"
            disabled={aiLoading || sessionsLoading || displaySessions.length === 0}
            onClick={generatePlan}
            className="mt-4 w-full rounded-full bg-[var(--ochre)] px-5 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {aiLoading ? "Generating…" : "Generate plan"}
          </button>

          {sessionsError ? <p className="mt-3 text-sm font-medium text-red-800">{sessionsError}</p> : null}
          {aiError ? <p className="mt-3 text-sm font-medium text-red-800">{aiError}</p> : null}

          {aiInsights ? (
            <div className="mt-4 rounded-2xl bg-white/60 p-4 text-sm text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/10">
              <div className="whitespace-pre-wrap leading-relaxed">{aiInsights}</div>
            </div>
          ) : (
            !aiLoading &&
            !sessionsLoading &&
            displaySessions.length === 0 && (
              <p className="mt-4 text-sm text-[var(--slate)]">
                No sessions in this view yet. Ask your fighters to log training, or use &quot;Back to
                dashboard&quot; to review activity.
              </p>
            )
          )}
        </section>
      </div>
    </div>
  );
}
