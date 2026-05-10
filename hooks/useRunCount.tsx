"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UsageState = {
  plan: "free" | "pro" | "agency";
  runsThisMonth: number;
  limit: number;
};

type RunCountContextValue = {
  usage: UsageState;
  loading: boolean;
  refreshUsage: () => Promise<void>;
  updateRuns: (nextRuns: number) => void;
};

const defaultUsage: UsageState = {
  plan: "free",
  runsThisMonth: 0,
  limit: 50,
};

const RunCountContext = createContext<RunCountContextValue | null>(null);

export function RunCountProvider({ children }: { children: React.ReactNode }) {
  const [usage, setUsage] = useState<UsageState>(defaultUsage);
  const [loading, setLoading] = useState(true);

  const refreshUsage = async () => {
    const res = await fetch("/api/user/usage");
    if (!res.ok) {
      setLoading(false);
      return;
    }

    const next = await res.json();
    setUsage(next);
    setLoading(false);
  };

  const updateRuns = (nextRuns: number) => {
    setUsage((prev) => ({ ...prev, runsThisMonth: nextRuns }));
  };

  useEffect(() => {
    void refreshUsage();
  }, []);

  const value = useMemo(
    () => ({
      usage,
      loading,
      refreshUsage,
      updateRuns,
    }),
    [loading, usage],
  );

  return <RunCountContext.Provider value={value}>{children}</RunCountContext.Provider>;
}

export function useRunCount() {
  const context = useContext(RunCountContext);
  if (!context) {
    throw new Error("useRunCount must be used within RunCountProvider");
  }

  return context;
}
