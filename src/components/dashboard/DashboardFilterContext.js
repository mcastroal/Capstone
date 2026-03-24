"use client";

import { createContext, useContext, useMemo, useState } from "react";

const DashboardFilterContext = createContext(null);

export function DashboardFilterProvider({ children }) {
  const [sessionSearch, setSessionSearch] = useState("");

  const value = useMemo(
    () => ({ sessionSearch, setSessionSearch }),
    [sessionSearch]
  );

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilter() {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) {
    return { sessionSearch: "", setSessionSearch: () => {} };
  }
  return ctx;
}
