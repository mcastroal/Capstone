"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardFilter } from "./DashboardFilterContext";
import DashboardSessionSearch from "./DashboardSessionSearch";
import SessionEditModal from "./SessionEditModal";

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

function syncStoredUserCoachCode(code) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const u = JSON.parse(raw);
    u.coach_code = code;
    localStorage.setItem("user", JSON.stringify(u));
  } catch {
    /* ignore */
  }
}

export default function DashboardHome({ welcomeName }) {
  const { sessionSearch } = useDashboardFilter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSession, setEditingSession] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [coachCodeDraft, setCoachCodeDraft] = useState("");
  const [coachLinkError, setCoachLinkError] = useState("");
  const [coachLinkMessage, setCoachLinkMessage] = useState("");
  const [coachLinkSubmitting, setCoachLinkSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setProfile(null);
        return;
      }
      const u = data.user;
      setProfile(u);
      if (u?.role === "fighter") {
        setCoachCodeDraft(u.coach_code ? String(u.coach_code) : "");
      }
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
      const hay = `${s.session_type} ${s.intensity ?? ""} ${s.notes ?? ""} ${s.coach_notes ?? ""}`
        .toLowerCase();
      return hay.includes(q);
    });
  }, [pastSessions, sessionSearch]);

  const unreadCoachNotesCount = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.coach_notes &&
          String(s.coach_notes).trim() !== "" &&
          (s.coach_notes_unread === true || Number(s.coach_notes_unread) === 1),
      ).length,
    [sessions],
  );

  function sessionHasUnreadCoach(s) {
    return (
      s.coach_notes &&
      String(s.coach_notes).trim() !== "" &&
      (s.coach_notes_unread === true || Number(s.coach_notes_unread) === 1)
    );
  }

  async function handleCoachCodeSubmit(e) {
    e.preventDefault();
    setCoachLinkError("");
    setCoachLinkMessage("");
    const code = coachCodeDraft.trim();
    if (!code) {
      setCoachLinkError("Enter your coach code.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    setCoachLinkSubmitting(true);
    try {
      const res = await fetch("/api/user/coach-code", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coachCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCoachLinkError(data.message || "Could not save coach code.");
        return;
      }
      const saved = data.coach_code ?? code;
      syncStoredUserCoachCode(saved);
      setProfile((prev) => (prev ? { ...prev, coach_code: saved } : prev));
      setCoachCodeDraft(saved);
      setCoachLinkMessage(
        profile?.coach_code
          ? "Coach code updated. Your coach can now see your sessions."
          : "Coach code saved. Your coach can now see your sessions.",
      );
    } catch {
      setCoachLinkError("Something went wrong. Try again.");
    } finally {
      setCoachLinkSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
        Welcome{welcomeName ? ` ${welcomeName}` : ""}
      </h1>

      {unreadCoachNotesCount > 0 ? (
        <div
          className="mt-4 rounded-2xl bg-[var(--ochre)]/20 px-4 py-3 ring-2 ring-[var(--ochre)]/35"
          role="alert"
        >
          <p className="font-semibold text-[var(--storm-blue)]">New coach comments</p>
          <p className="mt-1 text-sm text-[var(--slate)]">
            You have unread feedback on {unreadCoachNotesCount} session
            {unreadCoachNotesCount === 1 ? "" : "s"}. Click a session below or open{" "}
            <Link href="/dashboard/history" className="font-semibold text-[var(--storm-blue)] underline">
              Past sessions
            </Link>{" "}
            to read coach comments.
          </p>
        </div>
      ) : null}

      {profile?.role === "fighter" ? (
        <section className="mt-6 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-[var(--storm-blue)]/10 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--storm-blue)]">Coach code</h2>
          <p className="mt-1 text-sm text-[var(--slate)]">
            Did not have a code when you signed up? Enter your coach&apos;s code here so they can view your training.
          </p>
          {profileLoading ? (
            <p className="mt-3 text-sm text-[var(--slate)]">Loading profile…</p>
          ) : (
            <>
              {profile.coach_code ? (
                <p className="mt-3 text-sm text-[var(--storm-blue)]">
                  Linked with code:{" "}
                  <span className="rounded-md bg-[var(--rain)]/35 px-2 py-0.5 font-mono font-semibold">
                    {profile.coach_code}
                  </span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-[var(--ochre)]">You have not linked a coach yet.</p>
              )}
              <form
                onSubmit={handleCoachCodeSubmit}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <div className="min-w-0 flex-1">
                  <label htmlFor="coach-code-input" className="sr-only">
                    Coach code
                  </label>
                  <input
                    id="coach-code-input"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter coach code"
                    value={coachCodeDraft}
                    onChange={(e) => setCoachCodeDraft(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={coachLinkSubmitting}
                  className="rounded-full bg-[var(--storm-blue)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {coachLinkSubmitting ? "Saving…" : profile.coach_code ? "Update code" : "Link coach"}
                </button>
              </form>
              {coachLinkError ? (
                <p className="mt-2 text-sm font-medium text-red-800">{coachLinkError}</p>
              ) : null}
              {coachLinkMessage ? (
                <p className="mt-2 text-sm font-medium text-green-800">{coachLinkMessage}</p>
              ) : null}
            </>
          )}
        </section>
      ) : null}

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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{s.session_type}</p>
                      {sessionHasUnreadCoach(s) ? (
                        <span className="rounded-full bg-[var(--ochre)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          New comment
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm opacity-80">
                      {s.duration_minutes} min
                      {s.intensity ? ` · ${s.intensity}` : ""}
                    </p>
                    {s.notes ? (
                      <p className="mt-1 line-clamp-2 text-sm opacity-75">{s.notes}</p>
                    ) : null}
                    {s.coach_notes && String(s.coach_notes).trim() ? (
                      <div className="mt-2 rounded-xl bg-[var(--ochre)]/15 px-3 py-2 ring-1 ring-[var(--ochre)]/30">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--clay)]">
                          Coach comments
                        </p>
                        <p className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap text-sm text-[var(--storm-blue)]">
                          {s.coach_notes}
                        </p>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setEditingSession(s)}
                      className="mt-2 text-left text-xs font-semibold text-[var(--storm-blue)] underline decoration-[var(--storm-blue)]/40 underline-offset-2 hover:opacity-80"
                    >
                      Edit or delete
                    </button>
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
            <DashboardSessionSearch inputId="dashboard-home-past-search" />
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
                    className="shrink-0 cursor-pointer rounded-2xl bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] shadow-sm transition hover:bg-white/90 hover:ring-1 hover:ring-[var(--storm-blue)]/15"
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditingSession(s)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEditingSession(s);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{s.session_type}</p>
                        {sessionHasUnreadCoach(s) ? (
                          <span className="rounded-full bg-[var(--ochre)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            New comment
                          </span>
                        ) : null}
                      </div>
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
                    {s.coach_notes && String(s.coach_notes).trim() ? (
                      <div className="mt-2 rounded-xl bg-[var(--ochre)]/15 px-3 py-2 ring-1 ring-[var(--ochre)]/30">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--clay)]">
                          Coach comments
                        </p>
                        <p className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap text-sm text-[var(--storm-blue)]">
                          {s.coach_notes}
                        </p>
                      </div>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-[var(--slate)]">Click to edit or delete</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <SessionEditModal
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onSaved={load}
      />
    </>
  );
}
