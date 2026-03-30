/** Muay Thai session techniques / focus areas (multi-select). */
export const SESSION_TECHNIQUES = [
  "Pads / mitts",
  "Bag work",
  "Sparring",
  "Clinch",
  "Technique / drills",
  "Conditioning",
  "Other",
];

const JOINER = "; ";

/** Persist selected techniques as one string (DB column). */
export function techniquesToStoredString(selected) {
  const parts = (selected || [])
    .map((s) => String(s).trim())
    .filter(Boolean);
  return parts.join(JOINER).slice(0, 2000);
}

/** Normalize API body field (string or string[]) for DB storage. */
export function normalizeSessionTypeInput(input) {
  if (Array.isArray(input)) {
    return techniquesToStoredString(input);
  }
  if (input == null) return "";
  return String(input).trim().slice(0, 2000);
}

/** Parse stored string back into checkbox selections. */
export function storedStringToTechniques(stored) {
  if (stored == null || stored === "") return [];
  const raw = String(stored);
  const parts = raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  const known = new Set(SESSION_TECHNIQUES);
  const matched = parts.filter((p) => known.has(p));
  if (matched.length > 0) return matched;
  if (known.has(raw.trim())) return [raw.trim()];
  return parts.length ? [raw] : [];
}
