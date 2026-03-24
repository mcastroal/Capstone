"use client";

import { startTransition, useEffect, useState } from "react";
import DashboardHome from "@/components/dashboard/DashboardHome";

function readFirstName() {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);
    const full = u?.name || "";
    if (!full) return "";
    return full.split(/\s+/)[0] || full;
  } catch {
    return "";
  }
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const name = readFirstName();
    if (!name) return;
    startTransition(() => setFirstName(name));
  }, []);

  return <DashboardHome welcomeName={firstName} />;
}
