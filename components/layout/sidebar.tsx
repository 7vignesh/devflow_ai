"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bolt, History, Settings, Wrench, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRunCount } from "@/hooks/useRunCount";

const nav = [
  { href: "/dashboard", label: "Tools", icon: Wrench },
  { href: "/builder", label: "Workflow Builder", icon: Workflow },
  { href: "/history", label: "Run History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  onUpgradeClick: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ onUpgradeClick, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { usage } = useRunCount();
  const usageLabel = usage.limit === Number.POSITIVE_INFINITY ? `${usage.runsThisMonth} runs` : `${usage.runsThisMonth} / ${usage.limit} runs`;

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950/95 p-5 backdrop-blur-xl transition-transform lg:static lg:w-64 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <Bolt className="h-5 w-5 text-indigo-300" />
          DevFlow AI
        </Link>

        <nav className="mt-8 space-y-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active ? "bg-indigo-500/20 text-indigo-200" : "text-slate-300 hover:bg-slate-900 hover:text-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Current plan</span>
            <Badge tone={usage.plan === "free" ? "warning" : "success"}>{usage.plan}</Badge>
          </div>
          <p className="text-sm font-medium text-slate-200">{usageLabel}</p>
          {usage.plan === "free" && (
            <Button className="w-full" onClick={onUpgradeClick}>
              Upgrade
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
