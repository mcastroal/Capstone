import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1696454411278-a64de1369e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWF5JTIwdGhhaSUyMGZpZ2h0ZXIlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NzQzNzIxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

function ArrowRightIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function Hero() {
  return (
    <div
      className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--stone)" }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_IMAGE}
          alt="Muay Thai training"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom right, rgba(232, 226, 217, 0.85), rgba(255, 255, 255, 0.75))",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <div
          className="mb-6 inline-block rounded-full px-4 py-2 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(196, 137, 58, 0.15)",
            border: "1px solid rgba(196, 137, 58, 0.3)",
          }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--ochre)" }}>
            Track Every Strike, Master Every Move
          </span>
        </div>

        <h1
          className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl"
          style={{ color: "var(--storm-blue)" }}
        >
          NakPath
        </h1>

        <p
          className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed md:text-2xl"
          style={{ color: "var(--slate)" }}
        >
          Your complete Muay Thai training companion. Log sessions, track progress, and elevate your
          martial arts journey.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-95"
            style={{ backgroundColor: "var(--ochre)" }}
          >
            Get Started
            <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#learn-more"
            className="rounded-full px-8 py-4 text-lg font-semibold backdrop-blur-sm ring-1 ring-[var(--storm-blue)]/20 transition-all duration-200 hover:bg-white/90"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              color: "var(--storm-blue)",
            }}
          >
            Learn More
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold" style={{ color: "var(--ochre)" }}>
              100+
            </div>
            <div className="text-sm" style={{ color: "var(--slate)" }}>
              Active Users
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold" style={{ color: "var(--ochre)" }}>
              20K+
            </div>
            <div className="text-sm" style={{ color: "var(--slate)" }}>
              Sessions Logged
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold" style={{ color: "var(--ochre)" }}>
              20+
            </div>
            <div className="text-sm" style={{ color: "var(--slate)" }}>
              Gyms Connected
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
