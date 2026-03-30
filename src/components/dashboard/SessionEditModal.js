"use client";

import { useEffect, useRef, useState } from "react";
import { SESSION_TECHNIQUES, storedStringToTechniques } from "@/lib/sessionTypes";

export default function SessionEditModal({ session, onClose, onSaved }) {
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const [sessionDate, setSessionDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [intensity, setIntensity] = useState("Moderate");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    setSessionDate(session.session_date || "");
    setDurationMinutes(String(session.duration_minutes ?? "60"));
    setSelectedTechniques(storedStringToTechniques(session.session_type));
    setIntensity(session.intensity || "Moderate");
    setNotes(session.notes ?? "");
    setError("");
  }, [session]);

  useEffect(() => {
    if (!session?.id || !session.coach_notes_unread) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/sessions/${session.id}/mark-coach-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.ok) onSavedRef.current?.();
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.id, session?.coach_notes_unread]);

  if (!session) return null;

  function toggleTechnique(name) {
    setSelectedTechniques((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (selectedTechniques.length === 0) {
      setError("Select at least one technique.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not signed in.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_date: sessionDate,
          duration_minutes: Number(durationMinutes),
          session_type: selectedTechniques,
          intensity: intensity || null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not update session.");
        return;
      }
      onSaved?.();
      onClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not signed in.");
      return;
    }

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not delete session.");
        return;
      }
      onSaved?.();
      onClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-edit-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl ring-1 ring-[var(--storm-blue)]/15 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="session-edit-title" className="text-xl font-bold text-[var(--storm-blue)]">
            Edit session
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-semibold text-[var(--slate)] hover:bg-[var(--stone)]"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit_session_date" className="text-sm font-semibold text-[var(--storm-blue)]">
              Date
            </label>
            <input
              id="edit_session_date"
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit_duration" className="text-sm font-semibold text-[var(--storm-blue)]">
              Duration (minutes)
            </label>
            <input
              id="edit_duration"
              type="number"
              min={1}
              max={1440}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
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
                    intensity === level
                      ? "bg-[var(--storm-blue)] text-white"
                      : "bg-[var(--stone)] text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="edit_intensity"
                    value={level}
                    checked={intensity === level}
                    onChange={() => setIntensity(level)}
                    className="sr-only"
                  />
                  {level}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-[var(--storm-blue)]">Coach comments</label>
              {session.coach_notes_unread && session.coach_notes ? (
                <span className="rounded-full bg-[var(--ochre)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  New
                </span>
              ) : null}
            </div>
            {session.coach_notes ? (
              <div
                className="min-h-[4rem] whitespace-pre-wrap rounded-2xl bg-[var(--ochre)]/10 px-4 py-3 text-sm text-[var(--storm-blue)] ring-1 ring-[var(--ochre)]/25"
                role="region"
                aria-label="Coach comments"
              >
                {session.coach_notes}
              </div>
            ) : (
              <p className="rounded-2xl bg-[var(--stone)] px-4 py-3 text-sm text-[var(--slate)]">
                No coach comments on this session yet.
              </p>
            )}
            <p className="text-xs text-[var(--slate)]">Only your coach can add comments here.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit_notes" className="text-sm font-semibold text-[var(--storm-blue)]">
              Your notes <span className="font-normal text-[var(--slate)]">(optional)</span>
            </label>
            <textarea
              id="edit_notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-y rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-800">{error}</p> : null}

          <div className="flex flex-col gap-3 border-t border-[var(--storm-blue)]/10 pt-4 sm:flex-row sm:flex-wrap sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="order-3 rounded-full px-5 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50 sm:order-1"
            >
              {deleting ? "Deleting…" : "Delete session"}
            </button>
            <div className="order-1 flex flex-col gap-3 sm:order-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-6 py-3 text-sm font-semibold text-[var(--storm-blue)] ring-1 ring-[var(--storm-blue)]/25 transition hover:bg-[var(--stone)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-full bg-[var(--clay)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
