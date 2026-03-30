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

  function validateFields() {
    const firstName = String(form.firstName ?? "").trim();
    const lastName = String(form.lastName ?? "").trim();
    const email = String(form.email ?? "").trim();
    const password = String(form.password ?? "");

    if (!firstName) return "Please enter your first name.";
    if (!lastName) return "Please enter your last name.";
    if (!email) return "Please enter your email.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return 'Enter a valid email with "@" and a domain (for example, alex@example.com).';
    }
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  const handleChange = (field, value) => {
    setError("");
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

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 400) {
          const msg = String(data.message || "");
          if (msg.toLowerCase().includes("missing")) {
            setError("Please fill in all required fields.");
            return;
          }
          if (msg.toLowerCase().includes("already")) {
            setError("That email is already registered. Please log in instead.");
            return;
          }
          setError(data.message || "Please check your details and try again.");
          return;
        }
        setError(data.message || "Could not create account. Please try again.");
        return;
      }

      setError("");
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
      setError("Network error. Please check your connection and try again.");
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

          <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full rounded-2xl border border-[var(--rain)]/50 bg-[var(--stone)] px-4 py-3 text-base text-[var(--storm-blue)] placeholder:text-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--rain)]"
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

            <div className="space-y-2 pt-1">
              {error ? (
                <p className="text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="text-sm font-medium text-green-700" role="status">
                  {message}
                </p>
              ) : null}
            </div>

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
