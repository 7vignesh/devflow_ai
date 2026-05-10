"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useRunCount } from "@/hooks/useRunCount";
import { GitHubProfileSummary } from "@/types";

type GithubToolProps = {
  onLimitReached: () => void;
};

export function GithubTool({ onLimitReached }: GithubToolProps) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<GitHubProfileSummary | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateRuns } = useRunCount();

  const runTool = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setOutput("");
    setProfile(null);
    setStatus("Fetching GitHub profile...");

    try {
      const profileRes = await fetch(`/api/github?username=${encodeURIComponent(username.trim())}`);
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error ?? "GitHub lookup failed.");

      setProfile(profileData);
      setStatus("Running automation...");

      const claudeRes = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "github_brief",
          input: profileData,
        }),
      });
      const claudeData = await claudeRes.json();
      if (!claudeRes.ok) {
        if (claudeData.code === "LIMIT" || claudeData.code === "UPGRADE_REQUIRED") onLimitReached();
        throw new Error(claudeData.error ?? "Claude run failed.");
      }

      setOutput(claudeData.output);
      updateRuns(claudeData.runsThisMonth);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const writeOutreach = async () => {
    if (!output || !profile) return;
    setLoading(true);
    setStatus("Running automation...");

    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "outreach_email",
        input: {
          username: profile.username,
          brief: output,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "LIMIT" || data.code === "UPGRADE_REQUIRED") onLimitReached();
      setOutput(data.error ?? "Could not create outreach email.");
    } else {
      setOutput(`${output}\n\n---\n\nOutreach Email:\n${data.output}`);
      updateRuns(data.runsThisMonth);
    }

    setStatus("");
    setLoading(false);
  };

  return (
    <Card>
      <CardTitle>GitHub Brief</CardTitle>
      <CardDescription className="mt-1">Turn public GitHub profiles into recruiter-ready candidate briefs.</CardDescription>
      <div className="mt-4 flex gap-3">
        <Input
          placeholder="GitHub username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void runTool();
            }
          }}
        />
        <Button disabled={loading} onClick={runTool}>
          Run
        </Button>
      </div>

      {status && (
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400">
          <Spinner />
          {status}
        </div>
      )}

      {profile && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Image src={profile.avatarUrl} alt={profile.username} className="h-9 w-9 rounded-full" width={36} height={36} />
          <Badge>{profile.followers} followers</Badge>
          {profile.topRepos.slice(0, 3).map((repo) => (
            <Badge key={repo.name}>{repo.name}</Badge>
          ))}
        </div>
      )}

      {output ? (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <pre className="whitespace-pre-wrap text-sm text-slate-300">{output}</pre>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(output)}>
              Copy
            </Button>
            <Button variant="ghost" onClick={writeOutreach} disabled={loading}>
              Write outreach email
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">Run the tool to generate your first GitHub candidate brief.</p>
      )}
    </Card>
  );
}
