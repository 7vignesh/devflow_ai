import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { currentMonthKey } from "@/lib/utils";
import { UserPlan } from "@/types";

const monthlyLimits: Record<UserPlan, number> = {
  free: 50,
  pro: 500,
  agency: Number.POSITIVE_INFINITY,
};

export async function GET() {
  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const email = user.email;
  if (!email) {
    return NextResponse.json({ error: "No email found for user." }, { status: 400 });
  }

  await supabase.from("users").upsert({ id: userId, email }, { onConflict: "id" });
  const { data: userRecord, error } = await supabase
    .from("users")
    .select("plan, runs_this_month, runs_month")
    .eq("id", userId)
    .single();

  if (error || !userRecord) {
    return NextResponse.json({ error: "Unable to read usage." }, { status: 500 });
  }

  const monthNow = currentMonthKey();
  let runsThisMonth = userRecord.runs_this_month ?? 0;
  if (userRecord.runs_month !== monthNow) {
    runsThisMonth = 0;
    await supabase.from("users").update({ runs_this_month: 0, runs_month: monthNow }).eq("id", userId);
  }

  const plan = (userRecord.plan as UserPlan) ?? "free";
  return NextResponse.json({
    plan,
    runsThisMonth,
    limit: monthlyLimits[plan],
  });
}
