"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type UsageState = {
  plan: "free" | "pro" | "agency";
  runsThisMonth: number;
  limit: number;
};

const defaultUsage: UsageState = {
  plan: "free",
  runsThisMonth: 0,
  limit: 50,
};

export default function SettingsPage() {
  const [usage, setUsage] = useState<UsageState>(defaultUsage);
  const [loading, setLoading] = useState(false);

  const loadUsage = async () => {
    const res = await fetch("/api/user/usage");
    if (!res.ok) return;
    const data = await res.json();
    setUsage(data);
  };

  useEffect(() => {
    void loadUsage();
  }, []);

  const checkout = async (plan: "pro" | "agency") => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  };

  const usageLabel = usage.limit === Number.POSITIVE_INFINITY ? `${usage.runsThisMonth} runs this month` : `${usage.runsThisMonth} / ${usage.limit} runs this month`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Settings & Billing</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your plan and track usage for the current billing month.</p>
      </div>

      <Card>
        <CardTitle>Current account</CardTitle>
        <CardDescription className="mt-1">Your active subscription and usage details.</CardDescription>
        <div className="mt-4 flex items-center gap-3">
          <Badge tone={usage.plan === "free" ? "warning" : "success"}>{usage.plan}</Badge>
          <span className="text-sm text-slate-300">{usageLabel}</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Pro</CardTitle>
          <p className="mt-2 text-sm text-slate-400">$149/mo · 500 runs · all tools · run history · API access</p>
          <Button className="mt-4" disabled={loading} onClick={() => checkout("pro")}>
            Upgrade to Pro
          </Button>
        </Card>
        <Card>
          <CardTitle>Agency</CardTitle>
          <p className="mt-2 text-sm text-slate-400">$399/mo · unlimited runs · team seats · white-label exports · priority support</p>
          <Button className="mt-4" disabled={loading} onClick={() => checkout("agency")}>
            Upgrade to Agency
          </Button>
        </Card>
      </div>
    </div>
  );
}
