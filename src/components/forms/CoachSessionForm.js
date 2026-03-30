"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SESSION_TECHNIQUES } from "@/lib/sessionTypes";

function defaultDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fighterLabel(f) {
  const name = `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim();
  return name || f.email || `Fighter #${f.id}`;
}

export default function CoachSessionForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    session_date: defaultDate(),
    duration_minutes: "60",
    intensity: "Moderate",
    notes: "",
  });
  const [selectedTechniques, setSelectedTechniques] = useState([SESSION_TECHNIQUES[0]]);
  const [fighters, setFighters] = useState([]);
  const [selectedFighterIds, setSelectedFighterIds] = useState([]);
  const [loadingFighters, setLoadingFighters] = useState(true);
  const [fightersError, setFightersError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadFighters = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingFighters(true);
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
      setLoadingFighters(false);
    }
  }, []);

  useEffect(() => {
    loadFighters();
  }, [loadFighters]);

  function toggleTechnique(name) {
    setSelectedTechniques((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
  }

  function toggleFighter(id) {
    const sid = String(id);
    setSelectedFighterIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  }

  function selectAllFighters() {
    setSelectedFighterIds(fighters.map((f) => String(f.id)));
  }

  function clearFighters() {
    setSelectedFighterIds([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (selectedTechniques.length === 0) {
      setError("Select at least one technique.");
      return;
    }
    if (selectedFighterIds.length === 0) {
      setError("Select at least one fighter who attended.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?next=/coach/log-session");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/coach/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fighter_ids: selectedFighterIds.map(Number),
          session_date: form.session_date,
          duration_minutes: Number(form.duration_minutes),
          session_type: selectedTechniques,
          intensity: form.intensity || null,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not save sessions.");
        return;
      }
      router.push("/coach");
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
        <h1 className="text-2xl font-bold text-[var(--storm-blue)]">Log session for fighters</h1>
        <p className="mt-1 text-sm text-[var(--slate)]">
          Enter the class once and choose who was there. Each selected fighter gets the same session on
          their log.
        </p>
      </div>

      <fieldset className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="text-sm font-semibold text-[var(--storm-blue)]">Fighters in this session</legend>
          {fighters.length > 0 ? (
            <div className="flex gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={selectAllFighters}
                className="text-[var(--storm-blue)] underline decoration-[var(--storm-blue)]/30 underline-offset-2 hover:opacity-80"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearFighters}
                className="text-[var(--slate)] underline decoration-[var(--slate)]/30 underline-offset-2 hover:opacity-80"
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
        {loadingFighters ? (
          <p className="text-sm text-[var(--slate)]">Loading fighters…</p>
        ) : fightersError ? (
          <p className="text-sm font-medium text-red-800">{fightersError}</p>
        ) : fighters.length === 0 ? (
          <div className="rounded-2xl bg-[var(--stone)] px-4 py-3 text-sm text-[var(--storm-blue)]">
            <p>No fighters linked yet. Share your coach code from the dashboard so they can add it on their account.</p>
            <Link
              href="/coach"
              className="mt-2 inline-block font-semibold text-[var(--clay)] underline underline-offset-2"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="flex max-h-52 flex-col gap-2 overflow-y-auto rounded-2xl bg-[var(--stone)] p-3">
            {fighters.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-[var(--storm-blue)] hover:bg-white/60"
              >
                <input
                  type="checkbox"
                  checked={selectedFighterIds.includes(String(f.id))}
                  onChange={() => toggleFighter(f.id)}
                  className="h-4 w-4 rounded border-[var(--storm-blue)]/30 text-[var(--storm-blue)] focus:ring-[var(--rain)]"
                />
                <span>{fighterLabel(f)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="coach_session_date" className="text-sm font-semibold text-[var(--storm-blue)]">
          Date
        </label>
        <input
          id="coach_session_date"
          type="date"
          required
          value={form.session_date}
          onChange={(e) => setForm((prev) => ({ ...prev, session_date: e.target.value }))}
          className="w-full rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="coach_duration" className="text-sm font-semibold text-[var(--storm-blue)]">
          Duration (minutes)
        </label>
        <input
          id="coach_duration"
          type="number"
          min={1}
          max={1440}
          required
          value={form.duration_minutes}
          onChange={(e) => setForm((prev) => ({ ...prev, duration_minutes: e.target.value }))}
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
                name="coach_intensity"
                value={level}
                checked={form.intensity === level}
                onChange={() => setForm((prev) => ({ ...prev, intensity: level }))}
                className="sr-only"
              />
              {level}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="coach_session_notes" className="text-sm font-semibold text-[var(--storm-blue)]">
          Session notes <span className="font-normal text-[var(--slate)]">(optional)</span>
        </label>
        <textarea
          id="coach_session_notes"
          rows={4}
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Drills, rounds, focus for the group…"
          className="w-full resize-y rounded-2xl border-0 bg-[var(--stone)] px-4 py-3 text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
        />
        <p className="text-xs text-[var(--slate)]">
          These notes are copied to each fighter&apos;s session entry. You can still add per-person coach
          comments later from the dashboard.
        </p>
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
          disabled={submitting || fighters.length === 0}
          className="rounded-full bg-[var(--clay)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : `Save for ${selectedFighterIds.length || 0} fighter${selectedFighterIds.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </form>
  );
}
