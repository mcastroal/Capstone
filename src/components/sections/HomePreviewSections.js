import HomeScreenshot from "./HomeScreenshot";

function CheckIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function FeatureList({ items }) {
  return (
    <ul className="space-y-3 text-left">
      {items.map((text) => (
        <li key={text} className="flex gap-3 text-[var(--slate)]">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "var(--ochre)" }}
          >
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-base leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
  );
}

const FIGHTER_FEATURES = [
  "Log every session — date, duration, techniques, intensity, and your notes.",
  "Review past training with quick search across techniques, notes, and coach feedback.",
  "Link your coach with a code so they can see your progress and leave comments.",
  "See when your coach adds new feedback, then open sessions to read the full thread.",
  "Generate AI insights from your full history to spot patterns and plan what’s next.",
];

const COACH_FEATURES = [
  "Get a unique coach code and build a roster of linked fighters.",
  "See all fighters’ sessions in one feed, or filter to one athlete.",
  "Add coach comments on any session so fighters see guidance where it matters.",
  "Log one group class and attach the same session details to every fighter who attended.",
  "Open AI training plans on a dedicated page, scoped to one fighter or your whole roster.",
];

export default function HomePreviewSections() {
  return (
    <>
      {/* Fighters */}
      <section
        className="border-t border-[var(--storm-blue)]/10 bg-white py-16 sm:py-20"
        aria-labelledby="home-fighter-preview-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ochre)]">For fighters</p>
          <h2
            id="home-fighter-preview-heading"
            className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--storm-blue)" }}
          >
            Your dashboard after you log in
          </h2>
          <p className="mt-3 max-w-2xl text-lg" style={{ color: "var(--slate)" }}>
            NakPath centers on your training log — everything you need to stay consistent and hear from your coach
            in one place.
          </p>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FeatureList items={FIGHTER_FEATURES} />
            <HomeScreenshot
              src="/home/fighter-dashboard.png"
              alt="Preview of the fighter dashboard showing sessions and training activity"
              placeholderText="Add your image at public/home/fighter-dashboard.png (or update the src in HomePreviewSections.js if you use a different name or .jpg)."
            />
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section
        className="border-t border-[var(--storm-blue)]/10 py-16 sm:py-20"
        style={{ backgroundColor: "var(--stone)" }}
        aria-labelledby="home-coach-preview-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ochre)]">For coaches</p>
          <h2
            id="home-coach-preview-heading"
            className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--storm-blue)" }}
          >
            Coach tools in one workspace
          </h2>
          <p className="mt-3 max-w-2xl text-lg" style={{ color: "var(--slate)" }}>
            Track your team’s volume, leave targeted notes on sessions, and use AI to draft plans — without fighters
            re-entering the same workout twice.
          </p>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-2">
              <FeatureList items={COACH_FEATURES} />
            </div>
            <div className="lg:order-1">
              <HomeScreenshot
                src="/home/coach-dashboard.png"
                alt="Preview of the coach dashboard showing fighters and sessions"
                placeholderText="Add your image at public/home/coach-dashboard.png (or update the src in HomePreviewSections.js if you use a different name or .jpg)."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
