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
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
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
    <main className="w-full bg-[var(--stone)] pb-10 pt-8 text-[var(--ink)]">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 sm:px-6">
        <section className="w-full max-w-md rounded-[2rem] bg-white/85 p-6 shadow-xl ring-1 ring-[var(--storm-blue)]/15 sm:p-8">
          <h2 className="text-3xl font-bold text-[var(--storm-blue)] sm:text-4xl">Create account</h2>
          <p className="mt-2 text-sm text-[var(--slate)]">
            Sign up to start tracking sessions and build your training plan.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              required
              minLength={6}
            />

            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
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
                className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
              />
            )}

            {error && <p className="text-sm font-medium text-red-700">{error}</p>}
            {message && <p className="text-sm font-medium text-green-700">{message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--storm-blue)] px-5 py-3 text-lg font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--slate)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--storm-blue)] underline">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}