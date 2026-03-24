"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function safeNextPath(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }
  return raw;
}

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const destination =
        data.user?.role === "coach" ? "/coach" : nextPath || "/dashboard";
      router.push(destination);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-[var(--stone)] pb-10 text-[var(--ink)] pt-8">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 sm:px-6">
        <section className="w-full max-w-md rounded-[2rem] bg-white/85 p-6 shadow-xl ring-1 ring-[var(--storm-blue)]/15 sm:p-8">
          <h2 className="text-3xl font-bold text-[var(--storm-blue)] sm:text-4xl">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--slate)]">Sign in to continue to your fighter dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              required
            />

            {error && <p className="text-sm font-medium text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--storm-blue)] px-5 py-3 text-lg font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--slate)]">
            Do not have an account?{" "}
            <Link href="/register" className="font-semibold text-[var(--storm-blue)] underline">
              Register
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}