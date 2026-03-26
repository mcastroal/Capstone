"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

export default function CoachDashboardPage() {
  const searchParams = useSearchParams();
  const fighterIdFromQuery = searchParams?.get("fighterId");

  const [fighters, setFighters] = useState([]);
  const [fightersLoading, setFightersLoading] = useState(true);
  const [selectedFighterId, setSelectedFighterId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState("");

  const [noteComposerFor, setNoteComposerFor] = useState(null);
  const [coachNoteDrafts, setCoachNoteDrafts] = useState({});

  const [coachGoal, setCoachGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiInsights, setAiInsights] = useState("");

  const selectedFighter = useMemo(
    () => fighters.find((f) => String(f.id) === String(selectedFighterId)),
    [fighters, selectedFighterId],
  );

  const loadFighters = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setFightersLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coach/fighters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not load fighters.");
        setFighters([]);
        setSelectedFighterId(null);
        return;
      }

      const list = data.fighters ?? [];
      setFighters(list);

      const wanted =
        fighterIdFromQuery && list.some((f) => String(f.id) === String(fighterIdFromQuery))
          ? fighterIdFromQuery
          : list[0]?.id ?? null;

      setSelectedFighterId(wanted ? Number(wanted) : null);
    } catch {
      setError("Network error.");
      setFighters([]);
      setSelectedFighterId(null);
    } finally {
      setFightersLoading(false);
    }
  }, [fighterIdFromQuery]);

  const loadSessions = useCallback(async () => {
    if (!selectedFighterId) {
      setSessions([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setSessionsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/coach/fighters/${selectedFighterId}/sessions`, {
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
      setSessionsLoading(false);
    }
  }, [selectedFighterId]);

  useEffect(() => {
    loadFighters();
  }, [loadFighters]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const today = todayISO();
  const todaySessions = useMemo(
    () => sessions.filter((s) => s.session_date === today),
    [sessions, today],
  );
  const pastSessions = useMemo(
    () => sessions.filter((s) => s.session_date !== today),
    [sessions, today],
  );

  async function addCoachNote(sessionId) {
    const draft = (coachNoteDrafts[sessionId] || "").trim();
    if (!draft) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/coach/sessions/${sessionId}/coach-note`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coachNote: draft }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not save coach note.");
        return;
      }

      setCoachNoteDrafts((prev) => ({ ...prev, [sessionId]: "" }));
      setNoteComposerFor(null);
      await loadSessions();
    } catch {
      setError("Network error.");
    }
  }

  async function generatePlan() {
    setAiError("");
    setAiInsights("");

    if (!selectedFighterId) return;

    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const traineeName = selectedFighter
        ? `${selectedFighter.first_name ?? ""} ${selectedFighter.last_name ?? ""}`.trim()
        : "";

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? {} : {}),
        },
        body: JSON.stringify({
          sessions,
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
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
            Coach dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--slate)]">
            View fighter sessions, add coach notes (communication), and generate a training plan with AI.
          </p>
        </div>

        <Link
          href="/coach/students"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--clay)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
        >
          Manage fighters
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div className="space-y-6">
          <section className="rounded-3xl bg-[var(--rain)]/90 p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
            <h2 className="text-lg font-semibold text-[var(--storm-blue)]">Your fighters</h2>

            {fightersLoading ? (
              <p className="mt-4 text-sm text-[var(--storm-blue)]/80">Loading…</p>
            ) : error ? (
              <p className="mt-4 text-sm font-medium text-red-800">{error}</p>
            ) : fighters.length === 0 ? (
              <p className="mt-4 text-center text-sm text-[var(--storm-blue)]/85">
                No fighters found yet. Ask fighters to register with your coach code.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {fighters.map((f) => {
                  const active = String(f.id) === String(selectedFighterId);
                  const label = `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email;
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedFighterId(f.id)}
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
          </section>

          <section className="rounded-3xl bg-[var(--stone)] p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
            <h2 className="text-lg font-semibold text-[var(--storm-blue)]">AI plan for trainees</h2>
            <p className="mt-2 text-sm text-[var(--slate)]">
              Generate a coaching plan using the selected fighter sessions.
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
              disabled={aiLoading || sessionsLoading || sessions.length === 0}
              onClick={generatePlan}
              className="mt-4 w-full rounded-full bg-[var(--ochre)] px-5 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? "Generating..." : "Generate plan"}
            </button>

            {aiError ? <p className="mt-3 text-sm font-medium text-red-800">{aiError}</p> : null}
            {aiInsights ? (
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-white/60 p-4 text-sm text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/10">
                {aiInsights}
              </pre>
            ) : null}
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-center text-lg font-semibold text-[var(--storm-blue)] lg:text-left">
              {selectedFighter ? (
                <>
                  {`${selectedFighter.first_name ?? ""} ${selectedFighter.last_name ?? ""}`.trim() || "Fighter"} sessions
                </>
              ) : (
                "Fighter sessions"
              )}
            </h2>

            <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-10">
              <section>
                <h3 className="text-base font-semibold text-[var(--storm-blue)]">Activity today</h3>
                <div className="mt-4 rounded-3xl bg-[var(--rain)]/90 p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
                  {sessionsLoading ? (
                    <p className="text-[var(--storm-blue)]/80">Loading…</p>
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
                          ) : (
                            <p className="mt-1 line-clamp-2 text-sm opacity-60">No notes yet.</p>
                          )}

                          {noteComposerFor === s.id ? (
                            <div className="mt-3 rounded-2xl bg-[var(--stone)]/70 p-3 ring-1 ring-[var(--storm-blue)]/10">
                              <label className="block text-xs font-semibold text-[var(--storm-blue)]">
                                Coach note
                              </label>
                              <textarea
                                value={coachNoteDrafts[s.id] || ""}
                                onChange={(e) =>
                                  setCoachNoteDrafts((prev) => ({
                                    ...prev,
                                    [s.id]: e.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder="Write a short note for your fighter..."
                                className="mt-2 w-full resize-y rounded-2xl bg-white/60 px-3 py-2 text-sm text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
                              />
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => addCoachNote(s.id)}
                                  disabled={!((coachNoteDrafts[s.id] || "").trim())}
                                  className="rounded-full bg-[var(--clay)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Send
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNoteComposerFor(null)}
                                  className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20 transition hover:bg-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setNoteComposerFor(s.id)}
                              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20 transition hover:bg-white"
                            >
                              Add coach note
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold text-[var(--storm-blue)]">Past sessions</h3>
                <div className="mt-4 min-h-[280px] rounded-3xl bg-[var(--storm-blue)] p-4 shadow-inner sm:p-5">
                  {sessionsLoading ? (
                    <p className="p-4 text-center text-white/80">Loading…</p>
                  ) : pastSessions.length === 0 ? (
                    <p className="p-8 text-center text-sm text-white/70">
                      {sessions.length === 0
                        ? "No sessions yet for this fighter."
                        : "No past sessions match your filter."}
                    </p>
                  ) : (
                    <ul className="flex max-h-[min(420px,55vh)] flex-col gap-3 overflow-y-auto pr-1">
                      {pastSessions.map((s) => (
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
                          <p className="mt-1 text-sm opacity-80">
                            {s.duration_minutes} min
                            {s.intensity ? ` · ${s.intensity}` : ""}
                          </p>
                          {s.notes ? (
                            <p className="mt-1 line-clamp-2 text-sm opacity-80">{s.notes}</p>
                          ) : null}

                          {noteComposerFor === s.id ? (
                            <div className="mt-3 rounded-2xl bg-white/60 p-3 ring-1 ring-[var(--storm-blue)]/10">
                              <label className="block text-xs font-semibold text-[var(--storm-blue)]">
                                Coach note
                              </label>
                              <textarea
                                value={coachNoteDrafts[s.id] || ""}
                                onChange={(e) =>
                                  setCoachNoteDrafts((prev) => ({
                                    ...prev,
                                    [s.id]: e.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder="Write a short note..."
                                className="mt-2 w-full resize-y rounded-2xl bg-white/70 px-3 py-2 text-sm text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
                              />
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => addCoachNote(s.id)}
                                  disabled={!((coachNoteDrafts[s.id] || "").trim())}
                                  className="rounded-full bg-[var(--clay)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Send
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNoteComposerFor(null)}
                                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20 transition hover:bg-[var(--rain)]/20"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setNoteComposerFor(s.id)}
                              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20 transition hover:bg-white"
                            >
                              Add coach note
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
