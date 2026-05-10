"use client";

import { WorkflowBuilder } from "@/components/builder/workflow-builder";

export default function BuilderPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Workflow Builder</h1>
        <p className="mt-1 text-sm text-slate-400">Describe your automation and get a step-by-step implementation blueprint.</p>
      </div>
      <WorkflowBuilder onLimitReached={() => window.dispatchEvent(new CustomEvent("devflow:limit"))} />
    </div>
  );
}
