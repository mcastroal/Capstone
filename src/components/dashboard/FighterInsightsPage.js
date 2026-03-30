"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function FighterInsightsPage() {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [insights, setInsights] = useState("");
  const [meta, setMeta] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const loadSessions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSessionsLoading(true);
    setSessionsError("");
    try {
      const res = await fetch("/api/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.message || "Could not load sessions.");
        setSessions([]);
        return;
      }
      setSessions(data.sessions ?? []);
    } catch {
      setSessionsError("Network error.");
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleGenerate() {
    setGenerateError("");
    setInsights("");
    setMeta(null);

    const token = localStorage.getItem("token");
    if (!token) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/fighter-insights", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.message || "Could not generate insights.");
        return;
      }
      setInsights(data.insights || "");
      setMeta(data.meta ?? null);
    } catch {
      setGenerateError("Network error.");
    } finally {
      setGenerating(false);
    }
  }

  const hasSessions = sessions.length > 0;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-[var(--storm-blue)]/10 sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--storm-blue)] sm:text-3xl">AI training insights</h1>
        <p className="mt-2 max-w-2xl text-[var(--slate)]">
          NakPath reads your full session history (dates, duration, techniques, intensity, your notes, and coach
          feedback when present) and suggests focus areas and ideas for upcoming training. This complements your
          coach — not a replacement for in-person coaching.
        </p>

        {sessionsLoading ? (
          <p className="mt-6 text-sm text-[var(--slate)]">Loading your sessions…</p>
        ) : sessionsError ? (
          <p className="mt-6 text-sm font-medium text-red-800">{sessionsError}</p>
        ) : !hasSessions ? (
          <div className="mt-6 rounded-2xl bg-[var(--stone)] px-4 py-4 text-[var(--storm-blue)]">
            <p className="font-medium">No sessions yet</p>
            <p className="mt-1 text-sm text-[var(--slate)]">
              Log a few workouts first so the AI has real history to work from.
            </p>
            <Link
              href="/dashboard/log-session"
              className="mt-3 inline-flex rounded-full bg-[var(--clay)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Log a session
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--storm-blue)]">
              <span className="font-semibold">{sessions.length}</span> session{sessions.length === 1 ? "" : "s"}{" "}
              on file — ready to analyze your full history.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center justify-center rounded-full bg-[var(--storm-blue)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "Generating…" : "Generate insights"}
            </button>
          </div>
        )}

        {generateError ? (
          <p className="mt-4 text-sm font-medium text-red-800" role="alert">
            {generateError}
          </p>
        ) : null}
      </div>

      {insights ? (
        <section
          className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-[var(--storm-blue)]/10 sm:p-8"
          aria-label="Generated insights"
        >
          {meta ? (
            <p className="mb-4 text-xs text-[var(--slate)]">
              Based on <span className="font-semibold text-[var(--storm-blue)]">{meta.sessionCount}</span> sessions
              {meta.firstSessionDate && meta.lastSessionDate ? (
                <>
                  {" "}
                  from <span className="font-medium">{meta.firstSessionDate}</span> to{" "}
                  <span className="font-medium">{meta.lastSessionDate}</span>
                </>
              ) : null}
              .
            </p>
          ) : null}
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--storm-blue)]">{insights}</div>
          <p className="mt-6 border-t border-[var(--storm-blue)]/10 pt-4 text-xs text-[var(--slate)]">
            AI output may be inaccurate. Use judgment, listen to your body, and follow your coach&apos;s plan when
            it differs.
          </p>
        </section>
      ) : null}
    </div>
  );
}
