"use client";

import { GithubTool } from "@/components/tools/github-tool";
import { JDTool } from "@/components/tools/jd-tool";
import { OnboardTool } from "@/components/tools/onboard-tool";

function openUpgradeModal() {
  window.dispatchEvent(new CustomEvent("devflow:limit"));
}

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Automation tools</h1>
        <p className="mt-1 text-sm text-slate-400">Run pre-built AI workflows for recruiting and delivery operations.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <GithubTool onLimitReached={openUpgradeModal} />
        <JDTool onLimitReached={openUpgradeModal} />
      </div>
      <OnboardTool onLimitReached={openUpgradeModal} />
    </div>
  );
}
