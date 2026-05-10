"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { truncateText } from "@/lib/utils";

type RunRow = {
  id: string;
  tool: string;
  input: unknown;
  output: string;
  tokens_used: number | null;
  created_at: string;
};

type Usage = {
  plan: "free" | "pro" | "agency";
};

export default function HistoryPage() {
  const [usage, setUsage] = useState<Usage>({ plan: "free" });
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tool, setTool] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const usageRes = await fetch("/api/user/usage");
    if (usageRes.ok) {
      setUsage(await usageRes.json());
    }

    const runsRes = await fetch(`/api/runs?page=${page}&tool=${tool}`);
    if (!runsRes.ok) {
      setRuns([]);
      return;
    }

    const data = await runsRes.json();
    setRuns(data.runs ?? []);
    setTotal(data.total ?? 0);
  }, [page, tool]);

  useEffect(() => {
    void load();
  }, [load]);

  if (usage.plan === "free") {
    return (
      <Card>
        <CardTitle>Run History is a Pro feature</CardTitle>
        <CardDescription className="mt-2">
          Upgrade to Pro or Agency to unlock automation history, token tracking, and full output inspection.
        </CardDescription>
        <div className="mt-4">
          <Button onClick={() => window.dispatchEvent(new CustomEvent("devflow:limit"))}>Upgrade plan</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Run History</h1>
        <p className="mt-1 text-sm text-slate-400">Review past runs and inspect full outputs for each tool execution.</p>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-56">
            <Input value={tool} onChange={(event) => setTool(event.target.value)} placeholder="Filter by tool (or all)" />
          </div>
          <Badge>{total} total runs</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2">Tool</th>
                <th className="py-2">Input preview</th>
                <th className="py-2">Date</th>
                <th className="py-2">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const inputText = typeof run.input === "string" ? run.input : JSON.stringify(run.input);
                return (
                  <>
                    <tr key={run.id} className="cursor-pointer border-b border-slate-800" onClick={() => setExpanded(expanded === run.id ? null : run.id)}>
                      <td className="py-2 font-medium text-slate-100">{run.tool}</td>
                      <td className="py-2 text-slate-400">{truncateText(inputText ?? "", 70)}</td>
                      <td className="py-2 text-slate-400">{new Date(run.created_at).toLocaleString()}</td>
                      <td className="py-2 text-slate-400">{run.tokens_used ?? 0}</td>
                    </tr>
                    {expanded === run.id && (
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <td className="px-3 py-3 text-slate-300" colSpan={4}>
                          <pre className="whitespace-pre-wrap text-sm">{run.output}</pre>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-slate-400">Page {page}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
