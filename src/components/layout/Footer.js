import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--storm-blue)]/10 bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-[var(--slate)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {year} NakPath. Train with purpose.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[var(--storm-blue)]">
            Home
          </Link>
          <Link href="/login" className="hover:text-[var(--storm-blue)]">
            Login
          </Link>
          <Link href="/register" className="hover:text-[var(--storm-blue)]">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
