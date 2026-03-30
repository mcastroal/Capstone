"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SESSION_TECHNIQUES } from "@/lib/sessionTypes";

function defaultDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SessionForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    session_date: defaultDate(),
    duration_minutes: "60",
    intensity: "Moderate",
    notes: "",
  });
  const [selectedTechniques, setSelectedTechniques] = useState([SESSION_TECHNIQUES[0]]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unreadCoachCount, setUnreadCoachCount] = useState(0);
  const [coachPreview, setCoachPreview] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("/api/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.sessions) return;
        const list = data.sessions;
        const unread =
          typeof data.unreadCoachNotesCount === "number"
            ? data.unreadCoachNotesCount
            : list.filter(
                (s) =>
                  s.coach_notes &&
                  String(s.coach_notes).trim() !== "" &&
                  (s.coach_notes_unread === true || Number(s.coach_notes_unread) === 1),
              ).length;
        setUnreadCoachCount(unread);
        const latest = list.find((s) => s.coach_notes && String(s.coach_notes).trim());
        setCoachPreview(latest?.coach_notes ? String(latest.coach_notes).slice(0, 800) : "");
      } catch {
        /* ignore */
      }
    })();
  }, []);

  function toggleTechnique(name) {
    setSelectedTechniques((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (selectedTechniques.length === 0) {
      setError("Select at least one technique.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_date: form.session_date,
          duration_minutes: Number(form.duration_minutes),
          session_type: selectedTechniques,
          intensity: form.intensity || null,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not save session.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg space-y-5 rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-[var(--storm-blue)]/10 sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-[var(--storm-blue)]">Log training session</h1>
        <p className="mt-1 text-sm text-[var(--slate)]">
          Record what you did today — rounds, focus, and how hard you pushed.
        </p>
      </div>

      {unreadCoachCount > 0 ? (
        <div
          className="rounded-2xl bg-[var(--ochre)]/20 px-4 py-3 ring-2 ring-[var(--ochre)]/40"
          role="alert"
        >
          <p className="font-semibold text-[var(--storm-blue)]">You have new coach comments</p>
          <p className="mt-1 text-sm text-[var(--slate)]">
            Your coach left feedback on {unreadCoachCount} session{unreadCoachCount === 1 ? "" : "s"}.
            Open those sessions on your{" "}
            <Link href="/dashboard" className="font-semibold text-[var(--storm-blue)] underline">
              dashboard
            </Link>{" "}
            or{" "}
            <Link
              href="/dashboard/history"
              className="font-semibold text-[var(--storm-blue)] underline"
            >
              past sessions
            </Link>{" "}
            to read them.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="session_date" className="text-sm font-semibold text-[var(--storm-blue)]">
          Date
        </label>
        <input
          id="session_date"
          type="date"
          required
          value={form.session_date}
          onChange={(e) => setForm((f) => ({ ...f, session_date: e.target.value }))}
          className="w-full rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="duration" className="text-sm font-semibold text-[var(--storm-blue)]">
          Duration (minutes)
        </label>
        <input
          id="duration"
          type="number"
          min={1}
          max={1440}
          required
          value={form.duration_minutes}
          onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
          className="w-full rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-[var(--storm-blue)]">
          Techniques / session focus
        </legend>
        <p className="text-xs text-[var(--slate)]">Select all that apply.</p>
        <div className="flex flex-col gap-2 rounded-2xl bg-[var(--stone)] p-3">
          {SESSION_TECHNIQUES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-[var(--storm-blue)] hover:bg-white/60"
            >
              <input
                type="checkbox"
                checked={selectedTechniques.includes(t)}
                onChange={() => toggleTechnique(t)}
                className="h-4 w-4 rounded border-[var(--storm-blue)]/30 text-[var(--storm-blue)] focus:ring-[var(--rain)]"
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-[var(--storm-blue)]">Intensity</legend>
        <div className="flex flex-wrap gap-3">
          {["Light", "Moderate", "Hard"].map((level) => (
            <label
              key={level}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                form.intensity === level
                  ? "bg-[var(--storm-blue)] text-white"
                  : "bg-[var(--stone)] text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/15"
              }`}
            >
              <input
                type="radio"
                name="intensity"
                value={level}
                checked={form.intensity === level}
                onChange={() => setForm((f) => ({ ...f, intensity: level }))}
                className="sr-only"
              />
              {level}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="coach-comments-preview" className="text-sm font-semibold text-[var(--storm-blue)]">
          Coach comments
        </label>
        <p className="text-xs text-[var(--slate)]">
          Your coach adds feedback on sessions you have already logged. You cannot edit this box — it
          is read-only. Latest comment preview:
        </p>
        <textarea
          id="coach-comments-preview"
          readOnly
          rows={coachPreview ? 5 : 3}
          value={
            coachPreview ||
            "No coach comments yet. After you save this session, your coach can comment from their dashboard."
          }
          className="w-full resize-none rounded-2xl border border-[var(--ochre)]/30 bg-[var(--ochre)]/5 px-4 py-3 text-sm text-[var(--storm-blue)] focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-semibold text-[var(--storm-blue)]">
          Your notes <span className="font-normal text-[var(--slate)]">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Combinations worked, rounds, how you felt…"
          className="w-full resize-y rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
        />
      </div>

      {error ? <p className="text-sm font-medium text-red-800">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full px-6 py-3 text-sm font-semibold text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/25 transition hover:bg-[var(--stone)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[var(--clay)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save session"}
        </button>
      </div>
    </form>
  );
}
