"use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "fighter",
    coachCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    if (field === "role" && value === "coach") {
      setForm((prev) => ({ ...prev, role: value, coachCode: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      coachCode: form.role === "fighter" ? form.coachCode.trim() : "",
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not create account.");
        return;
      }

      setMessage(
        data.coachCode
          ? `Account created! Your coach code is: ${data.coachCode}`
          : "Account created successfully!",
      );
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "fighter",
        coachCode: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-[var(--slate)] text-[var(--ink)]">
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
          <h1 className="mb-6 text-center text-4xl font-bold text-[var(--ink)]">Register</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              required
              minLength={6}
            />

            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
            >
              <option value="fighter">Fighter</option>
              <option value="coach">Coach</option>
            </select>

            {form.role === "fighter" && (
              <input
                type="text"
                placeholder="Coach Code (optional)"
                value={form.coachCode}
                onChange={(e) => handleChange("coachCode", e.target.value)}
                className="w-full rounded-2xl border-2 border-transparent bg-[var(--rain)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--storm-blue)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--storm-blue)]"
              />
            )}

            {error && <p className="text-sm font-medium text-red-700">{error}</p>}
            {message && <p className="text-sm font-medium text-green-700">{message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-full bg-[var(--clay)] px-5 py-3 text-2xl font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>

          <p className="mt-4 text-center text-lg text-[var(--storm-blue)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}