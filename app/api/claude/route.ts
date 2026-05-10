import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runClaude } from "@/lib/anthropic";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { currentMonthKey } from "@/lib/utils";
import { ToolId, UserPlan } from "@/types";

const requestSchema = z.object({
  tool: z.enum(["github_brief", "jd_generator", "onboarding", "custom_workflow", "outreach_email"]),
  input: z.union([z.string(), z.record(z.string(), z.unknown())]),
});

const toolPrompts: Record<ToolId, string> = {
  github_brief:
    "You are a senior technical recruiter assistant. The user will provide a GitHub username and real profile data (repos, languages, bio, follower count). Generate a concise recruiter-ready candidate brief with these sections: Developer Profile, Likely Stack, Seniority Signal, Standout Traits (3 bullets), Best Fit Roles (3 options), Outreach Angle (one sentence). Be specific, not generic.",
  jd_generator:
    "You are an expert technical recruiter. Generate a compelling, modern job description from the user's brief role description. Avoid corporate jargon. Structure: Job Title, About the Role (2-3 sentences), What You'll Do (5 bullets), What We're Looking For (5 bullets), Nice to Have (3 bullets), Compensation & Perks placeholder. Keep it developer-friendly and honest.",
  onboarding:
    "You are an expert agency project manager. Generate a detailed, actionable client onboarding checklist from the client details provided. Structure: Week 1 Setup, Week 2 Integration, Ongoing tasks, Deliverables to prepare, Tools to provision. Be specific to the client context, not generic.",
  custom_workflow:
    "You are an automation architect. Parse the user's plain-English automation request and output a structured plan with: Automation name, Trigger (type + condition), Steps (numbered, each with action + tool/API), Data flow (input -> output), Integrations needed, Estimated build time. Be technical and specific.",
  outreach_email:
    "You are a senior technical recruiter. Write a concise personalized outreach email based on the candidate brief. Keep it human, specific, and under 180 words.",
};

const monthlyLimits: Record<UserPlan, number> = {
  free: 50,
  pro: 500,
  agency: Number.POSITIVE_INFINITY,
};

const rateWindowMs = 60_000;
const rateLimitMax = 10;
const requestWindows = new Map<string, number[]>();

function withinRateLimit(userId: string) {
  const now = Date.now();
  const start = now - rateWindowMs;
  const key = `claude:${userId}`;
  const history = requestWindows.get(key) ?? [];
  const recent = history.filter((stamp) => stamp >= start);

  if (recent.length >= rateLimitMax) {
    requestWindows.set(key, recent);
    return false;
  }

  recent.push(now);
  requestWindows.set(key, recent);
  return true;
}

function parseUserMessage(input: string | Record<string, unknown>) {
  if (typeof input === "string") {
    return input;
  }

  return JSON.stringify(input, null, 2);
}

export async function POST(req: NextRequest) {
  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!withinRateLimit(userId)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
  }

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { tool, input } = parsed.data;
  const supabase = getSupabaseAdmin();
  const email = user.email;

  if (!email) {
    return NextResponse.json({ error: "No email found for user." }, { status: 400 });
  }

  await supabase.from("users").upsert(
    {
      id: userId,
      email,
    },
    { onConflict: "id" },
  );

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("plan, runs_this_month, runs_month")
    .eq("id", userId)
    .single();

  if (userError || !dbUser) {
    return NextResponse.json({ error: "Unable to read user profile." }, { status: 500 });
  }

  const monthNow = currentMonthKey();
  let runsThisMonth = dbUser.runs_this_month ?? 0;
  if (dbUser.runs_month !== monthNow) {
    runsThisMonth = 0;
    await supabase
      .from("users")
      .update({ runs_this_month: 0, runs_month: monthNow })
      .eq("id", userId);
  }

  const plan = (dbUser.plan as UserPlan) ?? "free";
  const allowedFreeTools: ToolId[] = ["github_brief", "jd_generator", "onboarding"];
  if (plan === "free" && !allowedFreeTools.includes(tool)) {
    return NextResponse.json(
      { error: "This tool requires a paid plan.", code: "UPGRADE_REQUIRED", plan, runsThisMonth },
      { status: 403 },
    );
  }

  if (runsThisMonth >= monthlyLimits[plan]) {
    return NextResponse.json(
      { error: "Monthly run limit reached.", code: "LIMIT", plan, runsThisMonth },
      { status: 403 },
    );
  }

  const userMessage = parseUserMessage(input);
  const { output, tokensUsed } = await runClaude({
    system: toolPrompts[tool],
    userMessage,
  });

  await supabase.from("runs").insert({
    user_id: userId,
    tool,
    input,
    output,
    tokens_used: tokensUsed,
  });

  const updatedRuns = runsThisMonth + 1;
  await supabase.from("users").update({ runs_this_month: updatedRuns, runs_month: monthNow }).eq("id", userId);

  return NextResponse.json({
    output,
    tokensUsed,
    runsThisMonth: updatedRuns,
    plan,
  });
}
