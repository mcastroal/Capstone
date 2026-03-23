"use client";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
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

      setMessage("Logged in successfully!");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-[var(--rain)] text-[var(--ink)]">
      <header className="w-full bg-[var(--clay)] text-[var(--storm-blue)] shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-3xl font-extrabold tracking-tight">
            NakPath
          </Link>
          <nav className="flex items-center gap-6 text-lg font-semibold">
            <Link href="/login" className="transition hover:opacity-80">
              Login
            </Link>
            <Link href="/register" className="transition hover:opacity-80">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 items-start justify-center px-4 pb-12 pt-10 sm:pt-14">
        <div className="w-full max-w-md rounded-[2rem] bg-[var(--stone)] p-6 shadow-xl sm:p-8">
          <h1 className="mb-6 text-center text-4xl font-bold text-white">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              required
            />

            {error && <p className="text-sm font-medium text-red-700">{error}</p>}
            {message && <p className="text-sm font-medium text-green-700">{message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-full bg-[var(--clay)] px-5 py-3 text-2xl font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-lg text-[var(--storm-blue)]">
            Do not have an account?{" "}
            <Link href="/register" className="font-semibold underline">
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}