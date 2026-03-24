"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--storm-blue)]/10 bg-[var(--stone)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-[var(--storm-blue)] sm:text-3xl">
          NakPath
        </Link>

        <nav className="flex items-center gap-2 rounded-full bg-white/70 p-1 ring-1 ring-[var(--storm-blue)]/15">
          {links.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--storm-blue)] text-white"
                    : "text-[var(--storm-blue)] hover:bg-[var(--rain)]/30"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}