import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { UserPlan } from "@/types";

export async function GET(req: NextRequest) {
  const authClient = createAuthClient();
  const {
    data: { user: authUser },
  } = await authClient.auth.getUser();
  const userId = authUser?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase.from("users").select("plan").eq("id", userId).maybeSingle();
  const plan = (user?.plan as UserPlan) ?? "free";
  if (plan === "free") {
    return NextResponse.json({ error: "Run history requires Pro or Agency.", code: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  const tool = req.nextUrl.searchParams.get("tool");
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = 20;
  const from = (Math.max(page, 1) - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("runs")
    .select("id, tool, input, output, tokens_used, created_at", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (tool && tool !== "all") {
    query = query.eq("tool", tool);
  }

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to load run history." }, { status: 500 });
  }

  return NextResponse.json({
    runs: data ?? [],
    total: count ?? 0,
    page: Math.max(page, 1),
    pageSize,
  });
}
