"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoachSidebar from "@/components/coach/CoachSidebar";

function readStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CoachLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [_, startTransition] = useTransition();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/coach")}`);
      return;
    }

    const u = readStoredUser();
    if (!u?.role || u.role !== "coach") {
      router.replace("/dashboard");
      return;
    }

    startTransition(() => {
      setUser(u);
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--stone)] text-[var(--storm-blue)]">
        <p className="text-sm font-medium">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--stone)] text-[var(--ink)]">
      <CoachSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        userName={user?.name}
        userRole={user?.role}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

