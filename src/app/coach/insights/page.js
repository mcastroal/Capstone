"use client";

import { Suspense } from "react";
import CoachAiInsightsPage from "@/components/coach/CoachAiInsightsPage";

export default function CoachInsightsRoutePage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--storm-blue)]">Loading…</p>}>
      <CoachAiInsightsPage />
    </Suspense>
  );
}
