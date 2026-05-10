"use client";

import { useEffect, useState } from "react";
import { RunCountProvider } from "@/hooks/useRunCount";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const goToUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "pro" }),
    });
    if (!res.ok) {
      return;
    }

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  useEffect(() => {
    const onLimit = () => setUpgradeOpen(true);
    window.addEventListener("devflow:limit", onLimit);
    return () => window.removeEventListener("devflow:limit", onLimit);
  }, []);

  return (
    <RunCountProvider>
      <div className="min-h-screen bg-slate-950 lg:flex">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onUpgradeClick={() => setUpgradeOpen(true)} />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <Topbar onOpenMobile={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 lg:p-5">{children}</div>
          </main>
        </div>
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} onUpgrade={goToUpgrade} />
    </RunCountProvider>
  );
}
