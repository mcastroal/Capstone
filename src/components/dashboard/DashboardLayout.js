"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardFilterProvider } from "./DashboardFilterContext";
import FighterSidebar from "./FighterSidebar";

function readStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }
    const u = readStoredUser();
    if (u?.role === "coach") {
      router.replace("/coach");
      return;
    }
    startTransition(() => {
      setUser(u);
      setReady(true);
    });
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--stone)] text-[var(--storm-blue)]">
        <p className="text-sm font-medium">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardFilterProvider>
      <div className="flex min-h-screen bg-[var(--stone)] text-[var(--ink)]">
        <FighterSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          userName={user?.name}
          userRole={user?.role}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </DashboardFilterProvider>
  );
}
