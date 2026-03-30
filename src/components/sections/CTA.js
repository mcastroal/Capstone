import Link from "next/link";

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

const BACKGROUND_PATTERN_DATA_URI = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232e3d4f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function CTA() {
  return (
    <section
      className="relative overflow-hidden bg-white py-24 px-4 sm:px-6"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: BACKGROUND_PATTERN_DATA_URI }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <div
            className="mb-6 inline-block rounded-full p-3"
            style={{ backgroundColor: "rgba(196, 137, 58, 0.1)" }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--ochre)" }}
            >
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h2
          className="mb-6 text-4xl font-bold md:text-6xl"
          style={{ color: "var(--storm-blue)" }}
        >
          Ready to Transform Your Training?
        </h2>

        <p
          className="mx-auto mb-10 max-w-2xl text-xl"
          style={{ color: "var(--slate)" }}
        >
          Join hundreds of fighters who are already tracking their journey to mastery with
          NakPath.
        </p>

        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group flex items-center gap-3 rounded-full bg-[var(--ochre)] px-10 py-5 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-95"
          >
            Sign Up Free
            <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

