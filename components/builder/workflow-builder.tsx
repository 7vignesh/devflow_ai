"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useRunCount } from "@/hooks/useRunCount";

type WorkflowRow = {
  id: string;
  name: string;
  description: string | null;
  steps: unknown;
  created_at: string;
};

function parseSections(output: string) {
  const lines = output.split("\n");
  const trigger = lines.find((line) => /trigger/i.test(line)) ?? "Trigger not identified.";
  const estimated = lines.find((line) => /estimated build time/i.test(line)) ?? "Estimated build time not provided.";
  const integrationsLine = lines.find((line) => /integrations needed/i.test(line)) ?? "Integrations needed not provided.";
  const steps = lines.filter((line) => /^\d+[\).:-]/.test(line.trim()) || /^-\s/.test(line.trim())).slice(0, 8);

  return { trigger, estimated, integrationsLine, steps };
}

export function WorkflowBuilder({ onLimitReached }: { onLimitReached: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateRuns } = useRunCount();

  const parsed = useMemo(() => parseSections(output), [output]);

  const loadWorkflows = async () => {
    const res = await fetch("/api/workflows");
    if (!res.ok) return;
    const data = await res.json();
    setWorkflows(data.workflows ?? []);
  };

  useEffect(() => {
    void loadWorkflows();
  }, []);

  const runBuilder = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatus("Building your workflow...");

    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "custom_workflow",
        input: { request: prompt },
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.code === "LIMIT" || data.code === "UPGRADE_REQUIRED") onLimitReached();
      setOutput(data.error ?? "Unable to build workflow.");
    } else {
      setOutput(data.output);
      updateRuns(data.runsThisMonth);
    }

    setStatus("");
    setLoading(false);
  };

  const saveWorkflow = async () => {
    if (!output) return;

    const name = prompt.slice(0, 56) || "Untitled workflow";
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: prompt,
        steps: { rawOutput: output },
      }),
    });
    if (res.ok) {
      await loadWorkflows();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardTitle>Workflow Builder</CardTitle>
        <CardDescription className="mt-1">Describe your automation in plain English and get a technical execution plan.</CardDescription>
        <Textarea
          className="mt-4 min-h-40"
          placeholder="Describe your automation in plain English..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <div className="mt-4 flex gap-2">
          <Button onClick={runBuilder} disabled={loading}>
            Build workflow
          </Button>
          <Button variant="outline" onClick={saveWorkflow} disabled={!output}>
            Save
          </Button>
        </div>

        {status && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400">
            <Spinner />
            {status}
          </div>
        )}

        {output ? (
          <div className="mt-5 space-y-3">
            <Card className="bg-slate-900/60">
              <CardTitle className="text-base">Trigger</CardTitle>
              <p className="mt-2 text-sm text-slate-300">{parsed.trigger}</p>
            </Card>
            <Card className="bg-slate-900/60">
              <CardTitle className="text-base">Steps</CardTitle>
              <div className="mt-2 space-y-2">
                {parsed.steps.length ? (
                  parsed.steps.map((step, index) => (
                    <div key={`${index}-${step}`} className="rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-300">
                      <span className="font-medium">Step {index + 1}:</span> {step}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No numbered steps detected. Raw output is shown below.</p>
                )}
              </div>
            </Card>
            <Card className="bg-slate-900/60">
              <CardTitle className="text-base">Summary</CardTitle>
              <p className="mt-2 text-sm text-slate-300">{parsed.integrationsLine}</p>
              <p className="mt-1 text-sm text-slate-300">{parsed.estimated}</p>
            </Card>
            <Card>
              <CardTitle className="text-base">Raw output</CardTitle>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{output}</pre>
            </Card>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No workflow generated yet. Describe a process and click Build workflow.</p>
        )}
      </Card>

      <Card>
        <CardTitle>Saved workflows</CardTitle>
        <CardDescription className="mt-1">Reusable automations saved to your workspace.</CardDescription>
        <div className="mt-4 space-y-2">
          {workflows.length ? (
            workflows.map((workflow) => (
              <button
                key={workflow.id}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-left hover:bg-slate-900"
                onClick={() => {
                  setPrompt(workflow.description ?? workflow.name);
                  const steps = workflow.steps as { rawOutput?: string };
                  setOutput(steps?.rawOutput ?? "");
                }}
              >
                <p className="text-sm font-medium text-slate-100">{workflow.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge>{new Date(workflow.created_at).toLocaleDateString()}</Badge>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-400">No saved workflows yet. Build and save one to populate this list.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
