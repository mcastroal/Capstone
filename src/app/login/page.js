import { Suspense } from "react";
import LoginForm from "@/components/forms/LoginForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[var(--stone)]">
      <Navbar />
      <Suspense fallback={<p className="p-10 text-[var(--storm-blue)]">Loading…</p>}>
        <LoginForm />
      </Suspense>
      <Footer />
    </div>
  );
}