"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useRunCount } from "@/hooks/useRunCount";

type OnboardToolProps = {
  onLimitReached: () => void;
};

export function OnboardTool({ onLimitReached }: OnboardToolProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateRuns } = useRunCount();

  const runTool = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setStatus("Running automation...");

    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "onboarding",
        input: { clientDetails: input },
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.code === "LIMIT" || data.code === "UPGRADE_REQUIRED") onLimitReached();
      setOutput(data.error ?? "Unable to generate onboarding checklist.");
    } else {
      setOutput(data.output);
      updateRuns(data.runsThisMonth);
    }

    setLoading(false);
    setStatus("");
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "onboarding-checklist.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardTitle>Client Onboarding</CardTitle>
      <CardDescription className="mt-1">Generate a specific onboarding checklist for new client projects.</CardDescription>
      <Textarea
        className="mt-4 min-h-32"
        placeholder="Describe the client, stack, timeline, integrations, and delivery model..."
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <div className="mt-3">
        <Button onClick={runTool} disabled={loading}>
          Generate Checklist
        </Button>
      </div>
      {status && (
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400">
          <Spinner />
          {status}
        </div>
      )}

      {output ? (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <pre className="whitespace-pre-wrap text-sm text-slate-300">{output}</pre>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(output)}>
              Copy
            </Button>
            <Button variant="ghost" onClick={download}>
              Download .md
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">No checklist yet. Add client context and run the tool.</p>
      )}
    </Card>
  );
}
