"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function fighterSessionLabel(s) {
  const f = s?.fighter;
  if (!f) return "Fighter";
  const name = `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim();
  return name || f.email || "Fighter";
}

export default function CoachDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fighterIdFromQuery = searchParams?.get("fighterId");

  const [myCoachCode, setMyCoachCode] = useState(null);
  const [fighters, setFighters] = useState([]);
  const [fightersLoading, setFightersLoading] = useState(true);
  /** null = show every linked fighter's sessions */
  const [filterFighterId, setFilterFighterId] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [fightersError, setFightersError] = useState("");
  const [sessionsError, setSessionsError] = useState("");

  const [noteComposerFor, setNoteComposerFor] = useState(null);
  const [coachNoteDrafts, setCoachNoteDrafts] = useState({});

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
        setMyCoachCode(null);
        setFighters([]);
        return;
      }

      setMyCoachCode(data.coachCode ?? null);
      const list = data.fighters ?? [];
      setFighters(list);
    } catch {
      setFightersError("Network error.");
      setMyCoachCode(null);
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

  const today = todayISO();
  const todaySessions = useMemo(
    () => displaySessions.filter((s) => s.session_date === today),
    [displaySessions, today],
  );
  const pastSessions = useMemo(
    () => displaySessions.filter((s) => s.session_date !== today),
    [displaySessions, today],
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
        setSessionsError(data.message || "Could not save coach comment.");
        return;
      }

      setCoachNoteDrafts((prev) => ({ ...prev, [sessionId]: "" }));
      setNoteComposerFor(null);
      await loadAllSessions();
    } catch {
      setSessionsError("Network error.");
    }
  }

  return (
    <>
      {myCoachCode ? (
        <div className="mb-6 rounded-2xl bg-[var(--storm-blue)] px-4 py-4 text-white shadow-md sm:px-6 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Your coach code</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider sm:text-3xl">{myCoachCode}</p>
          <p className="mt-2 text-sm text-white/85">
            Share this code with fighters so they can link to you when they register or from their dashboard.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
            Coach dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--slate)]">
            View fighter sessions and add coach comments. Use AI training plans on the insights page.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={
              filterFighterId != null
                ? `/coach/insights?fighterId=${encodeURIComponent(String(filterFighterId))}`
                : "/coach/insights"
            }
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--ochre)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
          >
            AI training plans
          </Link>
          <Link
            href="/coach/students"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--clay)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
          >
            Manage fighters
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(260px,0.42fr)_1fr] lg:gap-10">
        <div className="space-y-6">
          <section className="rounded-3xl bg-[var(--rain)]/90 p-6 shadow-sm ring-1 ring-[var(--storm-blue)]/10">
            <h2 className="text-lg font-semibold text-[var(--storm-blue)]">Filter by fighter</h2>
            <p className="mt-1 text-xs text-[var(--storm-blue)]/80">
              By default you see every linked fighter&apos;s sessions. Tap one name to focus.
            </p>

            {fightersLoading ? (
              <p className="mt-4 text-sm text-[var(--storm-blue)]/80">Loading…</p>
            ) : fightersError ? (
              <p className="mt-4 text-sm font-medium text-red-800">{fightersError}</p>
            ) : fighters.length === 0 ? (
              <p className="mt-4 text-center text-sm text-[var(--storm-blue)]/85">
                No fighters found yet. Ask fighters to register with your coach code.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterFighterId(null);
                      router.replace("/coach");
                    }}
                    className={`w-full rounded-2xl px-4 py-3 text-left shadow-sm transition ${
                      filterFighterId == null
                        ? "bg-white/80 text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/20"
                        : "bg-white/60 text-[var(--storm-blue)] hover:bg-white/70"
                    }`}
                  >
                    <p className="font-semibold">All fighters</p>
                    <p className="text-xs opacity-80">Show combined sessions</p>
                  </button>
                </li>
                {fighters.map((f) => {
                  const active = String(f.id) === String(filterFighterId);
                  const label = `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email;
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterFighterId(f.id);
                          router.replace(`/coach?fighterId=${encodeURIComponent(String(f.id))}`);
                        }}
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
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-center text-lg font-semibold text-[var(--storm-blue)] lg:text-left">
              {filteredFighter
                ? `${filteredFighter.first_name ?? ""} ${filteredFighter.last_name ?? ""}`.trim() ||
                  filteredFighter.email ||
                  "Fighter"
                : "All fighters"}
              {" · "}
              sessions
            </h2>
            <p className="mt-1 text-center text-sm text-[var(--slate)] lg:text-left">
              {filterFighterId == null
                ? `${allSessions.length} session${allSessions.length === 1 ? "" : "s"} across your roster`
                : `${displaySessions.length} session${displaySessions.length === 1 ? "" : "s"} for this fighter`}
            </p>

            {sessionsError ? (
              <p className="mt-3 text-sm font-medium text-red-800 lg:text-left">{sessionsError}</p>
            ) : null}

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
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--storm-blue)]/70">
                            {fighterSessionLabel(s)}
                          </p>
                          <p className="mt-0.5 font-semibold">{s.session_type}</p>
                          <p className="text-sm opacity-80">
                            {s.duration_minutes} min
                            {s.intensity ? ` · ${s.intensity}` : ""}
                          </p>
                          {s.notes ? (
                            <p className="mt-1 line-clamp-2 text-sm opacity-75">{s.notes}</p>
                          ) : (
                            <p className="mt-1 line-clamp-2 text-sm opacity-60">No fighter notes yet.</p>
                          )}
                          {s.coach_notes ? (
                            <div className="mt-2 rounded-xl bg-[var(--ochre)]/20 px-3 py-2 text-xs text-[var(--storm-blue)] ring-1 ring-[var(--ochre)]/25">
                              <span className="font-semibold">Your comments: </span>
                              <span className="whitespace-pre-wrap">{s.coach_notes}</span>
                            </div>
                          ) : null}

                          {noteComposerFor === s.id ? (
                            <div className="mt-3 rounded-2xl bg-[var(--stone)]/70 p-3 ring-1 ring-[var(--storm-blue)]/10">
                              <label className="block text-xs font-semibold text-[var(--storm-blue)]">
                                Add coach comment
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
                              Add coach comment
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
                      {displaySessions.length === 0
                        ? filterFighterId == null
                          ? "No sessions yet from any linked fighter."
                          : "No sessions yet for this fighter."
                        : "No past sessions for this view."}
                    </p>
                  ) : (
                    <ul className="flex max-h-[min(420px,55vh)] flex-col gap-3 overflow-y-auto pr-1">
                      {pastSessions.map((s) => (
                        <li
                          key={s.id}
                          className="shrink-0 rounded-2xl bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] shadow-sm"
                        >
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--storm-blue)]/70">
                            {fighterSessionLabel(s)}
                          </p>
                          <div className="mt-0.5 flex items-start justify-between gap-2">
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
                          {s.coach_notes ? (
                            <div className="mt-2 rounded-xl bg-[var(--ochre)]/20 px-3 py-2 text-xs text-[var(--storm-blue)] ring-1 ring-[var(--ochre)]/25">
                              <span className="font-semibold">Your comments: </span>
                              <span className="whitespace-pre-wrap">{s.coach_notes}</span>
                            </div>
                          ) : null}

                          {noteComposerFor === s.id ? (
                            <div className="mt-3 rounded-2xl bg-white/60 p-3 ring-1 ring-[var(--storm-blue)]/10">
                              <label className="block text-xs font-semibold text-[var(--storm-blue)]">
                                Add coach comment
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
                              Add coach comment
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
